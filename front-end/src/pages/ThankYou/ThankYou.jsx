import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../utils/api";
import "./ThankYou.css";

export default function ThankYou() {
  const { orderId } = useParams(); // Get orderId from URL //Refresh-safe
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("No order ID provided");
        return;
      }
      setLoading(true);

      try {
        const response = await api.get(
          `/orders/${orderId}`,
        ); //Data always comes from the backend (source of truth) → prevents users from faking order data.
        setOrder(response.data);
      } catch (err) {
        console.error("Failed to fetch order:", err);
        setError("Order not found");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    //Gives feedback while waiting for the API.
    return (
      <div className="thank-you-page">
        <div className="receipt-container">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    //Handles missing/invalid orders gracefully.
    return (
      <div className="thank-you-error">
        <h2>Order not found</h2>
        <Link to="/shop" className="btn-primary-custom">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="thank-you-page">
      <div className="receipt-container">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" className="checkmark">
            <path
              fill="none"
              d="M4.1 12.7L9 17.6 20.3 6.3"
              strokeWidth="2"
            ></path>
          </svg>
        </div>
        <h1>Thank You!</h1>
        <p className="success-message">
          Your order has been placed successfully.
        </p>
        <p className="order-id">Order ID: #{order.orderNumber || order.id}</p>

        <div className="receipt-divider"></div>

        <div className="receipt-details">
          <div className="customer-info">
            <h3>Shipping To:</h3>
            <p>{order.user?.name || "Customer"}</p>
            <p>{order.shippingAddress}</p>
          </div>

          <div className="order-items-list">
            <h3>Order Details</h3>
            {order.items.map((item, index) => {
              // Map hex codes to readable color names
              const colorNames = {
                "#000000": "Black",
                "#FFFFFF": "White",
                "#EF4444": "Red",
                "#ffffff": "White",
                "#000": "Black",
                "#fff": "White",
              };
              const colorName = item.color
                ? colorNames[item.color] || item.color
                : null;

              return (
                <div key={index} className="receipt-item">
                  <span>
                    {item.product?.name || "Product"} x {item.quantity}
                    {item.size && <small> ({item.size})</small>}
                    {colorName && (
                      <small className="variant-color-inline">
                        {" - "}
                        <span
                          className="variant-color-dot"
                          style={{
                            backgroundColor: item.color,
                          }}
                        ></span>
                        {colorName}
                      </small>
                    )}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          <div className="receipt-total">
            <span>Total Amount Paid</span>
            <span className="amount">${order.totalAmount}</span>
          </div>
        </div>

        <div className="action-buttons-receipt">
          <button onClick={() => window.print()} className="btn-print">
            <i className="fas fa-print"></i> Print Receipt
          </button>
          <button onClick={() => navigate("/shop")} className="btn-continue">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
