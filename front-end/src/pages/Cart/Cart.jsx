import "./Cart.css";
import "../../styles/global.css";
import { useCart } from "../../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { getProductById } from "../../data/productsData";

// Get image URL from backend
const getImageUrl = (img) => {
  if (!img) return "https://placehold.co/300x300";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  const cleanImg = img.startsWith("/") ? img.slice(1) : img; // Remove leading slash if present to avoid double slashes when appending to base
  const cleanPath = cleanImg.replace(/\\/g, "/"); //replace back slashed \ them with forward slashes /
  return `${import.meta.env.VITE_API_URL || "https://glamora.up.railway.app"}/${cleanPath}`;
};

export default function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    clearCart,
    getCartCount,
  } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [stockMap, setStockMap] = useState({}); // Stores stock for each variantKey
  const [errors, setErrors] = useState({}); // Stores inline errors for each item /You want to track errors for each cart item separately.

  // Fetch up-to-date stock for all items in cart
  useEffect(() => {
    const fetchStock = async () => {
      const newStockMap = {}; // will store stock quantity for each cart item.
      // "101-M-Red": 5,
      //   "101-L-Blue": 0, // out of stock
      //   "102-NA-NA": 10  // product without variants

      // Get unique product IDs to fetch
      //Cart may contain multiple variants of the same product (different size/color) / We only need unique product IDs to fetch product data once per product.
      const productIds = [...new Set(cartItems.map((item) => item.id))]; //new Set() ensures uniqueness.

      try {
        // For each unique product ID, call getProductById(id).
        const products = await Promise.all(
          //waits for all requests to finish and returns an array of products.
          productIds.map((id) => getProductById(id)),
        );

        cartItems.forEach((item) => {
          //For each item in the cart, find the matching product in the database.
          const product = products.find((p) => p.id === item.id);
          if (product) {
            //If the product exists:
            if (product.variants && product.variants.length > 0) {
              //If it has variants → find the matching variant based on size and color.
              const variant = product.variants.find(
                (v) =>
                  v.size === item.size &&
                  v.color?.toLowerCase() === item.color?.toLowerCase(),
              );
              // If variant found, use its stock. If NOT found, effectively out of stock.
              // Ensure stock is parsed as integer
              newStockMap[item.key] = variant
                ? parseInt(variant.stock) || 0
                : 0;
            } else {
              //If no variants → use product.stock.
              newStockMap[item.key] =
                product.stock !== undefined ? parseInt(product.stock) || 0 : 0;
            }
          } else {
            //If the product does not exist → stock = 0
            newStockMap[item.key] = 0;
          }
        });
        setStockMap(newStockMap); //After calculating, update stockMap state
      } catch (error) {
        console.error("Error fetching stock:", error);
      }
    };

    if (cartItems.length > 0) {
      //Only fetch stock if there are items in the cart.
      fetchStock();
    }
  }, [cartItems]); // Any change in the cart (add/remove/update quantity) triggers this effect.

  const handleIncrement = (item) => {
    // Clear error first
    setErrors((prev) => ({ ...prev, [item.key]: null }));

    const availableStock = stockMap[item.key]; // stockMap is an object that stores real-time stock for each item.
    // /availableStock now holds how many of this variant are currently in stock.

    if (availableStock !== undefined) {
      if (item.quantity >= availableStock) {
        //Checks if the quantity the user wants to set exceeds available stock.
        setErrors((prev) => ({
          //If yes, it sets an inline error message and stops the increment (return).
          ...prev,
          [item.key]: `Only ${availableStock} left!`,
        }));
        return;
      }
    }
    updateQuantity(item.key || item.id, item.quantity + 1);
  };

  const handleDecrement = (item) => {
    //If quantity becomes less than 1, your updateQuantity function in CartContext removes the item automatically.
    setErrors((prev) => ({ ...prev, [item.key]: null }));
    updateQuantity(item.key || item.id, item.quantity - 1);
  };

  const handleCheckout = () => {
    //It’s responsible for navigating the user to the checkout page, but only if they are logged in.
    if (!token) {
      alert("Please log in to checkout.");
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    //If the cart is empty, this block returns JSX immediately.
    return (
      <div className="cart-page page-wrapper">
        <div className="cart-empty">
          <i className="fas fa-shopping-bag"></i>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/shop" className="btn-primary-custom">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page page-wrapper">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <p>{getCartCount()} item in your cart</p>
      </div>

      <div className="cart-container">
        <div className="cart-items">
          {cartItems.map(
            (
              item, //Loops over each cart item (cartItems) and renders it.
            ) => (
              <div key={item.key || item.id} className="cart-item">
                {" "}
                {/*key={item.key || item.id} → React needs a unique key for each item for re-rendering efficiency. */}
                <div className="cart-item-image">
                  <img src={getImageUrl(item.image)} alt={item.name} />
                </div>
                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <p className="cart-item-price">${item.price}</p>
                  {/* Display Variant Info */}
                  {(item.size || item.color) && (
                    <div className="cart-item-variants">
                      {item.size && (
                        <span className="variant-badge">Size: {item.size}</span>
                      )}
                      {item.color && (
                        <span
                          className="variant-badge"
                        >
                          Color:
                          <span
                            className="variant-color-dot"
                            style={{
                              backgroundColor: item.color,
                            }}
                          ></span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="cart-item-quantity">
                  <div className="cart-item-quantity-controls">
                    <button
                      className="qty-btn"
                      onClick={() => handleDecrement(item)} //Decreases the quantity by 1 (or removes item if quantity becomes 0)
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    {/*Shows the current quantity of this cart item. */}
                    <button
                      className="qty-btn"
                      onClick={() => handleIncrement(item)} //Increases the quantity by 1, but checks stock first.
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  {errors[item.key] && ( //Shows inline error if the user tries to increase quantity beyond stock.
                    <div className="cart-item-error">
                      {errors[item.key]}
                    </div>
                  )}
                </div>
                <div className="cart-item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                  {/*calculates the total price for this specific item. */}
                </div>
                <button
                  className="cart-item-remove"
                  onClick={() => removeFromCart(item.key || item.id)} //onClick calls removeFromCart, which removes this item from the cart completely.
                  aria-label="Remove item"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            ),
          )}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${getCartTotal().toFixed(2)}</span>{" "}
            {/*It calculates the sum of all items’ prices × quantities. */}
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{getCartTotal() >= 100 ? "Free" : "$9.99"}</span>{" "}
            {/*Simple shipping logic: If subtotal ≥ $100 → shipping is free Otherwise → $9.9 */}
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>${(getCartTotal() * 0.08).toFixed(2)}</span>{" "}
            {/*Calculates tax as 8% of subtotal (getCartTotal() * 0.08). */}
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row total">
            <span>Total</span>
            {/**Final total price calculation: */}
            <span>
              $
              {(
                getCartTotal() +
                (getCartTotal() >= 100 ? 0 : 9.99) +
                getCartTotal() * 0.08
              ).toFixed(2)}
            </span>
          </div>
          <button
            className="btn-primary-custom checkout-btn"
            onClick={handleCheckout} //Calls handleCheckout() function:
          >
            Proceed to Checkout
          </button>
          <button className="clear-cart-btn" onClick={clearCart}>
            {/*Calls clearCart() from CartContext. */}
            Clear Cart
          </button>
          <Link to="/shop" className="continue-shopping">
            {/*Navigates back to the shop page. */}
            <i className="fas fa-arrow-left"></i> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
