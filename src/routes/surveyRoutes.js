import NewSurvey from '../Pages/NewSurvey';
import Surveys from '../Pages/Surveys';
import Response from '../Pages/Response';
import Notifications from '../Pages/Notifications';

const routes = [
  {
    path: '/menu',
    element: Surveys,
  },
  {
    path: '/create',
    element: NewSurvey,
  },
  {
    path: '/edit/:id',
    element: NewSurvey,
  },
  {
    path: '/response/:id',
    element: Response,
  },
  {
    path: '/notifications/list',
    element: Notifications,
  },
];

export default routes;
