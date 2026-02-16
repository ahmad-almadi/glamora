import "./FAQ.css";
import "../../styles/global.css";
import { useState } from "react";

const faqData = [
  {
    category: "Orders & Shipping",
    questions: [
      {
        q: "How long does shipping take?",
        a: "Standard shipping takes 5-7 business days. Express shipping is available for 2-3 business day delivery. International orders may take 10-14 business days depending on the destination.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes! We offer free standard shipping on all orders over $100. For orders under $100, shipping is calculated at checkout based on your location.",
      },
      {
        q: "Can I track my order?",
        a: "Absolutely! Once your order ships, you'll receive a confirmation email with tracking information. You can also track your order in your account dashboard.",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes, we ship to over 50 countries worldwide. International shipping rates and delivery times are calculated at checkout.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    questions: [
      {
        q: "What is your return policy?",
        a: "We offer a 30-day return policy on all unworn items with original tags attached. Items must be in their original condition. Sale items are final sale unless defective.",
      },
      {
        q: "How do I initiate a return?",
        a: "Log into your account, go to Order History, and select the item you wish to return. Print the prepaid shipping label and send the item back. Refunds are processed within 5-7 business days of receiving the return.",
      },
      {
        q: "Can I exchange an item for a different size?",
        a: "Yes! You can request an exchange for a different size or color. Simply follow the return process and note that you'd like an exchange. We'll ship the new item once we receive your return.",
      },
    ],
  },
  {
    category: "Products & Sizing",
    questions: [
      {
        q: "How do I find my size?",
        a: "Check our Size Guide on each product page for detailed measurements. We provide measurements in both inches and centimeters. If you're between sizes, we recommend sizing up for a more comfortable fit.",
      },
      {
        q: "Are your products true to size?",
        a: "Most of our products run true to size. However, we include specific sizing notes on products that may run large or small. Check the product description for details.",
      },
      {
        q: "What materials do you use?",
        a: "We source premium materials including organic cotton, Italian leather, merino wool, and sustainable fabrics. Each product page lists the full material composition.",
      },
    ],
  },
  {
    category: "Payment & Security",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and Shop Pay. All transactions are secured with SSL encryption.",
      },
      {
        q: "Is my payment information secure?",
        a: "Absolutely. We use industry-standard SSL encryption and never store your full credit card information. All payments are processed through secure, PCI-compliant payment processors.",
      },
      {
        q: "Do you offer payment plans?",
        a: "Yes! We partner with Klarna and Afterpay to offer buy-now-pay-later options. Split your purchase into 4 interest-free payments at checkout.",
      },
    ],
  },
];

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`faq-item ${isOpen ? "open" : ""}`}>
      <button className="faq-question" onClick={() => setIsOpen(!isOpen)}>
        {/*Clicking the question toggles isOpen. */}
        <span>{question}</span>
        <i
          className={`fas fa-chevron-down faq-icon ${isOpen ? "rotate" : ""}`}
        ></i>
      </button>
      <div className="faq-answer">
        <p>{answer}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="faq-page page-wrapper">
      {/* Page Header */}
      <div className="faq-header">
        <span className="faq-tag">Help Center</span>
        <h1>Frequently Asked Questions</h1>
        <p>
          Find answers to common questions about orders, shipping, returns, and
          more.
        </p>
      </div>

      {/* Search Bar */}
      <div className="faq-search">
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder="Search for answers..."
          className="faq-search-input"
        />
      </div>

      {/* FAQ Content */}
      <div className="faq-content">
        {/*loops over each category and renders a <div> for it. */}
        {/*Only use index if your data has no unique id and the list is static */}
        {faqData.map((category, index) => (
          <div key={index} className="faq-category">
            {/*the key prop is specific to React , identity for React’s internal DOM tracking. */}
            <h2 className="category-title">{category.category}</h2>
            <div className="faq-list">
              {/*loops over each question */}
              {category.questions.map((item, idx) => (
                <FAQItem key={idx} question={item.q} answer={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* why we use key in React ??? It keeps a lightweight copy of the DOM in memory
        When your data changes, React compares the old virtual DOM with the new virtual DOM
        React then updates only what changed in the real DOM */}

      {/* Contact CTA */}
      <div className="faq-contact">
        <h3>Still have questions?</h3>
        <p>
          Can't find the answer you're looking for? Our customer support team is
          here to help.
        </p>
        <a href="/contact" className="btn-primary-custom">
          Contact Us
        </a>
      </div>
    </div>
  );
}
