import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import Card from "../components/Card";
import { getNotifications } from "../api/notifications";
import NotificationItem from "../components/NotificationItem";
import Loader from "../components/Loader";
import Notification from "../components/Notification";
import { sortByDate } from "../utils/helpers";
import { Pagination } from "antd";

const useStyles = createUseStyles({
  notification: {
    padding: 16,
  },
  Pagination: {
    display: "flex",
    justifyContent: "flex-end",
  },
});

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [notificationsPerPage, setNotificationsPerPage] = useState(15);
  const totalNotifications = notifications?.length;

  const classes = useStyles();

  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification =
    indexOfLastNotification - notificationsPerPage;
  const currentNotifications = notifications?.slice(
    indexOfFirstNotification,
    indexOfLastNotification
  );

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications({
        email: "dnjau@intellisoftkenya.com",
      });
      const sorted = sortByDate(data?.details);
      setNotifications(sorted);
      setLoading(false);
    } catch (error) {
      setError("Error fetching notifications");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <Card title="NOTIFICATIONS">
      {error && (
        <Notification
          status="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}
      {loading ? (
        <Loader />
      ) : (
        <div className={classes.notification}>
          {currentNotifications?.map((notification, index) => (
            <NotificationItem key={index} notification={notification} />
          ))}
        </div>
      )}
      <div className={classes.Pagination}>
        {notifications?.length > 15 && (
          <Pagination
            current={currentPage}
            showSizeChanger={false}
            pageSize={notificationsPerPage}
            total={totalNotifications}
            onChange={(page, pageSize) => {
              setCurrentPage(page);
              setNotificationsPerPage(pageSize);
            }}
          />
        )}
      </div>
    </Card>
  );
}
