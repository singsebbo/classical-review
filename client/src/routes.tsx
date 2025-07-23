import Search from "./pages/search";
import Layout from "./layout";
import User from "./pages/user";
import VerifyEmail from "./pages/verify-email";

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Search />
      },
      {
        path: "user",
        element: <User />
      },
      {
        path: "verify-email",
        element: <VerifyEmail />
      }
    ]
  }
]

export default routes;
