import {action, observable} from 'mobx';
import {Notification, NotificationType} from '../Models';
import {notificationAPI} from '../Services/API';
import Pagination from '../Models/Pagination';

class NotificationStore {
  @observable notifications: Array<Notification>;
  @observable unReadNotifications: Array<Notification>;
  @observable notificationLoader: Pagination<Notification>;
  @observable notification: Notification;

  constructor() {
    this.notificationLoader = new Pagination<Notification>({});
    this.notifications = new Array<Notification>();
    this.unReadNotifications = new Array<Notification>();
  }

  @action getNotifications = async (params: any) => {
    const {data} = await notificationAPI.loadNotifications(params);
    this.notificationLoader = data;
    const {results} = this.notificationLoader;
    this.notifications = results;
  };

  @action getUnreadNotifications = async (params: any) => {
    params.unread = true;
    const {data} = await notificationAPI.loadNotifications(params);
    this.unReadNotifications = data.results;
  };

  @action markNotificationAsRead = async (notification: Notification) => {
    const {data} = await notificationAPI.markAsRead(notification);
    if (data) {
      this.unReadNotifications = [...this.unReadNotifications.filter(notification => notification.id !== data.id)];
    }
  };

  @action deleteNotification = async (notification: Notification) => {
    const {data} = await notificationAPI.deleteNotification(notification);
    if (data) {
      this.notifications = [...this.notifications.filter(notification => notification.id !== data.id)];
    }
  };

  filterNotifications = (notifiableType: number) => {
    if (NotificationType.ALL === notifiableType) return this.notifications;
    return this.notifications.filter(e => e.notifiableType === notifiableType);
  };
}

export default new NotificationStore();
