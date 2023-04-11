import Versions from '../Pages/Versions';
import NewVersion from '../Pages/NewVersion';

const routes = [
  {
    path: '/versions',
    element: Versions,
  },
  {
    path: '/versions/new',
    element: NewVersion,
  },
  {
    path: '/view/:id',
    element: NewVersion,
  },
  {
    path: '/edit/:id',
    element: NewVersion,
  },
];

export default routes;
