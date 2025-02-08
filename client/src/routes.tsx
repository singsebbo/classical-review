import Search from "./pages/search";
import Layout from "./layout";

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Search />
      },
    ]
  }
]

export default routes;
