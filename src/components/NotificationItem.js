import React from 'react';
import { createUseStyles } from 'react-jss';
import { format } from 'date-fns';

const useStyles = createUseStyles({
  notification: {
    padding: 5,
    margin: '10px 0px',
    backgroundColor: ({ isRead }) => (isRead ? '#FAFAFA' : '#F1F7FB'),
    borderRadius: 3,
    position: 'relative',
    '& h3, p': {
        margin: 5,
        padding: 0,
    },
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
  },
  description: {
    fontSize: 14,
    fontWeight: 300,
    marginRight: '20%',
  },
    date: {
    fontSize: 12,
    fontWeight: 600,
    textDecoration: 'italic !important',
    position: 'absolute',
    right: 10,
    bottom: 0,
    },
});

export default function NotificationItem({ notification }) {
  const classes = useStyles(notification);
  return (
    <div key={notification.id} className={classes.notification}>
      <h3 className={classes.title}>{notification.title}</h3>
      <p className={classes.description}>{notification.description}</p>

      <p className={classes.date}>
        {notification.createdAt
          ? format(new Date(notification.createdAt), 'EEE dd MMM yyyy')
          : null}
      </p>
    </div>
  );
}
