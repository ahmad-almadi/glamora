import { Routes, Route } from "react-router-dom";
import Layout from "./layouts/layout";
import AdminLayout from "./layouts/AdminLayout";
import {
  Home,
  Log_in,
  Sign_up,
  Shop,
  NewArrival,
  AboutUs,
  FAQ,
  Contact,
  Cart,
  ProductDetail,
  Checkout,
  ThankYou,
} from "./pages";

// Admin Pages
import {
  Dashboard,
  Products,
  Categories,
  Orders,
  Customers,
  Messages,
  Settings,
} from "./pages/Admin";

export default function App() {
  return (
    <Routes>{/*Container for all routes in React Router*/}
      {/* Customer-facing routes */}
      <Route element={<Layout />}> {/* Wrapper Layout / All these pages are wrapped by <Layout />*/}
        <Route index element={<Home />} />{/* Route -> Defines a single route with a path and the component to render. */}
        <Route path="/home" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/new-arrival" element={<NewArrival />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/thank-you/:orderId" element={<ThankYou />} />
        <Route path="login" element={<Log_in />} />
        <Route path="signup" element={<Sign_up />} />
      </Route>
      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}> {/*/admin → Renders <AdminLayout /> wrapper (sidebar + admin header). */}
        <Route index element={<Dashboard />} /> {/* index is used to mark a default child route inside a parent route. */}
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="orders" element={<Orders />} />
        <Route path="customers" element={<Customers />} />
        <Route path="messages" element={<Messages />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
