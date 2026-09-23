import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/axios";

import {
  ShoppingCart,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  UserPlus,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Briefcase,
  Layers,
  Sparkles
} from "lucide-react";

import "./Register.css";

const API_URL = "http://localhost:8080";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    designation: "Procurement Specialist",
    role: "USER",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      let updatedDesignation = prev.designation;
      if (name === "role") {
        if (value === "SUPPLIER" && (prev.designation === "Procurement Specialist" || prev.designation === "Procurement Administrator")) {
          updatedDesignation = "Authorized Supplier Partner";
        } else if (value === "ADMIN" && (prev.designation === "Procurement Specialist" || prev.designation === "Authorized Supplier Partner")) {
          updatedDesignation = "Procurement Administrator";
        } else if (value === "USER" && (prev.designation === "Authorized Supplier Partner" || prev.designation === "Procurement Administrator")) {
          updatedDesignation = "Procurement Specialist";
        }
      }
      return {
        ...prev,
        [name]: value,
        ...(name === "role" ? { designation: updatedDesignation } : {}),
      };
    });
    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(false);

    // -----------------------------
    // VALIDATIONS
    // -----------------------------
    if (
      !form.username.trim() ||
      !form.email.trim() ||
      !form.phoneNumber.trim() ||
      !form.designation.trim() ||
      !form.password.trim() ||
      !form.confirmPassword.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    const phone = form.phoneNumber.replace(/\D/g, "");
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the Terms & Conditions.");
      return;
    }

    try {
      setLoading(true);

      // Payload matching backend UserEntity schema exactly
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        designation: form.designation.trim(),
        phoneNumber: phone,
        role: form.role || "USER",
      };

      const res = await fetch(`${API_URL}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.text();

      // Check if backend returned a string error
      if (
        responseData.includes("Email already exists") ||
        responseData.includes("already exists")
      ) {
        setError("This email is already registered. Please sign in or use another email.");
        return;
      }

      if (
        responseData.includes("Password already used") ||
        responseData.includes("already used")
      ) {
        setError("This password has already been used. Please choose a unique password.");
        return;
      }

      if (res.ok) {
        // If role is SUPPLIER, ensure a Supplier record is also registered in backend
        if (form.role === "SUPPLIER") {
          try {
            await fetch(`${API_URL}/supplier`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                supplierName: form.username.trim(),
                email: form.email.trim(),
                phone: phone,
                address: form.designation.trim() || "Authorized Supplier Partner",
              }),
            });
          } catch (suppErr) {
            console.warn("Supplier profile sync notice:", suppErr);
          }
        }

        setSuccess(true);
        setForm({
          username: "",
          email: "",
          phoneNumber: "",
          designation: "Procurement Specialist",
          role: "USER",
          password: "",
          confirmPassword: "",
        });
        setAgreeTerms(false);

        setTimeout(() => {
          navigate("/login");
        }, 1800);
      } else {
        setError(responseData || "Registration failed. Please verify your details.");
      }
    } catch (err) {
      console.error("Registration Error:", err);
      setError("Unable to connect to the server. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Ambient background glow */}
      <div className="register-glow register-glow-one" />
      <div className="register-glow register-glow-two" />
      <div className="register-grid" />

      {/* Back to Home button */}
      <button
        type="button"
        className="register-back-home"
        onClick={() => navigate("/")}
      >
        <ArrowLeft size={18} />
        Back to Home
      </button>

      {/* Register Card */}
      <div className="register-card">
        {/* Logo & Branding */}
        <div className="register-logo">
          <ShoppingCart size={28} strokeWidth={2.4} />
        </div>

        <div className="register-brand">
          <span className="brand-dark">Smart</span>
          <span className="brand-blue">Procure</span>
        </div>

        <p className="register-tagline">
          Enterprise Procurement & Purchase Order System
        </p>

        <div className="register-heading">
          <h1>Create Account</h1>
          <p>Register your profile according to your organizational role</p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="register-success">
            <div className="register-success-icon">
              <CheckCircle size={24} />
            </div>
            <div>
              <strong>Registration Successful!</strong>
              <p>Your account has been registered. Redirecting to login...</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="register-error">
            <XCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister}>
          {/* Full Name / Username */}
          <div className="register-input-group">
            <label>
              Full Name / Username <span>*</span>
            </label>
            <div className="register-input-wrapper">
              <User size={18} />
              <input
                type="text"
                name="username"
                placeholder="e.g. John Doe"
                value={form.username}
                onChange={handleChange}
                disabled={loading || success}
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="register-input-group">
            <label>
              Corporate Email Address <span>*</span>
            </label>
            <div className="register-input-wrapper">
              <Mail size={18} />
              <input
                type="email"
                name="email"
                placeholder="e.g. john.doe@company.com"
                value={form.email}
                onChange={handleChange}
                disabled={loading || success}
                required
              />
            </div>
          </div>

          {/* Phone Number & Role */}
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "12px" }}>
            <div className="register-input-group">
              <label>
                Phone Number <span>*</span>
              </label>
              <div className="register-input-wrapper">
                <Phone size={18} />
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="10-digit number"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  maxLength={10}
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            <div className="register-input-group">
              <label>
                System Role <span>*</span>
              </label>
              <div className="register-input-wrapper">
                <Layers size={18} />
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  disabled={loading || success}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    color: "var(--sp-text-main)",
                    fontWeight: "600",
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="USER" style={{ color: "var(--sp-text-main)", background: "var(--sp-card-bg)" }}>USER (Employee)</option>
                  <option value="SUPPLIER" style={{ color: "var(--sp-text-main)", background: "var(--sp-card-bg)" }}>SUPPLIER (Vendor Partner)</option>
                  <option value="ADMIN" style={{ color: "var(--sp-text-main)", background: "var(--sp-card-bg)" }}>ADMIN (Controller)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Designation */}
          <div className="register-input-group">
            <label>
              Professional Designation <span>*</span>
            </label>
            <div className="register-input-wrapper">
              <Briefcase size={18} />
              <input
                type="text"
                name="designation"
                placeholder={form.role === "SUPPLIER" ? "e.g. Authorized Vendor, Logistics Manager" : "e.g. Procurement Specialist, IT Lead"}
                value={form.designation}
                onChange={handleChange}
                disabled={loading || success}
                required
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="register-input-group">
              <label>
                Password <span>*</span>
              </label>
              <div className="register-input-wrapper">
                <Lock size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading || success}
                  required
                />
                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="register-input-group">
              <label>
                Confirm Password <span>*</span>
              </label>
              <div className="register-input-wrapper">
                <Lock size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={loading || success}
                  required
                />
                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Role badge preview info */}
          <div className="role-info">
            <div className="role-icon">
              <ShieldCheck size={18} />
            </div>
            <div>
              <strong>Selected Permission Tier: {form.role}</strong>
              <span>
                {form.role === "ADMIN"
                  ? "Full administrative control, supplier assignment & payment execution."
                  : form.role === "SUPPLIER"
                  ? "Supplier fulfillment portal, order tracking, order status updates & product catalog management."
                  : "Standard employee requisition submission & tracking portal."}
              </span>
            </div>
          </div>

          {/* Terms & Conditions */}
          <label className="terms-row">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              disabled={loading || success}
            />
            <span>
              I agree to the <b>Terms & Conditions</b> and <b>Privacy Policy</b>
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            className="register-submit"
            disabled={loading || success}
          >
            {loading ? (
              <>
                <span className="register-spinner" />
                Registering Profile...
              </>
            ) : success ? (
              <>
                <CheckCircle size={18} />
                Account Created Successfully
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Complete Registration
              </>
            )}
          </button>
        </form>

        {/* Security badge */}
        <div className="register-security">
          <ShieldCheck size={16} />
          <span>Encrypted and verified via SmartProcure Security Service</span>
        </div>

        {/* Sign In link */}
        <div className="register-login-section">
          <span>Already registered?</span>
          <button type="button" onClick={() => navigate("/login")}>
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
