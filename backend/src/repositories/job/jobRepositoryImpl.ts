import "reflect-metadata";
import { Job, JobWorker, User } from "@entities";
import { JobStatus } from "@constants";
import { JobRepository, TimesheetRepositoryImpl } from "@repositories";
import { MetadataObj } from "commons";
import { DeleteResult, EntityRepository, FilterQuery, getCustomRepository } from "typeorm";
import { Request } from "express";
import { ApplicationRepositoryImpl } from "../applicationRepository";
import { ChangesLog } from "../../entities/changesLog";
import { QueryBuilderImpl } from "@utils/queryBuilder";
import { Pagination } from "@paginate";
import { notifyServer } from "../../app";
import NotificationService from "../../services/NotificationService";
import { NotifiableType } from "../../entities/notification/NotifiableType";

@EntityRepository(Job)
export class JobRepositoryImpl extends ApplicationRepositoryImpl<Job> implements JobRepository {
  EntityType = Job;
  private _author: User;
  private notificationService: NotificationService;

  constructor() {
    super();
    this.notificationService = new NotificationService();
  }

  set author(value: User) {
    this._author = value;
  }

  async add(args: MetadataObj, permitKeys: string[]): Promise<Job> {
    const job = await this.customCreate(args, permitKeys);
    await this.notificationService.sendJobNotification(NotifiableType.CREATE_JOB, { job });
    (await notifyServer).sendUpdateJob(job);
    return job;
  }

  async update(entity: Job, args: MetadataObj, permitKeys: Array<string> = []): Promise<Job> {
    const job = await this.customUpdate(entity, args, permitKeys);
    if (entity.notificationObj) {
      const notificationType = entity.notificationObj.type || NotifiableType.EDIT_JOB;
      const notificationData = entity.notificationObj.data || {};
      await this.notificationService.sendJobNotification(notificationType, { ...notificationData, job });
    }
    return job;
  }

  async customCreate(args: MetadataObj, permitKeys: Array<string> = []): Promise<Job> {
    let entity = await super.buidEntity();
    const _old = JSON.parse(JSON.stringify(entity));
    entity.assignAttributes(args, permitKeys);
    if (!entity.changesLog || !Array.isArray(entity.changesLog)) {
      entity.changesLog = new Array<ChangesLog>();
    }
    await entity.validate();

    entity = entity.logStatusChanges(entity.jobStatus);
    entity.changesLog.push(ChangesLog.createLog(permitKeys, _old, entity, this._author));

    if (Array.isArray(entity.workers)) {
      entity.workers.map((worker) => {
        worker.hasSeen = false;
      });
    }

    return await entity.save();
  }

  async updateWithChangesLog(old: Job, entity: Job, args: MetadataObj, permitKeys: Array<string> = []): Promise<Job> {
    const job = await new Promise<Job>(async (resolve) => {
      entity.assignAttributes(args, permitKeys);
      if (!entity.changesLog || !Array.isArray(entity.changesLog)) {
        entity.changesLog = new Array<ChangesLog>();
      }
      await entity.validate();
      const updated = await entity.save();
      updated.changesLog.push(ChangesLog.createLog(permitKeys, old, updated, this._author));
      updated.logStatusChanges(updated.jobStatus, old.jobStatus);
      if (updated.jobStatus == JobStatus.Cancelled) {
        if (updated.timesheets && updated.timesheets.length > 0) {
          updated.timesheets.forEach(async (element) => {
            element.finishDate = new Date().toISOString() as any;
            element.totalHours = args["trackingHours"];
          });
        }
      }
      const updateUser = new Array<JobWorker>();
      if (Array.isArray(updated.workers)) {
        updated.workers.map(async (worker) => {
          let searchIndex = -1;
          if (Array.isArray(old.workers)) {
            searchIndex = old.workers.findIndex((oldworker: JobWorker) => {
              if (worker.locationID == oldworker.locationID &&
                worker.startDate == oldworker.startDate &&
                worker.endDate == oldworker.endDate)
                return true;
            });
            if (searchIndex == -1) {
              worker.hasSeen = false;
            }
          } else {
            worker.hasSeen = false;
          }
          if (!worker.hasSeen) {
            updateUser.push(worker);
          }
        });
      }
      const receiveUser = [...updated.workers];
      console.log("receiveUSer: ", receiveUser);
      if (Array.isArray(old.workers)) {
        old.workers.map((worker: JobWorker) => {
          if (receiveUser.findIndex((reu) => reu.workerId == worker.workerId) == -1) {
            receiveUser.push(worker);
          }
        });
      }
      await updated.save();
      (await notifyServer).sendUpdateJobWithUser(updated, receiveUser);
      if (updated.jobStatus == JobStatus.Cancelled) {
        await this.notificationService.sendJobNotification(NotifiableType.CANCEL_JOB, { job: updated });
        const timesheets = await getCustomRepository(TimesheetRepositoryImpl).findAllNoPaginate({ jobId: updated.id });
        if (timesheets && timesheets.length > 0) {
          timesheets.forEach(async (element) => {
            element.finishDate = new Date().toISOString() as any;
            element.totalHours = args["trackingHours"];
            await element.save();
          });
        }
      } else {
        if (args["workers"] && (old.workers == undefined || old.workers.length === 0)) {
          await this.notificationService.sendJobNotification(NotifiableType.ASSIGN_JOB, { job: updated });
        }
      }
      resolve(updated);
    });
    if (entity.notificationObj) {
      const notificationType = entity.notificationObj.type || NotifiableType.EDIT_JOB;
      const notificationData = entity.notificationObj.data || {};
      await this.notificationService.sendJobNotification(notificationType, { ...notificationData, job });
    }
    return job;
  }

  async customUpdate(entity: Job, args: MetadataObj, permitKeys: Array<string> = []): Promise<Job> {
    const _old = JSON.parse(JSON.stringify(entity));
    entity.assignAttributes(args, permitKeys);

    if (!entity.changesLog || !Array.isArray(entity.changesLog)) {
      entity.changesLog = new Array<ChangesLog>();
    }

    await entity.validate();
    const updated = await entity.save();

    updated.changesLog.push(ChangesLog.createLog(permitKeys, _old, updated, this._author));
    updated.logStatusChanges(updated.jobStatus, _old.jobStatus);
    if (updated.jobStatus == JobStatus.Cancelled) {
      if (updated.timesheets && updated.timesheets.length > 0) {
        updated.timesheets.forEach(async (element) => {
          element.finishDate = new Date().toISOString() as any;
          element.totalHours = args["trackingHours"];
        });
      }
    }

    const updateUser: JobWorker[] = [];
    if (Array.isArray(updated.workers)) {
      updated.workers.map(async (worker) => {
        let searchIndex = -1;
        if (Array.isArray(_old.workers)) {
          searchIndex = _old.workers.findIndex((oldworker: JobWorker) => {
            if (worker.locationID == oldworker.locationID &&
              worker.startDate == oldworker.startDate &&
              worker.endDate == oldworker.endDate)
              return true;
          });
          if (searchIndex == -1) {
            worker.hasSeen = false;

          } else {

          }
        } else {
          worker.hasSeen = false;
        }
        if (!worker.hasSeen) {
          updateUser.push(worker);

        }

      });
    }
    let receiveUser: JobWorker[] = [];
    receiveUser = [...updated.workers];
    console.log("receiveUSer: ", receiveUser);

    if (Array.isArray(_old.workers)) {
      _old.workers.map((worker: JobWorker) => {
        if (receiveUser.findIndex((reu) => reu.workerId == worker.workerId) == -1) {
          receiveUser.push(worker);
        }
      });
    }
    await updated.save();

    (await notifyServer).sendUpdateJobWithUser(updated, receiveUser);

    if (updated.jobStatus == JobStatus.Cancelled) {
      await this.notificationService.sendJobNotification(NotifiableType.CANCEL_JOB, { job: updated });

      const timesheets = await getCustomRepository(TimesheetRepositoryImpl).findAllNoPaginate({ jobId: updated.id });
      if (timesheets && timesheets.length > 0) {
        timesheets.forEach(async (element) => {
          element.finishDate = new Date().toISOString() as any;
          element.totalHours = args["trackingHours"];
          await element.save();
        });
      }
    }
    else {
      if (updated.jobStatus == JobStatus.Completed) {
        await this.notificationService.sendJobNotification(NotifiableType.COMPLETE_JOB, { job: updated });
      }
      if (args["workers"] && (_old.workers == undefined || _old.workers.length === 0)) {
        await this.notificationService.sendJobNotification(NotifiableType.ASSIGN_JOB, { job: updated });
      }
      if (args["workers"] && (_old.workers.length > updated.workers.length)) {
        await this.notificationService.sendJobNotification(NotifiableType.WORKER_REMOVED, { job: updated, old: _old });
      }
      if (args["locations"] && Date.parse(_old.requestTime) > Date.now()) {
        const oldAddress = _old.locations[0].address;
        const newAddress = args["locations"][0].address;
        oldAddress !== newAddress && await this.notificationService.sendJobNotification(NotifiableType.JOB_LOCATION_CHANGED, { job: updated });
      }
    }

    return updated;
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }


  async findAllWithTextSearch(request: Request, appQuery: any = {}): Promise<Pagination<Job>> {
    const queryBuilder = new QueryBuilderImpl<Job>(request, appQuery);
    const query = queryBuilder.build();
    const results = await this.repository.find(query);

    let total = 0;
    const queryRunner = this.repository.queryRunner as any;
    if (queryRunner) {
      total = await queryRunner.getCollection("job").count((query as any).where as FilterQuery<any>);
    }

    return new Pagination<Job>({
      results,
      total,
      page: queryBuilder.page,
      limit: queryBuilder.limit
    });
  }

  async findAllWithPagination(req: Request, appQuery: any = {}, isWorker: any= false, workerStatus: any= {}) {

    const queryBuilder = new QueryBuilderImpl<Job>(req, appQuery);
    const query = queryBuilder.build();

    const results = await this.repository.find({where: appQuery, order: {requestTime: 'ASC'}});

    if (results) {
      const data = this.filterJobsWithWorker(results, isWorker, req, workerStatus);

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const dataResults = data.slice((page * limit - limit), page * limit);

      return new Pagination<Job>({
        results: dataResults,
        total: data.length,
        page,
        limit
      });
    }



  }

  filterJobsWithWorker(jobs: Job[], isWorker: boolean, req: Request, workerStatus: any= {}) {
    let _jobs: any[];
    _jobs = jobs;
    if (isWorker) {
      _jobs = [];
      jobs.forEach((job) => {
        let workerAsigns: any[];
        let timesheetId: any[];
        const time: any = {};
        let conEdisonTruck: Number; // apollo

        if (job.jobStatus !== 6) {
          workerAsigns = job.workers.filter(
            (jW) => {
              if (workerStatus && workerStatus.length > 0 && !workerStatus.includes(jW.status))
                return false;
              return jW.workerId === req.user.id.toString();
            }
          );

          if (job.timesheets) {


            timesheetId = job.timesheets && job.timesheets.map((item: any) => {

              conEdisonTruck = item.conEdisonTruck;
              // time.startDate = moment(item.startDate).format('MM/DD/YYYY')
              // time.startTime = moment(item.startDate).format('HH:mm')
              // time.finishDate = moment(item.finishDate).format('MM/DD/YYYY')
              // time.finishTime = moment(item.finishDate).format('HH:mm')

              time.startTime = item.startDate;
              time.finishTime = item.finishDate;
              return item.id;
            }
            );
          }


          workerAsigns.forEach((jW) => {
            _jobs.push({
              ...job.workerView(jW),
              "timeSheetsId": timesheetId,
              "conEdisonTruck": conEdisonTruck,
              "timesheetStartTime": time.startTime || "",
              "timesheetFinishTime": time.finishTime || "",


            });
          });
        }
      });
    }
    _jobs.map((_job) => {
      if (_job.changesLog) {
        delete _job.changesLog;
        delete _job.timesheets;
        return _job;
      }
    });
    return _jobs;
  }

}