import Notifications from '../Pages/Notifications';
import NotificationSettings from '../Pages/NotificationSettings';
import Unsubscribe from '../Pages/Unsubscribe';

const routes = [
  {
    path: '/notifications/list',
    element: Notifications,
  },
  {
    path: '/notifications/settings',
    element: NotificationSettings,
  },
  {
    path: '/notifications/unsubscribe',
    element: Unsubscribe,
  }
];

export default routes;
