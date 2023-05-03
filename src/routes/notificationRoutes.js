import Notifications from '../Pages/Notifications';
import NotificationSettings from '../Pages/NotificationSettings';

const routes = [
  {
    path: '/notifications/list',
    element: Notifications,
  },
  {
    path: '/notifications/settings',
    element: NotificationSettings,
  },
];

export default routes;
