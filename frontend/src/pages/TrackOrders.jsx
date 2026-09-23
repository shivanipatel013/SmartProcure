import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, Plus, FileText, Menu, ShoppingCart, ChevronDown, LogOut,
  Search, CheckCircle2, Circle, Truck, Package, Eye, CreditCard, Calendar, Building2, User,
  X, Sparkles, RefreshCw, Check, ChevronLeft, ChevronRight, DollarSign, Tag, Info
} from "lucide-react";
import NotificationBell from "../components/NotificationBell";
import "./Dashboard.css";

const API_URL = "http://localhost:8080";

// Strict 5-Stage Procurement Order Lifecycle
const ORDER_STAGES = [
  { key: "ORDER_PLACED", label: "Order Placed", desc: "Purchase order authorized & placed with supplier" },
  { key: "PACKED", label: "Packed", desc: "Items picked and packaged at facility" },
  { key: "SHIPPED", label: "Shipped", desc: "Handed over to express courier & logistics carrier" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", desc: "Arrived at destination hub; out for local dispatch" },
  { key: "RECEIVED", label: "Received", desc: "Requisition delivered and received at departmental facility" },
];

function TrackOrders() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  // Server-side Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Selected Order for Tracking / Details Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      fetchUserOrders(parsed.userId, currentPage, pageSize, search, filter);
    } else {
      navigate("/login");
    }
  }, [navigate, currentPage, pageSize, filter]);

  // Debounced search trigger
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      fetchUserOrders(user.userId, 1, pageSize, search, filter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUserOrders = async (userId, page = 1, limit = 10, q = "", statusFilter = "ALL") => {
    setLoading(true);
    try {
      let url = `${API_URL}/orders/user/${userId}/paginated?page=${page}&limit=${limit}&sortOrder=asc`;
      if (q && q.trim()) {
        url += `&search=${encodeURIComponent(q.trim())}`;
      }
      if (statusFilter && statusFilter !== "ALL") {
        url += `&status=${encodeURIComponent(statusFilter)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const resData = await res.json();
        setOrders(resData.data || []);
        if (resData.pagination) {
          setCurrentPage(resData.pagination.currentPage);
          setTotalPages(resData.pagination.totalPages);
          setTotalItems(resData.pagination.totalItems);
        }
      } else {
        const fallbackRes = await fetch(`${API_URL}/orders/user/${userId}`);
        if (fallbackRes.ok) {
          const allOrders = await fallbackRes.json();
          setOrders(allOrders);
          setTotalItems(allOrders.length);
          setTotalPages(Math.ceil(allOrders.length / limit) || 1);
        }
      }
    } catch (err) {
      console.error("Error fetching user orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTracking = async (order) => {
    setSelectedOrder(order);
    setTrackingLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders/${order.id || order.orderDbId || order.orderId}/tracking`);
      if (res.ok) {
        const data = await res.json();
        setTrackingData(data);
      } else {
        setTrackingData(null);
      }
    } catch (err) {
      setTrackingData(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  const getStageState = (stageKey, orderStatus) => {
    const statusHierarchy = {
      "PENDING": 0,
      "APPROVED": 1,
      "ORDER_PLACED": 1,
      "ORDER_CONFIRMED": 1,
      "PACKED": 2,
      "PROCESSING": 2,
      "SHIPPED": 3,
      "OUT_FOR_DELIVERY": 4,
      "RECEIVED": 5,
      "DELIVERED": 5
    };

    const stageIdx = {
      "ORDER_PLACED": 1,
      "APPROVED": 1,
      "PACKED": 2,
      "SHIPPED": 3,
      "OUT_FOR_DELIVERY": 4,
      "RECEIVED": 5
    }[stageKey] || 0;

    const currentIdx = statusHierarchy[orderStatus] || 0;

    if (currentIdx > stageIdx) return "completed";
    if (currentIdx === stageIdx) return "current";
    return "upcoming";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ORDER_PLACED":
      case "APPROVED":
      case "ORDER_CONFIRMED":
        return <span className="request-status order-placed">✓ Order Placed</span>;
      case "PACKED":
      case "PROCESSING":
        return <span className="request-status pending">📦 Packed</span>;
      case "SHIPPED":
        return <span className="request-status" style={{ background: "#e0f2fe", color: "#0284c7" }}>🚚 Shipped</span>;
      case "OUT_FOR_DELIVERY":
        return <span className="request-status" style={{ background: "#fef3c7", color: "#b45309" }}>🚚 Out for Delivery</span>;
      case "RECEIVED":
      case "DELIVERED":
        return <span className="request-status approved">✓ Received</span>;
      case "CANCELLED":
        return <span className="request-status rejected">✕ Cancelled</span>;
      default:
        return <span className="request-status">{status}</span>;
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="brand">
          <div className="brand-icon"><ShoppingCart size={22} strokeWidth={2.4} /></div>
          <div className="brand-name"><span>Smart</span><strong>Procure</strong></div>
        </div>
        <nav className="sidebar-navigation">
          <div className="sidebar-section-title">Overview</div>
          <Link to="/dashboard" className="sidebar-item">
            <LayoutDashboard size={19} /><span>Dashboard</span>
          </Link>
          <div className="sidebar-section-title">Request Management</div>
          <Link to="/raise-request" className="sidebar-item">
            <Plus size={19} /><span>Raise Request</span>
          </Link>
          <Link to="/employee/my-requests" className="sidebar-item">
            <FileText size={19} /><span>My Requests</span>
          </Link>
          <div className="sidebar-section-title">Order Fulfillment</div>
          <Link to="/track-orders" className="sidebar-item active">
            <Truck size={19} /><span>Track My Order</span>
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
            {/* Real-time Notification Bell */}
            <NotificationBell currentUser={user} />

            <button className="notification-button" onClick={() => fetchUserOrders(user?.userId, currentPage, pageSize, search, filter)} title="Refresh Orders">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="header-divider" />
            <div className="user-profile">
              <div className="avatar">
                {user?.username ? user.username.substring(0, 2).toUpperCase() : "US"}
              </div>
              <div className="user-details">
                <strong>{user?.username || "User"}</strong>
                <span>{user?.role || "USER"}</span>
              </div>
              <ChevronDown size={14} color="#64748b" />
            </div>
          </div>
        </header>

        <section className="dashboard-content">
          <div className="page-heading">
            <div>
              <h1>Track My Order</h1>
              <p className="welcome-text">
                Live order tracking, 5-stage milestone progression pipeline, and end-to-end delivery audit trail.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
            <div className="stat-card raised" onClick={() => { setFilter("ALL"); setCurrentPage(1); }} style={{ cursor: "pointer" }}>
              <div className="stat-top">
                <div className="stat-icon"><Package size={22} /></div>
                <div className="stat-info">
                  <span className="stat-title">Total Orders</span>
                  <div className="stat-value">{totalItems}</div>
                  <div className="stat-subtitle">All Placed Orders</div>
                </div>
              </div>
            </div>

            <div className="stat-card pending" onClick={() => { setFilter("PACKED"); setCurrentPage(1); }} style={{ cursor: "pointer" }}>
              <div className="stat-top">
                <div className="stat-icon"><Package size={22} /></div>
                <div className="stat-info">
                  <span className="stat-title">In Fulfillment</span>
                  <div className="stat-value">
                    {orders.filter(o => o.status === "APPROVED" || o.status === "ORDER_PLACED" || o.status === "PACKED" || o.status === "PROCESSING").length}
                  </div>
                  <div className="stat-subtitle">Packing & Processing</div>
                </div>
              </div>
            </div>

            <div className="stat-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", cursor: "pointer" }} onClick={() => { setFilter("SHIPPED"); setCurrentPage(1); }}>
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}><Truck size={22} /></div>
                <div className="stat-info">
                  <span className="stat-title">In Transit</span>
                  <div className="stat-value" style={{ color: "#0284c7" }}>
                    {orders.filter(o => o.status === "SHIPPED" || o.status === "OUT_FOR_DELIVERY").length}
                  </div>
                  <div className="stat-subtitle">On Route to Destination</div>
                </div>
              </div>
            </div>

            <div className="stat-card approved" onClick={() => { setFilter("RECEIVED"); setCurrentPage(1); }} style={{ cursor: "pointer" }}>
              <div className="stat-top">
                <div className="stat-icon"><CheckCircle2 size={22} /></div>
                <div className="stat-info">
                  <span className="stat-title">Received</span>
                  <div className="stat-value">
                    {orders.filter(o => o.status === "RECEIVED" || o.status === "DELIVERED").length}
                  </div>
                  <div className="stat-subtitle">Delivered Requisitions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Container */}
          <div className="dashboard-panel">
            {/* Toolbar */}
            <div className="panel-toolbar" style={{ flexWrap: "wrap", gap: "12px", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "10px", flex: "1", minWidth: "240px", maxWidth: "420px" }}>
                <div className="search-box" style={{ width: "100%", background: "#ffffff", border: "1px solid #cbd5e1" }}>
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search by Order ID, Product, Supplier..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
                {["ALL", "ORDER_PLACED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "RECEIVED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => { setFilter(st); setCurrentPage(1); }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: filter === st ? "1px solid #0284c7" : "1px solid #e2e8f0",
                      background: filter === st ? "#e0f2fe" : "#ffffff",
                      color: filter === st ? "#0284c7" : "#64748b",
                      fontSize: "12px",
                      fontWeight: filter === st ? "800" : "600",
                      cursor: "pointer",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {st === "ALL" ? "All Orders" : st.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product Name</th>
                    <th>Supplier</th>
                    <th>Quantity</th>
                    <th>Total Amount</th>
                    <th>Order Date</th>
                    <th>Expected Delivery</th>
                    <th>Current Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: "center", padding: "40px 0" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", color: "#64748b" }}>
                          <RefreshCw size={24} className="animate-spin" />
                          <span>Fetching live order fulfillment records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: "center", padding: "48px 0" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: "#64748b" }}>
                          <Truck size={38} color="#94a3b8" />
                          <strong style={{ fontSize: "16px", color: "#0f172a" }}>No Orders Found</strong>
                          <p style={{ fontSize: "13px", maxWidth: "340px", margin: 0 }}>
                            {search || filter !== "ALL"
                              ? "No orders match your current search or filter criteria."
                              : "You haven't placed any procurement orders yet. Raise a request to start."}
                          </p>
                          <Link to="/raise-request" className="raise-button" style={{ marginTop: "4px" }}>
                            <Plus size={16} /> Raise New Request
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.orderId || o.id}>
                        <td>
                          <span style={{ fontFamily: "monospace", fontWeight: "800", color: "#0284c7" }}>
                            {o.orderId}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: "#0f172a" }}>{o.productName}</strong>
                          {o.category && (
                            <div style={{ fontSize: "11px", color: "#64748b" }}>{o.category.categoryName || o.category}</div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Building2 size={13} color="#64748b" />
                            <span style={{ fontWeight: "600", color: "#334155" }}>
                              {o.supplier?.supplierName || o.supplierName || "Assigned Partner"}
                            </span>
                          </div>
                        </td>
                        <td><strong>{o.quantity}</strong></td>
                        <td>
                          <strong style={{ color: "#0284c7" }}>
                            ₹{o.totalAmount ? o.totalAmount.toLocaleString() : "0"}
                          </strong>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>
                            {o.orderDate ? new Date(o.orderDate).toLocaleDateString() : "—"}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", color: "#0284c7", fontWeight: "600" }}>
                            {o.expectedDeliveryDate ? new Date(o.expectedDeliveryDate).toLocaleDateString() : "5-7 Days"}
                          </span>
                        </td>
                        <td>{getStatusBadge(o.status)}</td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              className="action-button"
                              onClick={() => handleOpenTracking(o)}
                              title="Live Milestone Tracking"
                              style={{ background: "#e0f2fe", color: "#0284c7", border: "1px solid #bae6fd" }}
                            >
                              <Truck size={14} />
                            </button>
                            <button
                              className="action-button"
                              onClick={() => setDetailsOrder(o)}
                              title="View Full Order Details"
                              style={{ background: "#f8fafc", color: "#334155", border: "1px solid #cbd5e1" }}
                            >
                              <Eye size={14} /> View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderTop: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Showing page <b>{currentPage}</b> of <b>{totalPages}</b> ({totalItems} total orders)
                </span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="download-button"
                    style={{ padding: "6px 12px", fontSize: "12px" }}
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="download-button"
                    style={{ padding: "6px 12px", fontSize: "12px" }}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ================= LIVE TIMELINE TRACKING MODAL ================= */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "620px" }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Truck size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    Track Order • {selectedOrder.orderId}
                  </h2>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                    {selectedOrder.productName} • Qty {selectedOrder.quantity} • ₹{selectedOrder.totalAmount?.toLocaleString()}
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "18px", padding: "20px 24px" }}>
              {/* Status Banner */}
              <div style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "10px",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px"
              }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#15803d", textTransform: "uppercase" }}>
                    Current Fulfillment Status
                  </span>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>
                    {selectedOrder.status?.replace(/_/g, " ")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                    Expected Delivery
                  </span>
                  <div style={{ fontSize: "15px", fontWeight: "800", color: "#0284c7", marginTop: "2px" }}>
                    {selectedOrder.expectedDeliveryDate ? new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString() : "5-7 Business Days"}
                  </div>
                </div>
              </div>

              {/* Visual 5-Stage Stepper */}
              <div>
                <h4 style={{ fontSize: "12px", fontWeight: "800", color: "#64748b", margin: "0 0 14px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Fulfillment Timeline Progression
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "0px", position: "relative" }}>
                  {ORDER_STAGES.map((stage, idx) => {
                    const state = getStageState(stage.key, selectedOrder.status);
                    const isLast = idx === ORDER_STAGES.length - 1;

                    return (
                      <div key={stage.key} style={{ display: "flex", gap: "14px", position: "relative" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "28px" }}>
                          <div style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "800",
                            fontSize: "12px",
                            background: state === "completed" ? "#10b981" : state === "current" ? "#0284c7" : "#f1f5f9",
                            color: state === "upcoming" ? "#64748b" : "#ffffff",
                            border: `2px solid ${state === "completed" ? "#34d399" : state === "current" ? "#38bdf8" : "#cbd5e1"}`
                          }}>
                            {state === "completed" ? <Check size={14} strokeWidth={3} /> : state === "current" ? <Sparkles size={14} /> : <Circle size={8} fill="#94a3b8" color="#94a3b8" />}
                          </div>

                          {!isLast && (
                            <div style={{
                              width: "2px",
                              flex: 1,
                              minHeight: "32px",
                              background: state === "completed" ? "#10b981" : "#e2e8f0",
                              margin: "3px 0"
                            }} />
                          )}
                        </div>

                        <div style={{ paddingBottom: isLast ? "0" : "18px", paddingTop: "2px" }}>
                          <div style={{
                            fontSize: "13px",
                            fontWeight: state === "current" || state === "completed" ? "800" : "600",
                            color: state === "current" ? "#0284c7" : state === "completed" ? "#0f172a" : "#64748b"
                          }}>
                            {stage.label}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "1px" }}>
                            {stage.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: "flex", justifyContent: "space-between", padding: "16px 24px" }}>
              <button
                type="button"
                className="download-button"
                onClick={() => {
                  const orderToView = selectedOrder;
                  setSelectedOrder(null);
                  setDetailsOrder(orderToView);
                }}
              >
                <Info size={15} />
              </button>
              <button
                type="button"
                className="raise-button"
                onClick={() => setSelectedOrder(null)}
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= COMPREHENSIVE ORDER DETAILS MODAL ================= */}
      {detailsOrder && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "680px" }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Package size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    Order Details • {detailsOrder.orderId}
                  </h2>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                    Complete procurement and payment breakdown
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setDetailsOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "20px 24px" }}>
              {/* Order Info Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Order ID</span>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: "#0284c7" }}>{detailsOrder.orderId}</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Request ID</span>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>REQ-{detailsOrder.product?.productId || detailsOrder.productId || "—"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Product Name</span>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{detailsOrder.productName}</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Category</span>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>{detailsOrder.category?.categoryName || detailsOrder.category || "General"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Requester</span>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{detailsOrder.user?.username || user?.username || "Employee"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Assigned Supplier</span>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{detailsOrder.supplier?.supplierName || detailsOrder.supplierName || "Authorized Vendor"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Department</span>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>{detailsOrder.department?.departmentName || detailsOrder.department || "Enterprise"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Quantity & Unit Price</span>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{detailsOrder.quantity} units @ ₹{detailsOrder.unitPrice?.toLocaleString() || "—"}</div>
                </div>
              </div>

              {/* Payment & Status Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f0f9ff", padding: "16px", borderRadius: "12px", border: "1px solid #bae6fd" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#0369a1", fontWeight: "700", textTransform: "uppercase" }}>Total Amount</span>
                  <div style={{ fontSize: "18px", fontWeight: "900", color: "#0284c7" }}>₹{detailsOrder.totalAmount?.toLocaleString()}</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#0369a1", fontWeight: "700", textTransform: "uppercase" }}>Payment Status</span>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: "#15803d" }}>✓ {detailsOrder.paymentStatus || "COMPLETED"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#0369a1", fontWeight: "700", textTransform: "uppercase" }}>Payment Method</span>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>{detailsOrder.payment?.paymentMethod || "UPI / Treasury"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#0369a1", fontWeight: "700", textTransform: "uppercase" }}>Transaction Reference</span>
                  <div style={{ fontSize: "12px", fontFamily: "monospace", color: "#334155" }}>{detailsOrder.transactionId || detailsOrder.payment?.transactionId || "TXN-VERIFIED"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#0369a1", fontWeight: "700", textTransform: "uppercase" }}>Order Date</span>
                  <div style={{ fontSize: "13px", color: "#334155" }}>{detailsOrder.orderDate ? new Date(detailsOrder.orderDate).toLocaleString() : "—"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#0369a1", fontWeight: "700", textTransform: "uppercase" }}>Current Order Status</span>
                  <div style={{ marginTop: "3px" }}>{getStatusBadge(detailsOrder.status)}</div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: "flex", justifyContent: "space-between", padding: "16px 24px" }}>
              <button
                type="button"
                className="raise-button"
                onClick={() => {
                  const ord = detailsOrder;
                  setDetailsOrder(null);
                  handleOpenTracking(ord);
                }}
              >
                <Truck size={16} />
              </button>
              <button
                type="button"
                className="download-button"
                onClick={() => setDetailsOrder(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrackOrders;
