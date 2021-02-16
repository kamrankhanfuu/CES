import { User } from '.';
import { JobListItem } from './jobListItem';

export class Notification {
  id: string;
  creator: User;
  createdAt: string;
  notifiableType: number;
  notifiableRecord: User | JobListItem; // User | Job | Invoice......
  notifiableGroup?: NotifiableGroup;
  message: string;
  isRead: boolean;
}

class NotifiableGroup {
  id: number;
  type: string;
  po: number;
}

export enum NotificationType {
  ALL = 0,
  CREATE_JOB = 1,
  CANCEL_JOB = 2,
  CREATE_INVOICE = 3,
  APPOINTED = 4,
  AWAITING_APPROVAL = 5,
  EDIT_JOB = 6,
  ASSIGN_JOB = 7,
  WORKER_EN_ROUTE = 8,
  WORKER_ON_LOCATION = 9,
  WORKER_SECURED_SITE = 10,
  WORKER_UPLOAD_AN_IMAGE = 11,
  WORKER_ENDED_SHIFT = 12,
  PO_NUMBER_HAS_BEEN_ADDED = 13,
  REMINDER_EMAILS = 14,
  JOB_REROUTE_CURRENT = 15,
  JOB_REROUTE_NEW_JOB = 16,
  WORKER_CANNOT_SECURED_SITE = 17,
  WORKER_NOT_EN_ROUTE_YET = 18,
  INVOICE_IS_AVAILABLE = 19
}
