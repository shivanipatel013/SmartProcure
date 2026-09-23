import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, CreditCard, LogOut, Bell, Menu, ShoppingCart,
  ChevronDown, Clock3, XCircle, CheckCircle, Package, FileText,
  Search, RefreshCw, Check, X, Shield, ArrowUpRight, Sparkles,
  Layers, Eye, Trash2, Download, Truck, ChevronLeft, ChevronRight, User,
  Building2, DollarSign, QrCode, Phone, Mail, CheckCheck, AlertCircle, Info
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from "recharts";
import NotificationBell from "../components/NotificationBell";
import QRCodeDisplay from "../components/QRCodeDisplay";
import "./AdminDashboard.css";

const API_URL = "http://localhost:8080";

function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  // Active Main Navigation Tab
  // "OVERVIEW" | "REQUESTS" | "ORDERS" | "SUPPLIERS" | "PAYMENTS"
  const [activeNav, setActiveNav] = useState("OVERVIEW");

  // Data States
  const [requests, setRequests] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [supplierPerformances, setSupplierPerformances] = useState([]);
  const [payments, setPayments] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL"); // For requests filter
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [downloadingCSB, setDownloadingCSB] = useState(false);

  // Server-side Pagination State (for requests)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals state
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);

  // Reject Modal
  const [rejectingProduct, setRejectingProduct] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Supplier Selection Modal
  const [supplierSelectionProduct, setSupplierSelectionProduct] = useState(null);
  const [chosenSupplierId, setChosenSupplierId] = useState("");

  // Payment Module State
  const [paymentProduct, setPaymentProduct] = useState(null);
  const [paymentSupplier, setPaymentSupplier] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI"); // "UPI" | "QR"
  const [upiId, setUpiId] = useState("admin.procure@okhdfcbank");
  const [paymentStep, setPaymentStep] = useState("INPUT"); // "INPUT" | "PROCESSING" | "SUCCESS" | "FAILED"
  const [completedOrderInfo, setCompletedOrderInfo] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      if (parsed.role?.toUpperCase() !== "ADMIN") {
        navigate("/dashboard");
        return;
      }
    } else {
      navigate("/login");
      return;
    }

    fetchPaginatedRequests(currentPage, pageSize, searchQuery, activeTab);
    fetchGlobalResources();
  }, [navigate, currentPage, pageSize, activeTab]);

  // Debounced search trigger for requests
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPaginatedRequests(1, pageSize, searchQuery, activeTab);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchGlobalResources = async () => {
    try {
      const [suppRes, accRes, ordRes, payRes, perfRes] = await Promise.all([
        fetch(`${API_URL}/supplier`),
        fetch(`${API_URL}/account`),
        fetch(`${API_URL}/orders?page=1&limit=50&sortOrder=asc`),
        fetch(`${API_URL}/payment`),
        fetch(`${API_URL}/supplier/performance/all`)
      ]);

      if (suppRes.ok) {
        const suppData = await suppRes.json();
        setSuppliers(suppData);
        if (suppData.length > 0 && !chosenSupplierId) {
          setChosenSupplierId(suppData[0].supplierId);
        }
      }

      if (accRes.ok) {
        const accData = await accRes.json();
        setAccounts(accData);
      }

      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setAllOrders(ordData.data || ordData || []);
      }

      if (payRes.ok) {
        const payData = await payRes.json();
        setPayments(payData || []);
      }

      if (perfRes.ok) {
        const perfData = await perfRes.json();
        setSupplierPerformances(perfData || []);
      }
    } catch (err) {
      console.error("Global resource load note:", err);
    }
  };

  const fetchPaginatedRequests = async (page = 1, limit = 10, search = "", statusFilter = "ALL") => {
    setLoading(true);
    try {
      let url = `${API_URL}/product/paginated?page=${page}&limit=${limit}&sortOrder=asc`;
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      if (statusFilter && statusFilter !== "ALL") {
        url += `&status=${encodeURIComponent(statusFilter)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const resData = await res.json();
        setRequests(resData.data || []);
        if (resData.pagination) {
          setCurrentPage(resData.pagination.currentPage);
          setTotalPages(resData.pagination.totalPages);
          setTotalItems(resData.pagination.totalItems);
        }
      } else {
        const fallbackRes = await fetch(`${API_URL}/product/getAllProducts`);
        if (fallbackRes.ok) {
          const allData = await fallbackRes.json();
          setRequests(allData);
          setTotalItems(allData.length);
          setTotalPages(Math.ceil(allData.length / limit) || 1);
        }
      }
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------------
     DECISION HANDLER (APPROVE / REJECT)
  ---------------------------------------------------- */
  const handleApprove = async (productId) => {
    setActionLoading(productId);
    try {
      const res = await fetch(`${API_URL}/product/decision/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" })
      });

      if (res.ok) {
        setMessage({
          text: `✓ Request REQ-${productId} approved successfully. You can now assign a supplier partner.`,
          type: "success"
        });
        fetchPaginatedRequests(currentPage, pageSize, searchQuery, activeTab);
        // Prompt for supplier selection automatically
        const approvedItem = requests.find(r => r.productId === productId);
        if (approvedItem) {
          setSupplierSelectionProduct(approvedItem);
        }
      } else {
        setMessage({ text: "Failed to approve request.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Network error approving request.", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenRejectModal = (product) => {
    setRejectingProduct(product);
    setRejectReason("");
  };

  const handleConfirmReject = async () => {
    if (!rejectingProduct) return;
    setActionLoading(rejectingProduct.productId);
    try {
      const res = await fetch(`${API_URL}/product/decision/${rejectingProduct.productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REJECT",
          reason: rejectReason.trim() || "Budget constraints / non-standard specification"
        })
      });

      if (res.ok) {
        setMessage({
          text: `✕ Request REQ-${rejectingProduct.productId} rejected. Requester has been notified.`,
          type: "error"
        });
        setRejectingProduct(null);
        setRejectReason("");
        fetchPaginatedRequests(currentPage, pageSize, searchQuery, activeTab);
      } else {
        setMessage({ text: "Failed to reject request.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Network error rejecting request.", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  /* ----------------------------------------------------
     SUPPLIER SELECTION & PAYMENT FLOW
  ---------------------------------------------------- */
  const handleOpenSupplierSelection = (product) => {
    setSupplierSelectionProduct(product);
    if (suppliers.length > 0 && !chosenSupplierId) {
      setChosenSupplierId(suppliers[0].supplierId);
    }
  };

  const handleConfirmSupplierSelection = () => {
    if (!supplierSelectionProduct || !chosenSupplierId) return;
    const matchedSupplier = suppliers.find(s => String(s.supplierId) === String(chosenSupplierId)) || suppliers[0];
    setSupplierSelectionProduct(null);
    setMessage({
      text: `✓ Supplier ${matchedSupplier.supplierName} selected successfully for REQ-${supplierSelectionProduct.productId}. Ready for payment disbursement.`,
      type: "success"
    });

    // Open Payment Modal with pre-selected supplier
    setPaymentProduct(supplierSelectionProduct);
    setPaymentSupplier(matchedSupplier);
    setPaymentMethod("UPI");
    setPaymentStep("INPUT");
  };

  const handleExecutePayment = async () => {
    if (!paymentProduct || !paymentSupplier) return;
    setPaymentStep("PROCESSING");

    try {
      // Simulate authentic secure network verification
      await new Promise(r => setTimeout(r, 1200));

      const payload = {
        product: { productId: paymentProduct.productId },
        supplier: { supplierId: paymentSupplier.supplierId },
        amount: paymentProduct.totalPrice,
        paymentMethod: paymentMethod === "QR" ? "QR_CODE" : "UPI",
        transactionId: `TXN-${paymentMethod}-${Date.now()}`
      };

      const res = await fetch(`${API_URL}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedPayment = await res.json();
        setPaymentStep("SUCCESS");
        setCompletedOrderInfo({
          orderId: `ORD-${Date.now().toString().slice(-4)}`,
          productName: paymentProduct.name,
          amount: paymentProduct.totalPrice,
          supplierName: paymentSupplier.supplierName,
          transactionId: savedPayment.transactionId || payload.transactionId
        });
        setMessage({
          text: `✓ Payment Successful! Requisition REQ-${paymentProduct.productId} transitioned to ORDER PLACED.`,
          type: "success"
        });
        fetchPaginatedRequests(currentPage, pageSize, searchQuery, activeTab);
        fetchGlobalResources();
      } else {
        const err = await res.json().catch(() => ({}));
        setPaymentStep("FAILED");
        setMessage({ text: err.message || "Payment disbursement could not be completed.", type: "error" });
      }
    } catch (err) {
      setPaymentStep("FAILED");
      setMessage({ text: "Payment service connection error.", type: "error" });
    }
  };

  /* ----------------------------------------------------
     DOWNLOAD MASTER CSB
  ---------------------------------------------------- */
  const handleDownloadMasterCSB = async () => {
    setDownloadingCSB(true);
    try {
      const res = await fetch(`${API_URL}/admin/csb/all`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `SmartProcure_Master_All_Requisitions_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setDownloadingCSB(false);
        setMessage({ text: "Master CSB Report downloaded successfully!", type: "success" });
        return;
      }
    } catch (err) {
      console.log("Client fallback CSB download");
    }

    try {
      const allRes = await fetch(`${API_URL}/product/getAllProducts`);
      const allReqs = allRes.ok ? await allRes.json() : requests;

      const headers = [
        "Request ID", "Product Name", "Category", "Department", "Requester", "Quantity", "Unit Price (INR)", "Total Amount (INR)", "Current Status", "Created Date"
      ];
      const rows = allReqs.map(r => [
        `REQ-${r.productId}`,
        r.name || "N/A",
        r.category?.categoryName || "General",
        r.department?.departmentName || "General",
        r.user?.username || "Employee",
        r.numberOfQuantities,
        r.pricePerProduct,
        r.totalPrice,
        r.status,
        r.createdDate ? new Date(r.createdDate).toLocaleString() : "N/A"
      ]);

      const csvContent = [headers.join(","), ...rows.map(e => e.map(cell => `"${String(cell || "").replace(/"/g, '""')}"`).join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SmartProcure_Master_Report_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setMessage({ text: "Master CSB Report generated and downloaded successfully!", type: "success" });
    } catch (err) {
      setMessage({ text: "Failed to download CSB report.", type: "error" });
    } finally {
      setDownloadingCSB(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Live KPI Calculations
  const stats = useMemo(() => {
    const totalRequests = totalItems;
    const pendingRequests = requests.filter(r => r.status === "PENDING").length;
    const approvedRequests = requests.filter(r => r.status === "APPROVED").length;
    const rejectedRequests = requests.filter(r => r.status === "REJECTED").length;
    const totalOrdersCount = allOrders.length;
    const ordersInProgress = allOrders.filter(o => o.status === "APPROVED" || o.status === "ORDER_PLACED" || o.status === "PACKED" || o.status === "PROCESSING" || o.status === "SHIPPED" || o.status === "OUT_FOR_DELIVERY").length;
    const completedOrders = allOrders.filter(o => o.status === "RECEIVED" || o.status === "DELIVERED").length;
    const totalPaymentsCount = payments.length;
    const totalDisbursedAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      totalOrdersCount,
      ordersInProgress,
      completedOrders,
      totalPaymentsCount,
      totalDisbursedAmount
    };
  }, [requests, totalItems, allOrders, payments]);

  // Donut chart distribution
  const chartData = useMemo(() => {
    const data = [
      { name: "Pending", value: stats.pendingRequests, color: "#f59e0b" },
      { name: "Approved", value: stats.approvedRequests, color: "#10b981" },
      { name: "Active Orders", value: stats.ordersInProgress, color: "#0284c7" },
      { name: "Delivered", value: stats.completedOrders, color: "#15803d" },
      { name: "Rejected", value: stats.rejectedRequests, color: "#ef4444" },
    ].filter(i => i.value > 0);

    return data.length > 0 ? data : [{ name: "No Activity", value: 1, color: "#cbd5e1" }];
  }, [stats]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <span className="admin-badge pending"><span className="admin-badge-dot" /> Pending Review</span>;
      case "APPROVED":
        return <span className="admin-badge approved"><span className="admin-badge-dot" /> Approved (Ready to Pay)</span>;
      case "ORDER_PLACED":
        return <span className="admin-badge order_placed"><span className="admin-badge-dot" /> Order Placed</span>;
      case "PACKED":
        return <span className="admin-badge pending"><span className="admin-badge-dot" /> Packed</span>;
      case "SHIPPED":
        return <span className="admin-badge" style={{ background: "#e0f2fe", color: "#0369a1" }}>✈ Shipped</span>;
      case "OUT_FOR_DELIVERY":
        return <span className="admin-badge" style={{ background: "#fef3c7", color: "#b45309" }}>🚚 Out for Delivery</span>;
      case "RECEIVED":
      case "DELIVERED":
        return <span className="admin-badge" style={{ background: "#dcfce7", color: "#15803d" }}>✓ Received</span>;
      case "REJECTED":
        return <span className="admin-badge rejected"><span className="admin-badge-dot" /> Rejected</span>;
      default:
        return <span className="admin-badge">{status}</span>;
    }
  };

  return (
    <div className="admin-layout">
      {/* ================= ONE CONSOLIDATED ADMIN SIDEBAR ================= */}
      <aside className={`admin-sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <ShoppingCart size={22} strokeWidth={2.6} />
          </div>
          <div className="admin-brand-text">
            <span>Smart</span><strong>Procure</strong>
          </div>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-section-title">Core Management</div>
          <button
            onClick={() => setActiveNav("OVERVIEW")}
            className={`admin-nav-item ${activeNav === "OVERVIEW" ? "active" : ""}`}
            style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer" }}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveNav("REQUESTS")}
            className={`admin-nav-item ${activeNav === "REQUESTS" ? "active" : ""}`}
            style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer" }}
          >
            <FileText size={19} />
            <span>Request Management</span>
            {stats.pendingRequests > 0 && (
              <span className="admin-sidebar-badge" style={{ background: "#f59e0b" }}>
                {stats.pendingRequests}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveNav("ORDERS")}
            className={`admin-nav-item ${activeNav === "ORDERS" ? "active" : ""}`}
            style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer" }}
          >
            <Truck size={19} />
            <span>Order Management</span>
            {stats.ordersInProgress > 0 && (
              <span className="admin-sidebar-badge" style={{ background: "#0284c7" }}>
                {stats.ordersInProgress}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveNav("SUPPLIERS")}
            className={`admin-nav-item ${activeNav === "SUPPLIERS" ? "active" : ""}`}
            style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer" }}
          >
            <Building2 size={19} />
            <span>Supplier Management</span>
          </button>

          <button
            onClick={() => setActiveNav("PAYMENTS")}
            className={`admin-nav-item ${activeNav === "PAYMENTS" ? "active" : ""}`}
            style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer" }}
          >
            <CreditCard size={19} />
            <span>Payment History</span>
          </button>

          <div className="admin-nav-section-title">Portal Switch</div>
          <Link to="/dashboard" className="admin-nav-item">
            <User size={19} />
            <span>Employee View</span>
          </Link>
        </nav>

        <button className="admin-logout-btn" onClick={handleLogout}>
          <LogOut size={19} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <button
            className="admin-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="admin-header-right">
            {/* Real-time Persistent Notification Bell */}
            <NotificationBell currentUser={user} />

            <div className="admin-profile-badge">
              <div className="admin-avatar">AD</div>
              <div className="admin-profile-info">
                <strong>{user?.username || "Admin"}</strong>
                <span>Procurement Controller</span>
              </div>
            </div>
          </div>
        </header>

        {/* Global Alert Notification */}
        {message.text && (
          <div
            className={`admin-alert-banner ${message.type}`}
            style={{ margin: "20px 32px 0", borderRadius: "10px" }}
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

        {/* ================= VIEW 1: OVERVIEW DASHBOARD ================= */}
        {activeNav === "OVERVIEW" && (
          <div className="admin-content">
            <div className="admin-page-title">
              <div>
                <h1>Procurement Control Dashboard</h1>
                <p className="admin-page-desc">
                  Real-time visibility across enterprise requisitions, orders, suppliers, and payment disbursements.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="admin-btn-secondary"
                  onClick={handleDownloadMasterCSB}
                  disabled={downloadingCSB}
                >
                  <Download size={16} />
                  <span>{downloadingCSB ? "Exporting..." : "Master CSB Report"}</span>
                </button>
                <button
                  className="admin-btn-primary"
                  onClick={() => { fetchPaginatedRequests(1, pageSize, searchQuery, activeTab); fetchGlobalResources(); }}
                >
                  <RefreshCw size={16} />
                  <span>Refresh System</span>
                </button>
              </div>
            </div>

            {/* Comprehensive KPI Cards */}
            <div className="admin-stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <div className="admin-stat-card">
                <div className="admin-stat-top">
                  <span className="admin-stat-label">Total Requests</span>
                  <div className="admin-stat-icon-wrap neutral"><Layers size={20} /></div>
                </div>
                <div className="admin-stat-value">{stats.totalRequests}</div>
                <div className="admin-stat-sub">Across All Departments</div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-top">
                  <span className="admin-stat-label">Pending Requests</span>
                  <div className="admin-stat-icon-wrap warning"><Clock3 size={20} /></div>
                </div>
                <div className="admin-stat-value" style={{ color: "#f59e0b" }}>{stats.pendingRequests}</div>
                <div className="admin-stat-sub">Requiring Review</div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-top">
                  <span className="admin-stat-label">Approved Requests</span>
                  <div className="admin-stat-icon-wrap success"><CheckCircle size={20} /></div>
                </div>
                <div className="admin-stat-value" style={{ color: "#10b981" }}>{stats.approvedRequests}</div>
                <div className="admin-stat-sub">Ready for Supplier Selection</div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-top">
                  <span className="admin-stat-label">Total Orders</span>
                  <div className="admin-stat-icon-wrap info"><Truck size={20} /></div>
                </div>
                <div className="admin-stat-value" style={{ color: "#0284c7" }}>{stats.totalOrdersCount}</div>
                <div className="admin-stat-sub">{stats.ordersInProgress} in fulfillment</div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-top">
                  <span className="admin-stat-label">Total Disbursed</span>
                  <div className="admin-stat-icon-wrap success"><DollarSign size={20} /></div>
                </div>
                <div className="admin-stat-value" style={{ color: "#0284c7", fontSize: "22px" }}>
                  ₹{stats.totalDisbursedAmount.toLocaleString()}
                </div>
                <div className="admin-stat-sub">{stats.totalPaymentsCount} completed payments</div>
              </div>
            </div>

            {/* Quick Actions & Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px", marginTop: "24px" }}>
              {/* Quick Pipeline Navigation */}
              <div className="admin-panel" style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: "0 0 16px" }}>
                  Active Operational Modules
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div
                    onClick={() => setActiveNav("REQUESTS")}
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "16px", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <FileText size={20} color="#0284c7" />
                      <span style={{ fontSize: "11px", fontWeight: "700", background: "#e0f2fe", color: "#0284c7", padding: "2px 8px", borderRadius: "6px" }}>
                        {stats.pendingRequests} Pending
                      </span>
                    </div>
                    <strong style={{ display: "block", fontSize: "14px", color: "#0f172a" }}>Requisition Approval</strong>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Approve, reject, & inspect requisitions</span>
                  </div>

                  <div
                    onClick={() => setActiveNav("ORDERS")}
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "16px", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <Truck size={20} color="#10b981" />
                      <span style={{ fontSize: "11px", fontWeight: "700", background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "6px" }}>
                        {stats.ordersInProgress} Active
                      </span>
                    </div>
                    <strong style={{ display: "block", fontSize: "14px", color: "#0f172a" }}>Order Fulfillment</strong>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Track 5-stage delivery pipeline</span>
                  </div>

                  <div
                    onClick={() => setActiveNav("SUPPLIERS")}
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "16px", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <Building2 size={20} color="#8b5cf6" />
                      <span style={{ fontSize: "11px", fontWeight: "700", background: "#ede9fe", color: "#6d28d9", padding: "2px 8px", borderRadius: "6px" }}>
                        {suppliers.length} Partners
                      </span>
                    </div>
                    <strong style={{ display: "block", fontSize: "14px", color: "#0f172a" }}>Supplier Performance</strong>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Partner metrics & order values</span>
                  </div>

                  <div
                    onClick={() => setActiveNav("PAYMENTS")}
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "16px", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <CreditCard size={20} color="#0284c7" />
                      <span style={{ fontSize: "11px", fontWeight: "700", background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "6px" }}>
                        ₹{stats.totalDisbursedAmount.toLocaleString()}
                      </span>
                    </div>
                    <strong style={{ display: "block", fontSize: "14px", color: "#0f172a" }}>Payment History & CSB</strong>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Disbursement ledger & audits</span>
                  </div>
                </div>
              </div>

              {/* Status Distribution Donut Chart */}
              <div className="admin-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: "0 0 16px", width: "100%" }}>
                  Requisition Distribution
                </h3>

                <div style={{ width: "100%", height: "200px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
                  {chartData.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#64748b" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color }} />
                      <span>{item.name}: <b>{item.value}</b></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 2: REQUEST MANAGEMENT ================= */}
        {activeNav === "REQUESTS" && (
          <div className="admin-content">
            <div className="admin-page-title">
              <div>
                <h1>Requisition Request Management</h1>
                <p className="admin-page-desc">
                  Review employee procurement requests, authorize approvals, specify rejection notes, and route to verified supplier partners.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="admin-btn-secondary"
                  onClick={handleDownloadMasterCSB}
                  disabled={downloadingCSB}
                >
                  <Download size={16} />
                  <span>{downloadingCSB ? "Exporting..." : "Export Requests CSB"}</span>
                </button>
              </div>
            </div>

            <div className="admin-panel">
              {/* Toolbar */}
              <div className="admin-panel-toolbar" style={{ flexWrap: "wrap", gap: "12px", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "10px", flex: "1", minWidth: "240px", maxWidth: "420px" }}>
                  <div className="admin-search-box" style={{ width: "100%" }}>
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search by Request ID, Product, Requester..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: "flex", gap: "6px", overflowX: "auto" }}>
                  {["ALL", "PENDING", "APPROVED", "ORDER_PLACED", "REJECTED"].map((st) => (
                    <button
                      key={st}
                      onClick={() => { setActiveTab(st); setCurrentPage(1); }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: activeTab === st ? "1px solid #0284c7" : "1px solid #e2e8f0",
                        background: activeTab === st ? "#e0f2fe" : "#ffffff",
                        color: activeTab === st ? "#0284c7" : "#64748b",
                        fontSize: "12px",
                        fontWeight: activeTab === st ? "800" : "600",
                        cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {st === "ALL" ? "All Requests" : st.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Requests Table */}
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Product Name</th>
                      <th>Requested By</th>
                      <th>Department</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total Amount</th>
                      <th>Request Date</th>
                      <th>Current Status</th>
                      <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: "center", padding: "40px" }}>
                          <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 10px", color: "#0284c7" }} />
                          <div>Loading requisitions...</div>
                        </td>
                      </tr>
                    ) : requests.length > 0 ? (
                      requests.map((r) => (
                        <tr key={r.productId}>
                          <td>
                            <span style={{ fontFamily: "monospace", fontWeight: "800", color: "#0284c7" }}>
                              REQ-{r.productId}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: "#0f172a" }}>{r.name}</strong>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>{r.category?.categoryName || "General"}</div>
                          </td>
                          <td>
                            <strong style={{ color: "#334155" }}>{r.user?.username || "Employee"}</strong>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>{r.user?.email || ""}</div>
                          </td>
                          <td>
                            <span style={{ fontSize: "12px", color: "#334155", background: "#f1f5f9", padding: "3px 8px", borderRadius: "6px" }}>
                              {r.department?.departmentName || "General"}
                            </span>
                          </td>
                          <td><strong>{r.numberOfQuantities}</strong></td>
                          <td>₹{r.pricePerProduct?.toLocaleString()}</td>
                          <td><strong style={{ color: "#0284c7" }}>₹{r.totalPrice?.toLocaleString()}</strong></td>
                          <td>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>
                              {r.createdDate ? new Date(r.createdDate).toLocaleDateString() : "—"}
                            </span>
                          </td>
                          <td>{getStatusBadge(r.status)}</td>
                          <td style={{ textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                              {/* View Action */}
                              <button
                                className="action-button"
                                title="View Requisition Details"
                                onClick={() => setSelectedDetailProduct(r)}
                                style={{ background: "#f8fafc", color: "#334155", border: "1px solid #cbd5e1" }}
                              >
                                <Eye size={14} /> View
                              </button>

                              {/* Pending -> Approve & Reject */}
                              {r.status === "PENDING" && (
                                <>
                                  <button
                                    className="action-button"
                                    title="Approve Requisition"
                                    disabled={actionLoading === r.productId}
                                    onClick={() => handleApprove(r.productId)}
                                    style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}
                                  >
                                    <Check size={14} /> Approve
                                  </button>
                                  <button
                                    className="action-button"
                                    title="Reject Requisition"
                                    disabled={actionLoading === r.productId}
                                    onClick={() => handleOpenRejectModal(r)}
                                    style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca" }}
                                  >
                                    <X size={14} /> Reject
                                  </button>
                                </>
                              )}

                              {/* Approved -> Select Supplier & Pay */}
                              {r.status === "APPROVED" && (
                                <>
                                  <button
                                    className="action-button"
                                    title="Select Supplier Partner"
                                    onClick={() => handleOpenSupplierSelection(r)}
                                    style={{ background: "#e0f2fe", color: "#0284c7", border: "1px solid #bae6fd" }}
                                  >
                                    <Building2 size={14} /> Select Supplier
                                  </button>
                                  <button
                                    className="action-button"
                                    title="Pay with UPI or QR Code"
                                    onClick={() => {
                                      setPaymentProduct(r);
                                      setPaymentSupplier(suppliers[0] || null);
                                      setPaymentMethod("UPI");
                                      setPaymentStep("INPUT");
                                    }}
                                    style={{ background: "#0284c7", color: "#ffffff", border: "1px solid #0284c7" }}
                                  >
                                    <CreditCard size={14} /> Make Payment
                                  </button>
                                </>
                              )}

                              {r.status === "ORDER_PLACED" && (
                                <span style={{ fontSize: "11px", color: "#15803d", fontWeight: "700", display: "flex", alignItems: "center", gap: "3px" }}>
                                  <CheckCircle size={14} /> Placed
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" style={{ textAlign: "center", padding: "40px" }}>
                          <Package size={36} color="#94a3b8" style={{ margin: "0 auto 10px" }} />
                          <div style={{ color: "#0f172a", fontWeight: "700" }}>No requisitions found</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderTop: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>
                    Showing page <b>{currentPage}</b> of <b>{totalPages}</b> ({totalItems} requisitions in ASC order)
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
          </div>
        )}

        {/* ================= VIEW 3: ORDER MANAGEMENT ================= */}
        {activeNav === "ORDERS" && (
          <div className="admin-content">
            <div className="admin-page-title">
              <div>
                <h1>Enterprise Order Management</h1>
                <p className="admin-page-desc">
                  Monitor the full lifecycle of all orders. Supplier partners update delivery milestones in real-time.
                </p>
              </div>
            </div>

            <div className="admin-panel">
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Request ID</th>
                      <th>Product Name</th>
                      <th>Requester</th>
                      <th>Supplier Partner</th>
                      <th>Quantity</th>
                      <th>Total Amount</th>
                      <th>Payment Status</th>
                      <th>Order Status</th>
                      <th>Order Date</th>
                      <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.length === 0 ? (
                      <tr>
                        <td colSpan="11" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                          No enterprise orders recorded yet.
                        </td>
                      </tr>
                    ) : (
                      allOrders.map((o) => (
                        <tr key={o.orderId || o.id}>
                          <td><span style={{ fontFamily: "monospace", fontWeight: "800", color: "#0284c7" }}>{o.orderId}</span></td>
                          <td>REQ-{o.product?.productId || o.productId || "—"}</td>
                          <td><strong style={{ color: "#0f172a" }}>{o.productName}</strong></td>
                          <td>{o.user?.username || o.userName || "Employee"}</td>
                          <td><strong>{o.supplier?.supplierName || o.supplierName || "Supplier"}</strong></td>
                          <td>{o.quantity}</td>
                          <td><strong style={{ color: "#0284c7" }}>₹{o.totalAmount?.toLocaleString()}</strong></td>
                          <td><span style={{ color: "#15803d", fontWeight: "700" }}>✓ {o.paymentStatus || "COMPLETED"}</span></td>
                          <td>{getStatusBadge(o.status)}</td>
                          <td><span style={{ fontSize: "12px", color: "#64748b" }}>{o.orderDate ? new Date(o.orderDate).toLocaleDateString() : "—"}</span></td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              className="action-button"
                              onClick={() => setSelectedOrderDetails(o)}
                              style={{ background: "#f8fafc", color: "#0284c7", border: "1px solid #cbd5e1" }}
                            >
                              <Eye size={14} /> View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 4: SUPPLIER MANAGEMENT ================= */}
        {activeNav === "SUPPLIERS" && (
          <div className="admin-content">
            <div className="admin-page-title">
              <div>
                <h1>Supplier Performance & Management</h1>
                <p className="admin-page-desc">
                  Individual supplier metrics, delivery fulfillment performance, and procurement value allocations.
                </p>
              </div>
            </div>

            <div className="admin-panel">
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Supplier Name</th>
                      <th>Total Orders</th>
                      <th>Pending Orders</th>
                      <th>In Progress</th>
                      <th>Completed</th>
                      <th>Total Products</th>
                      <th>Total Quantity</th>
                      <th>Total Order Value</th>
                      <th>Success Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierPerformances.length === 0 ? (
                      suppliers.map(s => (
                        <tr key={s.supplierId}>
                          <td>
                            <strong style={{ color: "#0f172a" }}>{s.supplierName}</strong>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>{s.email} • {s.phone}</div>
                          </td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td><strong style={{ color: "#0284c7" }}>₹0</strong></td>
                          <td>100%</td>
                        </tr>
                      ))
                    ) : (
                      supplierPerformances.map(sp => (
                        <tr key={sp.supplierId}>
                          <td>
                            <strong style={{ color: "#0f172a" }}>{sp.supplierName}</strong>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>{sp.email} • {sp.phone}</div>
                          </td>
                          <td><strong>{sp.totalOrders}</strong></td>
                          <td><span style={{ color: "#f59e0b", fontWeight: "700" }}>{sp.pendingOrders}</span></td>
                          <td><span style={{ color: "#0284c7", fontWeight: "700" }}>{sp.processingOrders + sp.shippedOrders + sp.outForDeliveryOrders}</span></td>
                          <td><span style={{ color: "#15803d", fontWeight: "700" }}>{sp.completedOrders}</span></td>
                          <td>{sp.totalProductsOrdered}</td>
                          <td><strong>{sp.totalQuantity}</strong></td>
                          <td><strong style={{ color: "#0284c7" }}>₹{sp.totalProcurementValue?.toLocaleString()}</strong></td>
                          <td>
                            <span style={{ background: "#dcfce7", color: "#15803d", padding: "3px 8px", borderRadius: "6px", fontWeight: "700", fontSize: "12px" }}>
                              {sp.deliverySuccessRate || 100}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 5: PAYMENT HISTORY ================= */}
        {activeNav === "PAYMENTS" && (
          <div className="admin-content">
            <div className="admin-page-title">
              <div>
                <h1>Payment Disbursement History</h1>
                <p className="admin-page-desc">
                  Audit logs of all UPI and QR Code corporate treasury settlements.
                </p>
              </div>

              <button
                className="admin-btn-secondary"
                onClick={handleDownloadMasterCSB}
                disabled={downloadingCSB}
              >
                <Download size={16} />
                <span>Export Payment CSB</span>
              </button>
            </div>

            <div className="admin-panel">
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Product / Requisition</th>
                      <th>Supplier Partner</th>
                      <th>Disbursement Account</th>
                      <th>Amount</th>
                      <th>Payment Method</th>
                      <th>Payment Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                          No payment records found.
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p.paymentId}>
                          <td><span style={{ fontFamily: "monospace", color: "#0284c7", fontWeight: "700" }}>{p.transactionId || `TXN-${p.paymentId}`}</span></td>
                          <td><strong>{p.product?.name || "Procurement Item"}</strong> (REQ-{p.product?.productId})</td>
                          <td>{p.supplier?.supplierName || "Supplier Partner"}</td>
                          <td>{p.account?.accountHolderName || "Corporate Treasury Account"}</td>
                          <td><strong style={{ color: "#0284c7" }}>₹{p.amount?.toLocaleString()}</strong></td>
                          <td><span style={{ background: "#e0f2fe", color: "#0284c7", padding: "2px 8px", borderRadius: "6px", fontWeight: "700", fontSize: "11px" }}>{p.paymentMethod || "UPI"}</span></td>
                          <td><span style={{ fontSize: "12px", color: "#64748b" }}>{p.paymentDate ? new Date(p.paymentDate).toLocaleString() : "—"}</span></td>
                          <td><span style={{ color: "#15803d", fontWeight: "800" }}>✓ {p.paymentStatus || "COMPLETED"}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: REJECT REQUEST ================= */}
      {rejectingProduct && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: "480px" }}>
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <XCircle size={18} color="#ef4444" />
                <span>Reject Requisition • REQ-{rejectingProduct.productId}</span>
              </div>
              <button className="admin-modal-close" onClick={() => setRejectingProduct(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ padding: "20px 24px" }}>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 14px" }}>
                Please specify the reason for rejecting <b>{rejectingProduct.name}</b> requested by {rejectingProduct.user?.username}.
              </p>

              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>
                Rejection Reason *
              </label>
              <textarea
                rows="4"
                placeholder="Enter justification for rejection (e.g. Budget ceiling reached, redundant request)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  resize: "vertical"
                }}
              />
            </div>

            <div className="admin-modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button className="admin-btn-secondary" onClick={() => setRejectingProduct(null)}>
                Cancel
              </button>
              <button
                className="admin-btn-primary"
                onClick={handleConfirmReject}
                style={{ background: "#ef4444", borderColor: "#ef4444" }}
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SELECT SUPPLIER ================= */}
      {supplierSelectionProduct && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: "520px" }}>
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <Building2 size={18} color="#0284c7" />
                <span>Select Supplier • REQ-{supplierSelectionProduct.productId}</span>
              </div>
              <button className="admin-modal-close" onClick={() => setSupplierSelectionProduct(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ padding: "20px 24px" }}>
              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
                <div style={{ fontSize: "13px", marginBottom: "4px" }}>Product: <b>{supplierSelectionProduct.name}</b></div>
                <div style={{ fontSize: "13px", marginBottom: "4px" }}>Quantity: <b>{supplierSelectionProduct.numberOfQuantities} units</b></div>
                <div style={{ fontSize: "13px", marginBottom: "4px" }}>Unit Price: <b>₹{supplierSelectionProduct.pricePerProduct?.toLocaleString()}</b></div>
                <div style={{ fontSize: "15px", color: "#0284c7", fontWeight: "800" }}>Total Amount: ₹{supplierSelectionProduct.totalPrice?.toLocaleString()}</div>
              </div>

              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
                Choose Verified Supplier Partner *
              </label>
              <select
                value={chosenSupplierId}
                onChange={(e) => setChosenSupplierId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "14px"
                }}
              >
                {suppliers.map(s => (
                  <option key={s.supplierId} value={s.supplierId}>
                    {s.supplierName} ({s.email || s.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button className="admin-btn-secondary" onClick={() => setSupplierSelectionProduct(null)}>
                Cancel
              </button>
              <button className="admin-btn-primary" onClick={handleConfirmSupplierSelection}>
                Confirm Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: PAYMENT MODULE (UPI & QR CODE) ================= */}
      {paymentProduct && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: "560px" }}>
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <CreditCard size={18} color="#0284c7" />
                <span>Payment Authorization • REQ-{paymentProduct.productId}</span>
              </div>
              <button className="admin-modal-close" onClick={() => setPaymentProduct(null)}>
                <X size={18} />
              </button>
            </div>

            {paymentStep === "SUCCESS" ? (
              <div style={{ textAlign: "center", padding: "36px 24px" }}>
                <CheckCircle size={56} color="#10b981" style={{ margin: "0 auto 14px" }} />
                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px" }}>
                  Payment Successful!
                </h3>
                <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 20px" }}>
                  Order <b>#{completedOrderInfo?.orderId}</b> has been placed successfully with {completedOrderInfo?.supplierName}.
                </p>

                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "left", fontSize: "13px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: "#64748b" }}>Transaction ID:</span>
                    <strong style={{ fontFamily: "monospace" }}>{completedOrderInfo?.transactionId}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: "#64748b" }}>Disbursed Amount:</span>
                    <strong style={{ color: "#0284c7" }}>₹{completedOrderInfo?.amount?.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Fulfillment Partner:</span>
                    <strong>{completedOrderInfo?.supplierName}</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                  <button
                    className="admin-btn-primary"
                    onClick={() => {
                      setPaymentProduct(null);
                      setActiveNav("ORDERS");
                    }}
                  >
                    <Truck size={16} />
                  </button>
                  <button
                    className="admin-btn-secondary"
                    onClick={() => setPaymentProduct(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="admin-modal-body" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* Payment Overview */}
                <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
                  <div>
                    <span style={{ color: "#64748b" }}>Product:</span>
                    <div style={{ fontWeight: "700", color: "#0f172a" }}>{paymentProduct.name}</div>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Supplier:</span>
                    <div style={{ fontWeight: "700", color: "#0f172a" }}>{paymentSupplier?.supplierName || "Supplier Partner"}</div>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Requester:</span>
                    <div style={{ fontWeight: "700", color: "#0f172a" }}>{paymentProduct.user?.username || "Employee"}</div>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Quantity & Rate:</span>
                    <div style={{ fontWeight: "700", color: "#0f172a" }}>{paymentProduct.numberOfQuantities} × ₹{paymentProduct.pricePerProduct?.toLocaleString()}</div>
                  </div>
                </div>

                {/* Total Disbursement Banner */}
                <div style={{ padding: "14px 18px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#0369a1" }}>Total Disbursement Amount</span>
                  <span style={{ fontSize: "20px", fontWeight: "900", color: "#0284c7" }}>₹{paymentProduct.totalPrice?.toLocaleString()}</span>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
                    Select Corporate Payment Method
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("UPI")}
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        border: paymentMethod === "UPI" ? "2px solid #0284c7" : "1px solid #cbd5e1",
                        background: paymentMethod === "UPI" ? "#e0f2fe" : "#ffffff",
                        color: paymentMethod === "UPI" ? "#0284c7" : "#334155",
                        fontWeight: "800",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                      }}
                    >
                      <DollarSign size={16} /> Corporate UPI
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("QR")}
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        border: paymentMethod === "QR" ? "2px solid #0284c7" : "1px solid #cbd5e1",
                        background: paymentMethod === "QR" ? "#e0f2fe" : "#ffffff",
                        color: paymentMethod === "QR" ? "#0284c7" : "#334155",
                        fontWeight: "800",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                      }}
                    >
                      <QrCode size={16} /> Dynamic QR Code
                    </button>
                  </div>
                </div>

                {/* UPI Mode */}
                {paymentMethod === "UPI" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>Corporate UPI ID *</label>
                    <input
                      type="text"
                      placeholder="e.g. admin@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "14px",
                        fontWeight: "600"
                      }}
                    />
                    <span style={{ fontSize: "11px", color: "#64748b" }}>
                      Instant bank settlement will be executed via corporate UPI gateway.
                    </span>
                  </div>
                )}

                {/* QR Code Mode */}
                {paymentMethod === "QR" && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "10px 0" }}>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                      Scan QR Code to Pay
                    </span>
                    <QRCodeDisplay
                      value={`upi://pay?pa=smartprocure@treasury&pn=SmartProcure&am=${paymentProduct.totalPrice}&cu=INR&tn=REQ-${paymentProduct.productId}`}
                      size={170}
                      amount={paymentProduct.totalPrice}
                      orderId={`REQ-${paymentProduct.productId}`}
                    />
                    <span style={{ fontSize: "12px", color: "#64748b", textAlign: "center" }}>
                      Scan this QR code using any supported UPI application.
                    </span>
                  </div>
                )}
              </div>
            )}

            {paymentStep !== "SUCCESS" && (
              <div className="admin-modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  className="admin-btn-secondary"
                  onClick={() => setPaymentProduct(null)}
                  disabled={paymentStep === "PROCESSING"}
                >
                  Cancel Payment
                </button>
                <button
                  className="admin-btn-primary"
                  onClick={handleExecutePayment}
                  disabled={paymentStep === "PROCESSING"}
                >
                  {paymentStep === "PROCESSING" ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : paymentMethod === "QR" ? (
                    <>
                      <Check size={16} />
                      <span>I've Completed Payment</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Proceed with UPI Payment</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: REQUISITION DOSSIER ================= */}
      {selectedDetailProduct && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <Layers size={18} color="#0284c7" />
                <span>Requisition Dossier • REQ-{selectedDetailProduct.productId}</span>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedDetailProduct(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ padding: "20px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div><span style={{ color: "#64748b", fontSize: "12px" }}>Product Name:</span><div style={{ fontWeight: "800", color: "#0f172a" }}>{selectedDetailProduct.name}</div></div>
                <div><span style={{ color: "#64748b", fontSize: "12px" }}>Category:</span><div style={{ fontWeight: "700" }}>{selectedDetailProduct.category?.categoryName || "General"}</div></div>
                <div><span style={{ color: "#64748b", fontSize: "12px" }}>Requested By:</span><div style={{ fontWeight: "700" }}>{selectedDetailProduct.user?.username || "Employee"}</div></div>
                <div><span style={{ color: "#64748b", fontSize: "12px" }}>Department:</span><div style={{ fontWeight: "700" }}>{selectedDetailProduct.department?.departmentName || "General"}</div></div>
                <div><span style={{ color: "#64748b", fontSize: "12px" }}>Quantity:</span><div style={{ fontWeight: "700" }}>{selectedDetailProduct.numberOfQuantities} units</div></div>
                <div><span style={{ color: "#64748b", fontSize: "12px" }}>Unit Price:</span><div style={{ fontWeight: "700" }}>₹{selectedDetailProduct.pricePerProduct?.toLocaleString()}</div></div>
                <div><span style={{ color: "#64748b", fontSize: "12px" }}>Total Amount:</span><div style={{ fontWeight: "900", color: "#0284c7", fontSize: "16px" }}>₹{selectedDetailProduct.totalPrice?.toLocaleString()}</div></div>
                <div><span style={{ color: "#64748b", fontSize: "12px" }}>Status:</span><div>{getStatusBadge(selectedDetailProduct.status)}</div></div>
              </div>
              {selectedDetailProduct.description && (
                <div style={{ marginTop: "14px", background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Business Justification</span>
                  <p style={{ margin: "4px 0 0", color: "#334155", fontSize: "13px" }}>{selectedDetailProduct.description}</p>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setSelectedDetailProduct(null)}>
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ORDER DETAILS ================= */}
      {selectedOrderDetails && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: "600px" }}>
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <Truck size={18} color="#0284c7" />
                <span>Enterprise Order • {selectedOrderDetails.orderId}</span>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedOrderDetails(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ padding: "20px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px" }}>
                <div><span style={{ color: "#64748b" }}>Order ID:</span><div style={{ fontWeight: "800", color: "#0284c7" }}>{selectedOrderDetails.orderId}</div></div>
                <div><span style={{ color: "#64748b" }}>Request Ref:</span><div style={{ fontWeight: "700" }}>REQ-{selectedOrderDetails.product?.productId || selectedOrderDetails.productId || "—"}</div></div>
                <div><span style={{ color: "#64748b" }}>Product Name:</span><div style={{ fontWeight: "700" }}>{selectedOrderDetails.productName}</div></div>
                <div><span style={{ color: "#64748b" }}>Supplier Partner:</span><div style={{ fontWeight: "700" }}>{selectedOrderDetails.supplier?.supplierName || selectedOrderDetails.supplierName || "Partner"}</div></div>
                <div><span style={{ color: "#64748b" }}>Requester:</span><div style={{ fontWeight: "700" }}>{selectedOrderDetails.user?.username || "Employee"}</div></div>
                <div><span style={{ color: "#64748b" }}>Quantity:</span><div style={{ fontWeight: "700" }}>{selectedOrderDetails.quantity} units</div></div>
                <div><span style={{ color: "#64748b" }}>Disbursed Amount:</span><div style={{ fontWeight: "900", color: "#0284c7" }}>₹{selectedOrderDetails.totalAmount?.toLocaleString()}</div></div>
                <div><span style={{ color: "#64748b" }}>Order Status:</span><div>{getStatusBadge(selectedOrderDetails.status)}</div></div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setSelectedOrderDetails(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
