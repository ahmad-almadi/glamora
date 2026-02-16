import "./Header.css";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, NavLink } from "react-router-dom";
import { useCart } from "../../context/CartContext";

export default function Header() {
  const { token, setToken } = useAuth();
  const { getCartCount } = useCart();
  let tokenInfo;
  const navigate = useNavigate();
  if (token) {
    try {
      const cleanToken = token.trim();
      tokenInfo = jwtDecode(cleanToken);
    } catch (err) {
      console.error("Invalid token", err);
    }
  }
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };
  return (
    <nav className="navbar navbar-expand-lg bg-white">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <NavLink className="navbar-brand me-3 pe-3" to="/home">
          <img src="/images/logo.png" width={50} height={50} alt="logo" />
        </NavLink>

        <button
          className="navbar-toggler ms-auto"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarTogglerDemo01"
          aria-controls="navbarTogglerDemo01"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse justify-content-between"
          id="navbarTogglerDemo01"
        >
          <ul className="navbar-nav mb-2 mb-lg-0">
            <li className="nav-item ps-5">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link my-active" : "nav-link"
                }
                to="/home"
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item ps-5">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link my-active" : "nav-link"
                }
                to="/shop"
              >
                Shop
              </NavLink>
            </li>
            <li className="nav-item ps-5">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link my-active" : "nav-link"
                }
                to="/new-arrival"
              >
                New Arrival
              </NavLink>
            </li>
            <li className="nav-item ps-5">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link my-active" : "nav-link"
                }
                to="/about"
              >
                About Us
              </NavLink>
            </li>
            <li className="nav-item ps-5">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link my-active" : "nav-link"
                }
                to="/faq"
              >
                FAQ
              </NavLink>
            </li>
            <li className="nav-item ps-5">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link my-active" : "nav-link"
                }
                to="/contact"
              >
                Contact
              </NavLink>
            </li>
          </ul>
          <div className="d-flex align-items-center gap-3">
            {!token ? (
              <form
                onSubmit={(e) => e.preventDefault()}
                className="auth-buttons-container"
              >
                <button className=" btn-12" onClick={() => navigate("/login")}>
                  <span>Log In</span>
                </button>
                <button
                  className=" btn-12"
                  onClick={() => navigate("signup")}
                >
                  <span>Sign Up</span>
                </button>
              </form>
            ) : (
              <div className="dropdown d-flex align-items-center">
                <i
                  className="fa-regular fa-user fa-2x text-muted dropdown-toggle user-dropdown-icon"
                  role="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                ></i>
                {/* Cart Icon */}
                <NavLink
                  to="/cart"
                  className={({ isActive }) =>
                    isActive ? "nav-link my-active ms-3" : "nav-link ms-3"
                  }
                >
                  <i className="fas fa-shopping-bag fa-lg"></i>
                  <span className="cart-badge">{getCartCount()}</span>
                </NavLink>
                <ul
                  className="dropdown-menu custom-dropdown"
                  aria-labelledby="userDropdown"
                >
                  <li>
                    <span className="dropdown-item fw-bold ">
                      Username : <br />
                      {tokenInfo?.name || "User"}
                    </span>
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
