import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { getNotifications } from '../api/notifications';
import { createUseStyles } from 'react-jss';
import NotificationItem from '../components/NotificationItem';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    const data = await getNotifications();
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <Card title='NOTIFICATIONS'>
      <div style={{ padding: 16 }}>
        {notifications.map(notification => (
          <NotificationItem notification={notification} />
        ))}
      </div>
    </Card>
  );
}
