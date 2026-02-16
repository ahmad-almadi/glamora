import "./AboutUs.css";
import "../../styles/global.css";

export default function AboutUs() {
    return (
        <div className="about-page page-wrapper">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="about-hero-content">
                    <span className="about-tag">Our Story</span>
                    <h1>Crafting Style, Defining Elegance</h1>
                    <p>
                        More than just fashion — we create experiences that empower you to express your unique identity.
                    </p>
                </div>
            </section>

            {/* Story Section */}
            <section className="about-story">
                <div className="story-image">
                    <img
                        src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800"
                        alt="Our Store"
                    />
                </div>
                <div className="story-content">
                    <h2>The Beginning</h2>
                    <p>
                        Founded in 2020, our brand emerged from a simple vision: to create fashion that combines
                        timeless elegance with modern sensibility. What started as a small boutique has grown
                        into a destination for style-conscious individuals seeking quality and distinction.
                    </p>
                    <p>
                        We believe that great fashion should be accessible, sustainable, and designed to last.
                        Every piece in our collection is carefully curated to ensure it meets our exacting
                        standards for quality, comfort, and style.
                    </p>
                </div>
            </section>

            {/* Values Section */}
            <section className="about-values">
                <h2 className="section-title">Our Values</h2>
                <div className="values-grid">
                    <div className="value-card">
                        <div className="value-icon">
                            <i className="fas fa-gem"></i>
                        </div>
                        <h3>Quality First</h3>
                        <p>We source only the finest materials and partner with skilled artisans to create pieces that last.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon">
                            <i className="fas fa-leaf"></i>
                        </div>
                        <h3>Sustainability</h3>
                        <p>Our commitment to the environment guides every decision, from sourcing to packaging.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon">
                            <i className="fas fa-heart"></i>
                        </div>
                        <h3>Community</h3>
                        <p>We're more than a brand — we're a community of individuals who share a passion for style.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon">
                            <i className="fas fa-star"></i>
                        </div>
                        <h3>Innovation</h3>
                        <p>We constantly evolve, bringing fresh perspectives and cutting-edge designs to our collection.</p>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="about-team">
                <h2 className="section-title">Meet Our Team</h2>
                <p className="team-intro">
                    Behind every great collection is a passionate team dedicated to bringing you the best in fashion.
                </p>
                <div className="team-grid">
                    <div className="team-member">
                        <img
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
                            alt="Team Member"
                        />
                        <h4>James Wilson</h4>
                        <span>Founder & CEO</span>
                    </div>
                    <div className="team-member">
                        <img
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"
                            alt="Team Member"
                        />
                        <h4>Sarah Chen</h4>
                        <span>Creative Director</span>
                    </div>
                    <div className="team-member">
                        <img
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"
                            alt="Team Member"
                        />
                        <h4>Michael Brown</h4>
                        <span>Head of Design</span>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="about-stats">
                <div className="stat-item">
                    <span className="stat-number">50K+</span>
                    <span className="stat-label">Happy Customers</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">500+</span>
                    <span className="stat-label">Products</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">25+</span>
                    <span className="stat-label">Countries</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">5</span>
                    <span className="stat-label">Years of Excellence</span>
                </div>
            </section>
        </div>
    );
}
