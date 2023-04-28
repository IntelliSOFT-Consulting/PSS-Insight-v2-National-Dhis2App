import Notifications from '../Pages/Notifications';
import NotificationSettings from '../Pages/NotificationSettings';

const routes = [
  {
    path: '/list',
    element: Notifications,
  },
  {
    path: '/settings',
    element: NotificationSettings,
  },
];

export default routes;
