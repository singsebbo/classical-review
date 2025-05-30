import Search from "./pages/search";
import Layout from "./layout";
import User from "./pages/user";

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
      }
    ]
  }
]

export default routes;
