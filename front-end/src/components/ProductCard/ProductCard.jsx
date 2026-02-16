import "./ProductCard.css";
import { Link } from "react-router-dom";

export default function ProductCard({ id, image, name, price, isNew, quantity, variants }) {

  // Calculate if product is out of stock
  // If variants exist, check if ALL variants have 0 stock
  // Otherwise, check the main product quantity
  const isOutOfStock = variants && variants.length > 0
    ? variants.every(v => v.stock <= 0) //.every() checks all items in the array. //true → all variants are  v.stock <= 0
    : (quantity !== undefined && quantity <= 0);

  const getImageUrl = (img) => {
    if (!img) return "https://placehold.co/300x300";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    const cleanImg = img.startsWith("/") ? img.slice(1) : img;
    const cleanPath = cleanImg.replace(/\\/g, "/");
    return `http://glamora.up.railway.app/${cleanPath}`;
  };
  const imageUrl = getImageUrl(image);

  return (
    <Link to={`/product/${id}`} className="glam-product-link">
      <div className={`glam-product-card ${isOutOfStock ? "out-of-stock" : ""}`}>
        <div className="glam-image-wrapper">
          <img src={imageUrl} alt={name} className="glam-product-image" />
          {isNew && !isOutOfStock && <span className="glam-badge">New</span>}
          {isOutOfStock && <span className="glam-badge out-of-stock-badge">Out of Stock</span>}
          {!isOutOfStock && (
            <div className="glam-overlay">
              <div className="glam-add-btn">
                <i className="fas fa-list-ul"></i>
                Select Options
              </div>
            </div>
          )}
        </div>
        <div className="glam-product-info">
          <h3 className="glam-product-name">{name}</h3>
          <div className="glam-price-wrapper">
            <span className="glam-price">${price}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
