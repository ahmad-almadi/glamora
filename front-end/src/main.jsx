import React from "react"; //Core React library.
import ReactDOM from "react-dom/client";//Used to render your React app into the DOM.
import { BrowserRouter } from "react-router-dom"; //React Router component that enables client-side routing using the browser history API. 
import App from "./App.jsx";//Main component where all your routes are defined.
import { AuthProvider } from "./context/AuthContext.jsx"; //authentication state (user login, token).
import { CartProvider } from "./context/CartContext.jsx"; //shopping cart state (items in cart).
import { SettingsProvider } from "./context/SettingsContext.jsx"; //app/store settings (like email, store name, phone).

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>{/*Helps detect potential problems in your app (development-only). */}
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <SettingsProvider>
            <App />
          </SettingsProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
