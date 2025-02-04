import { Outlet } from "react-router-dom";
import Header from "./components/header";
import Footer from "./components/footer";

function Layout(): JSX.Element {
  return (
    <>
      <div className="flex flex-col min-h-screen max-w-6xl mx-auto">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default Layout;