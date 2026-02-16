import { useState } from "react";
import "./Contact.css";
import "../../styles/global.css";
import { useSettings } from "../../context/SettingsContext";
import api from "../../utils/api";

export default function Contact() {
  const { settings } = useSettings(); //to get site setting

  // Form state
  const [formData, setFormData] = useState({
    ///Holds all form input values in a single object. /This makes the form controlled and easy to submit
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false); //Tracks whether the form is currently being submitted.
  const [submitStatus, setSubmitStatus] = useState(null); //Tracks submission result: 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState(""); //Stores the error message returned from the backend or a fallback message.

  const handleChange = (e) => {
    const { id, value } = e.target; //destructing the id {firsrname} and the value {what u wrote}
    setFormData((prev) => ({
      //prev old value of state
      ...prev, //This copies all existing fields so they are not lost.
      [id]: value, //This is a computed property name in JavaScript. /It updates the field that matches the input’s id.
      //[] Because you want to use the value of the variable id, not the literal word "id".
      //A computed property name is when you want the key of an object to be determined dynamically, using a variable or expression, instead of being a fixed string.
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage("");

    try {
      const res = await api.post("/contact", formData);

      // Check status code
      if (res.status === 201) { //created the recode and saved to db
        setSubmitStatus("success");

        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          subject: "",
          message: "",
        });
      }
    } catch (error) {
      console.error("Failed to submit contact form:", error);
      setSubmitStatus("error");
      setErrorMessage(
        error.response?.data?.message ||
        "Failed to send message. Please try again later.",
      );
    } finally {
      setIsSubmitting(false); //Stops the loading state whether the request succeeded or failed.
    }
  };

  return (
    <div className="contact-page page-wrapper">
      {/* Page Header */}
      <div className="contact-header">
        <span className="contact-tag">Get In Touch</span>
        <h1>Contact Us</h1>
        <p>Have a question or feedback? We'd love to hear from you.</p>
      </div>

      <div className="contact-container">
        {/* Contact Form */}
        <div className="contact-form-wrapper">
          <h2>Send us a Message</h2>

          {/* Success Message */}
          {submitStatus === "success" && (
            <div className="form-message success">
              <i className="fas fa-check-circle"></i>
              <span>
                Thank you for your message! We'll get back to you soon.
              </span>
            </div>
          )}

          {/* Error Message */}
          {submitStatus === "error" && (
            <div className="form-message error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting} //Disabled while submitting
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <select
                id="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              >
                <option value="">Select a subject</option>
                <option value="order">Order Inquiry</option>
                <option value="return">Returns & Exchanges</option>
                <option value="product">Product Question</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                rows="5"
                placeholder="How can we help you?"
                value={formData.message}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              ></textarea>
            </div>
            <button
              type="submit"
              className="btn-primary-custom submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? ( //spinned if its submitting
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Sending...</span>
                </>
              ) : (
                "Send Message"
              )}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="contact-info-wrapper">
          <div className="contact-info">
            <h2>Contact Information</h2>
            <p className="info-intro">
              Reach out to us through any of the following channels. We
              typically respond within 24 hours.
            </p>

            <div className="info-items">
              <div className="info-item">
                <div className="info-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div>
                  <h4>Email Us</h4>
                  <p>{settings?.storeEmail || "support@yourbrand.com"}</p>
                  <p>
                    sales@
                    {settings?.storeEmail
                      ? settings.storeEmail.split("@")[1]
                      : "yourbrand.com"}
                  </p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <i className="fas fa-phone"></i>
                </div>
                <div>
                  <h4>Call Us</h4>
                  <p>{settings?.storePhone || "+1 (555) 123-4567"}</p>
                  <p>
                    Mon - Fri: 9AM - 6PM{" "}
                    {settings?.timezone
                      ? settings.timezone.split("/")[1]
                      : "EST"}
                  </p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div>
                  <h4>Visit Us</h4>
                  <p>
                    {settings?.storeAddress ||
                      "123 Fashion Street, New York, NY 10000"}
                  </p>
                </div>
              </div>
            </div>

            <div className="social-section">
              <h4>Follow Us</h4>
              <div className="social-links">
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

          {/* Map Placeholder */}
          <div className="map-placeholder">
            <div className="map-content">
              <i className="fas fa-map-marked-alt"></i>
              <p>Interactive Map</p>
              <span>Map integration coming soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
