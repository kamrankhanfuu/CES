import { EntityRepository } from "typeorm";
import { NotificationRepository } from "./notificationRepository";
import { Notification } from "@entities";
import { ApplicationRepositoryImpl } from "@repositories/applicationRepository";
import { MetadataObj } from "../../commons";
import { Request } from "express";
import { Pagination } from "../../paginate";

@EntityRepository(Notification)
export class NotificationRepositoryImpl extends ApplicationRepositoryImpl<Notification> implements NotificationRepository {
  EntityType = Notification;

  async customCreate(args: MetadataObj, permitKeys: Array<string> = []): Promise<Notification> {
    const notification = await super.customCreate(args, permitKeys);
    await notification.loadRelateData();
    return notification;
  }

  async customUpdate(entity: Notification, args: MetadataObj, permitKeys: Array<string> = []): Promise<Notification> {
    return await super.customUpdate(entity, args, permitKeys);
  }

  async findAll(request: Request, appQuery: any = {}): Promise<Pagination<Notification>> {
    return super.findAll(request, appQuery);
  }
}
