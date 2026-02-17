import "./Orders.css";
import "../Products/Products.css";
import { useState, useEffect } from "react";
import Pagination from "../../../components/Pagination/Pagination";

import api from "../../../utils/api";
import { handleApiError } from "../../../utils/errorHandler";

export default function Orders() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // It fetches orders from the backend, formats them properly, then saves them into state so your UI can display them correctly.
  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      const formattedOrders = res.data.map((order) => ({
        id: order.orderNumber,
        realId: order.id, // Keep real UUID for API calls
        customer: {
          name: order.user?.name || "Guest",
          email: order.user?.email || "No Email",
          phone: "N/A", // Phone not in User model yet
        },
        items: order.items.map((item) => {
          const img = item.product?.imageUrl;
          let imageUrl = "https://placehold.co/50x50/1a1a2e/ffffff?text=N/A";
          if (img) {
            if (img.startsWith("http://") || img.startsWith("https://")) {
              imageUrl = img;
            } else {
              const cleanImg = img.startsWith("/") ? img.slice(1) : img;
              const cleanPath = cleanImg.replace(/\\/g, "/");
              imageUrl = `${import.meta.env.VITE_API_URL || "https://glamora.up.railway.app"}/${cleanPath}`;
            }
          }
          return {
            name: item.product?.name || "Product Unavailable",
            price: parseFloat(item.price),
            quantity: item.quantity,
            image: imageUrl,
          };
        }),
        total: parseFloat(order.totalAmount),
        status: order.status.toLowerCase(), // Backend is uppercase
        date: order.createdAt,
        address: order.shippingAddress,
      }));
      setOrders(formattedOrders);
    } catch (error) {
      handleApiError(error, setError, "Fetch Orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Order stats / This builds the numbers shown at the top of your Orders page so each status card shows how many orders belong to it
  const orderStats = [
    {
      key: "all",
      label: "All Orders",
      icon: "fas fa-layer-group",
      count: orders.length,
    },
    {
      key: "pending",
      label: "Pending",
      icon: "fas fa-clock",
      count: orders.filter((o) => o.status === "pending").length,
    },
    {
      key: "processing",
      label: "Processing",
      icon: "fas fa-spinner",
      count: orders.filter((o) => o.status === "processing").length,
    },
    {
      key: "shipped",
      label: "Shipped",
      icon: "fas fa-truck",
      count: orders.filter((o) => o.status === "shipped").length,
    },
    {
      key: "delivered",
      label: "Delivered",
      icon: "fas fa-check-circle",
      count: orders.filter((o) => o.status === "delivered").length,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      icon: "fas fa-times-circle",
      count: orders.filter((o) => o.status === "cancelled").length,
    },
  ];

  // Filter orders / This code filters your orders based on the selected status and search input before displaying them in the table.
  const term = searchTerm.trim().toLowerCase();

  const filteredOrders = orders.filter((order) => {
    const searchableText = [order.id, order.customer.name]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = !term || searchableText.includes(term);
    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;

    return matchesStatus && matchesSearch;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, searchTerm]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // Update order status
  const updateStatus = async (orderId, newStatus) => {
    try {
      // Find the order to get its real UUID
      const orderToUpdate = orders.find((o) => o.id === orderId);
      if (!orderToUpdate) return;

      //PATCH = Modify"Change just this one field."
      await api.patch(`/orders/${orderToUpdate.realId}/status`, {
        status: newStatus.toUpperCase(),
      });

      // Optimistic update
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );
    } catch (error) {
      handleApiError(error, null, "Update Order Status");
      alert("Failed to update status. Check console for details.");
    }
  };

  // View order details
  const viewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // This function builds the order progress timeline and marks which steps are completed based on the current order status.
  const getTimeline = (status) => {
    const steps = [
      { key: "pending", label: "Order Placed", desc: "Order has been placed" },
      {
        key: "processing",
        label: "Processing",
        desc: "Order is being prepared",
      },
      { key: "shipped", label: "Shipped", desc: "Order has been shipped" },
      {
        key: "delivered",
        label: "Delivered",
        desc: "Order has been delivered",
      },
    ];
    const statusOrder = ["pending", "processing", "shipped", "delivered"];
    const currentIndex = statusOrder.indexOf(status);
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
    }));
  };

  return (
    <div className="orders-page">
      <div className="page-header-admin">
        <h1 className="page-title-admin">Orders</h1>
        <p className="page-subtitle-admin">Manage and track customer orders</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="admin-error-alert">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* This code renders clickable status cards that show order counts and filter the table when clicked.*/}
      <div className="order-stats">
        {orderStats.map((stat) => (
          <div
            key={stat.key}
            className={`order-stat-card stat-${stat.key} ${selectedStatus === stat.key ? "active" : ""}`}
            onClick={() => setSelectedStatus(stat.key)}
          >
            <div className={`stat-icon ${stat.key}`}>
              <i className={stat.icon}></i>
            </div>
            <div className="stat-content">
              <h4>{stat.label}</h4>
              <span className="stat-value">{stat.count}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="products-toolbar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            className="admin-input"
            placeholder="Search by order ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="products-table-wrapper admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order) => (
              <tr key={order.id}>
                <td>
                  <span className="order-id order-id-cell">
                    #{order.id}
                  </span>
                </td>
                <td>
                  <div className="order-customer">
                    <div className="customer-avatar-small">
                      {order.customer.name.charAt(0)}
                    </div>
                    <span className="customer-name">{order.customer.name}</span>
                  </div>
                </td>
                <td className="text-secondary-sm">
                  {formatDate(order.date)}
                </td>
                <td>
                  <span className="text-secondary">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""}
                  </span>
                </td>
                <td>
                  <span className="order-total">
                    {formatCurrency(order.total)}
                  </span>
                </td>
                <td>
                  <select
                    className={`status-select ${order.status}`}
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn"
                      onClick={() => viewDetails(order)}
                      title="View Details"
                    >
                      <i className="fas fa-eye"></i>
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

      {filteredOrders.length === 0 && (
        <div className="empty-state empty-state-container">
          <i className="fas fa-inbox empty-state-icon"></i>
          <p className="empty-state-text">No orders found</p>
        </div>
      )}

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="modal-content medium"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Order #{selectedOrder.id}</h3>
              <button
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="order-detail-grid">
                <div className="detail-section">
                  <h4 className="detail-section-title">Customer Information</h4>
                  <div className="detail-row">
                    <span className="detail-label">Name</span>
                    <span className="detail-value">
                      {selectedOrder.customer.name}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">
                      {selectedOrder.customer.email}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">
                      {selectedOrder.customer.phone}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4 className="detail-section-title">Shipping Address</h4>
                  <p className="address-text">
                    {selectedOrder.address}
                  </p>
                </div>
              </div>

              <div className="detail-section mt-6">
                <h4 className="detail-section-title">Order Timeline</h4>
                <div className="order-timeline">
                  {getTimeline(selectedOrder.status).map((step) => (
                    <div key={step.key} className="timeline-item">
                      <div
                        className={`timeline-dot ${step.completed ? "completed" : ""}`}
                      >
                        {step.completed && <i className="fas fa-check"></i>}
                      </div>
                      <div className="timeline-content">
                        <h4>{step.label}</h4>
                        <p>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-items-list">
                <h4 className="detail-section-title">Order Items</h4>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="order-item-image"
                      onError={(e) => { e.target.src = 'https://placehold.co/50x50/1a1a2e/ffffff?text=N/A'; }}
                    />
                    <div className="order-item-details">
                      <div className="order-item-name">{item.name}</div>
                      <div className="order-item-meta">
                        Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="order-item-price">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}

                <div className="modal-total-box">
                  <span className="total-label">
                    Total
                  </span>
                  <span className="total-value">
                    {formatCurrency(selectedOrder.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
