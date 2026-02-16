import { useState, useEffect } from "react";
import Pagination from "../../../components/Pagination/Pagination";
import "../Customers/Customers.css";
import "./Messages.css";
import api from "../../../utils/api";
import { handleApiError } from "../../../utils/errorHandler";

export default function Messages() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchMessages();
  }, []);
  useEffect(() => {
    //So this effect resets the page to 1 whenever the data set changes.It prevents pagination bugs and empty result
    setCurrentPage(1);
  }, [searchTerm, filterSubject, filterStatus]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get("/contact");
      setMessages(res.data);
    } catch (error) {
      handleApiError(error, setError, "Fetch Messages");
    } finally {
      setLoading(false);
    }
  };

  // Subject label mapping
  const subjectLabels = {
    order: "Order Inquiry",
    return: "Returns & Exchanges",
    product: "Product Question",
    feedback: "Feedback",
    other: "Other",
  };

  // Filter logic
  const term = searchTerm.trim().toLowerCase();

  const filteredMessages = messages.filter((message) => {
    //Instead of checking each field separately, we put them all in one array.
    const searchableText = [
      message.firstName,
      message.lastName,
      message.email,
      message.message,
    ]
      .filter(Boolean) // this remove null & undefined
      .join(" ") //This combines everything into one single string.
      .toLowerCase(); //Converts everything to lowercase so the search becomes case-insensitive.

    const matchesSearch = !term || searchableText.includes(term); //If search is empty → return true (show everything) / Otherwise → check if the combined text contains the search term

    const matchesSubject =
      filterSubject === "all" || message.subject === filterSubject;

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "read" && message.isRead) ||
      (filterStatus === "unread" && !message.isRead);

    return matchesSearch && matchesSubject && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // View message details
  const viewDetails = (message) => {
    setSelectedMessage(message);
    setShowDetailModal(true);
  };

  // Mark message as read manually
  const handleMarkAsRead = async (message) => {
    try {
      await api.put(`/contact/${message.id}/read`);
      // Update local state
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, isRead: true } : m)),
      );
      // Update selected message state so the modal reflects the change
      setSelectedMessage((prev) => ({ ...prev, isRead: true }));
    } catch (error) {
      handleApiError(error, setError, "Mark as Read");
    }
  };

  // Delete message
  const confirmDelete = (message) => {
    setMessageToDelete(message);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!messageToDelete) return;

    try {
      await api.delete(`/contact/${messageToDelete.id}`);
      setMessages((prev) => prev.filter((m) => m.id !== messageToDelete.id));
      setShowDeleteModal(false);
      setMessageToDelete(null);
      if (showDetailModal) setShowDetailModal(false);
    } catch (error) {
      handleApiError(error, setError, "Delete Message");
    }
  };

  // Stats calculations
  const totalMessages = messages.length;
  const unreadMessages = messages.filter((m) => !m.isRead).length;
  const todayMessages = messages.filter((m) => {
    const today = new Date().toDateString(); //current date & time (now) /converts it to a human-readable date string without time
    return new Date(m.createdAt).toDateString() === today; //convert timestamp/string to JS Date object
  }).length;

  return (
    <div className="products-page">
      <div className="page-header-admin">
        <h1 className="page-title-admin">Messages</h1>
        <p className="page-subtitle-admin">
          View and manage customer contact messages
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="admin-error-alert">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Message Stats */}
      <div className="stat-cards-grid stat-cards-grid-3">
        {/* Total Messages */}
        <div className="stat-card yellow">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper">
              <i className="fas fa-envelope fa-lg"></i>
            </div>
            <div>
              <div className="stat-label">Total Messages</div>
              <div className="stat-value">{totalMessages}</div>
            </div>
          </div>
        </div>

        {/* Unread */}
        <div className="stat-card blue">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper">
              <i className="fas fa-envelope-open fa-lg"></i>
            </div>
            <div>
              <div className="stat-label">Unread</div>
              <div className="stat-value">{unreadMessages}</div>
            </div>
          </div>
        </div>

        {/* Today */}
        <div className="stat-card green">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper">
              <i className="fas fa-calendar-day fa-lg"></i>
            </div>
            <div>
              <div className="stat-label">Today</div>
              <div className="stat-value">{todayMessages}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="products-toolbar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            className="admin-input"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="toolbar-filters">
          <select
            className="admin-select"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="all">All Subjects</option>
            <option value="order">Order Inquiry</option>
            <option value="return">Returns & Exchanges</option>
            <option value="product">Product Question</option>
            <option value="feedback">Feedback</option>
            <option value="other">Other</option>
          </select>
          <select
            className="admin-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      {/* Messages Table */}
      <div className="products-table-wrapper admin-table-wrapper">
        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin fa-2x"></i>
            <p className="loading-text">Loading messages...</p>
          </div>
        ) : paginatedMessages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="fas fa-inbox"></i>
            </div>
            <p className="empty-text">No messages found</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>From</th>
                <th>Subject</th>
                <th className="th-class">Message</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMessages.map((message) => (
                <tr
                  key={message.id}
                  className={!message.isRead ? "unread-row" : ""}
                >
                  <td>
                    <span
                      className={`status-indicator ${message.isRead ? "read" : "unread"}`}
                    >
                      <i
                        className={`fas ${message.isRead ? "fa-envelope-open" : "fa-envelope"}`}
                      ></i>
                    </span>
                  </td>
                  <td>
                    <div className="sender-info">
                      <div className="sender-avatar">
                        {message.firstName?.charAt(0)}
                        {message.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div className="sender-name">
                          {message.firstName} {message.lastName}
                        </div>
                        <div className="sender-email">{message.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`subject-badge ${message.subject}`}>
                      {subjectLabels[message.subject] || message.subject}
                    </span>
                  </td>
                  <td>
                    <div className="message-preview">
                      {message.message?.substring(0, 50)}
                      {message.message?.length > 50 ? "..." : ""}
                    </div>
                  </td>
                  <td
                    style={{
                      color: "var(--admin-text-secondary)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {formatDate(message.createdAt)}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn"
                        onClick={() => viewDetails(message)}
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => confirmDelete(message)}
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Message Detail Modal */}
      {showDetailModal && selectedMessage && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="modal-content message-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Message Details</h3>
              <button
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {/* Sender Info */}
              <div className="message-sender-header">
                <div className="sender-avatar large">
                  {selectedMessage.firstName?.charAt(0)}
                  {selectedMessage.lastName?.charAt(0)}
                </div>
                <div>
                  <h3>
                    {selectedMessage.firstName} {selectedMessage.lastName}
                  </h3>
                  <p>{selectedMessage.email}</p>
                </div>
              </div>

              {/* Meta Info */}
              <div className="message-meta">
                <div className="meta-item">
                  <span className="meta-label">Subject</span>
                  <span className={`subject-badge ${selectedMessage.subject}`}>
                    {subjectLabels[selectedMessage.subject] ||
                      selectedMessage.subject}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Received</span>
                  <span>{formatDate(selectedMessage.createdAt)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Status</span>
                  <span
                    className={`status-badge ${selectedMessage.isRead ? "success" : "warning"}`}
                  >
                    {selectedMessage.isRead ? "Read" : "Unread"}
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div className="message-content-box">
                <h4>Message</h4>
                <p>{selectedMessage.message}</p>
              </div>

              {/* Actions */}
              <div className="modal-actions">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${subjectLabels[selectedMessage.subject] || selectedMessage.subject}`}
                  className="btn-admin-primary"
                >
                  <i className="fas fa-reply"></i> Reply via Email
                </a>
                {!selectedMessage.isRead && (
                  <button
                    className="btn-admin-secondary"
                    onClick={() => handleMarkAsRead(selectedMessage)}
                  >
                    <i className="fas fa-check"></i> Mark as Read
                  </button>
                )}
                <button
                  className="btn-admin-danger"
                  onClick={() => confirmDelete(selectedMessage)}
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="modal-content modal-content-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Delete Message</h3>
              <button
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: "center" }}>
              <i className="fas fa-exclamation-triangle delete-icon-large"></i>
              <p className="delete-text-primary">
                Are you sure you want to delete this message?
              </p>
              <p className="delete-text-secondary">
                This action cannot be undone.
              </p>
              <div className="modal-actions-center">
                <button
                  className="btn-admin-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button className="btn-admin-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
