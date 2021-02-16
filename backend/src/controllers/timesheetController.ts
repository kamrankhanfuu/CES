import { TYPES } from "@commons";
import { rescuable } from "@commons/decorators";
import { SystemLogger } from "@loggers";
import { JobRepositoryImpl, TimesheetRepositoryImpl, } from "@repositories";
import express, { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import passport from "passport";
import { getCustomRepository } from "typeorm";
import { EROLES, searchDepartmentById } from "../constants";
import { Timesheet } from "../entities";
import { WorkerJobStatus } from "../entities/jobWorker";
import ApplicationController from "./applicationController";
import multer = require("multer");

const { ObjectId } = require("mongodb").ObjectId;

@injectable()
export class TimesheetController extends ApplicationController {
  logger: SystemLogger;
  timesheetRepository: TimesheetRepositoryImpl;
  job: JobRepositoryImpl;

  constructor(@inject(TYPES.SystemLogger) _logger: SystemLogger) {
    super(_logger);
    this.timesheetRepository = getCustomRepository(TimesheetRepositoryImpl);
    this.job = getCustomRepository(JobRepositoryImpl);
  }

  register(app: express.Application, upload: multer.Instance): void {
    super.register(app);
    const router = express.Router();

    router.all("*", passport.authenticate("jwt", { session: false }));

    router.route("/").get(this.getAllWithPagination);
    router.route("/:id").get(this.getOne);
    router.route("/:id/pdf").get(this.getPDF);
    router.route("/:id/calculate-total").get(this.calcTotal);
    router.route("/:id/notify-supervisor").get(this.notifySupervisor);

    router.route("/").post(this.create);

    router.route("/:id").put(upload.single("sign"), this.update);
    router.route("/:id/sign").put(this.sign);
    router.route("/:id/skip").put(this.updateSkipReason);

    app.use("/timesheets", router);
  }

  @rescuable
  async getAllWithPagination(req: Request, res: Response, next: NextFunction) {
    req.query = await Timesheet.buildSearchQuery(req.query);
    let isWorker = false;
    if (req.user.roles && req.user.roles.includes(EROLES.worker)) {
      req.query = { workerId: req.user.id.toString() };
      isWorker = true;
    }

    if (req.user && req.user.roles) {
      if (req.user.roles.includes(EROLES.coned_billing_admin) ||
        req.user.roles.includes(EROLES.requestor) ||
        req.user.roles.includes(EROLES.department_supervisor)) {
        if (!(
          req.user.roles.includes(EROLES.dispatcher) ||
          req.user.roles.includes(EROLES.dispatcher_supervisor) ||
          req.user.roles.includes(EROLES.billing) ||
          req.user.roles.includes(EROLES.superadmin)
        )) {
          const departments: any[] = req.user.departments;
          const departmentIds: any[] = departments.map(el => Number(el.id));
          req.query["department"] = { $in: departmentIds };
        }
      }
    }
    if (req.user && req.user.roles) {
      if (req.user.roles.includes(EROLES.coned_field_supervisor)) {
        if (!(
          req.user.roles.includes(EROLES.coned_billing_admin) ||
          req.user.roles.includes(EROLES.requestor) ||
          req.user.roles.includes(EROLES.department_supervisor) ||
          req.user.roles.includes(EROLES.dispatcher) ||
          req.user.roles.includes(EROLES.dispatcher_supervisor) ||
          req.user.roles.includes(EROLES.billing) ||
          req.user.roles.includes(EROLES.superadmin)
        )) {
          const jobRepository = getCustomRepository(JobRepositoryImpl);

          const jobs = await jobRepository.findAllNoPaginate({
            "supervisor": `${req.user.id}`
          });

          const jobIds: any[] = jobs.map(el => el.id);

          req.query["jobId"] = { $in: jobIds };
        }
      }
    }

    if (req.user && req.user.roles) {
      if (req.user.roles.length === 1 && req.user.roles.includes(EROLES.requestor)) {
        req.query["requestor"] = req.user.id.toString();
      }
    }

    const result = [] as any;
    const found = await this.timesheetRepository.findAll(req);

    if (!isWorker) {
      for (let i = 0; i < found.results.length; i++) {
        const timesheet = found.results[i];
        result.push({
          ...timesheet, worker: {
            avatar: timesheet.worker.avatar,
            name: timesheet.worker.name,
          }
        });
      }
      res.send({
        results: result,
        total: found.total,
        page: found.page,
        limit: found.limit
      });
      return;
    }
    for (let i = 0; i < found.results.length; i++) {
      const timesheet = found.results[i];
      const data = await timesheet.workerView(req.user.id);
      if (data) {
        result.push(data);
      }
    }
    res.send({
      results: result,
      total: found.total,
      page: found.page,
      limit: found.limit
    });
  }

  @rescuable
  async getOne(req: Request, res: Response, next: NextFunction) {
    const { params: { id } } = req;
    let isWorker = false;
    if (req.user.roles && req.user.roles.includes(EROLES.worker)) {
      req.query = { workerId: req.user.id.toString() };
      isWorker = true;
    }
    if (!isWorker) {
      const timesheet = await this.timesheetRepository.findOne(ObjectId(id));
      if (!timesheet) {
        res.status(404);
        return;
      }

      res.send(timesheet);
      return;
    }
    req.query = {
      workerId: req.user.id.toString(),
      _id: ObjectId(id)
    };
    const timesheet = await this.timesheetRepository.findOne(ObjectId(id));
    if (!timesheet) {
      res.status(404);
      return;
    }
    const result = await timesheet.workerView(req.user.id);
    if (!result) {
      res.status(404);
      return;
    }
    res.send(await timesheet.workerView(req.user.id));
  }

  @rescuable
  async create(req: Request, res: Response, next: NextFunction) {
    if (!req.user.roles.includes(EROLES.worker)) {
      res.status(400).send({ message: `Only workers can create timesheets` });
      return;
    }
    if (!req.body.hasOwnProperty("date")) {
      res.status(400).send({ message: '"date" is required' });
      return;
    }
    req.body.workerId = req.user.id.toString();
    const timesheet = await this.timesheetRepository.customCreate(req.body);
    if (!timesheet) {
      res.status(400).send({ message: `Unexpected Error` });
      return;
    }
    const jobRepository = getCustomRepository(JobRepositoryImpl);
    jobRepository.author = req.user;

    const job = await jobRepository.findById(timesheet.jobId.toString());
    if (!job) {
      res.status(404).send({ message: `Can't find Job` });
      await this.timesheetRepository.destroy(timesheet.id.toString());
      return;
    }
    if (searchDepartmentById(job.department).otBreak) {
      timesheet.noBreak = false;
      await timesheet.save();
    }
    job.setWorkerStatus(req.user.id.toString(), req.body.date, WorkerJobStatus.REVIEW);
    const _job = await jobRepository.findById(timesheet.jobId.toString());
    await jobRepository.customUpdate(_job, { jobStatus: job.jobStatus, workers: job.workers });
    res.send(timesheet);
  }

  @rescuable
  async update(req: Request, res: Response, next: NextFunction) {
    const timesheet = await this.timesheetRepository.findById(req.params.id.toString());

    if (!timesheet) {
      res.status(404).send();
      return;
    }

    res.send(await this.timesheetRepository.customUpdate(timesheet, req.body, this.permitedAttributes));
  }

  @rescuable
  async updateSkipReason(req: Request, res: Response, next: NextFunction) {

    const timesheetId = req.params.id.toString();

    const timesheet = await this.timesheetRepository.findById(timesheetId);
    if (!timesheet) {
      res.status(404).send();
      return;
    }

    if (timesheet.jobId) {
      const job = await this.job.findById(timesheet.jobId.toString());

      if (job.workers)
        job.workers.map((item: any) => {
          if (item.worker.id.toString() === timesheet.workerId.toString())
            item.status = 7;
          return item;
        });

      if (job.timesheets)
        job.timesheets.map((item: any) => {
          if (item.id.toString() === timesheetId)
            item.reason = JSON.parse(req.query.reason);
          return item;
        });
      this.job.author = req.user;
      await this.job.findAndUpdate(job.id.toString(), { workers: job.workers, timesheets: job.timesheets });
    }

    res.send(await this.timesheetRepository.customUpdate(timesheet, { ...req.body, reason: JSON.parse(req.query.reason) }, this.permitedAttributes));
  }

  @rescuable
  async sign(req: express.Request, res: express.Response, next: express.NextFunction) {
    const required = ["sign", "signatureName", "employeeNumber", "signedTime"];
    const {id} = req.params;
    const signature = req.body;
    const {roles = []} = req.user;

    if (!roles.includes(EROLES.worker)) {
      res.status(403);
      res.send({message: `Only workers can sing timesheet`});
      return;
    }

    const missedFields = required.filter(key => !Object.keys(signature).includes(key) || !signature[key]);
    if (missedFields.length > 0) {
      res.status(400);
      res.send({message: `Missing required '${missedFields.join(", ")}' in body`});
      return;
    }

    const timesheet = await this.timesheetRepository.findById(id);

    if (!timesheet) {
      res.status(404);
      res.send({message: `Timesheet with id '${id} not found'`});
      return;
    }

    if (timesheet.workerId && timesheet.jobId) {
      const job = await this.job.findById(timesheet.jobId.toString());
      if (job) {
        job.workers = job.workers.map((item: any) => {
          if (item.worker.id.toString() === timesheet.workerId.toString())
            item.status = WorkerJobStatus.COMPLETE;
          return item;
        });
        this.job.author = req.user;
        await this.job.findAndUpdate(job.id.toString(), { workers: job.workers });
      }
    }

    const updatedTimesheet = await this.timesheetRepository.customUpdate(timesheet, signature, this.permitedAttributes);

    res.send(updatedTimesheet);
  }

  @rescuable
  async getPDF(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { params: { id } } = req;
    const tz =req.query.tz || "";
    const timesheet = await this.timesheetRepository.findOne(id.toString());
    if (!timesheet) {
      res.status(404).send();
      return;
    }
    const file = await timesheet.getPdfReport(tz);
    res.download(file);
  }

  @rescuable
  async calcTotal(req: Request, res: Response, next: NextFunction) {
    const timesheet = await this.timesheetRepository.findById(req.params.id.toString());
    if (!timesheet) {
      res.status(404).send();
      return;
    }
    timesheet.startDate = req.query.startDate;
    timesheet.finishDate = req.query.finishDate;
    res.send({ total: timesheet.totalH });
  }

  @rescuable
  async notifySupervisor(req: Request, res: Response, next: NextFunction) {
    const timesheet = await this.timesheetRepository.findById(req.params.id.toString());
    if (!timesheet) {
      res.status(404).send();
      return;
    }

    if (timesheet.conEdisonSupervisor) {
      const user = await this.users.findById(timesheet.conEdisonSupervisor);
      const jobRepository = getCustomRepository(JobRepositoryImpl);

      const job = await jobRepository.findById(timesheet.jobId.toString());
      const url = `${process.env.CLIENT_DOMAIN}/timesheets/${timesheet.id}/edit`;
      this.mailer.send(user.email, { url, confirmationNumber: job.confirmationNumber }, "notifySupervisor");
    }

    res.send();
  }

  get permitedAttributes() {
    return [
      "electric",
      "gas",
      "locations",
      "startDate",
      "finishDate",
      "totalHours",
      "hasLunch",
      "hasDinner",
      "noBreak",
      "conEdisonTruck",
      "conEdisonSupervisor",
      "sign",
      "signatureName",
      "signedTime",
      "employeeNumber",
      "reason",
      "receipt",
      "poet"
    ];
  }
}
