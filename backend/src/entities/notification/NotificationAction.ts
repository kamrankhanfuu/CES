import { NotifiableType } from "./NotifiableType";

export const NotificationAction: { [type: number]: { recipients: string[], message: string } } = {
    [NotifiableType.CREATE_JOB]: {
        recipients: ["requestorObj", "supervisorObj", "departmentSupervisors"],
        message: "Job Created"
    },
    [NotifiableType.ASSIGN_JOB]: {
        recipients: ["requestorObj", "supervisorObj", "departmentSupervisors"],
        message: "Job First Assigned to Worker"
    },
    [NotifiableType.WORKER_EN_ROUTE]: {
        recipients: ["requestorObj", "supervisorObj", "departmentSupervisors"],
        message: "Worker EnRoute"
    },
    [NotifiableType.WORKER_ON_LOCATION]: {
        recipients: ["requestorObj", "supervisorObj", "departmentSupervisors"],
        message: "Worker OnLocation"
    },
    [NotifiableType.WORKER_SECURED_SITE]: {
        recipients: ["requestorObj", "supervisorObj", "departmentSupervisors"],
        message: "Worker Secured Site"
    },
    [NotifiableType.WORKER_UPLOAD_AN_IMAGE]: {
        recipients: ["requestorObj", "supervisorObj", "departmentSupervisors"],
        message: "Worker Uploaded an Image"
    },
    [NotifiableType.WORKER_ENDED_SHIFT]: {
        recipients: ["requestorObj", "supervisorObj", "departmentSupervisors"],
        message: "Worker Ended Shift"
    },
    [NotifiableType.PO_NUMBER_HAS_BEEN_ADDED]: {
        recipients: ["requestorObj", "supervisorObj", "departmentSupervisors", "conEdBillingAdmins"],
        message: "PO Number has been added"
    },
    [NotifiableType.EDIT_JOB]: {
        recipients: ["requestorObj", "supervisorObj", "departmentSupervisors"],
        message: "Job has been modified"
    },
    [NotifiableType.CREATE_INVOICE]: {
        recipients: ["requestorObj", "supervisorObj", "departmentSupervisors", "conEdBillingAdmins"],
        message: "Invoice is available"
    },
    [NotifiableType.REMINDER_EMAILS]: {
        recipients: ["requestorObj", "supervisorObj", "departmentSupervisor"],
        message: "Invoice/PO Number Reminder Emails for outstanding invoices w/ missing PO Numbers"
    },
    [NotifiableType.JOB_REROUTE_CURRENT]: {
        recipients: ["requestorObj", "supervisorObj", "departmentSupervisor", "workerObjs"],
        message: "Worker has been rerouted"
    },
    [NotifiableType.JOB_REROUTE_NEW_JOB]: {
        recipients: ["requestorObj", "supervisorObj", "departmentSupervisor", "workerObjs"],
        message: "Worker has been rerouted"
    },
};
