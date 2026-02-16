import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { db, ref, push } from "../../../firebase"; // path حسب مكان firebase.js

import api from "../../utils/api";
import "./Checkout.css";

export default function Checkout() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    //formData → stores all checkout form inputs (shipping info + payment method).
    fullName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
    paymentMethod: "cod", // Default to Cash on Delivery
  });

  const subtotal = getCartTotal();
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e) => {
    //Generic input handler: updates formData based on name attribute.
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const createOrderNotification = (orderId, total, orderDetails) => {
    //It creates a new notification record in Firebase
    push(ref(db, "notifications/admin"), {
      //ref Database path where admin notifications are stored || push → Adds a new notification
      type: "order",
      message: "New order placed",
      orderId: orderId,
      totalAmount: total,
      customerName: orderDetails.customerName,
      customerEmail: orderDetails.customerEmail,
      itemsCount: orderDetails.itemsCount,
      paymentMethod: orderDetails.paymentMethod,
      read: false,
      createdAt: Date.now(),
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      //Checks if the user is logged in (token). If not → redirect to login.
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      const decoded = jwtDecode(token); //Decodes JWT to get userId.
      const userId = decoded.userId;

      const fullAddress = `${formData.address}, ${formData.city}, ${formData.zipCode}, ${formData.country}`; //Builds full shipping address as a single string.

      const orderData = {
        userId,
        items: cartItems.map((item) => ({
          //Maps cart items to a simplified array for the backend.
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color,
        })),
        totalAmount: total,
        shippingAddress: fullAddress,
        paymentMethod:
          formData.paymentMethod === "cod" ? "Cash on Delivery" : "Credit Card",
      };

      const response = await api.post(
        //Sends POST request to /orders.
        "/orders",
        orderData,
      );

      if (response.status === 201) {
        //If successful (201 (order) → created):
        createOrderNotification(response.data.id, total, {
          customerName: formData.fullName,
          customerEmail: formData.email,
          itemsCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          paymentMethod:
            formData.paymentMethod === "cod"
              ? "Cash on Delivery"
              : "Credit Card",
        }); //A new notification is created in Firebase for the admin.
        clearCart();
        // Navigate to Thank You page with order ID in URL (best practice)
        navigate(`/thank-you/${response.data.id}`);
      }
    } catch (error) {
      console.error("Checkout Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    //Prevent checkout with empty cart
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate("/shop")}>Return to Shop</button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>
        <div className="checkout-grid">
          {/* Left Column: Form */}
          <div className="checkout-form-section">
            <form id="checkout-form" onSubmit={handleSubmit}>
              {/*form has id */}
              <div className="form-section">
                <h3>Shipping Information</h3>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="New York"
                    />
                  </div>
                  <div className="form-group">
                    <label>Zip Code</label>
                    <input
                      type="number"
                      name="zipCode"
                      required
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="10001"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <select
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Country</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>
              <div className="form-section">
                <h3>Payment Method</h3>
                <div className="payment-options">
                  <label
                    className={`payment-option ${formData.paymentMethod === "cod" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={handleInputChange}
                    />
                    <div className="option-content">
                      <span className="option-title">Cash on Delivery</span>
                      <span className="option-desc">
                        Pay when you receive your order
                      </span>
                    </div>
                  </label>
                  {/* Future: Add Stripe/Credit Card here */}
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="checkout-summary-section">
            <div className="order-summary-card">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {cartItems.map(
                  (
                    item, //This loops over every item in the cart and renders it.
                  ) => (
                    <div key={item.key || item.id} className="summary-item">
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <div
                          className="item-meta"
                        >
                          {item.size && <span>Size: {item.size} </span>}
                          {item.color && (
                            <span className="item-color-indicator">
                              Color:{" "}
                              <span
                                className="item-color-dot"
                                style={{
                                  background: item.color,
                                }}
                              ></span>
                            </span>
                          )}
                        </div>
                        <span className="item-qty">x {item.quantity}</span>
                      </div>
                      <span className="item-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ),
                )}
              </div>
              <div className="summary-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="total-row">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="total-row final">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <button
                type="submit"
                form="checkout-form" //The button has a form attribute pointing to that id / HTML allows a button to submit a form even if it’s outside the form
                className="place-order-btn"
                disabled={loading}
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
              <div className="secure-badge">
                <i className="fas fa-lock"></i> Secure Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
