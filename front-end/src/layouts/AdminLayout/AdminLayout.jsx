import "./AdminLayout.css";
import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { db, ref, onValue, remove } from "../../../firebase"; // adjust path

///Why outside is better : They don’t use React state or hooks , Better performance

const playNotificationSound = () => {
  //Plays a sound when a new notification arrives
  const audio = new Audio("/sounds/notification.mp3");
  audio.play().catch((err) => console.error("Sound play failed:", err));
};

// Time formatter
const formatTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const previousUnreadCountRef = useRef(0); //updates the value instantly without telling React to refresh the UI
  const isInitialLoadRef = useRef(true); //Prevents sound on first load.
  const location = useLocation(); //It gives you access to the current location object in your app — basically, info about the URL and routing state.
  const navigate = useNavigate();
  const { token, setToken } = useAuth();

  // Get user info from token
  let adminName = "Admin";
  useEffect(() => {
    document.body.classList.add("admin-page");

    return () => {
      document.body.classList.remove("admin-page");
    };
  }, []);

  useEffect(() => {
    if (!token) {
      //If no token → redirect to login
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "ADMIN") {
        // If not admin, clear token and redirect
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        setToken(null);
        navigate("/login");
        return;
      }
      adminName = decoded.name || "Admin";
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      setToken(null);
      navigate("/login");
    }
  }, [token, navigate, setToken]);

  useEffect(() => {
    const notifRef = ref(db, "notifications/admin");
    //Everything inside those curly braces { ... } In listen mode
    const unsubscribe = onValue(notifRef, (snapshot) => {
      //onValue() sets up a real-time listener it triggers every time Firebase data changes automatically. snapshot contains the current value of the database at that location
      const data = snapshot.val() || {}; //returns the object at notifications/admin.
      const notifArray = Object.entries(data) // Object.entries(data) : converts the object into an array of [key, value] pairs:
        .map(([id, value]) => ({
          //transform each entry into a notification object with id included:
          id, // Firebase key to Delete
          ...value, //...value = spread operator for objects (copies all key-value pairs into new object) || Objects ({}) → ... copies properties.
        }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); // Sort newest first

      setNotifications(notifArray); //Update React state with the new notifications array.

      // Count total notifications (all are unread since they're deleted when clicked)
      const count = notifArray.length;

      // Play sound if new notification arrived (skip on initial page load)
      if (count > previousUnreadCountRef.current && !isInitialLoadRef.current) {
        //new notification added. / skip sound on first page load.
        playNotificationSound();
      }

      // After first data load, set initial load to false
      isInitialLoadRef.current = false; //Marks that initial load is done.
      previousUnreadCountRef.current = count; //Store current notification count for the next comparison.

      setUnreadCount(count); //Update badge count on the bell icon.
    });

    return () => unsubscribe(); //Clean up the Firebase listener when the component unmounts. so its delete the real time firebase listener
  }, []);

  // Get current page name for breadcrumb
  const getPageName = () => {
    const path = location.pathname.split("/").pop(); //.pop() → takes the last element of the array → "orders"
    if (path === "admin" || path === "") return "Dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  // Delete a single notification (removes from Firebase completely)
  const deleteNotification = (id) => {
    const notifRef = ref(db, `notifications/admin/${id}`); //points exactly to the notification you want to delete.
    remove(notifRef); //remove() → deletes the entire node at that reference.
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    const notifRef = ref(db, "notifications/admin"); //points to the entire notifications node for admin
    remove(notifRef);
  };

  // Close mobile menu on route change
  useEffect(() => {
    //location changes → effect runs → setMobileOpen(false) → menu automatically closes
    setMobileOpen(false);
  }, [location]);

  // Navigation items
  const navItems = [
    {
      section: "Main",
      items: [
        {
          path: "/admin",
          icon: "fas fa-th-large",
          label: "Dashboard",
          exact: true,
        },
        { path: "/admin/products", icon: "fas fa-tshirt", label: "Products" },
        { path: "/admin/categories", icon: "fas fa-tags", label: "Categories" },
        {
          path: "/admin/orders",
          icon: "fas fa-shopping-bag",
          label: "Orders",
          badge: unreadCount > 0 ? unreadCount : null,
        },
      ],
    },
    {
      section: "Management",
      items: [
        { path: "/admin/customers", icon: "fas fa-users", label: "Customers" },
        { path: "/admin/messages", icon: "fas fa-envelope", label: "Messages" },
        { path: "/admin/settings", icon: "fas fa-cog", label: "Settings" },
      ],
    },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${mobileOpen ? "active" : ""}`}
        onClick={() => setMobileOpen(false)} //Adds a click handler to the div. When the overlay is clicked, it closes the mobile sidebar by setting mobileOpen to false.
      />

      {/* Sidebar */}
      <aside
        // if collapsed become smaller if mobile open become visible
        className={`admin-sidebar ${sidebarCollapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <img src="/images/logo.png" alt="Logo" className="sidebar-logo" />
          <div>
            <span className="sidebar-brand">Glamora</span>
            <span className="sidebar-badge">Admin</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(
            (
              section, // loops over navItems
            ) => (
              <div key={section.section} className="nav-section">
                <div className="nav-section-title">{section.section}</div>
                {section.items.map(
                  (
                    item, //loops over items array inside navItems
                  ) => (
                    <div key={item.path} className="nav-item">
                      <NavLink
                        to={item.path}
                        //exact: true prevents the Dashboard from being highlighted on nested pages.
                        end={item.exact} //If true, the URL must exactly match item.path for the link to be active.//admin is a prefix for almost every other admin route.
                        className={({ isActive }) =>
                          `nav-link-admin ${isActive ? "active" : ""}`
                        }
                      >
                        <i className={item.icon}></i>
                        <span className="nav-link-text">{item.label}</span>
                        {item.badge && (
                          <span className="nav-badge">{item.badge}</span>
                        )}
                      </NavLink>
                    </div>
                  ),
                )}
              </div>
            ),
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)} //toggle  sidebar
          >
            <i className="fas fa-chevron-left"></i>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <button
              className="mobile-menu-btn" // ☰ button in mopbile size for responsive //full size display none
              onClick={() => setMobileOpen(true)}
            >
              <i className="fas fa-bars"></i>
            </button>
            <div className="breadcrumb-admin">
              <span>Admin</span>
              <i
                className="fas fa-chevron-right breadcrumb-chevron"
              ></i>
              <span className="current">{getPageName()}</span>
            </div>
          </div>

          <div className="header-right">
            <div
              className="notification-wrapper"
            >
              <button
                className="header-action"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)} //toggles showNotifDropdown (opens/closes dropdown)
              >
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && ( //if there are unread notifications, show red circle with number.
                  <span className="notification-circle">{unreadCount}</span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifDropdown && ( // when showNotifDropdown is true.
                <div className="notifications-dropdown">
                  <div className="notifications-header">
                    <h4>Notifications</h4>
                    {notifications.length > 0 && ( //if there are notification
                      <button
                        className="mark-all-read"
                        onClick={clearAllNotifications} //clear all notification from firbase real-time db
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="notifications-list">
                    {notifications.length === 0 ? ( //if their are no notification
                      <div className="notification-empty">
                        <i className="fas fa-bell-slash"></i>
                        <span>No notifications yet</span>
                      </div>
                    ) : (
                      notifications.map(
                        (
                          n, // loops through an array of notification objects.
                        ) => (
                          <div
                            key={n.id}
                            className="notification-item unread"
                            onClick={() => {
                              deleteNotification(n.id); //removes this notification from firbase real-time db
                              if (n.orderId) {
                                navigate(`/admin/orders`); //Navigate to /admin/orders.
                                setShowNotifDropdown(false); //Close the dropdown (setShowNotifDropdown(false)).
                              }
                            }}
                          >
                            <div className="notification-icon">
                              <i className="fas fa-shopping-bag"></i>
                            </div>
                            <div className="notification-content">
                              <div className="notification-title">
                                {n.message || "New Order"}
                                <span className="new-badge">NEW</span>
                              </div>
                              <div className="notification-details">
                                <span className="detail-item">
                                  <i className="fas fa-user"></i>
                                  {n.customerName || "Customer"}
                                </span>
                                <span className="detail-item">
                                  <i className="fas fa-box"></i>
                                  {n.itemsCount || 0} item
                                  {n.itemsCount !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <div className="notification-details">
                                <span className="detail-item">
                                  <i className="fas fa-credit-card"></i>
                                  {n.paymentMethod || "N/A"}
                                </span>
                                <span className="detail-item amount">
                                  <i className="fas fa-dollar-sign"></i>
                                  {n.totalAmount?.toFixed(2) || "0.00"}
                                </span>
                              </div>
                              <div className="notification-time">
                                <i className="fas fa-clock"></i>
                                {formatTimeAgo(n.createdAt)}
                              </div>
                            </div>
                          </div>
                        ),
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
            <div
              className="admin-profile"
              onClick={handleLogout} //clicking anywhere here will log the admin out.
              title="Click to logout"
            >
              <div className="profile-avatar">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="profile-info">
                <div className="profile-name">{adminName}</div>
                <div className="profile-role">Administrator</div>
              </div>
              <i
                className="fas fa-sign-out-alt logout-icon"
              ></i>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-content">
          <Outlet /> {/*This is where the main content of each admin page renders. */}
        </div>
      </main>
    </div>
  );
}
