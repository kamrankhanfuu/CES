import React from 'react';
import {NotificationType, Notification, User} from '../../Models';
import {convertDateToString} from '../../Utils/DateHelper';
import './NotificationItem.scss';

type NotificationItemProps = {
  notification: Notification,
  onCloseHandler?: (notification: Notification) => void
};

const NotificationItem = (props: NotificationItemProps) => {

  const {notification, onCloseHandler} = props;
  // const {creator, notifiableGroup} = notification;

  // const renderMessage = () => {
  //   const group = `${notifiableGroup && notifiableGroup.type}<b> #${notifiableGroup && notifiableGroup.po}</b>`;
  //   switch (notification.notifiableType) {
  //     case NotificationType.CREATE_JOB:
  //       return `created the job ${group}`;
  //     case NotificationType.EDIT_JOB:
  //       return `edited the job ${group}`;
  //     case NotificationType.CANCEL_JOB:
  //       return `canceled the job ${group}`;
  //     case NotificationType.CREATE_INVOICE:
  //       return `created <a href="/invoice">invoice</a> for ${group}`;
  //     case NotificationType.APPOINTED:
  //       const fullName = `${(notification.notifiableRecord as User).firstName} ${(notification.notifiableRecord as User).lastName}`;
  //       return `appointed <b>${fullName}</b> to the ${group}`;
  //     case NotificationType.AWAITING_APPROVAL:
  //       return `is waiting to be approved. <a href="#">Go to confirm</a>`;
  //     default:
  //       return '';
  //   }
  // };

  return (
    <div className="d-flex notification-item">
      <div className="w-100 text-left">
        <div className="content">
          {/*<span className="name">*/}
          {/*  {`${creator.firstName} ${creator.lastName}`}*/}
          {/*</span>*/}
          {/*{' '}*/}
          {/*<span*/}
          {/*  dangerouslySetInnerHTML={{__html: renderMessage()}}*/}
          {/*/>*/}
          <span>{notification.message}</span>
        </div>
        <div className="text-small">
          {convertDateToString(new Date(notification.createdAt))}
        </div>
      </div>
      <div>
        {
          onCloseHandler && <span className="notification-item-close"
                                  onClick={() => onCloseHandler(notification)}
                                  data-popup={true} />
        }
      </div>
    </div>
  );
};

export default NotificationItem;
