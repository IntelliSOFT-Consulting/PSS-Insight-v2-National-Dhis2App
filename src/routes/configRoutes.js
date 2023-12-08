import Configurations from "../Pages/Configurations";
import EmailConfig from "../Pages/EmailConfig";
import ContactConfig from "../Pages/ContactConfig";
import SyncConfig from "../Pages/SyncConfig";

const routes = [
  {
    path: "/configurations",
    element: Configurations,
  },
  {
    path: "/configurations/email",
    element: EmailConfig,
  },
  {
    path: "/configurations/contact",
    element: ContactConfig,
  },
  {
    path: "/configurations/sync",
    element: SyncConfig,
  },
];

export default routes;
