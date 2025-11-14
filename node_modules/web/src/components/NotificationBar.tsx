import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import '../App.css';

const NotificationBar: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="notification-bar">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
          onClick={() => removeNotification(notification.id)}
        >
          <span className="notification-message">{notification.message}</span>
          <button className="notification-close">✕</button>
        </div>
      ))}
    </div>
  );
};

export default NotificationBar;
