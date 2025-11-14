import React from 'react';
import { useNotification } from '../contexts/NotificationContext';

const NotificationBar: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  const getAlertClass = (type: string) => {
    switch(type) {
      case 'error': return 'alert-retro alert-retro-danger';
      case 'success': return 'alert-retro alert-retro-success';
      case 'warning': return 'alert-retro alert-retro-warning';
      case 'info': return 'alert-retro alert-retro-info';
      default: return 'alert-retro alert-retro-info';
    }
  };

  return (
    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1000, marginTop: '60px' }}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`toast show ${getAlertClass(notification.type)}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{ minWidth: '300px' }}
        >
          <div className="toast-header bg-dark text-light">
            <strong className="me-auto">SISTEMA</strong>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => removeNotification(notification.id)}
            ></button>
          </div>
          <div className="toast-body text-start">
            {notification.message}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationBar;
