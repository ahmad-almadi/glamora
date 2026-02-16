import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom"; //Outlet → React Router component that renders the child route content inside the layout.

export default function Layout() {
  return (
    //Wraps the page in a div with class "public-layout".
    //  Always shows the Header at the top.
    //  <main> → placeholder for the page content, rendered dynamically by <Outlet />.
    //  Always shows the Footer at the bottom.
    <div className="public-layout">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
