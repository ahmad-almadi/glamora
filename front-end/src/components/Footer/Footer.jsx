import "./Footer.css";
import { Link } from "react-router-dom"; //navigate between pages without reloading
import { useSettings } from "../../context/SettingsContext"; //Custom hook to get store settings like email, phone, and store name.

export default function Footer() {
  const { settings } = useSettings(); //It  contain dynamic info

  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h2 className="footer-title">About Us</h2>
            <p>
              We provide the latest fashion trends with premium quality and
              style.
            </p>
          </div>
          <div className="footer-section">
            <h2 className="footer-title">Quick Links</h2>
            <ul>
              <li>
                <Link to="/home">Home</Link>
              </li>
              <li>
                <Link to="/shop">Shop</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h2 className="footer-title">Contact</h2>
            <p>{/* Uses settings if available; otherwise defaults to generic values */}
              <i className="fas fa-envelope me-2"></i>
              {settings?.storeEmail || "info@yourbrand.com"}
            </p>
            <p>
              <i className="fas fa-phone me-2"></i>
              {settings?.storePhone || "+1 234 567 890"} 
            </p>
          </div>
          <div className="footer-section">
            <h2 className="footer-title">Follow Us</h2>
            <div className="social-icons">
              <a href="#" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" aria-label="Pinterest">
                <i className="fab fa-pinterest-p"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2026 {settings?.storeName || "YourBrand"}. All Rights Reserved.
        </div>
      </footer>
    </>
  );
}
