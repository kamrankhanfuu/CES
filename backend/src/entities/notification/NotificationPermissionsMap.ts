import { NotifiableType } from "./NotifiableType";
import { NotificationPermission } from "./NotificationPermission";

export const NOTIFICATION_PERMISSIONS_MAP: { [type: number]: Array<NotificationPermission> }  = {
    [NotifiableType.CREATE_JOB]: [NotificationPermission.job_created_email, NotificationPermission.job_created_webpush],
    [NotifiableType.CANCEL_JOB]: [NotificationPermission.job_has_been_modified_email, NotificationPermission.job_has_been_modified_webpush],
    [NotifiableType.EDIT_JOB]: [NotificationPermission.job_has_been_modified_email, NotificationPermission.job_has_been_modified_webpush],
    [NotifiableType.AWAITING_APROVAL]: [NotificationPermission.job_has_been_modified_email, NotificationPermission.job_has_been_modified_webpush],
    [NotifiableType.ASSIGN_JOB]: [NotificationPermission.job_first_assigned_worker_email, NotificationPermission.job_first_assigned_worker_webpush],
    [NotifiableType.CREATE_INVOICE]: [NotificationPermission.invoice_available_email, NotificationPermission.invoice_available_webpush],
    [NotifiableType.APPOINTED]: [NotificationPermission.job_first_assigned_worker_email, NotificationPermission.job_first_assigned_worker_webpush],
    [NotifiableType.WORKER_EN_ROUTE]: [NotificationPermission.worker_en_router_email, NotificationPermission.worker_en_router_webpush],
    [NotifiableType.WORKER_ON_LOCATION]: [NotificationPermission.worker_on_location_email, NotificationPermission.worker_on_location_webpush],
    [NotifiableType.WORKER_SECURED_SITE]: [NotificationPermission.worker_secured_site_email, NotificationPermission.worker_secured_site_webpush],
    [NotifiableType.WORKER_UPLOAD_AN_IMAGE]: [NotificationPermission.worker_uploaded_image_email, NotificationPermission.worker_uploaded_image_webpush],
    [NotifiableType.WORKER_ENDED_SHIFT]: [NotificationPermission.worker_ended_shift_email, NotificationPermission.worker_ended_shift_webpush],
    [NotifiableType.PO_NUMBER_HAS_BEEN_ADDED]: [NotificationPermission.job_PO_email, NotificationPermission.job_PO_webpush],
    [NotifiableType.REMINDER_EMAILS]: [NotificationPermission.invoice_number_reminder_emails_email, NotificationPermission.invoice_number_reminder_emails_webpush],
    [NotifiableType.JOB_REROUTE_CURRENT]: [NotificationPermission.current_job_reroute_email, NotificationPermission.current_job_reroute_webpush],
    [NotifiableType.JOB_REROUTE_NEW_JOB]: [NotificationPermission.new_job_reroute_email, NotificationPermission.new_job_reroute_webpush],
    [NotifiableType.WORKER_CANNOT_SECURED_SITE]: [NotificationPermission.worker_cannot_secured_site_email, NotificationPermission.worker_cannot_secured_site_webpush],
    [NotifiableType.WORKER_NOT_EN_ROUTE_YET]: [NotificationPermission.worker_not_yet_enroute_email, NotificationPermission.worker_not_yet_enroute_webpush],
};
