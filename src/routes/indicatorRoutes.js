import IndicatorDetails from '../Pages/IndicatorDetails';
import Indicators from '../Pages/Indicators';
import NewIndicator from '../Pages/NewIndicator';

const routes = [
  {
    path: '/indicators/dictionary',
    element: Indicators,
  },
  {
    path: '/indicators/add',
    element: NewIndicator,
  },
  {
    path: '/indicators/indicator/:id/edit',
    element: NewIndicator,
  },
  {
    path: '/indicators/indicator/:id',
    element: IndicatorDetails,
  },
];

export default routes;
