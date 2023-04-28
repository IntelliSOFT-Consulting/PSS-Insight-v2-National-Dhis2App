import NewSurvey from '../Pages/NewSurvey';
import Surveys from '../Pages/Surveys';
import Response from '../Pages/Response';

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
];

export default routes;
