import NewSurvey from '../Pages/NewSurvey';
import Surveys from '../Pages/Surveys';
import Response from '../Pages/Response';

const routes = [
  {
    path: '/surveys/menu',
    element: Surveys,
  },
  {
    path: '/surveys/create',
    element: NewSurvey,
  },
  {
    path: '/surveys/edit/:id',
    element: NewSurvey,
  },
  {
    path: '/surveys/response/:id',
    element: Response,
  },
];

export default routes;
