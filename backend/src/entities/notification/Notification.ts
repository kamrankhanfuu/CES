import { AfterLoad, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity } from "typeorm";
import { Expose } from "class-transformer";
import { Buildable } from "@commons/decorators";
import { ApplicationEntity } from "../applicationEntity";
import { Invoice, Job, User } from "@entities";
import { IsOptional } from "class-validator";
import { NotifiableType } from "./NotifiableType";
import { NotificationPermission } from "./NotificationPermission";

@Entity()
@Buildable
export class Notification extends ApplicationEntity {

  static tableName = "notification";

  @Column({ nullable: false })
  creatorId: string;

  @Column()
  notifiableType: NotifiableType;

  @Column()
  notifiableGroup: {type: string, po: string};

  @Column()
  notifiableStates: Array<{id: string, isRead?: boolean, isRemoved?: boolean}>;

  @Column()
  @IsOptional()
  message: string;

  @Column()
  permissions: Array<NotificationPermission>;

  @Column()
  notifiableRecordID: string;

  @Expose({ name: "notifiableRecord" })
  notifiableRecord: User | Invoice | Job;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async removeRelatedData() {
    delete this.notifiableRecord;
  }

  @AfterLoad()
  async loadRelateData() {
    switch (this.notifiableType) {
      case NotifiableType.CREATE_JOB:
      case NotifiableType.EDIT_JOB:
      case NotifiableType.CANCEL_JOB:
      case NotifiableType.ASSIGN_JOB:
      case NotifiableType.WORKER_EN_ROUTE:
      case NotifiableType.WORKER_ON_LOCATION:
      case NotifiableType.WORKER_SECURED_SITE:
      case NotifiableType.WORKER_UPLOAD_AN_IMAGE:
      case NotifiableType.WORKER_ENDED_SHIFT:
      case NotifiableType.JOB_REROUTE_NEW_JOB:
      case NotifiableType.JOB_REROUTE_CURRENT:
      case NotifiableType.PO_NUMBER_HAS_BEEN_ADDED:
        this.notifiableRecord = <Job>await this.getRepository(Job).findOne(this.notifiableRecordID);
        break;
      case NotifiableType.CREATE_INVOICE:
        this.notifiableRecord = <Invoice>await this.getRepository(Invoice).findOne(this.notifiableRecordID);
        break;
      case NotifiableType.APPOINTED:
      case NotifiableType.AWAITING_APROVAL:
        this.notifiableRecord = <User>await this.getRepository(User).findOne(this.notifiableRecordID);
        break;
      default:
        break;
    }
  }
}
