import Configurations from '../Pages/Configurations';
import EmailConfig from '../Pages/EmailConfig';
import ContactConfig from '../Pages/ContactConfig';
import PeriodConfig from '../Pages/PeriodConfig';

const routes = [
  {
    path: '/configurations',
    element: Configurations,
  },
  {
    path: '/configurations/email',
    element: EmailConfig,
  },
  {
    path: '/configurations/contact',
    element: ContactConfig,
  },
  {
    path: '/configurations/period',
    element: PeriodConfig,
  },
];

export default routes;
