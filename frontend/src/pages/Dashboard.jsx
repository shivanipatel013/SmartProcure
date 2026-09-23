import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Plus,
  FileText,
  CheckCircle,
  Package,
  LogOut,
  Bell,
  Download,
  Menu,
  ShoppingCart,
  Clock3,
  XCircle,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Truck
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import "./Dashboard.css";

const API_URL = "http://localhost:8080";

function Dashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchUserData(parsedUser.userId);
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.log("User data not available", error);
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserData = async (userId) => {
    setLoading(true);
    try {
      let data = [];
      const res = await fetch(`${API_URL}/product/user/${userId}`);
      if (res.ok) {
        data = await res.json();
      } else {
        const resAll = await fetch(`${API_URL}/product/getAllProducts`);
        if (resAll.ok) {
          const allData = await resAll.json();
          data = allData.filter((r) => r.user?.userId === userId);
        }
      }

      const pending = data.filter((r) => r.status === "PENDING").length;
      const approved = data.filter((r) => r.status === "APPROVED" || r.status === "ORDER_PLACED").length;
      const rejected = data.filter((r) => r.status === "REJECTED").length;

      setStats({
        total: data.length,
        pending,
        approved,
        rejected,
      });

      const recent = data
        .slice(-6)
        .reverse()
        .map((r) => ({
          id: `REQ-${r.productId}`,
          title: r.name,
          rawStatus: r.status,
          status:
            r.status === "ORDER_PLACED"
              ? "Order Placed"
              : r.status === "APPROVED"
              ? "Approved"
              : r.status === "REJECTED"
              ? "Rejected"
              : "Pending",
          time: r.createdDate
            ? new Date(r.createdDate).toLocaleDateString()
            : "Recently",
          amount: r.totalPrice,
          category: r.category?.categoryName || "General",
        }));

      setRecentRequests(recent);
    } catch (error) {
      console.log("Error loading user dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = () => {
    if (!user) return "User";
    return user.username || user.userName || user.name || "User";
  };

  const getInitials = () => {
    const name = getUserName();
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const downloadCSBOrCSV = async () => {
    if (!user || !user.userId) return;

    try {
      const res = await fetch(`${API_URL}/payment/csb/${user.userId}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `user_${user.userId}_CSB.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
    } catch (err) {
      console.log("No CSB on server, exporting live CSV", err);
    }

    const headers = ["Request ID", "Product Name", "Category", "Amount", "Status", "Date"];
    const rows = recentRequests.map((r) => [
      r.id,
      r.title,
      r.category,
      `₹${r.amount}`,
      r.status,
      r.time,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SmartProcure_Requests_${getUserName()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalSum = stats.total || 1;
  const pendingPct = stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0;
  const approvedPct = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
  const rejectedPct = stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0;

  return (
    <div className="dashboard-layout">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`dashboard-sidebar ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
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
          <Link to="/dashboard" className="sidebar-item active">
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </Link>

          <div className="sidebar-section-title">Request Management</div>
          <Link to="/raise-request" className="sidebar-item">
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

      {/* ================= MAIN CONTENT ================= */}
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
            <NotificationBell currentUser={user} />

            <div className="header-divider" />

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

        {/* Dashboard Content */}
        <section className="dashboard-content">
          {/* Welcome & Actions */}
          <div className="page-heading">
            <div>
              <h1>Welcome back, {getUserName()} 👋</h1>
              <p className="welcome-text">
                Track your procurement requests, check authorization states, and download settlement reports.
              </p>
            </div>

            <div className="heading-actions" style={{ display: "flex", gap: "10px" }}>
              <button
                className="download-button"
                onClick={downloadCSBOrCSV}
                title="Download Settlement CSB / CSV"
              >
                <Download size={16} />
                <span>Export Report</span>
              </button>

              <button
                className="raise-button"
                onClick={() => navigate("/raise-request")}
              >
                <Plus size={16} />
                <span>Raise New Request</span>
              </button>
            </div>
          </div>

          {/* ================= STATS CARDS ================= */}
          <div className="stats-grid">
            <div
              className="stat-card raised"
              onClick={() => navigate("/employee/my-requests")}
              style={{ cursor: "pointer" }}
            >
              <div className="stat-top">
                <div className="stat-icon">
                  <FileText size={22} />
                </div>
                <div className="stat-info">
                  <span className="stat-title">Total Raised</span>
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-subtitle">All Requisitions</div>
                </div>
              </div>
            </div>

            <div
              className="stat-card pending"
              onClick={() => navigate("/employee/my-requests")}
              style={{ cursor: "pointer" }}
            >
              <div className="stat-top">
                <div className="stat-icon">
                  <Clock3 size={22} />
                </div>
                <div className="stat-info">
                  <span className="stat-title">Pending Approvals</span>
                  <div className="stat-value">{stats.pending}</div>
                  <div className="stat-subtitle">Admin Review</div>
                </div>
              </div>
            </div>

            <div
              className="stat-card approved"
              onClick={() => navigate("/employee/my-requests")}
              style={{ cursor: "pointer" }}
            >
              <div className="stat-top">
                <div className="stat-icon">
                  <CheckCircle size={22} />
                </div>
                <div className="stat-info">
                  <span className="stat-title">Approved & Dispatched</span>
                  <div className="stat-value">{stats.approved}</div>
                  <div className="stat-subtitle">Ready / Settled</div>
                </div>
              </div>
            </div>

            <div
              className="stat-card rejected"
              onClick={() => navigate("/employee/my-requests")}
              style={{ cursor: "pointer" }}
            >
              <div className="stat-top">
                <div className="stat-icon">
                  <XCircle size={22} />
                </div>
                <div className="stat-info">
                  <span className="stat-title">Rejected Requests</span>
                  <div className="stat-value">{stats.rejected}</div>
                  <div className="stat-subtitle">Requires Attention</div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= LOWER PANELS ================= */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "20px" }}>
            {/* Status Breakdown Panel */}
            <div className="dashboard-panel" style={{ padding: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "16px" }}>Requisition Status Overview</h2>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "160px",
                    height: "160px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `conic-gradient(
                      #f59e0b 0% ${pendingPct}%,
                      #10b981 ${pendingPct}% ${pendingPct + approvedPct}%,
                      #ef4444 ${pendingPct + approvedPct}% 100%
                    )`,
                  }}
                >
                  <div style={{
                    width: "110px",
                    height: "110px",
                    borderRadius: "50%",
                    background: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <strong style={{ fontSize: "20px", color: "#0f172a" }}>{stats.total}</strong>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Total Requests</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#334155" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }} /> Pending</span>
                    <strong>{stats.pending} ({pendingPct}%)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#334155" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} /> Approved / Placed</span>
                    <strong>{stats.approved} ({approvedPct}%)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#334155" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} /> Rejected</span>
                    <strong>{stats.rejected} ({rejectedPct}%)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Requests List */}
            <div className="dashboard-panel" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>My Recent Requisitions</h2>
                <Link to="/employee/my-requests" style={{ fontSize: "13px", fontWeight: "700", color: "#0284c7" }}>View All →</Link>
              </div>

              {recentRequests.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {recentRequests.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        background: "#f8fafc",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0"
                      }}
                    >
                      <div>
                        <strong style={{ color: "#0f172a", fontSize: "14px", display: "block" }}>{r.title}</strong>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>{r.id} • {r.category} • {r.time}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: "800", color: "#15803d", fontSize: "14px" }}>₹{r.amount}</div>
                        <span style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          background: r.rawStatus === "APPROVED" || r.rawStatus === "ORDER_PLACED" ? "#dcfce7" : r.rawStatus === "REJECTED" ? "#fee2e2" : "#fef3c7",
                          color: r.rawStatus === "APPROVED" || r.rawStatus === "ORDER_PLACED" ? "#15803d" : r.rawStatus === "REJECTED" ? "#b91c1c" : "#b45309"
                        }}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  No recent requisitions. Click "Raise New Request" to get started.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;