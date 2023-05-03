import Versions from '../Pages/Versions';
import NewVersion from '../Pages/NewVersion';

const routes = [
  {
    path: '/templates/versions',
    element: Versions,
  },
  {
    path: '/templates/versions/new',
    element: NewVersion,
  },
  {
    path: '/templates/view/:id',
    element: NewVersion,
  },
  {
    path: '/templates/edit/:id',
    element: NewVersion,
  },
];

export default routes;
