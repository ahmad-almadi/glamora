import "./Home.css";
import "../../styles/global.css";
import { useState, useEffect } from "react";
import ProductCard from "../../components/ProductCard";
import { getProducts } from "../../data/productsData";
import ChatBot from "../../components/ChatBot";

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newArrivals, setNewArrivals] = useState([]); //stores the latest products marked as isNew
  const [featuredProducts, setFeaturedProducts] = useState([]); //stores other products for a “featured” section
  const toggleChat = () => setIsChatOpen(!isChatOpen);

  useEffect(() => {
    //Runs once when the component is mounted ([] dependency).
    async function fetchProducts() {
      try {
        const products = await getProducts(); //Calls getProducts() which fetches all products from backend

        // Ensure products is an array
        if (Array.isArray(products)) {
          setNewArrivals(products.filter((p) => p.isNew && p.quantity > 0).slice(0, 5)); //get 4 item New
          setFeaturedProducts(products.filter((p) => !p.isNew && p.quantity > 0).slice(0, 10)); //get 8 item not New
        } else {
          console.error("Products data is not an array:", products);
          setNewArrivals([]);
          setFeaturedProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setNewArrivals([]);
        setFeaturedProducts([]);
      }
    }

    fetchProducts();
  }, []);
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-tag">New Season Collection</span>
          <h1 className="hero-title">Elevate Your Style</h1>
          <p className="hero-subtitle">
            Discover timeless pieces designed for the modern individual. Premium
            quality, exceptional craftsmanship.
          </p>
          <div className="hero-buttons">
            <a href="/shop" className="btn-primary-custom">
              Shop Now
            </a>
            <a href="/new-arrival" className="btn-outline-custom">
              View Collection
            </a>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <img
            src="/images/home-photo.jpg"
            alt="Fashion Collection"
            className="hero-image"
          />
        </div>
      </section>

      {/* Features Bar */}
      <section className="features-bar">
        <div className="feature-item">
          <i className="fas fa-shipping-fast"></i>
          <span>Free Shipping</span>
        </div>
        <div className="feature-item">
          <i className="fas fa-undo"></i>
          <span>30-Day Returns</span>
        </div>
        <div className="feature-item">
          <i className="fas fa-lock"></i>
          <span>Secure Payment</span>
        </div>
        <div className="feature-item">
          <i className="fas fa-headset"></i>
          <span>24/7 Support</span>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="section new-arrivals-section">
        <h2 className="section-title">New Arrivals</h2>
        <p className="section-description">
          Be the first to discover our latest additions to the collection
        </p>
        <div className="product-grid">
          {/*Loops over newArrivals and renders a ProductCard for each product. Displays top 4 new products. */}
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              image={product.imageUrl}
              name={product.name}
              price={product.price}
              isNew={product.isNew}
            />
          ))}
        </div>
        <div className="section-cta">
          <a href="/new-arrival" className="btn-outline-custom">
            View All New Arrivals
          </a>
        </div>
      </section>

      {/* Banner Section */}
      <section className="promo-banner">
        <div className="promo-content">
          <span className="promo-tag">Limited Time Offer</span>
          <h2 className="promo-title">Up to 40% Off</h2>
          <p className="promo-text">On selected premium collections</p>
          <a href="/shop" className="btn-primary-custom">
            Shop Sale
          </a>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="section featured-section">
        <h2 className="section-title">Featured Products</h2>
        <p className="section-description">
          Curated selection of our most beloved pieces
        </p>
        <div className="product-grid">
          {/*Loops over featuredProducts and renders up to 8 products. */}
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              image={product.imageUrl}
              name={product.name}
              price={product.price}
              isNew={product.isNew}
            />
          ))}
        </div>
        <div className="section-cta">
          <a href="/shop" className="btn-outline-custom">
            Explore All Products
          </a>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="newsletter-content">
          <h2>Join Our Newsletter</h2>
          <p>
            Subscribe to get exclusive offers, style tips, and early access to
            new arrivals.
          </p>
          <form
            className="newsletter-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email address"
              className="newsletter-input"
            />
            <button type="submit" className="btn-primary-custom">
              Subscribe
            </button>
          </form>
        </div>
      </section>
      {/* =================== */}
      {/* Chat Icon */}
      <div className="chat-icon-wrapper" onClick={toggleChat}>
        <i className="fas fa-comment"></i>
      </div>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="chat-window">
          <ChatBot />
        </div>
      )}
    </div>
  );
}
