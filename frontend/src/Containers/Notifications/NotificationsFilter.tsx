import React, {Component} from 'react';
import {NotificationType} from '../../Models';

interface Props {
  onFilterItemSelect: (notificationType: NotificationType) => void;
}

interface State {
  selectedNotificationType: NotificationType;
}

class NotificationsFilter extends Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      selectedNotificationType: NotificationType.ALL
    };
  }

  handleFilterItemClick(notificationType: NotificationType) {
    this.setState({
      selectedNotificationType: notificationType
    });
    this.props.onFilterItemSelect(notificationType);
  }

  render() {
    const {selectedNotificationType} = this.state;
    return (
      <div>
        <div className="filter-notification box-item-body d-none d-sm-block">
          <ul>
            <li
              className={selectedNotificationType === NotificationType.ALL ? 'active' : ''}
              onClick={() => this.handleFilterItemClick(NotificationType.ALL)}
            >
              All Notifications
            </li>
          </ul>
          <p className="mx-3 font-Bold">Jobs</p>
          <ul>
            <li
              className={selectedNotificationType === NotificationType.CREATE_JOB ? 'active' : ''}
              onClick={() => this.handleFilterItemClick(NotificationType.CREATE_JOB)}
            >
              Job created
            </li>
            <li
              className={selectedNotificationType === NotificationType.ASSIGN_JOB ? 'active' : ''}
              onClick={() => this.handleFilterItemClick(NotificationType.ASSIGN_JOB)}
            >
              Job First Assigned to Worker
            </li>
            <li
              className={selectedNotificationType === NotificationType.EDIT_JOB ? 'active' : ''}
              onClick={() => this.handleFilterItemClick(NotificationType.EDIT_JOB)}
            >
              Job has been modified
            </li>
            <li
              className={selectedNotificationType === NotificationType.PO_NUMBER_HAS_BEEN_ADDED ? 'active' : ''}
              onClick={() => this.handleFilterItemClick(NotificationType.PO_NUMBER_HAS_BEEN_ADDED)}
            >
              PO Number has been added
            </li>
            <li
              className={selectedNotificationType === NotificationType.JOB_REROUTE_NEW_JOB ? 'active' : ''}
              onClick={() => this.handleFilterItemClick(NotificationType.JOB_REROUTE_NEW_JOB)}
            >
              New Job Re-Route
            </li>
            <li
              className={selectedNotificationType === NotificationType.JOB_REROUTE_CURRENT ? 'active' : ''}
              onClick={() => this.handleFilterItemClick(NotificationType.JOB_REROUTE_CURRENT)}
            >
              Current Job Re-Route
            </li>
          </ul>
          <p  className="mx-3 font-Bold">Workers</p>
          <ul>
            <li
              className={selectedNotificationType === NotificationType.WORKER_EN_ROUTE ? 'active' : ''}
              onClick={() => this.handleFilterItemClick(NotificationType.WORKER_EN_ROUTE)}
            >
              Worker EnRouter
            </li>
            <li
              className={selectedNotificationType === NotificationType.WORKER_ON_LOCATION ? 'active' : ''}
              onClick={() => this.handleFilterItemClick(NotificationType.WORKER_ON_LOCATION)}
            >
              Worker OnLocation
            </li>
            <li
              className={selectedNotificationType === NotificationType.WORKER_SECURED_SITE ? 'active' : ''}
              onClick={() => this.handleFilterItemClick(NotificationType.WORKER_SECURED_SITE)}
            >
              Worker Secured Site
            </li>
            <li
              className={selectedNotificationType === NotificationType.WORKER_CANNOT_SECURED_SITE ? 'active' : ''}
              onClick={() => this.handleFilterItemClick(NotificationType.WORKER_CANNOT_SECURED_SITE)}
            >
              Worker Cannot Secured Site
            </li>
            <li
              className={selectedNotificationType === NotificationType.WORKER_UPLOAD_AN_IMAGE ? 'active' : ''}
              onClick={() => this.handleFilterItemClick(NotificationType.WORKER_UPLOAD_AN_IMAGE)}
            >
              Worker Uploaded an Image
            </li>
            <li
              className={selectedNotificationType === NotificationType.WORKER_ENDED_SHIFT ? 'active' : ''}
              onClick={() => this.handleFilterItemClick(NotificationType.WORKER_ENDED_SHIFT)}
            >
              Worker Ended Shift
            </li>
            <li
              className={selectedNotificationType === NotificationType.WORKER_NOT_EN_ROUTE_YET ? 'active' : ''}
              onClick={() => this.handleFilterItemClick(NotificationType.WORKER_NOT_EN_ROUTE_YET)}
            >
              Worker Not yet EnRoute 1 hour before scheduled time
            </li>
          </ul>
          <p  className="mx-3 font-Bold">Invoices</p>
          <ul>
            <li
              className={selectedNotificationType === NotificationType.INVOICE_IS_AVAILABLE ? 'active' : ''}
              onClick={() => this.handleFilterItemClick(NotificationType.INVOICE_IS_AVAILABLE)}
            >
              Invoice is available
            </li>
            <li
              className={selectedNotificationType === NotificationType.REMINDER_EMAILS ? 'active' : ''}
              onClick={() => this.handleFilterItemClick(NotificationType.REMINDER_EMAILS)}
            >
              Invoice/PO Number Reminder Emails for outstanding invoices w/missing PO Numbers
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default NotificationsFilter;