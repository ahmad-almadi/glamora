import "./NewArrival.css";
import "../../styles/global.css";
import ProductCard from "../../components/ProductCard";
import { useState, useEffect } from "react";
import { getProducts } from "../../data/productsData";

export default function NewArrival() {
  const [newProducts, setNewProducts] = useState([]);
  useEffect(() => {
    //Runs once when the page loads ([] dependency array
    async function fetchProducts() {
      try {
        const data = await getProducts(); //function that fetches all products from the backend API
        // Filter only new products
        const filtered = data.filter((product) => product.isNew); //Filters products where isNew === true
        setNewProducts(filtered);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    }
    fetchProducts();
  }, []);
  return (
    <div className="new-arrival-page page-wrapper">
      {/* Page Header */}
      <div className="new-arrival-header">
        <span className="header-tag">Fresh Drops</span>
        <h1>New Arrivals</h1>
        <p>
          Be the first to discover our latest collection. Fresh styles, premium
          quality, just for you.
        </p>
      </div>

      {/* Products Grid */}
      <section className="new-arrival-section">
        <div className="product-grid">
          {/*Loops over newProducts */}
          {newProducts.map((product) => (
            <ProductCard //Renders one ProductCard per product
              key={product.id} //(reconciliation) is required by React for performance , React uses key to identify which elements have changed, been added, or removed, so it can update the UI efficiently.
              id={product.id}
              image={product.imageUrl}
              name={product.name}
              price={product.price}
              isNew={product.isNew}
            />
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="new-arrival-cta">
        <div className="cta-content">
          <h2>Stay Updated</h2>
          <p>
            Sign up for our newsletter to be notified of new arrivals and
            exclusive offers.
          </p>
          <form className="cta-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="cta-input"
            />
            <button type="submit" className="btn-primary-custom">
              Notify Me
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
