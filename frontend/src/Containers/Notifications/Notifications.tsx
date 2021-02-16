import React, {Component} from 'react';
import NotificationItem from './NotificationItem';
import './notification.scss';
import actionRight from '../../Images/action-right.png';
import {observer} from 'mobx-react';
import notificationStore from '../../Stores/notificationStore';
import NotificationsFilter from './NotificationsFilter';
import {NotificationType} from '../../Models';
import PagingComponent from '../Components/Paging/PagingComponent';

interface Props {

}

interface State {
  page: number;
  isOptionMenuOpen: boolean;
  notificationType: NotificationType;
}

@observer
export class Notifications extends Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      isOptionMenuOpen: false,
      notificationType: NotificationType.ALL
    };
  }

  componentDidMount() {
    notificationStore.getNotifications({});
  }

  onToggleOptionMenu() {
    const {isOptionMenuOpen} = this.state;
    this.setState({isOptionMenuOpen: !isOptionMenuOpen});
  }

  setSelectedNotificationType(notificationType: NotificationType) {
    this.setState({notificationType});
    notificationStore.getNotifications({page: 0, notifiableType: notificationType});
  }

  changedPage = (page: number) => {
    this.setState({page});
    notificationStore.getNotifications({page, notifiableType: this.state.notificationType});
  }

  public render() {
    const filteredNotifications = notificationStore.notifications
      .map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onCloseHandler={(notification) => notificationStore.deleteNotification(notification)}/>
      ));

    return (
      <div className="container notification-page py-4">
        <div className="row">
          <div className="col-sm-4 ">
            <NotificationsFilter onFilterItemSelect={(type) => this.setSelectedNotificationType(type)}/>
          </div>
          <div className="col-sm-8">
            <div className="box-item p-0">
              <div className="box-item-header d-flex justify-content-between align-items-center px-4">
                Notifications
                <span className="d-block d-sm-none" onClick={() => this.onToggleOptionMenu()} >
                  <img src={actionRight} alt=""/>
                </span>
                {
                  this.state.isOptionMenuOpen && (
                    <div className="notification-option">
                      <ul className="notification-option__list">
                        <li
                          className="notification-option__items"
                          onClick={() => this.setSelectedNotificationType(NotificationType.ALL)}
                        >
                          All Notifications
                        </li>
                        <li
                          className="notification-option__items"
                          onClick={() => this.setSelectedNotificationType(NotificationType.CANCEL_JOB)}
                        >
                          Canceling Jobs
                        </li>
                        <li
                          className="notification-option__items"
                          onClick={() => this.setSelectedNotificationType(NotificationType.CREATE_JOB)}
                        >
                          Creating Jobs
                        </li>
                        <li
                          className="notification-option__items"
                          onClick={() => this.setSelectedNotificationType(NotificationType.CREATE_INVOICE)}
                        >
                          Creating Invoices
                        </li>
                      </ul>
                    </div>
                  )
                }
              </div>
              <div className="box-content-notification">
                {filteredNotifications}
              </div>
            </div>
            <div className="pagination-invoices">
              <PagingComponent
                activePage={this.state.page}
                totalItemsCount={notificationStore.notificationLoader.total}
                onChangePage={this.changedPage}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
