import Routines from '../Pages/Routines';
import RoutineDetails from '../Pages/RoutineDetails';

const routes = [
  {
    path: '/routine',
    element: Routines,
  },
  {
    path: '/routine/:id',
    element: RoutineDetails,
  },
];

export default routes;
