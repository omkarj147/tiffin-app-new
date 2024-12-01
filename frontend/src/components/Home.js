import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLeaf, FaUtensils, FaClock, FaShieldAlt } from 'react-icons/fa';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Delicious & Healthy<br />Homemade Tiffin</h1>
          <p className="hero-description">
            Experience the taste of authentic home-cooked meals, delivered fresh to your doorstep daily.
            Made with love, served with care.
          </p>
          <div className="hero-cta">
            <button className="cta-button primary" onClick={() => navigate('/login')}>
              Order Now
            </button>
            <button className="cta-button secondary" onClick={() => navigate('/menu')}>
              View Menu
            </button>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Why Choose Us</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaLeaf />
            </div>
            <h3>Fresh Ingredients</h3>
            <p>Handpicked fresh ingredients and premium quality spices for authentic taste</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaUtensils />
            </div>
            <h3>Diverse Menu</h3>
            <p>Wide variety of dishes that change daily to keep your meals exciting</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaClock />
            </div>
            <h3>Timely Delivery</h3>
            <p>Hot and fresh meals delivered right on time at your convenience</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaShieldAlt />
            </div>
            <h3>Hygiene Assured</h3>
            <p>Prepared in certified kitchens following strict hygiene protocols</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Choose Your Plan</h3>
            <p>Select from our flexible meal plans that suit your needs</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Customize Menu</h3>
            <p>Pick your preferred dishes from our rotating menu</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Enjoy Your Meals</h3>
            <p>Get fresh, hot meals delivered to your location</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
