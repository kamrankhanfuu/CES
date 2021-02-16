import { AfterLoad, BeforeInsert, Column, Entity, FindOneOptions, Unique, } from "typeorm";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { ApplicationEntity } from "./applicationEntity";
import { Subcontractor } from "./subcontractor";
import { Exclude, Expose } from "class-transformer";
import { ACTIVE, APPROVE } from "@constants";
import { WorkingHours } from "./user/workingHours";
import { EROLES } from "../constants";
import { MongoHelper } from "../main";
import { Location } from "./location";
import { Department } from "./department";
import { NotificationPermission } from "./notification/NotificationPermission";
import { NOTIFICATION_PERMISSIONS_MAP } from "./notification/NotificationPermissionsMap";
import { NOTIFICATION_ROLE_MAP } from "./notification/NotificationRolesMap";

@Entity()
@Unique(["email"])
export class User extends ApplicationEntity {
  static tableName = "user";

  @Column({ nullable: false })
  @IsNotEmpty()
  firstName: string;

  @Column({ nullable: false })
  @IsNotEmpty()
  lastName: string;

  @Column({ unique: true, nullable: false })
  @IsNotEmpty()
  @IsEmail()
  @ValidateIf(
    (user) =>
      !user.roles ||
      (!user.roles.includes(EROLES.worker) &&
        !user.roles.includes(EROLES.subcontractor))
  )
  // @Validate(ConedEmailValidator)
  email: string;

  @Column({ default: ACTIVE.inactive })
  isActive: number;

  @Column({ default: "" })
  @IsOptional()
  @IsString()
  activateToken: string;

  @Column({ default: "" })
  @IsOptional()
  @IsString()
  restoreToken: string;

  @Column({ select: false })
  @Exclude()
  password: string;

  @Column()
  // @IsNotEmpty()
  public phoneNumber: string;

  @Column({ select: false })
  departments: Department[];

  @Column({ default: [EROLES.worker] })
  @IsArray()
  @IsOptional()
  roles: Array<EROLES>;

  @Column()
  @IsOptional()
  @IsNumber()
  isApproved: number;

  @Column()
  avatar: string;

  @Exclude()
  @IsOptional()
  subcontractor: Subcontractor;

  @Column()
  @Exclude()
  @IsOptional()
  subcontractor_name: string;

  @Column()
  @IsOptional()
  subcontractorId: string;

  @Column({ default: new Array<WorkingHours>() })
  @IsOptional()
  @IsArray()
  workingHours: Array<WorkingHours>;

  @Column()
  @ValidateNested()
  location: Location;

  @Column({ default: new Array<string>() })
  @IsOptional()
  fcmToken: Array<string>;

  // tslint:disable-next-line:no-null-keyword
  // @Column({ default: null })
  @Column()
  @IsOptional()
  @IsDateString()
  deletedAt: Date;

  @Expose()
  available?: boolean;

  @Column()
  @IsOptional()
  @ValidateNested({ each: true })
  trace: Array<Location>;

  @Column()
  notification: NotificationPermission[];

  @Column()
  @IsOptional()
  @IsNumber()
  timezone: number;

  @Column()
  workerTypes: number[];

  @Column()
  workerTypesDefault: any[];

  @BeforeInsert()
  async setDefaultValues() {
    this.password = bcrypt.hashSync(this.password, 10);
    this.activateToken = crypto.randomBytes(16).toString("hex");
    if (this.isActive === undefined) {
      this.isActive = ACTIVE.inactive;
    }
    if (isNaN(this.isApproved)) {
      this.isApproved = APPROVE.waiting;
    }
    if (!this.workingHours) {
      this.workingHours = new Array<WorkingHours>();
    }
    if (!this.location) {
      this.location = new Location();
    }

    if (!this.roles) {
      this.roles = [];
    }
    this.departments = this.departments || [];
    this.notification = [];

    this.roles &&
      this.roles.forEach((role) => {
        NOTIFICATION_ROLE_MAP[role] &&
          NOTIFICATION_ROLE_MAP[role].forEach((notificationType) => {
            NOTIFICATION_PERMISSIONS_MAP[notificationType] &&
              NOTIFICATION_PERMISSIONS_MAP[notificationType].forEach((notification) => {
                if (!this.notification.includes(notification)) {
                  this.notification.push(notification);
                }
              });
          });
      });
  }

  @AfterLoad()
  async loadRelateData() {
    const subcontractorRepo = this.getRepository(Subcontractor);
    const subcontractor = <Subcontractor>await subcontractorRepo.findOne({
      workerIds: this.id.toString(),
    } as FindOneOptions);
    if (subcontractor) {
      this.subcontractor = subcontractor;
    }
    if (!this.workingHours) {
      this.workingHours = new Array<WorkingHours>();
    }
    if (this.roles && this.roles.includes(EROLES.worker)) {
      const query = {
        workers: {
          $elemMatch: {
            workerId: this.id.toString(),
            startDate: {
              $lt: new Date().toISOString(),
            },
            endTime: {
              $gte: new Date().toISOString(),
            },
          },
        },
      };
      await MongoHelper.connect();
      const collection = MongoHelper.getCollection("job");
      const currentJobs = await collection.count(query);
      this.available = currentJobs === 0;
    }
  }

  @Expose()
  get name() {
    return `${this.firstName} ${this.lastName}`;
  }

  @Expose()
  subcontractorName() {
    if (this.subcontractor) {
      if (this.subcontractor_name !== this.subcontractor.name) {
        this.subcontractor_name = this.subcontractor.name;
        // this.save();
      }
      return this.subcontractor_name;
      // return this.subcontractor_name;
    }
    return "";
  }

  @Expose()
  subcontractorInfo() {
    if (this.subcontractor) {
      return this.subcontractorId;
      // return this.subcontractor;
      // return this.subcontractor_name;
    }
    return undefined;
  }

  @Expose()
  status() {
    switch (true) {
      case !this.isActive:
        return "Inactive";
      case !this.isApproved:
        return "Onhold";
      default:
        return "Active";
    }
  }
}
