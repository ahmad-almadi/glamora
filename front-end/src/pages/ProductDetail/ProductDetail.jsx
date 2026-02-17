import "./ProductDetail.css";
import "../../styles/global.css";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getProductById,
  getRelatedProducts,
  getCategories,
} from "../../data/productsData";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import ProductCard from "../../components/ProductCard";

export default function ProductDetail() {
  const { id } = useParams(); // Read dynamic values from the URL (<Route path="/product/:id" element={<ProductDetails />} />) :id = a dynamic URL parameter
  const { addToCart, cartItems } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [categories, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const colorNames = {
    "#000000": "Black",
    "#FFFFFF": "White",
    "#EF4444": "Red",
  };

  // Derived State (Safe to run always)
  const variants = product?.variants || [];
  const hasVariants = variants.length > 0;

  // Check if product is completely out of stock
  const isOutOfStock = !product //First, it checks if product exists at all. /
    ? false //If product is null or undefined, then isOutOfStock is false.
    : hasVariants //if their is a product
      ? variants.every((v) => v.stock <= 0) //.every() → returns true only if all variants have stock ≤ 0.
      : product.quantity !== undefined && product.quantity <= 0; //If there are no variants, we just check the main product.quantity.

  const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"]; //custom order aRRAY

  // Dynamic Filtering: Available Sizes based on Selected Color
  const availableSizes = !product
    ? [] //If product is null or undefined return an empty array
    : hasVariants
      ? [
        //sizes come from variants
        ...new Set( // A Set automatically removes duplicates: [... ]Convert back to array:
          variants
            .filter(
              (v) =>
                !selectedColor || // if no color selected : keep all variants
                (v.color?.toLowerCase() === selectedColor?.toLowerCase() && // if color selected : variants with the selected color / variants that are in stock
                  v.stock > 0),
            ) // Filter by color if selected
            .map((v) => v.size), //extract only the sizes
        ),
      ].sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b)) //sort sizes correctly
      : product.sizes && product.sizes.length > 0 //sizes come from product.sizes
        ? product.sizes
        : ["XS", "S", "M", "L", "XL", "XXL"];

  // Dynamic Filtering: Available Colors based on Selected Size
  const availableColors = !product
    ? [] //If product is null/undefined → return empty array
    : hasVariants
      ? [
        //   colors come from variants
        ...new Set( // A Set automatically removes duplicates: [... ]Convert back to array:
          variants
            .filter(
              (
                v, //If a size is selected : variants with that selected size / variants that are in stock
              ) => !selectedSize || (v.size === selectedSize && v.stock > 0), //If no size selected : keep all variants
            )
            .map((v) => v.color), //extract only the colors
        ),
      ]
      : product.colors && product.colors.length > 0 //colors come from product.colors
        ? product.colors
        : ["#000000", "#FFFFFF", "#EF4444"];

  useEffect(() => {
    setErrorMessage(null); // Clear error when selection changes
  }, [selectedSize, selectedColor, quantity]);

  useEffect(() => {
    async function fetchProductData() {
      setLoading(true); // Show loading spinner
      setError(null); // Clear any previous errors
      try {
        // Fetch product, related products, and categories in parallel
        const [productData, related, cats] = await Promise.all([
          //array destructuring | take values from an array and assign them to variables in one line.
          //await Promise.all([...]) returns an array of results
          getProductById(id), // fetch main product by id
          getRelatedProducts(id, 5), // fetch 4 related products
          getCategories(), // // fetch all categories
        ]);

        setProduct(productData);
        setRelatedProducts(related);
        setCategoriesList(cats);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Product not found"); // // show error message if fetch fails
      } finally {
        setLoading(false); // // hide loading spinner
      }
    }

    fetchProductData();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="product-detail-page page-wrapper">
        <div className="product-loading">
          <div className="loading-spinner"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  // Handle product not found
  if (error || !product) {
    return (
      <div className="product-detail-page page-wrapper">
        <div className="product-not-found">
          <i className="fas fa-exclamation-circle"></i>
          <h2>Product Not Found</h2>
          <p>Sorry, we couldn't find the product you're looking for.</p>
          <Link to="/shop" className="btn-primary-custom">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const categoryName =
    categories.find((cat) => cat.id === product.categoryId)?.name || "Fashion";
  // ?. optional chaining operator | checks If it exists → returns the property | If it’s null or undefined → returns undefined
  ///It prevents errors if the thing before the ?. doesn’t exist. And if the thing exists but the next property doesn’t exist, it simply returns undefined

  // Get image URL from backend
  const getImageUrl = (img) => {
    if (!img) return "https://placehold.co/300x300";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    const cleanImg = img.startsWith("/") ? img.slice(1) : img; // Remove leading slash if present to avoid double slashes when appending to base
    const cleanPath = cleanImg.replace(/\\/g, "/"); //replace back slashed \ them with forward slashes /
    return `${import.meta.env.VITE_API_URL || "https://glamora.up.railway.app"}/${cleanPath}`;
  };

  const productImage = getImageUrl(product.imageUrl);

  const handleQuantityChange = (delta) => {

    setQuantity((prev) => {
      const newValue = prev + delta;
      if (newValue < 1) return 1;

      if (hasVariants && selectedSize && selectedColor) {
        const variant = variants.find(
          (v) =>
            v.size === selectedSize &&
            v.color?.toLowerCase() === selectedColor?.toLowerCase(),
        );
        if (variant) {
          if (newValue > variant.stock) {
            // Show error message when trying to exceed stock
            setErrorMessage(`Only ${variant.stock} items currently in stock`);
            return variant.stock;
          }
        }
      }
      return newValue;
    });
  };

  const handleAddToCart = () => {
    setErrorMessage(null); // Clear previous errors

    if (!token) {
      //If the user is not logged in, redirect them to the login page.
      navigate("/login");
      return;
    }

    if (!selectedSize) {
      setErrorMessage("Please select a size");
      return;
    }

    if (!selectedColor) {
      setErrorMessage("Please select a color");
      return;
    }

    // Find the exact variant that matches the user’s selected size and color.
    const selectedVariant = variants.find(
      (v) =>
        v.size === selectedSize &&
        v.color?.toLowerCase() === selectedColor?.toLowerCase(),
    );

    if (!selectedVariant && hasVariants) {
      setErrorMessage("Variant not available.");
      return;
    }

    // Stock Validation
    if (selectedVariant) {
      const variantKey = `${product.id}-${selectedSize}-${selectedColor}`; //Create a unique key for the variant (id-size-color)
      const currentCartItem = cartItems.find((item) => item.key === variantKey); //Check if the user already has this in the cart
      const currentCartQty = currentCartItem ? currentCartItem.quantity : 0;
      const availableStock = parseInt(selectedVariant.stock) || 0;

      if (currentCartQty + quantity > availableStock) {
        //Make sure total quantity doesn’t exceed stock
        setErrorMessage(
          `Sorry, only ${availableStock} items available (You have ${currentCartQty} in cart).`, //If it does, show an error.
        );
        return;
      }
    } else if (!hasVariants && product) {
      //If the product doesn’t have variants, check stock the normal way.
      const currentCartQty =
        cartItems.find((item) => item.id === product.id)?.quantity || 0;
      const availableStock = parseInt(product.stock) || 0;
      if (currentCartQty + quantity > availableStock) {
        setErrorMessage(
          `Sorry, only ${availableStock} items available (You have ${currentCartQty} in cart).`,
        );
        return;
      }
    }

    // Create cart item object
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: productImage,
      isNew: product.isNew,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
    };

    addToCart(cartItem); //add to cart

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000); //Show a temporary “Added to Cart!” state for 2 seconds.
  };

  return (
    <div className="product-detail-page page-wrapper">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/shop">Shop</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="product-detail-container">
        {/* Product Image */}
        <div className="product-image-section">
          <div className="product-main-image">
            {product.isNew && <span className="product-badge-detail">New</span>}
            <img src={productImage} alt={product.name} />
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <span className="product-category-label">{categoryName}</span>
          <h1 className="product-title">{product.name}</h1>

          {/* Rating (Static for UI) */}
          <div className="product-rating">
            <div className="stars">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star-half-alt"></i>
            </div>
            <span className="rating-text">4.5 (128 reviews)</span>
          </div>

          {/* Price */}
          <div className="product-price-section">
            <span className="current-price">${product.price}</span>
          </div>

          {/* Description */}
          <div className="product-description">
            <p>
              {product.description ||
                "Premium quality product crafted with the finest materials. Perfect for any occasion and designed to last."}
            </p>
          </div>

          {isOutOfStock ? ( //checks if the product is out of stock /It renders a red warning icon and the message “Out of Stock”.
            <div className="out-of-stock-section">
              <div className="out-of-stock-message">
                <i
                  className="fas fa-exclamation-triangle out-of-stock-icon"
                ></i>
                <span className="out-of-stock-text">
                  Out of Stock
                </span>
              </div>
              <p className="out-of-stock-desc">
                This product is currently unavailable. Please check back later
                or explore our other products.
              </p>
            </div>
          ) : ( //else shows size and color and quantity selector
            <div className="product-options">
              {/* Size Selector */}
              <div className="option-group">
                <label className="option-label">
                  Size:{" "}
                  <span className="option-selected-value">
                    {selectedSize || ""}
                  </span>
                </label>
                <div className="size-buttons">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      className={`size-btn ${selectedSize === size ? "active" : ""}`}
                      onClick={
                        () =>
                          setSelectedSize(selectedSize === size ? null : size) //toggle logic
                      }
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              {availableColors.length > 0 && (
                <div className="option-group">
                  <label className="option-label">
                    Color:{" "}
                    <span className="option-selected-value">
                      {colorNames[selectedColor] || selectedColor}
                    </span>
                  </label>
                  <div className="color-options">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        className={`color-btn ${selectedColor === color ? "active" : ""}`}
                        style={{
                          backgroundColor: color,
                        }}
                        onClick={
                          () =>
                            setSelectedColor(
                              selectedColor === color ? null : color,
                            ) //toggle logic
                        }
                        aria-label={`Color ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="option-group">
                <label className="option-label">Quantity</label>
                <div className="quantity-selector">
                  <button
                    className="qty-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || !selectedSize || !selectedColor}
                    title={!selectedSize || !selectedColor ? "Select size and color first" : ""}
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => handleQuantityChange(1)}
                    disabled={!selectedSize || !selectedColor}
                    title={!selectedSize || !selectedColor ? "Select size and color first" : ""}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>

                {/* Hint message when size/color not selected */}
                {(!selectedSize || !selectedColor) && (
                  <div className="selection-hint">
                    <i className="fas fa-info-circle"></i>
                    Please select size and color to adjust quantity
                  </div>
                )}

                {/* Error Message Display */}
                {errorMessage && (
                  <div className="quantity-error">
                    <i
                      className="fas fa-exclamation-circle"
                    ></i>
                    {errorMessage}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <div className="product-actions">
            <button
              className={`add-to-cart-btn-large ${addedToCart ? "added" : ""} ${isOutOfStock ? "disabled" : ""}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock} //The button cannot be clicked
            >
              {isOutOfStock ? (
                <>
                  <i className="fas fa-ban"></i>
                  Out of Stock
                </>
              ) : addedToCart ? (
                <>
                  <i className="fas fa-check"></i>
                  Added to Cart!
                </>
              ) : (
                <>
                  <i className="fas fa-shopping-bag"></i>
                  Add to Cart
                </>
              )}
            </button>
            <button className="wishlist-btn">
              <i className="far fa-heart"></i>
            </button>
          </div>

          {/* Product Features */}
          <div className="product-features">
            <div className="feature">
              <i className="fas fa-truck"></i>
              <span>Free shipping on orders over $100</span>
            </div>
            <div className="feature">
              <i className="fas fa-undo"></i>
              <span>30-day easy returns</span>
            </div>
            <div className="feature">
              <i className="fas fa-shield-alt"></i>
              <span>2-year warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="related-products-section">
          <h2 className="section-title">You May Also Like</h2>
          <div className="product-grid">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                id={relatedProduct.id}
                image={relatedProduct.imageUrl}
                name={relatedProduct.name}
                price={relatedProduct.price}
                isNew={relatedProduct.isNew}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
