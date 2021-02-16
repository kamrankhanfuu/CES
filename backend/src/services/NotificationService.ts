import moment from "moment-timezone";
import { ObjectID } from "mongodb";
import { getCustomRepository } from "typeorm";
import { mailer, notifyServer } from "../app";
import { ACTIVE, APPROVE, EROLES } from "../constants";
import { Job, JobWorker, Notification, User } from "../entities";
import { NotifiableType } from "../entities/notification/NotifiableType";
import { NOTIFICATION_PERMISSIONS_MAP } from "../entities/notification/NotificationPermissionsMap";
import {
  NotificationRepository,
  NotificationRepositoryImpl,
  UserRepository,
  UserRepositoryImpl
} from "../repositories";
import ETAService from "./ETAService";
import FirebaseService, { FirebaseMessage } from "./firebaseServise/FirebaseService";

export default class NotificationService {

    private readonly notificationRepository: NotificationRepository;
    private readonly firebaseService: FirebaseService;
    private readonly userRepository: UserRepository;
    private readonly ETAService: ETAService;
    private readonly timeZone = "America/New_York";

    constructor() {
        this.notificationRepository = getCustomRepository<NotificationRepository>(NotificationRepositoryImpl);
        this.firebaseService = new FirebaseService();
        this.userRepository = getCustomRepository<UserRepository>(UserRepositoryImpl);
        this.ETAService = new ETAService();
    }

    async sendJobNotification(notifiableType: NotifiableType, data?: any): Promise<void> {
        const {creatorId, job, old} = data;

        await job.loadRelatedData();
        const jobObj = JSON.parse(JSON.stringify(job));

        const recipientsMap: Map<string, User> = await this.getNotificationRecipients(notifiableType, jobObj);
        const notifiableUsers = new Array<User>();

        recipientsMap.forEach(recipient => {
            notifiableUsers.push(recipient);
        });

        if (notifiableType === NotifiableType.WORKER_REMOVED) {
          const jobWorkerIds = job.workers.map((worker: JobWorker) => worker.worker.id.toString());
          old.workers.forEach((worker: JobWorker) => {
            if (!jobWorkerIds.includes(worker.worker.id.toString())) {
              notifiableUsers.push(worker.worker);
            }
          });
        }

        const message = await this.createNotificationMessage(notifiableType, data);
        const firebaseMessage = this.createFcmMessage(notifiableType, data);
        const notification = new Notification({
            creatorId,
            notifiableType,
            message,
            notifiableGroup: {type: job.jobType, po: job.po},
            notifiableStates: notifiableUsers.map(user => ({id: user.id.toString(), isRead: false, isRemoved: false})),
            permissions: NOTIFICATION_PERMISSIONS_MAP[notifiableType],
            notifiableRecordID: job.id.toString(),
        });

        const storedNotification = await this.notificationRepository.customCreate({...notification});

        await this.notify(notifiableUsers, storedNotification, firebaseMessage);
    }

    async notify(notifiableUsers: Array<User>, notification: Notification, firebaseMessage?: FirebaseMessage) {
        notifiableUsers.forEach(user => {
            const permissions = NOTIFICATION_PERMISSIONS_MAP[notification.notifiableType];

          if (user.roles && user.roles.includes(EROLES.worker)) {
            this.sendFirebaseNotification(user, firebaseMessage);
          } else {
            if (user.notification && permissions && user.notification.includes(permissions[0])) {
              this.sendEmailNotification(user, notification);
            } else {
              const reason = `User "${user.id}" turns off email notification permission.`;
              console.log("WARN ===> Email notification not sent. ", reason);
            }

            if (user.notification && permissions && user.notification.includes(permissions[1])) {
              this.sendPushNotification(user, notification);
            } else {
              const reason = `User "${user.id}" turns off push notification permission.`;
              console.log("WARN ===> Push notification  not sent. ", reason);
            }
          }
        });
    }

    private async getNotificationRecipients(notifiableType: NotifiableType, job: Job): Promise<Map<string, User>> {
        const {department, requestor, supervisor, workers} = job;

        const recipients = new Array<User>();

        // get available users with roles superadmin, dispatcher, dispatcher_supervisor
        recipients.push(...await this.userRepository.findAllNoPaginate({
            roles: {$elemMatch: {$in: [EROLES.superadmin, EROLES.dispatcher, EROLES.dispatcher_supervisor]}},
            isActive: ACTIVE.active,
            isApproved: APPROVE.approved
        }));

        // get applied users with roles requestor, coned_field_supervisor
        recipients.push(...await this.userRepository.findAllNoPaginate({
            _id: {$in: [new ObjectID(requestor), new ObjectID(supervisor)]},
            roles: {$elemMatch: {$in: [EROLES.requestor, EROLES.coned_field_supervisor]}},
            isActive: ACTIVE.active,
            isApproved: APPROVE.approved
        }));

        // get applied users with role department_supervisor
        recipients.push(...await this.userRepository.findAllNoPaginate({
            departments: {$elemMatch: {$eq: department}},
            roles: {$elemMatch: {$eq: EROLES.department_supervisor}},
            isActive: ACTIVE.active,
            isApproved: APPROVE.approved
        }));

        // get user with billing role for PO_NUMBER_HAS_BEEN_ADDED notification
        if (notifiableType === NotifiableType.PO_NUMBER_HAS_BEEN_ADDED) {
            recipients.push(...await this.userRepository.findAllNoPaginate({
                roles: {$elemMatch: {$eq: EROLES.billing}},
                isActive: ACTIVE.active,
                isApproved: APPROVE.approved
            }));
        }

        // get notifiable workers
        recipients.push(...workers.map(worker => worker.worker));

        // remove duplicated users
        const notifiableUsers = new Map<string, User>();
        recipients.forEach((recipient) => {
            if (!notifiableUsers.has(recipient.id.toString())) {
                notifiableUsers.set(recipient.id.toString(), recipient);
            }
        });

        return notifiableUsers;
    }

    // noinspection JSMethodCanBeStatic
    private async sendEmailNotification(user: User, notification: Notification) {
        try {
            await mailer.send(user.email, {message: notification.message}, "notification");
            console.log("INFO ===> Sent email notification to", user.email);
        } catch (error) {
            console.log("ERROR ===> Sent email notification failed. Reason is: ", error.message);
        }
    }

    private async sendPushNotification(user: User, notification?: Notification) {
      if (notification) {
        const notificationServer = await notifyServer;
        notificationServer.sendNotification(notification, user.id);
        console.log("INFO ===> sent push notification to", user.id);
      }
    }

    private async sendFirebaseNotification(user: User, message?: FirebaseMessage) {
        if (message) {
          try {
            const {fcmToken} = user;
            if (fcmToken) {
              fcmToken.map(token => {
                if (message) {
                  this.firebaseService.sendMessage(token, message);
                }
              });
            }
          } catch (error) {
            console.log("ERROR ===> sent push notification failed. Reason is: ", error.message);
          }
        }
    }

    private async createNotificationMessage(notificationType: number, notificationData: any) {
        const {job, worker} = notificationData;
        switch (notificationType) {
            case NotifiableType.CREATE_JOB:
                const requestedDate = moment(job.requestTime).tz(this.timeZone).format("MM/DD/YY HH:mm");
                return `Job #${job.confirmationNumber} ${job.locations && job.locations.length ? `for ${job.locations[0].address}` : ""} at ${requestedDate} has been submitted!`;
            case NotifiableType.CANCEL_JOB:
                return `Job #${job.confirmationNumber} ${job.locations && job.locations.length ? `for ${job.locations[0].address}` : ""} has been canceled!`;
            case NotifiableType.EDIT_JOB:
                return `Job #${job.confirmationNumber} has been modified.`;
            case NotifiableType.WORKER_UPLOAD_AN_IMAGE:
                return `Worker Uploaded an Image. Job po #${job.po}.`;
            case NotifiableType.PO_NUMBER_HAS_BEEN_ADDED:
                return `PO Number has been added to Job #${job.confirmationNumber}.`;
            case NotifiableType.WORKER_EN_ROUTE:
                const {name, location} = worker.worker && await this.userRepository.findById(worker.worker.id);
                const route = location && await this.ETAService.getDirectionRoute(location, worker.location);
                const duration = route && route.duration.text;
                return `Worker ${name} is on their way to Job #${job.confirmationNumber} at ${worker.location.address}. Their ETA is ${duration}.`;
            case NotifiableType.WORKER_ON_LOCATION:
                return `Worker ${worker.worker.name} is on-site for Job #${job.confirmationNumber} at ${worker.location.address}.`;
            case NotifiableType.WORKER_SECURED_SITE:
                return `Worker ${worker.worker.name} has secured the site for Job #${job.confirmationNumber} at ${worker.location.address}.`;
            case NotifiableType.WORKER_ENDED_SHIFT:
                return `Worker ${worker.worker.name} has Ended their shift for Job #${job.confirmationNumber} at ${worker.location.address}.`;
            case NotifiableType.WORKER_CANNOT_SECURED_SITE:
                return `Worker ${worker.worker.name} cannot secure the site for Job #${job.confirmationNumber} at ${worker.location.address}.`;
            case NotifiableType.ASSIGN_JOB:
                const assignDate = moment(job.workers[0].startDate).tz(this.timeZone).format("MM/DD/YY HH:mm");
                return `Worker ${job.workers[0].worker.name} has been assigned to Job #${job.confirmationNumber} for ${assignDate}.`;
            case NotifiableType.JOB_REROUTE_CURRENT:
                return `Worker ${worker.worker.name} has been re-routed from ${worker?.old.address} to ${worker.new.address} for Job #${job.confirmationNumber}.`;
            case NotifiableType.JOB_REROUTE_NEW_JOB:
                return `Worker ${worker.worker} has been re-routed from Job #${worker?.job} at ${worker?.old.address} to Job #${job.confirmationNumber} at ${worker.new.address}.`;
        }
    }

    // noinspection JSMethodCanBeStatic
    private createFcmMessage(notificationType: NotifiableType, notificationData: any): FirebaseMessage {
      const {job, worker} = notificationData;
      switch (notificationType) {
        case NotifiableType.ASSIGN_JOB:
          return {
            notification: {
              title: "Job assign",
              body: `You have been assigned to Job ${job.confirmNumber}`
            }
          };
        case NotifiableType.WORKER_REMOVED:
          return {
            notification: {
              title: "Removed from Job",
              body: `You have been removed from Job ${job.confirmNumber}`
            }
          };
        case NotifiableType.JOB_LOCATION_CHANGED:
          return {
            notification: {
              title: "Job location changed",
              body: `Location has changed for Job ${job.confirmNumber} to ${job.locations[0].address}`
            }
          };
        case NotifiableType.COMPLETE_JOB:
          return {
            notification: {
              title: "Job complete",
              body: `Job ${job.confirmNumber} is now Complete`
            }
          };
        case NotifiableType.CANCEL_JOB:
          return {
            notification: {
              title: "Job cancelled",
              body: `Job ${job.confirmNumber} has been cancelled`
            }
          };
      }
    }
}

