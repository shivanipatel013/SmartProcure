import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, CreditCard, LogOut, Bell, Menu, ShoppingCart,
  ChevronDown, Clock3, XCircle, CheckCircle2, Package, FileText,
  Search, RefreshCw, Check, X, Shield, ArrowUpRight, Sparkles,
  Layers, ChevronRight, Eye, Truck, Calendar, Building2, User, Phone, Mail,
  Edit3, Send, Plus, BarChart3, TrendingUp, DollarSign, CheckCircle
} from "lucide-react";
import NotificationBell from "../components/NotificationBell";
import "./AdminDashboard.css";

const API_URL = "http://localhost:8080";

const SUPPLIER_STAGES = [
  { key: "APPROVED", label: "Approved", desc: "Purchase order authorized" },
  { key: "PACKED", label: "Packed", desc: "Items picked and packaged" },
  { key: "SHIPPED", label: "Shipped", desc: "Handed over to cargo logistics" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", desc: "Out for final delivery" },
  { key: "RECEIVED", label: "Received", desc: "Safely received at facility" },
];

function SupplierDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [supplierProfile, setSupplierProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    packedOrders: 0,
    shippedOrders: 0,
    outForDeliveryOrders: 0,
    receivedOrders: 0,
    totalProcurementValue: 0
  });
  const [performance, setPerformance] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModalOrder, setStatusModalOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("PACKED");
  const [statusRemark, setStatusRemark] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      resolveSupplier(parsed);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const resolveSupplier = async (userData) => {
    try {
      const suppRes = await fetch(`${API_URL}/supplier`);
      if (suppRes.ok) {
        const allSuppliers = await suppRes.json();
        let matched = allSuppliers.find(
          (s) => s.email?.toLowerCase() === userData.email?.toLowerCase() ||
                 s.supplierName?.toLowerCase().includes(userData.username?.toLowerCase())
        );
        if (!matched && allSuppliers.length > 0) {
          matched = allSuppliers[0];
        }
        setSupplierProfile(matched);
        if (matched) {
          fetchSupplierData(matched.supplierId, page, limit, searchQuery, activeTab);
        }
      }
    } catch (err) {
      console.error("Error resolving supplier profile:", err);
    }
  };

  const fetchSupplierData = async (supplierId, curPage, curLimit, curSearch, curStatus) => {
    if (!supplierId) return;
    setLoading(true);
    try {
      const searchParam = encodeURIComponent(curSearch || "");
      const statusParam = curStatus === "ALL" ? "" : curStatus;

      const [ordersRes, statsRes, perfRes] = await Promise.all([
        fetch(`${API_URL}/supplier/${supplierId}/orders/paginated?page=${curPage}&limit=${curLimit}&search=${searchParam}&status=${statusParam}&sortOrder=asc`),
        fetch(`${API_URL}/supplier/${supplierId}/stats`),
        fetch(`${API_URL}/supplier/${supplierId}/performance`)
      ]);

      if (ordersRes.ok) {
        const paginatedData = await ordersRes.json();
        setOrders(paginatedData.data || []);
        if (paginatedData.pagination) {
          setPagination(paginatedData.pagination);
        }
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (perfRes.ok) {
        const perfData = await perfRes.json();
        setPerformance(perfData);
      }
    } catch (err) {
      console.error("Error loading supplier orders:", err);
      setMessage({ text: "Unable to load orders. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && supplierProfile) {
      setPage(newPage);
      fetchSupplierData(supplierProfile.supplierId, newPage, limit, searchQuery, activeTab);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setLimit(newLimit);
    setPage(1);
    if (supplierProfile) {
      fetchSupplierData(supplierProfile.supplierId, 1, newLimit, searchQuery, activeTab);
    }
  };

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    setPage(1);
    if (supplierProfile) {
      fetchSupplierData(supplierProfile.supplierId, 1, limit, q, activeTab);
    }
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setPage(1);
    if (supplierProfile) {
      fetchSupplierData(supplierProfile.supplierId, 1, limit, searchQuery, tabKey);
    }
  };

  const getNextPermittedStatus = (currentStatus) => {
    switch (currentStatus) {
      case "ORDER_PLACED":
      case "APPROVED":
      case "ORDER_CONFIRMED":
        return ["PACKED"];
      case "PACKED":
      case "PROCESSING":
        return ["SHIPPED"];
      case "SHIPPED":
        return ["OUT_FOR_DELIVERY"];
      case "OUT_FOR_DELIVERY":
        return ["RECEIVED"];
      default:
        return [];
    }
  };

  const handleOpenStatusModal = (order) => {
    setStatusModalOrder(order);
    const permitted = getNextPermittedStatus(order.status);
    setNewStatus(permitted.length > 0 ? permitted[0] : order.status);
    setStatusRemark("");
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusModalOrder) return;

    setUpdatingStatus(true);
    try {
      const payload = {
        status: newStatus,
        description: statusRemark || `Status progressed to ${newStatus} by Supplier partner ${supplierProfile?.supplierName}`,
        changedBy: supplierProfile?.supplierName || user?.username || "Supplier",
        changedByRole: "SUPPLIER",
      };

      const res = await fetch(`${API_URL}/orders/${statusModalOrder.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({ text: `Order status updated to ${newStatus} successfully.`, type: "success" });
        setStatusModalOrder(null);
        setStatusRemark("");
        if (supplierProfile) {
          fetchSupplierData(supplierProfile.supplierId, page, limit, searchQuery, activeTab);
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        setMessage({ text: errorData.message || "Failed to update order status.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Unable to update order status. Please try again.", type: "error" });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ORDER_PLACED":
      case "APPROVED":
        return <span className="admin-badge approved">● Approved</span>;
      case "PACKED":
      case "PROCESSING":
        return <span className="admin-badge pending">● Packed</span>;
      case "SHIPPED":
        return <span className="admin-badge" style={{ background: "#e0f2fe", color: "#0369a1" }}>✈ Shipped</span>;
      case "OUT_FOR_DELIVERY":
        return <span className="admin-badge" style={{ background: "#ede9fe", color: "#6d28d9" }}>🚚 Out for Delivery</span>;
      case "RECEIVED":
      case "DELIVERED":
        return <span className="admin-badge" style={{ background: "#dcfce7", color: "#15803d" }}>✓ Received</span>;
      case "CANCELLED":
        return <span className="admin-badge rejected">✕ Cancelled</span>;
      default:
        return <span className="admin-badge">{status}</span>;
    }
  };

  const getStageState = (stageKey, currentStatus) => {
    const stageOrder = ["APPROVED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "RECEIVED"];
    let normCurrent = currentStatus;
    if (normCurrent === "ORDER_PLACED" || normCurrent === "ORDER_CONFIRMED") normCurrent = "APPROVED";
    if (normCurrent === "PROCESSING") normCurrent = "PACKED";
    if (normCurrent === "DELIVERED") normCurrent = "RECEIVED";

    const currentIdx = stageOrder.indexOf(normCurrent);
    const thisIdx = stageOrder.indexOf(stageKey);

    if (currentIdx === -1) return "upcoming";
    if (thisIdx < currentIdx) return "completed";
    if (thisIdx === currentIdx) return "current";
    return "upcoming";
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", color: "#0f172a", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Top Navigation Bar */}
      <header style={{
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", padding: "8px", borderRadius: "10px", color: "#ffffff", display: "flex" }}>
              <ShoppingCart size={22} color="#ffffff" />
            </div>
            <div style={{ fontSize: "18px", fontWeight: "800" }}>
              <span style={{ color: "#0f172a" }}>Smart</span><strong style={{ color: "#0284c7" }}>Procure</strong>
              <span style={{ fontSize: "12px", background: "#e0f2fe", color: "#0369a1", padding: "3px 8px", borderRadius: "6px", marginLeft: "10px", fontWeight: "700" }}>
                Supplier Portal
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          {/* Notification Bell */}
          <NotificationBell currentUser={user} />

          <div style={{ fontSize: "13px", color: "#64748b" }}>
            Supplier Partner: <strong style={{ color: "#0f172a" }}>{supplierProfile?.supplierName || user?.username || "Supplier"}</strong>
          </div>

          <button
            onClick={() => setShowAddProductModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              background: "#e0f2fe",
              border: "1px solid #bae6fd",
              borderRadius: "8px",
              color: "#0369a1",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            <Plus size={15} />
            <span>Add Catalog Item</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              background: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              color: "#b91c1c",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: "28px 32px 40px", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Main Heading */}
        <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "800", margin: "0 0 6px", color: "#0f172a", display: "flex", alignItems: "center", gap: "10px" }}>
              <span>Supplier Dashboard</span>
              <span style={{ fontSize: "16px", color: "#0284c7", fontWeight: "600" }}>• Welcome, {supplierProfile?.supplierName || "Partner"}</span>
            </h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
              Manage your assigned purchase orders and update delivery fulfillment milestones in real-time.
            </p>
          </div>

          <button
            onClick={() => supplierProfile && fetchSupplierData(supplierProfile.supplierId, page, limit, searchQuery, activeTab)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 16px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              color: "#334155",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span>Refresh Portal</span>
          </button>
        </div>

        {/* Alert Message */}
        {message.text && (
          <div className={`admin-alert-banner ${message.type}`} style={{ marginBottom: "20px" }}>
            <span>{message.text}</span>
            <button onClick={() => setMessage({ text: "", type: "" })} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Statistics Grid (Light Theme) */}
        <div className="admin-stats-grid" style={{ marginBottom: "24px" }}>
          <div className={`admin-stat-card total ${activeTab === "ALL" ? "active" : ""}`} onClick={() => handleTabChange("ALL")}>
            <div className="admin-stat-top">
              <div className="admin-stat-icon-wrapper">
                <Package size={20} />
              </div>
              <span className="admin-stat-label">Total Assigned</span>
            </div>
            <div className="admin-stat-value">{stats.totalOrders}</div>
            <span className="admin-stat-label">Total purchase orders</span>
          </div>

          <div className={`admin-stat-card pending ${activeTab === "APPROVED" ? "active" : ""}`} onClick={() => handleTabChange("APPROVED")}>
            <div className="admin-stat-top">
              <div className="admin-stat-icon-wrapper">
                <Clock3 size={20} />
              </div>
              <span className="admin-stat-label">Pending Packing</span>
            </div>
            <div className="admin-stat-value">{stats.pendingOrders}</div>
            <span className="admin-stat-label">Awaiting warehouse packaging</span>
          </div>

          <div className={`admin-stat-card order ${activeTab === "PACKED" ? "active" : ""}`} onClick={() => handleTabChange("PACKED")}>
            <div className="admin-stat-top">
              <div className="admin-stat-icon-wrapper">
                <Truck size={20} />
              </div>
              <span className="admin-stat-label">In Fulfillment</span>
            </div>
            <div className="admin-stat-value">{stats.inProgressOrders}</div>
            <span className="admin-stat-label">Packed, shipped or in transit</span>
          </div>

          <div className={`admin-stat-card approved ${activeTab === "RECEIVED" ? "active" : ""}`} onClick={() => handleTabChange("RECEIVED")}>
            <div className="admin-stat-top">
              <div className="admin-stat-icon-wrapper">
                <CheckCircle2 size={20} />
              </div>
              <span className="admin-stat-label">Completed</span>
            </div>
            <div className="admin-stat-value">{stats.completedOrders}</div>
            <span className="admin-stat-label">Received at client facility</span>
          </div>
        </div>

        {/* Supplier Performance Analytics Card */}
        {performance && (
          <div style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "20px 24px",
            marginBottom: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0284c7", fontWeight: "800", fontSize: "15px" }}>
                <BarChart3 size={18} />
                <span>Supplier Performance & Execution Metrics</span>
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                Fulfillment Success Rate: <strong style={{ color: "#15803d" }}>{performance.deliverySuccessRate}%</strong>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", fontSize: "13px" }}>
              <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase", fontWeight: "700" }}>Total Procurement Value</div>
                <div style={{ fontSize: "18px", fontWeight: "900", color: "#0284c7", marginTop: "4px" }}>₹{performance.totalProcurementValue?.toLocaleString()}</div>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase", fontWeight: "700" }}>Average Order Value</div>
                <div style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", marginTop: "4px" }}>₹{performance.averageOrderValue?.toLocaleString()}</div>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase", fontWeight: "700" }}>Total Units Supplied</div>
                <div style={{ fontSize: "18px", fontWeight: "900", color: "#7c3aed", marginTop: "4px" }}>{performance.totalQuantity} units</div>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase", fontWeight: "700" }}>In Transit / Dispatch</div>
                <div style={{ fontSize: "18px", fontWeight: "900", color: "#d97706", marginTop: "4px" }}>
                  {(performance.processingOrders || 0) + (performance.shippedOrders || 0) + (performance.outForDeliveryOrders || 0)} orders
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Orders Table Card */}
        <div className="admin-table-card">
          <div className="admin-table-toolbar">
            <div className="admin-tabs-pills">
              {[
                { key: "ALL", label: "All Orders", count: stats.totalOrders },
                { key: "APPROVED", label: "Approved", count: stats.pendingOrders },
                { key: "PACKED", label: "Packed", count: stats.packedOrders },
                { key: "SHIPPED", label: "Shipped", count: stats.shippedOrders },
                { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", count: stats.outForDeliveryOrders },
                { key: "RECEIVED", label: "Received", count: stats.completedOrders },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`admin-tab-btn ${activeTab === tab.key ? "active" : ""}`}
                >
                  <span>{tab.label}</span>
                  <span className="admin-tab-count">{tab.count || 0}</span>
                </button>
              ))}
            </div>

            <div className="admin-search-wrapper">
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search Order ID, product, requester..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="admin-table-responsive">
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
                <RefreshCw className="animate-spin" size={24} style={{ margin: "0 auto 10px", color: "#0284c7" }} />
                <div>Loading orders...</div>
              </div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
                <Package size={36} style={{ margin: "0 auto 12px", color: "#94a3b8" }} />
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>No orders found</div>
                <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                  No procurement purchase orders assigned matching your current filter.
                </p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>PRODUCT</th>
                    <th>REQUESTED BY</th>
                    <th>DEPARTMENT</th>
                    <th>QUANTITY</th>
                    <th>UNIT PRICE</th>
                    <th>TOTAL</th>
                    <th>STATUS</th>
                    <th style={{ textAlign: "center" }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <span className="admin-req-id">
                          {o.orderId}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: "700", color: "#0f172a" }}>{o.productName}</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>{o.category?.categoryName || "General"}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: "600", color: "#0f172a" }}>{o.user?.username || "Employee"}</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>{o.user?.email}</div>
                      </td>
                      <td>
                        <span className="admin-dept-tag">
                          {o.department?.departmentName || "General"}
                        </span>
                      </td>
                      <td><strong>{o.quantity}</strong></td>
                      <td>₹{o.unitPrice?.toLocaleString()}</td>
                      <td>
                        <strong className="admin-price-tag">₹{o.totalAmount?.toLocaleString()}</strong>
                      </td>
                      <td>{getStatusBadge(o.status)}</td>
                      <td style={{ textAlign: "center" }}>
                        <div className="admin-actions-cell">
                          {/* View Order Details */}
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="admin-action-btn view"
                            title="View Order Details Dossier"
                          >
                            <Eye size={13} />
                            
                          </button>

                          {/* Update Status */}
                          {getNextPermittedStatus(o.status).length > 0 && (
                            <button
                              onClick={() => handleOpenStatusModal(o)}
                              className="admin-action-btn pay"
                              title="Update Delivery Lifecycle Status"
                            >
                              <Edit3 size={13} />
                              <span>Update</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Server-Side Pagination Bar */}
          <div style={{
            padding: "16px 20px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
            fontSize: "13px",
            color: "#64748b",
            background: "#fafafa"
          }}>
            <div>
              Showing {pagination.totalItems === 0 ? 0 : (page - 1) * limit + 1}–
              {Math.min(page * limit, pagination.totalItems)} of {pagination.totalItems} orders
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>Rows per page:</span>
                <select
                  value={limit}
                  onChange={handleLimitChange}
                  style={{
                    background: "#ffffff",
                    color: "#0f172a",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    fontSize: "12px"
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!pagination.hasPreviousPage}
                  style={{
                    padding: "6px 12px",
                    background: pagination.hasPreviousPage ? "#ffffff" : "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    color: pagination.hasPreviousPage ? "#0f172a" : "#94a3b8",
                    cursor: pagination.hasPreviousPage ? "pointer" : "not-allowed"
                  }}
                >
                  Previous
                </button>

                <span style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  background: "#e0f2fe",
                  border: "1px solid #bae6fd",
                  color: "#0284c7",
                  fontSize: "12px",
                  fontWeight: "700"
                }}>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!pagination.hasNextPage}
                  style={{
                    padding: "6px 12px",
                    background: pagination.hasNextPage ? "#ffffff" : "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    color: pagination.hasNextPage ? "#0f172a" : "#94a3b8",
                    cursor: pagination.hasNextPage ? "pointer" : "not-allowed"
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ================= ORDER DETAILS DOSSIER MODAL ================= */}
      {selectedOrder && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: "620px" }}>
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <Package size={18} color="#0284c7" />
                <span>Order Dossier • {selectedOrder.orderId}</span>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* 1. Product & Order Info */}
              <div className="admin-dossier-hero">
                <div>
                  <h3 className="admin-dossier-item-name">{selectedOrder.productName}</h3>
                  <div className="admin-dossier-meta">
                    {selectedOrder.category?.categoryName || "General"} • {selectedOrder.quantity} units
                  </div>
                </div>
                <div className="admin-dossier-price">
                  ₹{selectedOrder.totalAmount?.toLocaleString()}
                </div>
              </div>

              <div className="admin-dossier-grid">
                <div className="admin-dossier-field">
                  <span className="admin-dossier-lbl">Requested By</span>
                  <strong className="admin-dossier-val">{selectedOrder.user?.username || "Employee"}</strong>
                </div>
                <div className="admin-dossier-field">
                  <span className="admin-dossier-lbl">Department</span>
                  <strong className="admin-dossier-val">{selectedOrder.department?.departmentName || "General"}</strong>
                </div>
                <div className="admin-dossier-field">
                  <span className="admin-dossier-lbl">Unit Rate</span>
                  <strong className="admin-dossier-val">₹{selectedOrder.unitPrice?.toLocaleString()}</strong>
                </div>
                <div className="admin-dossier-field">
                  <span className="admin-dossier-lbl">Fulfillment Status</span>
                  <div>{getStatusBadge(selectedOrder.status)}</div>
                </div>
              </div>

              {/* 4. Sequential Tracking Timeline */}
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 14px", fontSize: "11px", color: "#0284c7", textTransform: "uppercase", letterSpacing: "1px" }}>
                  5-Stage Milestone Progression
                </h4>
                <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                  {SUPPLIER_STAGES.map((stg, idx) => {
                    const state = getStageState(stg.key, selectedOrder.status);
                    return (
                      <div key={stg.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", flex: 1, zIndex: 1 }}>
                        <div style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: state === "completed" ? "#10b981" : state === "current" ? "#0284c7" : "#e2e8f0",
                          border: `2px solid ${state === "completed" ? "#34d399" : state === "current" ? "#38bdf8" : "#cbd5e1"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "700",
                          color: state === "upcoming" ? "#64748b" : "#ffffff"
                        }}>
                          {state === "completed" ? "✓" : idx + 1}
                        </div>
                        <div style={{ fontSize: "11px", fontWeight: "600", marginTop: "6px", color: state === "current" ? "#0284c7" : state === "completed" ? "#15803d" : "#94a3b8" }}>
                          {stg.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setSelectedOrder(null)}>
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= UPDATE STATUS MODAL ================= */}
      {statusModalOrder && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card payment">
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <Edit3 size={18} color="#0284c7" />
                <span>Update Order Lifecycle • {statusModalOrder.orderId}</span>
              </div>
              <button className="admin-modal-close" onClick={() => setStatusModalOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus}>
              <div className="admin-modal-body">
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", fontWeight: "700" }}>
                    Current Status
                  </label>
                  <div style={{ padding: "10px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", fontWeight: "700", color: "#0284c7" }}>
                    {statusModalOrder.status}
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>New Status (Next Permitted Transition) *</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    {getNextPermittedStatus(statusModalOrder.status).map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Fulfillment Remarks & Tracking Info (Optional)</label>
                  <textarea
                    rows="3"
                    placeholder="e.g. Dispatched with BlueDart Express AWB #889210"
                    value={statusRemark}
                    onChange={(e) => setStatusRemark(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setStatusModalOrder(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="admin-btn-primary"
                >
                  {updatingStatus ? "Updating..." : "Confirm Status Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD PRODUCT MODAL (SUPPLIER) ================= */}
      {showAddProductModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: "460px" }}>
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <Plus size={18} color="#0284c7" />
                <span>Supplier Product Catalog</span>
              </div>
              <button className="admin-modal-close" onClick={() => setShowAddProductModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body" style={{ color: "#475569", fontSize: "14px" }}>
              <p>
                Products added to your organization's catalog are synchronized with the enterprise procurement database.
              </p>
              <div style={{ background: "#f0fdf4", padding: "14px", borderRadius: "10px", border: "1px solid #bbf7d0", color: "#15803d", fontSize: "13px", fontWeight: "600" }}>
                ✓ Catalog auto-sync enabled with Procurement Director review.
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setShowAddProductModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupplierDashboard;
