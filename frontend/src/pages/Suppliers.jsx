import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, Users, CreditCard, LogOut, Bell, Menu, ShoppingCart, ChevronDown,
  Plus, Check, X, Search, Edit2, Trash2, Shield, Phone, Mail, MapPin, RefreshCw,
  TrendingUp, Package, Truck, CheckCircle2, Clock3, ExternalLink, Sparkles
} from "lucide-react";
import "./Dashboard.css";

const API_URL = "http://localhost:8080";

function Suppliers() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [statusSupplier, setStatusSupplier] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("ORDER_PLACED");

  // Performance Modal State
  const [perfSupplier, setPerfSupplier] = useState(null);
  const [perfData, setPerfData] = useState(null);
  const [perfLoading, setPerfLoading] = useState(false);

  // Supplier Orders Modal State
  const [ordersSupplier, setOrdersSupplier] = useState(null);
  const [supplierOrders, setSupplierOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState("ALL");

  const [formData, setFormData] = useState({
    supplierName: "",
    email: "",
    phone: "",
    address: "",
    status: "ORDER_PLACED",
    mpin: "123456",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
    fetchSuppliers();
  }, [navigate]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/supplier`);
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data);
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPerformanceModal = async (supplier) => {
    setPerfSupplier(supplier);
    setPerfLoading(true);
    try {
      const res = await fetch(`${API_URL}/supplier/${supplier.supplierId}/performance`);
      if (res.ok) {
        const data = await res.json();
        setPerfData(data);
      }
    } catch (err) {
      console.error("Error fetching supplier performance:", err);
    } finally {
      setPerfLoading(false);
    }
  };

  const handleOpenOrdersModal = async (supplier) => {
    setOrdersSupplier(supplier);
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API_URL}/supplier/${supplier.supplierId}/orders`);
      if (res.ok) {
        const data = await res.json();
        setSupplierOrders(data);
      }
    } catch (err) {
      console.error("Error fetching supplier orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      supplierName: "",
      email: "",
      phone: "",
      address: "",
      status: "ORDER_PLACED",
      mpin: "123456",
    });
    setEditingSupplier(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      supplierName: supplier.supplierName || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      status: supplier.status || "ORDER_PLACED",
      mpin: supplier.mpin || "123456",
    });
    setShowAddModal(true);
  };

  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        const res = await fetch(`${API_URL}/supplier/${editingSupplier.supplierId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setMessage({ text: "Supplier updated successfully!", type: "success" });
          setShowAddModal(false);
          fetchSuppliers();
        } else {
          setMessage({ text: "Failed to update supplier.", type: "error" });
        }
      } else {
        const res = await fetch(`${API_URL}/supplier`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setMessage({ text: "New supplier registered successfully!", type: "success" });
          setShowAddModal(false);
          fetchSuppliers();
        } else {
          setMessage({ text: "Failed to register supplier.", type: "error" });
        }
      }
    } catch (err) {
      setMessage({ text: "Network error saving supplier.", type: "error" });
    }
  };

  const handleDeleteSupplier = async (supplierId, name) => {
    if (!window.confirm(`Are you sure you want to remove supplier "${name}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/supplier/${supplierId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessage({ text: `Supplier "${name}" was deleted successfully.`, type: "success" });
        fetchSuppliers();
      } else {
        setMessage({ text: "Failed to delete supplier.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Network error deleting supplier.", type: "error" });
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusSupplier) return;

    try {
      const res = await fetch(`${API_URL}/supplier/${statusSupplier.supplierId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      });
      if (res.ok) {
        setMessage({ text: `Supplier status updated to ${selectedStatus}!`, type: "success" });
        setStatusSupplier(null);
        fetchSuppliers();
      } else {
        setMessage({ text: "Failed to update supplier status.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Network error updating supplier status.", type: "error" });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const filteredSuppliers = suppliers.filter((s) => {
    const q = search.toLowerCase().trim();
    return (
      !q ||
      s.supplierName?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.includes(q) ||
      s.address?.toLowerCase().includes(q) ||
      String(s.supplierId).includes(q)
    );
  });

  const filteredSupplierOrders = supplierOrders.filter((o) => {
    if (orderFilter === "PROCESSING") return o.status === "ORDER_PLACED" || o.status === "ORDER_CONFIRMED" || o.status === "PROCESSING";
    if (orderFilter === "SHIPPED") return o.status === "SHIPPED" || o.status === "OUT_FOR_DELIVERY";
    if (orderFilter === "DELIVERED") return o.status === "DELIVERED";
    if (orderFilter === "CANCELLED") return o.status === "CANCELLED";
    return true;
  });

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="brand">
          <div className="brand-icon"><ShoppingCart size={22} strokeWidth={2.4} /></div>
          <div className="brand-name"><span>Smart</span><strong>Procure</strong></div>
        </div>
        <nav className="sidebar-navigation">
          <div className="sidebar-section-title">Core Management</div>
          <Link to="/admin" className="sidebar-item">
            <LayoutDashboard size={19} /><span>Admin Dashboard</span>
          </Link>
          <div className="sidebar-section-title">Procurement</div>
          <Link to="/suppliers" className="sidebar-item active">
            <Users size={19} /><span>Suppliers Directory</span>
          </Link>
          <Link to="/payment" className="sidebar-item">
            <CreditCard size={19} /><span>Payment History</span>
          </Link>
          <div className="sidebar-section-title">Portal Switch</div>
          <Link to="/dashboard" className="sidebar-item">
            <ExternalLink size={19} /><span>Employee View</span>
          </Link>
        </nav>
        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={19} /><span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <button className="menu-button" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={20} />
          </button>
          <div className="header-right">
            <button className="notification-button" onClick={fetchSuppliers} title="Refresh Directory">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="header-divider" />
            <div className="user-profile">
              <div className="avatar">AD</div>
              <div className="user-details">
                <strong>{user?.username || "Admin"}</strong>
                <span>Administrator</span>
              </div>
              <ChevronDown size={14} color="#94a3b8" />
            </div>
          </div>
        </header>

        <section className="dashboard-content">
          <div className="page-heading">
            <div>
              <h1>Suppliers Directory & Vendor Performance</h1>
              <p className="welcome-text">
                Manage registered vendor partners, inspect real-time fulfillment KPIs, evaluate delivery success rates, and audit vendor purchase orders.
              </p>
            </div>
            <div className="heading-actions">
              <button className="raise-button" onClick={handleOpenAddModal}>
                <Plus size={16} />
                <span>Add New Supplier</span>
              </button>
            </div>
          </div>

          {/* Feedback Alert */}
          {message.text && (
            <div style={{
              padding: "12px 18px",
              borderRadius: "10px",
              marginBottom: "20px",
              backgroundColor: message.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
              color: message.type === "success" ? "#34d399" : "#f87171",
              border: `1px solid ${message.type === "success" ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontWeight: "600"
            }}>
              <span>{message.text}</span>
              <button onClick={() => setMessage({ text: "", type: "" })} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>
                <X size={16} />
              </button>
            </div>
          )}

          <div className="dashboard-panel">
            {/* Toolbar */}
            <div style={{
              padding: "18px 24px",
              borderBottom: "1px solid var(--sp-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              background: "rgba(255, 255, 255, 0.02)"
            }}>
              <div style={{ fontWeight: "700", color: "#38bdf8", fontSize: "14px" }}>
                Active Supplier Partners: {suppliers.length}
              </div>

              <div style={{ position: "relative", minWidth: "280px" }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--sp-text-muted)" }} />
                <input
                  type="text"
                  placeholder="Search supplier name, email, phone..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: "100%", padding: "8px 14px 8px 36px" }}
                />
              </div>
            </div>

            {/* Table */}
            <div style={{ width: "100%", overflowX: "auto" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  <p>Loading suppliers directory...</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Supplier Name</th>
                      <th>Contact Info</th>
                      <th>Address</th>
                      <th>Fulfillment State</th>
                      <th>Security MPIN</th>
                      <th style={{ textAlign: "center" }}>Partner Operations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.length > 0 ? (
                      filteredSuppliers.map((s) => (
                        <tr key={s.supplierId}>
                          <td>
                            <span style={{
                              fontFamily: "monospace",
                              fontWeight: "700",
                              color: "#38bdf8",
                              background: "rgba(56, 189, 248, 0.12)",
                              padding: "4px 8px",
                              borderRadius: "6px"
                            }}>
                              SUP-{s.supplierId}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: "var(--sp-card-bg)", fontSize: "15px" }}>{s.supplierName}</strong>
                          </td>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "12px" }}>
                              <span style={{ color: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: "6px" }}>
                                <Mail size={12} color="#38bdf8" /> {s.email || "-"}
                              </span>
                              <span style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px" }}>
                                <Phone size={12} color="#10b981" /> {s.phone || "-"}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span style={{ color: "rgba(255,255,255,0.1)", fontSize: "13px", display: "flex", alignItems: "center", gap: "5px" }}>
                              <MapPin size={13} color="#f59e0b" /> {s.address || "Headquarters"}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => {
                                setStatusSupplier(s);
                                setSelectedStatus(s.status || "ORDER_PLACED");
                              }}
                              style={{
                                padding: "4px 10px",
                                borderRadius: "20px",
                                fontSize: "11px",
                                fontWeight: "800",
                                border: "1px solid rgba(139, 92, 246, 0.4)",
                                background: "rgba(139, 92, 246, 0.15)",
                                color: "#c084fc",
                                cursor: "pointer"
                              }}
                              title="Click to update fulfillment status"
                            >
                              {s.status || "ORDER_PLACED"} ▾
                            </button>
                          </td>
                          <td>
                            <span style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "12px",
                              fontWeight: "700",
                              color: "#10b981",
                              background: "rgba(16, 185, 129, 0.12)",
                              padding: "3px 8px",
                              borderRadius: "6px"
                            }}>
                              <Shield size={12} /> Configured
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                              {/* View Performance Button */}
                              <button
                                onClick={() => handleOpenPerformanceModal(s)}
                                title="View Real-Time Supplier Performance Analytics"
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  background: "rgba(16, 185, 129, 0.15)",
                                  border: "1px solid rgba(16, 185, 129, 0.4)",
                                  color: "#34d399",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}
                              >
                                <TrendingUp size={13} /> Performance
                              </button>

                              {/* View Orders Button */}
                              <button
                                onClick={() => handleOpenOrdersModal(s)}
                                title="View Orders Assigned to Supplier"
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  background: "rgba(0, 180, 216, 0.15)",
                                  border: "1px solid rgba(56, 189, 248, 0.4)",
                                  color: "#38bdf8",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}
                              >
                                <Package size={13} /> Orders
                              </button>

                              {/* Edit Supplier */}
                              <button
                                onClick={() => handleOpenEditModal(s)}
                                title="Edit Supplier Details"
                                style={{
                                  padding: "6px 8px",
                                  borderRadius: "6px",
                                  background: "rgba(255, 255, 255, 0.08)",
                                  border: "1px solid rgba(255, 255, 255, 0.1)",
                                  color: "rgba(255,255,255,0.1)",
                                  cursor: "pointer"
                                }}
                              >
                                <Edit2 size={13} />
                              </button>

                              {/* Delete Supplier */}
                              <button
                                onClick={() => handleDeleteSupplier(s.supplierId, s.supplierName)}
                                title="Delete Supplier"
                                style={{
                                  padding: "6px 8px",
                                  borderRadius: "6px",
                                  background: "rgba(239, 68, 68, 0.15)",
                                  border: "1px solid rgba(239, 68, 68, 0.4)",
                                  color: "#f87171",
                                  cursor: "pointer"
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                          No suppliers found. Click "Add New Supplier" to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ================= REAL SUPPLIER PERFORMANCE MODAL ================= */}
      {perfSupplier && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(3, 7, 18, 0.85)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "#081324",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "620px",
            maxHeight: "90vh",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            boxShadow: "0 25px 70px rgba(0,0,0,0.85)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            <div style={{
              padding: "20px 24px",
              background: "linear-gradient(135deg, #092019 0%, #0d2238 100%)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <TrendingUp size={20} color="#34d399" />
                  <span style={{ fontWeight: "900", color: "var(--sp-card-bg)", fontSize: "17px" }}>
                    Performance Analytics • {perfSupplier.supplierName}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                  Real backend analytics calculated from purchase orders
                </div>
              </div>
              <button onClick={() => setPerfSupplier(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "18px" }}>
              {perfLoading ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 10px", color: "#10b981" }} />
                  <p>Calculating supplier performance KPIs...</p>
                </div>
              ) : perfData ? (
                <>
                  {/* Supplier Profile Info Header */}
                  <div style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "12px",
                    padding: "16px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    fontSize: "12px"
                  }}>
                    <div><span style={{ color: "#94a3b8" }}>Email:</span> <strong style={{ color: "var(--sp-card-bg)" }}>{perfData.email || "-"}</strong></div>
                    <div><span style={{ color: "#94a3b8" }}>Phone:</span> <strong style={{ color: "var(--sp-card-bg)" }}>{perfData.phone || "-"}</strong></div>
                    <div><span style={{ color: "#94a3b8" }}>Address:</span> <span style={{ color: "rgba(255,255,255,0.1)" }}>{perfData.address || "-"}</span></div>
                    <div>
                      <span style={{ color: "#94a3b8" }}>MPIN Status:</span>{" "}
                      <span style={{ color: perfData.mpinConfigured ? "#10b981" : "#f59e0b", fontWeight: "700" }}>
                        {perfData.mpinConfigured ? "✓ Active & Configured" : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Primary KPI Metrics Cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }}>
                    <div style={{ background: "linear-gradient(180deg, #0c231b 0%, #06140f 100%)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "12px", padding: "14px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "#34d399", textTransform: "uppercase" }}>Total Procurement</span>
                      <div style={{ fontSize: "22px", fontWeight: "900", color: "var(--sp-card-bg)", marginTop: "4px" }}>
                        ₹{perfData.totalProcurementValue.toLocaleString()}
                      </div>
                    </div>

                    <div style={{ background: "linear-gradient(180deg, #0d1e34 0%, #081424 100%)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "12px", padding: "14px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "#38bdf8", textTransform: "uppercase" }}>Avg Order Value</span>
                      <div style={{ fontSize: "22px", fontWeight: "900", color: "var(--sp-card-bg)", marginTop: "4px" }}>
                        ₹{perfData.averageOrderValue.toLocaleString()}
                      </div>
                    </div>

                    <div style={{ background: "linear-gradient(180deg, #17122b 0%, #0c0918 100%)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "12px", padding: "14px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "#c084fc", textTransform: "uppercase" }}>Delivery Success</span>
                      <div style={{ fontSize: "22px", fontWeight: "900", color: "#34d399", marginTop: "4px" }}>
                        {perfData.deliverySuccessRate}%
                      </div>
                    </div>
                  </div>

                  {/* Order Volumes Breakdown */}
                  <div style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "16px" }}>
                    <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#38bdf8", margin: "0 0 12px", textTransform: "uppercase" }}>
                      Order Volumes & Fulfillment Breakdown
                    </h4>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", fontSize: "12px" }}>
                      <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px" }}>
                        <span style={{ color: "#94a3b8" }}>Total Orders:</span> <strong style={{ color: "var(--sp-card-bg)", float: "right" }}>{perfData.totalOrders}</strong>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px" }}>
                        <span style={{ color: "#94a3b8" }}>Total Quantity:</span> <strong style={{ color: "var(--sp-card-bg)", float: "right" }}>{perfData.totalQuantity} units</strong>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px" }}>
                        <span style={{ color: "#94a3b8" }}>Delivered:</span> <strong style={{ color: "#34d399", float: "right" }}>{perfData.deliveredOrders}</strong>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px" }}>
                        <span style={{ color: "#94a3b8" }}>In Processing:</span> <strong style={{ color: "#f59e0b", float: "right" }}>{perfData.processingOrders}</strong>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px" }}>
                        <span style={{ color: "#94a3b8" }}>In Transit / Shipped:</span> <strong style={{ color: "#38bdf8", float: "right" }}>{perfData.shippedOrders + perfData.outForDeliveryOrders}</strong>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px" }}>
                        <span style={{ color: "#94a3b8" }}>Cancelled:</span> <strong style={{ color: "#f87171", float: "right" }}>{perfData.cancelledOrders}</strong>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}

              <button
                onClick={() => setPerfSupplier(null)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "var(--sp-primary-gradient)",
                  border: "none",
                  color: "var(--sp-card-bg)",
                  fontWeight: "800",
                  cursor: "pointer"
                }}
              >
                Close Performance Analytics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUPPLIER ORDERS MODAL ================= */}
      {ordersSupplier && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(3, 7, 18, 0.85)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "#081324",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "760px",
            maxHeight: "90vh",
            border: "1px solid rgba(56, 189, 248, 0.35)",
            boxShadow: "0 25px 70px rgba(0,0,0,0.85)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            <div style={{
              padding: "20px 24px",
              background: "linear-gradient(135deg, #071220 0%, #0d2238 100%)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Package size={20} color="#38bdf8" />
                  <span style={{ fontWeight: "900", color: "var(--sp-card-bg)", fontSize: "17px" }}>
                    Assigned Purchase Orders • {ordersSupplier.supplierName}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                  Total {supplierOrders.length} orders on file
                </div>
              </div>
              <button onClick={() => setOrdersSupplier(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {/* Filter Sub-toolbar */}
            <div style={{
              padding: "12px 24px",
              background: "rgba(255,255,255,0.02)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              gap: "8px",
              flexWrap: "wrap"
            }}>
              {[
                { key: "ALL", label: `All (${supplierOrders.length})` },
                { key: "PROCESSING", label: "Processing" },
                { key: "SHIPPED", label: "Shipped" },
                { key: "DELIVERED", label: "Delivered" },
                { key: "CANCELLED", label: "Cancelled" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setOrderFilter(tab.key)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "16px",
                    fontSize: "11px",
                    fontWeight: "700",
                    cursor: "pointer",
                    border: orderFilter === tab.key ? "none" : "1px solid rgba(255,255,255,0.1)",
                    background: orderFilter === tab.key ? "var(--sp-primary-gradient)" : "transparent",
                    color: "var(--sp-card-bg)"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>
              {ordersLoading ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 10px", color: "#00b4d8" }} />
                  <p>Loading supplier orders...</p>
                </div>
              ) : filteredSupplierOrders.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {filteredSupplierOrders.map((o) => (
                    <div
                      key={o.id}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "10px",
                        padding: "14px 18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "14px"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontFamily: "monospace", color: "#38bdf8", fontWeight: "800", fontSize: "13px" }}>
                            {o.orderId}
                          </span>
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>• REQ-{o.product?.productId}</span>
                        </div>
                        <strong style={{ color: "var(--sp-card-bg)", display: "block", marginTop: "2px" }}>{o.productName}</strong>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                          Qty: {o.quantity} • By {o.user?.username || "Employee"} ({o.department?.departmentName || "Dept"})
                        </span>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "16px", fontWeight: "900", color: "#34d399" }}>₹{o.totalAmount}</div>
                        <span style={{
                          display: "inline-block",
                          marginTop: "4px",
                          padding: "3px 8px",
                          borderRadius: "12px",
                          fontSize: "10px",
                          fontWeight: "800",
                          background: o.status === "DELIVERED" ? "rgba(16, 185, 129, 0.2)" : "rgba(56, 189, 248, 0.2)",
                          color: o.status === "DELIVERED" ? "#34d399" : "#38bdf8"
                        }}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                  <Package size={36} style={{ margin: "0 auto 10px", color: "var(--sp-text-sub)" }} />
                  <p style={{ margin: 0 }}>No orders found matching this filter.</p>
                </div>
              )}

              <button
                onClick={() => setOrdersSupplier(null)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "var(--sp-primary-gradient)",
                  border: "none",
                  color: "var(--sp-card-bg)",
                  fontWeight: "800",
                  cursor: "pointer",
                  marginTop: "6px"
                }}
              >
                Close Orders
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD / EDIT SUPPLIER MODAL ================= */}
      {showAddModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(3, 7, 18, 0.8)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "#091526",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "500px",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
            overflow: "hidden"
          }}>
            <div style={{
              padding: "18px 24px",
              background: "linear-gradient(135deg, #071220 0%, #0d2238 100%)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ fontWeight: "800", color: "var(--sp-card-bg)", fontSize: "16px" }}>
                {editingSupplier ? "Edit Supplier Details" : "Register New Supplier Partner"}
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px" }}>Supplier / Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Tech Solutions"
                  value={formData.supplierName}
                  onChange={e => setFormData({ ...formData, supplierName: e.target.value })}
                  style={{ width: "100%", padding: "10px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px" }}>Official Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="sales@company.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: "100%", padding: "10px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px" }}>Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: "100%", padding: "10px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px" }}>Office / Warehouse Address</label>
                <input
                  type="text"
                  placeholder="Street, City, State"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: "100%", padding: "10px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px" }}>Supplier Payment MPIN (Default: 123456)</label>
                <input
                  type="password"
                  maxLength={6}
                  value={formData.mpin}
                  onChange={e => setFormData({ ...formData, mpin: e.target.value })}
                  style={{ width: "100%", padding: "10px", letterSpacing: "3px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid var(--sp-border)",
                    color: "rgba(255,255,255,0.1)",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: "10px",
                    borderRadius: "8px",
                    background: "var(--sp-primary-gradient)",
                    border: "none",
                    color: "var(--sp-card-bg)",
                    fontWeight: "800",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px var(--sp-primary-glow)"
                  }}
                >
                  {editingSupplier ? "Save Changes" : "Register Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= UPDATE STATUS MODAL ================= */}
      {statusSupplier && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(3, 7, 18, 0.8)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "#091526",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "440px",
            border: "1px solid rgba(139, 92, 246, 0.35)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
            overflow: "hidden"
          }}>
            <div style={{
              padding: "18px 24px",
              background: "linear-gradient(135deg, #17122b 0%, #0d2238 100%)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ fontWeight: "800", color: "#c084fc", fontSize: "16px" }}>
                Update Fulfillment Status
              </div>
              <button onClick={() => setStatusSupplier(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "rgba(255,255,255,0.04)", padding: "12px 16px", borderRadius: "10px" }}>
                <strong style={{ color: "var(--sp-card-bg)", display: "block" }}>{statusSupplier.supplierName}</strong>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>SUP-{statusSupplier.supplierId}</span>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px" }}>Fulfillment Lifecycle State</label>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  style={{ width: "100%", padding: "10px" }}
                >
                  <option value="ORDER_PLACED">ORDER_PLACED</option>
                  <option value="ORDER_ACCEPTED">ORDER_ACCEPTED</option>
                  <option value="IN_PROCESS">IN_PROCESS</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setStatusSupplier(null)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid var(--sp-border)",
                    color: "rgba(255,255,255,0.1)",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: "10px",
                    borderRadius: "8px",
                    background: "var(--sp-purple-gradient)",
                    border: "none",
                    color: "var(--sp-card-bg)",
                    fontWeight: "800",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px var(--sp-purple-glow)"
                  }}
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Suppliers;
