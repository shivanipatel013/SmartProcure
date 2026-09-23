import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, Plus, FileText, CheckCircle, Package,
  LogOut, Menu, ShoppingCart, ChevronDown, DollarSign, Calculator, X, Truck, Building2, Tag, AlertCircle
} from "lucide-react";
import NotificationBell from "../components/NotificationBell";
import "./Dashboard.css";

const API_URL = "http://localhost:8080";

const FALLBACK_CATALOG = [
  { name: "Dell Laptop 7440", price: 70000.0, departmentId: 1, departmentName: "IT & Cloud Infrastructure", categoryId: 1, categoryName: "Developer Laptops & Workstations", description: "Dell Latitude 7440 Core i7 13th Gen, 16GB RAM, 512GB NVMe SSD" },
  { name: "HP Laptop 15s", price: 50000.0, departmentId: 1, departmentName: "IT & Cloud Infrastructure", categoryId: 1, categoryName: "Developer Laptops & Workstations", description: "HP 15s Intel Core i5 12th Gen, 16GB RAM, 512GB SSD, FHD Display" },
  { name: "Dell Mouse MS116", price: 5000.0, departmentId: 1, departmentName: "IT & Cloud Infrastructure", categoryId: 2, categoryName: "Displays & Peripherals", description: "Dell Optical Wired USB Mouse MS116 1000 DPI Precision" },
  { name: "HP LaserJet Pro 4104", price: 25000.0, departmentId: 3, departmentName: "Facilities & Administration", categoryId: 2, categoryName: "Displays & Peripherals", description: "HP LaserJet Pro MFP 4104dw Multi-function High-Speed Laser Printer" },
  { name: "Apple MacBook Pro 16\" M3 Max", price: 249900.0, departmentId: 1, departmentName: "IT & Cloud Infrastructure", categoryId: 1, categoryName: "Developer Laptops & Workstations", description: "Apple MacBook Pro 16-inch M3 Max (36GB Unified Memory, 1TB SSD, Space Black)" },
  { name: "Dell UltraSharp 32\" 4K USB-C Hub Monitor", price: 68500.0, departmentId: 1, departmentName: "IT & Cloud Infrastructure", categoryId: 2, categoryName: "Displays & Peripherals", description: "Dell UltraSharp U3223QE 31.5-inch 4K UHD IPS USB-C Hub Monitor" },
  { name: "Lenovo ThinkPad P16 Gen 2", price: 215000.0, departmentId: 2, departmentName: "Software Engineering", categoryId: 1, categoryName: "Developer Laptops & Workstations", description: "Lenovo ThinkPad P16 Mobile Workstation Intel i9, 64GB DDR5, RTX 4000" },
  { name: "Keychron K2 Mechanical Keyboard", price: 7499.0, departmentId: 1, departmentName: "IT & Cloud Infrastructure", categoryId: 2, categoryName: "Displays & Peripherals", description: "Keychron K2 Wireless Mechanical Keyboard RGB Backlit Gateron G Pro" },
  { name: "Cisco Catalyst 9300 48-Port PoE+ Switch", price: 420000.0, departmentId: 1, departmentName: "IT & Cloud Infrastructure", categoryId: 3, categoryName: "Networking & Servers", description: "Cisco Catalyst C9300-48P-A 48-Port Gigabit PoE+ Enterprise Switch" },
  { name: "Steelcase Gesture Ergonomic Task Chair", price: 48000.0, departmentId: 3, departmentName: "Facilities & Administration", categoryId: 4, categoryName: "Ergonomic Furniture", description: "Steelcase Gesture Ergonomic Executive Office Chair with 360 Armrests" },
  { name: "AWS Direct Connect 10Gbps Dedicated Port", price: 175000.0, departmentId: 2, departmentName: "Software Engineering", categoryId: 5, categoryName: "Cloud & SaaS Licenses", description: "AWS Direct Connect 10Gbps Dedicated Cloud Connection & Enterprise Tier" },
  { name: "Dell PowerEdge R760 2U Rack Server", price: 620000.0, departmentId: 1, departmentName: "IT & Cloud Infrastructure", categoryId: 3, categoryName: "Networking & Servers", description: "Dell PowerEdge R760 2U Server Dual Intel Xeon Gold, 256GB ECC RAM, 8TB NVMe" }
];

function RaiseRequest() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [catalog, setCatalog] = useState(FALLBACK_CATALOG);

  const [selectedProduct, setSelectedProduct] = useState(FALLBACK_CATALOG[0]);
  const [quantity, setQuantity] = useState("1");
  const [description, setDescription] = useState(FALLBACK_CATALOG[0].description);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
    fetchCatalog();
  }, [navigate]);

  const fetchCatalog = async () => {
    try {
      const res = await fetch(`${API_URL}/product/catalog`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setCatalog(data);
          setSelectedProduct(data[0]);
          setDescription(data[0].description || "");
        }
      }
    } catch (err) {
      console.log("Using standard verified catalog:", err);
    }
  };

  const handleProductSelect = (e) => {
    const prodName = e.target.value;
    const found = catalog.find((c) => c.name === prodName);
    if (found) {
      setSelectedProduct(found);
      setDescription(found.description || "");
    }
  };

  const unitPrice = selectedProduct?.price || 0;
  const numQty = parseInt(quantity, 10) || 1;
  const totalAmount = unitPrice * numQty;

  const getUserName = () => {
    if (!user) return "User";
    return user.username || user.userName || user.name || "User";
  };

  const getInitials = () => {
    const name = getUserName();
    return name
      .split(" ")
      .map((w) => w.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      setMessage({ text: "Please select a product from the catalog.", type: "error" });
      return;
    }
    if (numQty < 1) {
      setMessage({ text: "Quantity must be at least 1.", type: "error" });
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const payload = {
        name: selectedProduct.name,
        pricePerProduct: selectedProduct.price,
        numberOfQuantities: numQty,
        department: { departmentId: selectedProduct.departmentId },
        category: { categoryId: selectedProduct.categoryId },
        description: description.trim() || selectedProduct.description,
        user: { userId: user.userId },
      };

      const res = await fetch(`${API_URL}/product/raiseRequest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        const reqId = `REQ-${saved.productId}`;
        setShowConfirmModal(false);
        setMessage({
          text: `✓ Request submitted successfully. Request ID: ${reqId}`,
          type: "success",
        });
        setTimeout(() => {
          navigate("/employee/my-requests");
        }, 1600);
      } else {
        const errorText = await res.text();
        setShowConfirmModal(false);
        setMessage({ text: errorText || "Failed to submit requisition.", type: "error" });
      }
    } catch (err) {
      setShowConfirmModal(false);
      setMessage({ text: "Network error submitting procurement request.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="brand">
          <div className="brand-icon">
            <ShoppingCart size={22} strokeWidth={2.4} />
          </div>
          <div className="brand-name">
            <span>Smart</span>
            <strong>Procure</strong>
          </div>
        </div>

        <nav className="sidebar-navigation">
          <div className="sidebar-section-title">Overview</div>
          <Link to="/dashboard" className="sidebar-item">
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </Link>
          <div className="sidebar-section-title">Request Management</div>
          <Link to="/raise-request" className="sidebar-item active">
            <Plus size={19} />
            <span>Raise Request</span>
          </Link>
          <Link to="/employee/my-requests" className="sidebar-item">
            <FileText size={19} />
            <span>My Requests</span>
          </Link>
          <div className="sidebar-section-title">Order Fulfillment</div>
          <Link to="/track-orders" className="sidebar-item">
            <Truck size={19} />
            <span>Track My Order</span>
          </Link>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={19} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <button
            className="menu-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="header-right">
            {/* Real-time Notification Bell */}
            <NotificationBell currentUser={user} />

            <div className="user-profile">
              <div className="avatar">{getInitials()}</div>
              <div className="user-details">
                <strong>{getUserName()}</strong>
                <span>{user?.role || "USER"}</span>
              </div>
              <ChevronDown size={14} color="#64748b" />
            </div>
          </div>
        </header>

        {/* Content */}
        <section
          className="dashboard-content"
          style={{ maxWidth: "860px", margin: "0 auto", padding: "28px 20px" }}
        >
          <div className="page-heading">
            <div>
              <h1>Raise Procurement Request</h1>
              <p className="welcome-text">
                Select standardized catalog products with verified enterprise pricing and automatic departmental routing.
              </p>
            </div>
          </div>

          <div className="dashboard-panel" style={{ padding: "28px" }}>
            {message.text && (
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: "10px",
                  marginBottom: "22px",
                  backgroundColor:
                    message.type === "success"
                      ? "#f0fdf4"
                      : "#fef2f2",
                  color: message.type === "success" ? "#15803d" : "#b91c1c",
                  border: `1px solid ${
                    message.type === "success"
                      ? "#bbf7d0"
                      : "#fecaca"
                  }`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontWeight: "700",
                }}
              >
                <span>{message.text}</span>
                <button
                  onClick={() => setMessage({ text: "", type: "" })}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <form onSubmit={handleOpenConfirm} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Product Selection Dropdown */}
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", fontWeight: "700", color: "#0f172a", fontSize: "14px" }}>
                  <Package size={16} color="#0284c7" />
                  <span>Product Name *</span>
                </label>
                <select
                  value={selectedProduct?.name || ""}
                  onChange={handleProductSelect}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    color: "#0f172a",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}
                >
                  {catalog.map((prod) => (
                    <option key={prod.name} value={prod.name}>
                      {prod.name} — ₹{prod.price.toLocaleString()} ({prod.categoryName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fixed Price & Quantity Display */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", fontWeight: "700", color: "#64748b", fontSize: "12px", textTransform: "uppercase" }}>
                    <DollarSign size={14} color="#15803d" />
                    <span>Unit Price (Predefined Fixed Price)</span>
                  </label>
                  <div
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      color: "#0284c7",
                      fontSize: "16px",
                      fontWeight: "800",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <span>₹{unitPrice.toLocaleString()}</span>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Locked Rate</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", fontWeight: "700", color: "#0f172a", fontSize: "12px", textTransform: "uppercase" }}>
                    <Calculator size={14} color="#0284c7" />
                    <span>Quantity Required *</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    name="quantity"
                    placeholder="e.g. 5"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "10px",
                      color: "#0f172a",
                      fontSize: "15px",
                      fontWeight: "700"
                    }}
                  />
                </div>
              </div>

              {/* Auto-Populated Category & Department */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", fontWeight: "700", color: "#64748b", fontSize: "12px", textTransform: "uppercase" }}>
                    <Tag size={14} color="#8b5cf6" />
                    <span>Category</span>
                  </label>
                  <div
                    style={{
                      padding: "12px 14px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      color: "#334155",
                      fontSize: "13px",
                      fontWeight: "600"
                    }}
                  >
                    {selectedProduct?.categoryName || "General Category"}
                  </div>
                </div>

                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", fontWeight: "700", color: "#64748b", fontSize: "12px", textTransform: "uppercase" }}>
                    <Building2 size={14} color="#0284c7" />
                    <span>Department</span>
                  </label>
                  <div
                    style={{
                      padding: "12px 14px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      color: "#334155",
                      fontSize: "13px",
                      fontWeight: "600"
                    }}
                  >
                    {selectedProduct?.departmentName || "General Department"}
                  </div>
                </div>
              </div>

              {/* Remarks / Business Justification */}
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#0f172a", fontSize: "13px" }}>
                  Remarks / Business Purpose
                </label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Enter project allocation, technical specifications, or business justification..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    color: "#0f172a",
                    fontSize: "14px",
                    resize: "vertical"
                  }}
                />
              </div>

              {/* Total Calculation Banner */}
              <div
                style={{
                  padding: "18px 22px",
                  background: "#f0f9ff",
                  border: "1px solid #bae6fd",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "700" }}>
                    Total Amount (Calculated Dynamically)
                  </div>
                  <div style={{ fontSize: "13px", color: "#0369a1", marginTop: "2px", fontWeight: "500" }}>
                    ₹{unitPrice.toLocaleString()} × {numQty} unit{numQty > 1 ? "s" : ""}
                  </div>
                </div>
                <div style={{ fontSize: "24px", fontWeight: "900", color: "#0284c7" }}>
                  ₹{totalAmount.toLocaleString()}
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "6px" }}>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="download-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedProduct}
                  className="raise-button"
                >
                  <CheckCircle size={17} />
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* Confirmation Dialog Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Submit Procurement Request?</h2>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Please review the requisition summary below before submitting.</p>
                </div>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "20px 24px" }}>
              <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                  <span style={{ color: "#64748b" }}>Product:</span>
                  <strong style={{ color: "#0f172a" }}>{selectedProduct?.name}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                  <span style={{ color: "#64748b" }}>Department:</span>
                  <strong style={{ color: "#0f172a" }}>{selectedProduct?.departmentName}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                  <span style={{ color: "#64748b" }}>Quantity:</span>
                  <strong style={{ color: "#0f172a" }}>{numQty} unit{numQty > 1 ? "s" : ""}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                  <span style={{ color: "#64748b" }}>Unit Price:</span>
                  <strong style={{ color: "#0f172a" }}>₹{unitPrice.toLocaleString()}</strong>
                </div>
                <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "8px", marginTop: "8px", display: "flex", justifyContent: "space-between", fontSize: "15px" }}>
                  <strong style={{ color: "#0f172a" }}>Total Amount:</strong>
                  <strong style={{ color: "#0284c7", fontSize: "17px" }}>₹{totalAmount.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "16px 24px" }}>
              <button
                type="button"
                className="download-button"
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="raise-button"
                onClick={handleConfirmSubmit}
                disabled={loading}
              >
                <CheckCircle size={16} />
                <span>{loading ? "Submitting..." : "Submit Request"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RaiseRequest;
