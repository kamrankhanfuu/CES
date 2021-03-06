import { NotifiableType } from "./NotifiableType";
import { EROLES } from "../../constants";

export const NOTIFICATION_ROLE_MAP: { [s: number]: NotifiableType[] } = {
    [EROLES.requestor]: [
        NotifiableType.CREATE_JOB,
        NotifiableType.EDIT_JOB,
        NotifiableType.CANCEL_JOB,
        NotifiableType.CREATE_INVOICE,
        NotifiableType.REMINDER_EMAILS,
        NotifiableType.JOB_REROUTE_CURRENT,
        NotifiableType.JOB_REROUTE_NEW_JOB,
        NotifiableType.PO_NUMBER_HAS_BEEN_ADDED,
        NotifiableType.WORKER_ENDED_SHIFT,
        NotifiableType.WORKER_EN_ROUTE,
        NotifiableType.WORKER_ON_LOCATION,
        NotifiableType.WORKER_SECURED_SITE,
        NotifiableType.WORKER_CANNOT_SECURED_SITE,
        NotifiableType.WORKER_UPLOAD_AN_IMAGE,
        NotifiableType.ASSIGN_JOB],
    [EROLES.department_supervisor]: [
        NotifiableType.CREATE_JOB,
        NotifiableType.EDIT_JOB,
        NotifiableType.CANCEL_JOB,
        NotifiableType.CREATE_INVOICE,
        NotifiableType.REMINDER_EMAILS,
        NotifiableType.JOB_REROUTE_CURRENT,
        NotifiableType.JOB_REROUTE_NEW_JOB,
        NotifiableType.PO_NUMBER_HAS_BEEN_ADDED,
        NotifiableType.WORKER_ENDED_SHIFT,
        NotifiableType.WORKER_EN_ROUTE,
        NotifiableType.WORKER_ON_LOCATION,
        NotifiableType.WORKER_SECURED_SITE,
        NotifiableType.WORKER_CANNOT_SECURED_SITE,
        NotifiableType.WORKER_UPLOAD_AN_IMAGE,
        NotifiableType.ASSIGN_JOB],
    [EROLES.coned_field_supervisor]: [
        NotifiableType.CREATE_JOB,
        NotifiableType.EDIT_JOB,
        NotifiableType.CANCEL_JOB,
        NotifiableType.CREATE_INVOICE,
        NotifiableType.REMINDER_EMAILS,
        NotifiableType.JOB_REROUTE_CURRENT,
        NotifiableType.JOB_REROUTE_NEW_JOB,
        NotifiableType.PO_NUMBER_HAS_BEEN_ADDED,
        NotifiableType.WORKER_ENDED_SHIFT,
        NotifiableType.WORKER_EN_ROUTE,
        NotifiableType.WORKER_ON_LOCATION,
        NotifiableType.WORKER_SECURED_SITE,
        NotifiableType.WORKER_CANNOT_SECURED_SITE,
        NotifiableType.WORKER_UPLOAD_AN_IMAGE,
        NotifiableType.ASSIGN_JOB],
    [EROLES.coned_billing_admin]: [
        NotifiableType.CREATE_INVOICE,
        NotifiableType.REMINDER_EMAILS,
    ],
    [EROLES.billing]: [
        NotifiableType.CREATE_INVOICE,
        NotifiableType.REMINDER_EMAILS,
        NotifiableType.PO_NUMBER_HAS_BEEN_ADDED
    ],
    [EROLES.dispatcher]: [
        NotifiableType.CREATE_JOB,
        NotifiableType.EDIT_JOB,
        NotifiableType.CANCEL_JOB,
        NotifiableType.CREATE_INVOICE,
        NotifiableType.REMINDER_EMAILS,
        NotifiableType.JOB_REROUTE_CURRENT,
        NotifiableType.JOB_REROUTE_NEW_JOB,
        NotifiableType.PO_NUMBER_HAS_BEEN_ADDED,
        NotifiableType.WORKER_ENDED_SHIFT,
        NotifiableType.WORKER_EN_ROUTE,
        NotifiableType.WORKER_ON_LOCATION,
        NotifiableType.WORKER_SECURED_SITE,
        NotifiableType.WORKER_CANNOT_SECURED_SITE,
        NotifiableType.WORKER_UPLOAD_AN_IMAGE,
        NotifiableType.WORKER_NOT_EN_ROUTE_YET,
        NotifiableType.ASSIGN_JOB],
    [EROLES.dispatcher_supervisor]: [
        NotifiableType.CREATE_JOB,
        NotifiableType.EDIT_JOB,
        NotifiableType.CANCEL_JOB,
        NotifiableType.CREATE_INVOICE,
        NotifiableType.REMINDER_EMAILS,
        NotifiableType.JOB_REROUTE_CURRENT,
        NotifiableType.JOB_REROUTE_NEW_JOB,
        NotifiableType.PO_NUMBER_HAS_BEEN_ADDED,
        NotifiableType.WORKER_ENDED_SHIFT,
        NotifiableType.WORKER_EN_ROUTE,
        NotifiableType.WORKER_ON_LOCATION,
        NotifiableType.WORKER_SECURED_SITE,
        NotifiableType.WORKER_CANNOT_SECURED_SITE,
        NotifiableType.WORKER_UPLOAD_AN_IMAGE,
        NotifiableType.WORKER_NOT_EN_ROUTE_YET,
        NotifiableType.ASSIGN_JOB],
    [EROLES.superadmin]: [
        NotifiableType.CREATE_JOB,
        NotifiableType.EDIT_JOB,
        NotifiableType.CANCEL_JOB,
        NotifiableType.CREATE_INVOICE,
        NotifiableType.REMINDER_EMAILS,
        NotifiableType.JOB_REROUTE_CURRENT,
        NotifiableType.JOB_REROUTE_NEW_JOB,
        NotifiableType.PO_NUMBER_HAS_BEEN_ADDED,
        NotifiableType.WORKER_ENDED_SHIFT,
        NotifiableType.WORKER_EN_ROUTE,
        NotifiableType.WORKER_ON_LOCATION,
        NotifiableType.WORKER_SECURED_SITE,
        NotifiableType.WORKER_CANNOT_SECURED_SITE,
        NotifiableType.WORKER_UPLOAD_AN_IMAGE,
        NotifiableType.WORKER_NOT_EN_ROUTE_YET,
        NotifiableType.ASSIGN_JOB],
};
