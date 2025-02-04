import App from "./App";
import Layout from "./layout";

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <App />
      },
    ]
  }
]

export default routes;
