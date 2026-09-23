import React from "react";
import "./App.css";

import {
  ShoppingCart,
  User,
  Building2,
  Rocket,
  ArrowRight,
  ClipboardCheck,
  TrendingUp,
  Truck,
  ShoppingBag,
} from "lucide-react";

function Home() {

  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleAbout = () => {
    window.location.href = "/about";
  };

  return (
    <div className="home">

      {/* Background Overlay */}
      <div className="overlay"></div>

      {/* =====================================
          NAVBAR
      ===================================== */}

      <header className="navbar">

        {/* Logo / Brand */}
        <div className="brand">

          <div className="brand-icon">
            <ShoppingCart
              size={22}
              strokeWidth={2.5}
            />
          </div>

          <h2>
            Smart<span>Procure</span>
          </h2>

        </div>


        {/* Navigation Buttons */}
        <div className="nav-buttons">

          <button
            className="about-btn"
            onClick={handleAbout}
          >
            <Building2 size={21} />
            <span>About</span>
          </button>


          <button
            className="login-btn"
            onClick={handleLogin}
          >
            <User size={21} />
            <span>Login</span>
          </button>

        </div>

      </header>


      {/* =====================================
          HERO SECTION
      ===================================== */}

      <main className="hero">


        {/* Decorative Left Icon */}
        <div className="floating-icon left-top">
          <ClipboardCheck size={65} />
        </div>


        {/* Decorative Right Icon */}
        <div className="floating-icon right-top">
          <TrendingUp size={70} />
        </div>


        {/* Decorative Bottom Left */}
        <div className="floating-icon left-bottom">
          <Truck size={60} />
        </div>


        {/* Decorative Bottom Right */}
        <div className="floating-icon right-bottom">
          <ShoppingBag size={60} />
        </div>


        {/* =================================
            MAIN LOGO
        ================================= */}

        <div className="logo-circle">

          <div className="circle-border"></div>


          <div className="cart-box">

            <ShoppingCart
              size={78}
              strokeWidth={2.2}
            />

            <div className="check">
              ✓
            </div>

          </div>

        </div>


        {/* =================================
            MAIN TITLE
        ================================= */}

        <h1>
          Smart<span>Procure</span>
        </h1>


        {/* Blue Line */}
        <div className="blue-line"></div>


        {/* =================================
            SUBTITLE
        ================================= */}

        <p className="subtitle">
          Smart Procurement &amp; Purchase Order
          <br />
          Management System
        </p>


        {/* =================================
            GET STARTED BUTTON
        ================================= */}

        <button
          className="start-btn"
          onClick={handleLogin}
        >

          <Rocket
            size={30}
            strokeWidth={2}
          />

          <span>
            Get Started
          </span>

          <ArrowRight
            size={35}
            className="arrow"
          />

        </button>


        {/* =================================
            SMALL DESCRIPTION
        ================================= */}

        <p className="description">
          Streamline procurement. Simplify approvals.
          <br />
          Make smarter purchasing decisions.
        </p>

      </main>


      {/* =====================================
          BOTTOM WAVES
      ===================================== */}

      <div className="wave wave-one"></div>

      <div className="wave wave-two"></div>

      <div className="wave wave-three"></div>

    </div>
  );
}

export default Home;