import { useState, useEffect } from "react";
import Pagination from "../../../components/Pagination/Pagination";
import "../Products/Products.css"; // Keep for shared table styles if needed, or remove if fully migrated
import "./Customers.css";
import api from "../../../utils/api";
import { handleApiError } from "../../../utils/errorHandler";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState(null);

  // Sample customers data
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Using api instance - token is automatically attached, auto-logout on 401/403
      const res = await api.get("/admin/users"); //It fetches all users from the database and returns only the selected fields (including their orders with specific fields).
      const data = res.data;

      if (!Array.isArray(data)) throw new Error("Invalid response format"); //It checks if data is an array

      // Map backend user data to frontend display format
      const formattedUsers = data.map((user) => {
        const userOrders = user.orders || [];
        const totalSpent = userOrders.reduce(
          (sum, order) => sum + parseFloat(order.totalAmount || 0),
          0,
        );
        const lastOrderDate =
          userOrders.length > 0
            ? userOrders.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            )[0].createdAt //[0] → the newest order //.createdAt → the date of that order
            : null;

        return {
          id: user.id,
          name: user.name || "Unknown User",
          email: user.email || "No Email",
          role: user.role,
          joinDate: user.createdAt,
          status: "active",
          totalOrders: userOrders.length,
          totalSpent: totalSpent,
          lastOrder: lastOrderDate || user.createdAt, // Fallback to join date if no orders
          phone: "N/A",
          address:
            user.orders && user.orders.length > 0
              ? user.orders[0].shippingAddress
              : "No orders yet",
        };
      });

      setCustomers(formattedUsers);
      setError(null);
    } catch (error) {
      handleApiError(error, setError, "Fetch Users");
    } finally {
      setLoading(false);
    }
  };

  // Filter customers
  const term = searchTerm.trim().toLowerCase();

  const filteredCustomers = customers.filter((customer) => {
    const searchableText = [customer.name, customer.email]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return !term || searchableText.includes(term);
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // View customer details
  const viewDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  return (
    <div className="products-page">
      <div className="page-header-admin">
        <h1 className="page-title-admin">Customers</h1>
        <p className="page-subtitle-admin">
          View and manage your customer base
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="admin-error-alert">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Customer Stats */}
      {/* Customer Stats */}
      <div className="stat-cards-grid">
        {/* Total Customers - Yellow */}
        <div className="stat-card yellow">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper">
              <i className="fas fa-users fa-lg"></i>
            </div>
            <div>
              <div className="stat-label">Total Customers</div>
              <div className="stat-value">{customers.length}</div>
            </div>
          </div>
        </div>

        {/* Active - Green */}
        <div className="stat-card green">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper">
              <i className="fas fa-user-check fa-lg"></i>
            </div>
            <div>
              <div className="stat-label">Active</div>
              <div className="stat-value">
                {customers.filter((c) => c.status === "active").length}
              </div>
            </div>
          </div>
        </div>

        {/* Total Orders - Blue */}
        <div className="stat-card blue">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper">
              <i className="fas fa-shopping-cart fa-lg"></i>
            </div>
            <div>
              <div className="stat-label">Total Orders</div>
              <div className="stat-value">
                {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Total Revenue - Purple */}
        <div className="stat-card purple">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper">
              <i className="fas fa-dollar-sign fa-lg"></i>
            </div>
            <div>
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">
                {formatCurrency(
                  customers.reduce((sum, c) => sum + c.totalSpent, 0),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="products-toolbar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            className="admin-input"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="products-table-wrapper admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Status</th>
              <th>Last Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.map((customer) => (
              <tr key={customer.id}>
                <td>
                  <div className="product-cell">
                    <div className="customer-avatar-cell">
                      {customer.name.charAt(0)}
                    </div>
                    <div className="product-details">
                      <div className="product-name">{customer.name}</div>
                      <div className="product-sku">
                        Member since {formatDate(customer.joinDate)}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    <div className="text-sm-primary">
                      {customer.email}
                    </div>
                    <div className="text-xm-muted">
                      {customer.phone}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="font-bold-primary">
                    {customer.totalOrders}
                  </span>
                </td>
                <td>
                  <span className="font-bold-accent">
                    {formatCurrency(customer.totalSpent)}
                  </span>
                </td>
                <td>
                  <span
                    className={`status-badge ${customer.status === "active" ? "success" : "warning"}`}
                  >
                    {customer.status.charAt(0).toUpperCase() +
                      customer.status.slice(1)}
                  </span>
                </td>
                <td className="text-sm-secondary">
                  {formatDate(customer.lastOrder)}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn"
                      onClick={() => viewDetails(customer)}
                      title="View Details"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="action-btn" title="Send Email">
                      <i className="fas fa-envelope"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="modal-content"
            style={{ maxWidth: "500px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Customer Details</h3>
              <button
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div className="customer-avatar-large">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <h3 className="customer-name-large">
                  {selectedCustomer.name}
                </h3>
                <span
                  className={`status-badge ${selectedCustomer.status === "active" ? "success" : "warning"}`}
                >
                  {selectedCustomer.status.charAt(0).toUpperCase() +
                    selectedCustomer.status.slice(1)}
                </span>
              </div>

              <div className="customer-stats-box">
                <div className="customer-stats-grid">
                  <div>
                    <div className="stat-label-item">
                      Total Orders
                    </div>
                    <div className="stat-value-item">
                      {selectedCustomer.totalOrders}
                    </div>
                  </div>
                  <div>
                    <div className="stat-label-item">
                      Total Spent
                    </div>
                    <div className="stat-value-item accent">
                      {formatCurrency(selectedCustomer.totalSpent)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-row">
                <div className="stat-label-item">
                  Email Address
                </div>
                <div style={{ color: "var(--admin-text-primary)" }}>
                  {selectedCustomer.email}
                </div>
              </div>

              <div className="info-row">
                <div className="stat-label-item">
                  Phone Number
                </div>
                <div style={{ color: "var(--admin-text-primary)" }}>
                  {selectedCustomer.phone}
                </div>
              </div>

              <div className="info-row">
                <div className="stat-label-item">
                  Shipping Address
                </div>
                <div style={{ color: "var(--admin-text-primary)" }}>
                  {selectedCustomer.address}
                </div>
              </div>

              <div className="info-grid">
                <div>
                  <div className="stat-label-item">
                    Member Since
                  </div>
                  <div style={{ color: "var(--admin-text-primary)" }}>
                    {formatDate(selectedCustomer.joinDate)}
                  </div>
                </div>
                <div>
                  <div className="stat-label-item">
                    Last Order
                  </div>
                  <div style={{ color: "var(--admin-text-primary)" }}>
                    {formatDate(selectedCustomer.lastOrder)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
