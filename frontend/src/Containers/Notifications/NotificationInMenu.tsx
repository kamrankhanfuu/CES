import React from 'react';
import NotificationItem from './NotificationItem';
import {Notification} from '../../Models';
import notificationStore from '../../Stores/notificationStore';
import {observer} from 'mobx-react';

@observer
export class NotificationInMenu extends React.Component<any> {

  componentDidMount() {
    document.body.addEventListener('click', this.props.handleOutSiteClick);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.props.handleOutSiteClick);
  }

  async markNotificationsAsRead(notification: Notification) {
    await notificationStore.markNotificationAsRead(notification);
  }

  public render() {
    return (
      <div className="notification-page notification-toggle" data-popup>
        <div className="box-item p-0" data-popup>
          <div className="box-item-header text-left px-4" data-popup>
            Notifications
          </div>
          <div className="box-content-notification" data-popup>
            {
              notificationStore.unReadNotifications
                .map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onCloseHandler={(notification) => this.markNotificationsAsRead(notification)}
                  />
                ))
            }
          </div>
          <div className="show-all" data-popup>
            <a href="/notifications">Show All</a>
          </div>
        </div>
      </div>
    );
  }
}
