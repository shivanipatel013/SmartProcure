import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ShoppingCart,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  LogIn,
  ShieldCheck,
  CheckCircle,
  XCircle,
} from "lucide-react";

import "./Login.css";

const API_URL = "http://localhost:8080";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const result = await response.text();

      /* Login failed */
      if (result === "Invalid Email or Password") {
        setError("Invalid email or password.");
        return;
      }

      if (!response.ok) {
        setError("Unable to login. Please try again.");
        return;
      }

      /* Save JWT token */
      localStorage.setItem("token", result);

      /* Get user details */
      const userResponse = await fetch(
        `${API_URL}/user/getByEmail?email=${encodeURIComponent(
          email.trim()
        )}`
      );

      let user = null;

      if (userResponse.ok) {
        user = await userResponse.json();
        localStorage.setItem("user", JSON.stringify(user));
      }

      /* =================================
         SUCCESS MESSAGE
      ================================= */

      setSuccess(true);

      /* Redirect after success message */
      setTimeout(() => {
        const role = user?.role?.toUpperCase();

        if (role === "ADMIN") {
          navigate("/admin/dashboard");
        } else if (role === "SUPPLIER") {
          navigate("/supplier/dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 1800);

    } catch (err) {
      console.error("Login error:", err);

      setError(
        "Cannot connect to server. Make sure your backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Background */}
      <div className="login-background"></div>

      {/* Back Home */}
      <button
        className="back-home"
        onClick={() => navigate("/")}
      >
        <ArrowLeft size={20} />
        Back to Home
      </button>


      {/* =====================================
          LOGIN CARD
      ===================================== */}

      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <ShoppingCart size={38} strokeWidth={2.3} />
        </div>


        {/* Heading */}
        <h1>
          Welcome to <span>SmartProcure</span>
        </h1>

        <p className="login-subtitle">
          Sign in to manage your procurement activities
        </p>


        {/* =====================================
            SUCCESS MESSAGE
        ===================================== */}

        {success && (
          <div className="success-box">

            <div className="success-icon">
              <CheckCircle size={26} />
            </div>

            <div>
              <strong>Login Successful!</strong>

              <p>
                Welcome back to SmartProcure.
              </p>
            </div>

          </div>
        )}


        {/* =====================================
            ERROR MESSAGE
        ===================================== */}

        {error && (
          <div className="login-error">

            <XCircle size={21} />

            <span>{error}</span>

          </div>
        )}


        {/* =====================================
            FORM
        ===================================== */}

        <form onSubmit={handleLogin}>

          {/* Email */}
          <div className="input-group">

            <label>Email Address</label>

            <div className="input-wrapper">

              <Mail size={21} />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />

            </div>

          </div>


          {/* Password */}
          <div className="input-group">

            <label>Password</label>

            <div className="input-wrapper">

              <Lock size={21} />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>

            </div>

          </div>


          {/* Login Button */}
          <button
            type="submit"
            className="login-submit"
            disabled={loading || success}
          >

            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : success ? (
              <>
                <CheckCircle size={21} />
                Login Successful
              </>
            ) : (
              <>
                <LogIn size={21} />
                Sign In
              </>
            )}

          </button>

        </form>


        {/* Security */}
        <div className="secure-login">

          <ShieldCheck size={18} />

          <span>
            Secure Procurement Management
          </span>

        </div>


        {/* Register */}
        <div className="register-section">

          <span>Don't have an account?</span>

          <button
            onClick={() => navigate("/register")}
          >
            Create Account
          </button>

        </div>

      </div>

    </div>
  );
}

export default Login;