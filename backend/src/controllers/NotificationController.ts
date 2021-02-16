import * as express from "express";
import { inject, injectable } from "inversify";
import ApplicationController from "./applicationController";
import { SystemLogger } from "@loggers";
import { TYPES } from "@commons";
import { NotificationRepository, NotificationRepositoryImpl } from "@repositories";
import { rescuable } from "@commons/decorators";
import { getCustomRepository } from "typeorm";
import passport from "passport";
import { EROLES } from "../constants";
import { Job } from "../entities";

@injectable()
export class NotificationController extends ApplicationController {

    notificationRepository: NotificationRepository;

    constructor(@inject(TYPES.SystemLogger) _logger: SystemLogger) {
        super(_logger);
        this.notificationRepository = getCustomRepository(NotificationRepositoryImpl);
    }

    register(app: express.Application): void {
        super.register(app);

        const router = express.Router();
        router.all("*", passport.authenticate("jwt", {session: false}));

        app.use("/notifications", router);

        router.route("/").get(this.getNotifications);
        router.route("/").put(this.markAsRead);
        router.route("/:id").delete(this.deleteNotification);
    }

    @rescuable
    async getNotifications(req: express.Request, res: express.Response) {
        const {user} = req;
        const query = {} as any;

        if (req.query.page) {
            query.page = req.query.page;
        }

        const notifiableType = parseInt(req.query.notifiableType);
        if (notifiableType) {
            query.notifiableType = notifiableType;
        }

        if (req.query.unread) {
            query.notifiableStates = {$elemMatch: {id: user.id.toString(), isRead: false, isRemoved: false}};
        } else {
            query.notifiableStates = {$elemMatch: {id: user.id.toString(), isRemoved: false}};
        }

        query.order = "-createdAt";

        req.query = {};

        if (user.roles && user.roles.includes(EROLES.worker)) {
            const response = await this.getNotificationsForWorker(req, query);
            res.send(response);
        } else {
            const response = await this.notificationRepository.findAll(req, query);
            const notifications = response.results.map(notification => {
                return {
                    id: notification.id.toString(),
                    createdAt: notification.createdAt,
                    notifiableType: notification.notifiableType,
                    notifiableGroup: notification.notifiableGroup,
                    notifiableRecord: notification.notifiableRecord,
                    message: notification.message,
                    isRead: notification.notifiableStates.find(state => state.id === req.user.id.toString()).isRead
                };
            });
            res.send({...response, results: notifications});
        }
    }

    private async getNotificationsForWorker(req: express.Request, query: any) {
        const notifications = await this.notificationRepository.findAll(req, query);
        const data = notifications.results
            .map(notification => {
                const job = <Job>notification.notifiableRecord;
                const jobWorker = job && job.workers && job.workers.find(worker => worker.workerId === req.user.id.toString());
                return {
                    id: notification.id.toString(),
                    createdAt: notification.createdAt,
                    notifiableType: notification.notifiableType,
                    notifiableGroup: notification.notifiableGroup,
                    notifiableRecord: jobWorker ? job.workerView(jobWorker) : undefined,
                    message: notification.message,
                    isRead: notification.notifiableStates.find(state => state.id === req.user.id.toString()).isRead
                };
            });
        return {
            results: data,
            total: notifications.total,
            page: notifications.page,
            limit: notifications.limit
        };
    }

    @rescuable
    async markAsRead(req: express.Request, res: express.Response) {
        const notification = await this.notificationRepository.findById(req.body.id);
        if (notification) {
            const notifiableStates = notification.notifiableStates.map(state => {
                if (state.id === req.user.id.toString()) {
                    state.isRead = true;
                }
                return state;
            });
            const updatedNotification = await this.notificationRepository.customUpdate(notification, {notifiableStates});
            console.log(`INFO ===> User ${req.user.id.toString()} has set notification ${updatedNotification.id} status to IsRead`);
            res.send({
                id: updatedNotification.id.toString(),
                createdAt: updatedNotification.createdAt,
                notifiableType: updatedNotification.notifiableType,
                notifiableGroup: updatedNotification.notifiableGroup,
                notifiableRecord: updatedNotification.notifiableRecord,
                message: updatedNotification.message,
                isRead: updatedNotification.notifiableStates.find(state => state.id === req.user.id.toString()).isRead
            });
        } else {
            console.log(`WARN ===> Notification with id ${req.body.id} not found`);
            res.send();
        }
    }

    @rescuable
    async deleteNotification(req: express.Request, res: express.Response) {
        const notification = await this.notificationRepository.findById(req.params.id);
        if (notification) {
            const notifiableStates = notification.notifiableStates.map(state => {
                if (state.id === req.user.id.toString()) {
                    state.isRead = true;
                    state.isRemoved = true;
                }
                return state;
            });
            const updatedNotification = await this.notificationRepository.customUpdate(notification, {notifiableStates});
            console.log(`INFO ===> User ${req.user.id.toString()} has set notification ${updatedNotification.id} status to IsRemoved`);
            res.send({
                id: updatedNotification.id.toString(),
                createdAt: updatedNotification.createdAt,
                notifiableType: updatedNotification.notifiableType,
                notifiableGroup: updatedNotification.notifiableGroup,
                notifiableRecord: updatedNotification.notifiableRecord,
                message: updatedNotification.message,
                isRead: updatedNotification.notifiableStates.find(state => state.id === req.user.id.toString()).isRead
            });
        } else {
            console.log(`WARN ===> Notification with id ${req.body.id} not found`);
            res.send();
        }
    }
}

