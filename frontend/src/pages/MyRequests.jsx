import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, Plus, FileText, Menu, ShoppingCart, ChevronDown, Bell, LogOut,
  Search, Download, Trash2, Eye, Star, X, Check, Clock3, CheckCircle, XCircle, Package, Truck,
  ChevronLeft, ChevronRight, RefreshCw
} from "lucide-react";
import NotificationBell from "../components/NotificationBell";
import "./Dashboard.css";

const API_URL = "http://localhost:8080";

function MyRequests() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [message, setMessage] = useState({ text: "", type: "" });

  // Server-side Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [ratingRequest, setRatingRequest] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingReview, setRatingReview] = useState("");
  const [ratingSupplierId, setRatingSupplierId] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchRequests(parsedUser.userId, currentPage, pageSize, search, filter);
      fetchSuppliers();
    } else {
      navigate("/login");
    }
  }, [navigate, currentPage, pageSize, filter]);

  // Debounced search
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      fetchRequests(user.userId, 1, pageSize, search, filter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchRequests = async (userId, page = 1, limit = 10, q = "", statusFilter = "ALL") => {
    setLoading(true);
    try {
      let url = `${API_URL}/product/user/${userId}/paginated?page=${page}&limit=${limit}&sortOrder=asc`;
      if (q && q.trim()) {
        url += `&search=${encodeURIComponent(q.trim())}`;
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
        // Fallback: legacy endpoint
        const fallbackRes = await fetch(`${API_URL}/product/user/${userId}`);
        if (fallbackRes.ok) {
          const allData = await fallbackRes.json();
          setRequests(allData);
          setTotalItems(allData.length);
          setTotalPages(Math.ceil(allData.length / limit) || 1);
        }
      }
    } catch (err) {
      console.error("Error fetching requests", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${API_URL}/supplier`);
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data);
        if (data.length > 0) {
          setRatingSupplierId(data[0].supplierId);
        }
      }
    } catch (err) {
      console.error("Error fetching suppliers", err);
    }
  };

  const handleDeleteRequest = async (productId) => {
    if (!window.confirm(`Are you sure you want to cancel and delete Request REQ-${productId}?`)) return;

    try {
      const res = await fetch(`${API_URL}/product/${productId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessage({ text: `Request REQ-${productId} was cancelled successfully.`, type: "success" });
        if (user?.userId) fetchRequests(user.userId, currentPage, pageSize, search, filter);
      } else {
        setMessage({ text: "Failed to delete request.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Network error deleting request.", type: "error" });
    }
  };

  const handleOpenRatingModal = (request) => {
    setRatingRequest(request);
    setRatingValue(5);
    setRatingReview("");
    if (suppliers.length > 0) {
      setRatingSupplierId(suppliers[0].supplierId);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!ratingRequest || !ratingSupplierId) return;

    setSubmittingRating(true);
    try {
      const payload = {
        rating: Number(ratingValue),
        review: ratingReview || "Great quality product.",
        product: { productId: ratingRequest.productId },
        supplier: { supplierId: Number(ratingSupplierId) },
      };

      const res = await fetch(`${API_URL}/product-rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({ text: "Thank you! Your rating and review have been submitted.", type: "success" });
        setRatingRequest(null);
      } else {
        setMessage({ text: "Error submitting product rating.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Network error submitting rating.", type: "error" });
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleDownloadCSB = async () => {
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
      } else {
        alert("No completed payment settlement records found for CSB export.");
      }
    } catch (err) {
      console.error("CSB download error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <span className="request-status pending">● Pending Review</span>;
      case "APPROVED":
        return <span className="request-status approved">● Approved</span>;
      case "ORDER_PLACED":
        return <span className="request-status order-placed">✓ Order Placed</span>;
      case "REJECTED":
        return <span className="request-status rejected">✕ Rejected</span>;
      default:
        return <span className="request-status">{status}</span>;
    }
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
          <Link to="/employee/my-requests" className="sidebar-item active">
            <FileText size={19} /><span>My Requests</span>
          </Link>
          <div className="sidebar-section-title">Order Fulfillment</div>
          <Link to="/track-orders" className="sidebar-item">
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
            <NotificationBell currentUser={user} />
            <button className="notification-button" onClick={() => fetchRequests(user?.userId, currentPage, pageSize, search, filter)} title="Refresh Requests">
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
              <h1>My Requisitions</h1>
              <p className="welcome-text">Track, inspect, and evaluate your procurement requisitions in real time.</p>
            </div>
            <div className="heading-actions" style={{ display: "flex", gap: "10px" }}>
              <button className="download-button" onClick={handleDownloadCSB}>
                <Download size={16} />
                <span>Download CSB Report</span>
              </button>
              <button className="raise-button" onClick={() => navigate("/raise-request")}>
                <Plus size={16} />
                <span>Raise New Request</span>
              </button>
            </div>
          </div>

          {/* Feedback Alert */}
          {message.text && (
            <div style={{
              padding: "12px 18px",
              borderRadius: "10px",
              marginBottom: "20px",
              backgroundColor: message.type === "success" ? "#f0fdf4" : "#fef2f2",
              color: message.type === "success" ? "#15803d" : "#b91c1c",
              border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`,
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
              padding: "16px 20px",
              borderBottom: "1px solid var(--sp-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              background: "#fafafa"
            }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  { key: "ALL", label: `All (${totalItems})` },
                  { key: "PENDING", label: "Pending" },
                  { key: "APPROVED", label: "Approved" },
                  { key: "ORDER_PLACED", label: "Order Placed" },
                  { key: "REJECTED", label: "Rejected" },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => { setFilter(tab.key); setCurrentPage(1); }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      border: filter === tab.key ? "none" : "1px solid #cbd5e1",
                      background: filter === tab.key ? "var(--sp-primary-gradient)" : "#ffffff",
                      color: filter === tab.key ? "#ffffff" : "#475569",
                      boxShadow: filter === tab.key ? "0 2px 8px var(--sp-primary-glow)" : "none"
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ position: "relative", minWidth: "260px" }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                <input
                  type="text"
                  placeholder="Search item, category, dept..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  style={{ width: "100%", padding: "8px 14px 8px 36px" }}
                />
              </div>
            </div>

            {/* Table */}
            <div style={{ width: "100%", overflowX: "auto" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 10px", color: "#0284c7" }} />
                  <p>Loading your requisitions...</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Req Code</th>
                      <th>Product & Category</th>
                      <th>Department</th>
                      <th>Quantity & Rate</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length > 0 ? (
                      requests.map(r => (
                        <tr key={r.productId}>
                          <td>
                            <span style={{
                              fontFamily: "monospace",
                              fontWeight: "700",
                              color: "#0284c7",
                              background: "#e0f2fe",
                              padding: "4px 8px",
                              borderRadius: "6px"
                            }}>
                              REQ-{r.productId}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: "#0f172a", display: "block" }}>{r.name}</strong>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>
                              {r.category?.categoryName || "General Item"}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              background: "#f1f5f9",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              color: "#334155"
                            }}>
                              {r.department?.departmentName || "General"}
                            </span>
                          </td>
                          <td>
                            <span style={{ color: "#475569" }}>
                              {r.numberOfQuantities} × ₹{r.pricePerProduct}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: "#15803d", fontSize: "15px" }}>₹{r.totalPrice}</strong>
                          </td>
                          <td>{getStatusBadge(r.status)}</td>
                          <td style={{ color: "#64748b", fontSize: "13px" }}>
                            {r.createdDate ? new Date(r.createdDate).toLocaleDateString() : "Recently"}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                              {/* View Details */}
                              <button
                                onClick={() => setSelectedRequest(r)}
                                title="View Details"
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  background: "#f0f9ff",
                                  border: "1px solid #bae6fd",
                                  color: "#0284c7",
                                  cursor: "pointer"
                                }}
                              >
                                <Eye size={14} />
                              </button>

                              {/* Rate Product (For Approved/Order Placed) */}
                              {(r.status === "APPROVED" || r.status === "ORDER_PLACED") && (
                                <button
                                  onClick={() => handleOpenRatingModal(r)}
                                  title="Rate Supplier & Product"
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    background: "#fef3c7",
                                    border: "1px solid #fde68a",
                                    color: "#d97706",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    fontSize: "11px",
                                    fontWeight: "700"
                                  }}
                                >
                                  <Star size={13} fill="#d97706" /> Rate
                                </button>
                              )}

                              {/* Cancel/Delete (If Pending) */}
                              {r.status === "PENDING" && (
                                <button
                                  onClick={() => handleDeleteRequest(r.productId)}
                                  title="Cancel Request"
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    background: "#fee2e2",
                                    border: "1px solid #fecaca",
                                    color: "#dc2626",
                                    cursor: "pointer"
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                          No matching requisitions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            {totalItems > 0 && (
              <div style={{
                padding: "16px 20px",
                borderTop: "1px solid var(--sp-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "14px",
                background: "#fafafa"
              }}>
                <div style={{ fontSize: "13px", color: "#64748b" }}>
                  Showing <strong style={{ color: "#0f172a" }}>{(currentPage - 1) * pageSize + 1}</strong> to{" "}
                  <strong style={{ color: "#0f172a" }}>{Math.min(currentPage * pageSize, totalItems)}</strong> of{" "}
                  <strong style={{ color: "#0f172a" }}>{totalItems}</strong> requisitions (Sorted in ASC order)
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#64748b" }}>
                    <span>Rows per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      style={{
                        padding: "4px 8px",
                        background: "#ffffff",
                        border: "1px solid var(--sp-border)",
                        borderRadius: "6px",
                        color: "#0f172a",
                        fontSize: "12px"
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        background: currentPage <= 1 ? "#f1f5f9" : "#ffffff",
                        border: "1px solid var(--sp-border)",
                        color: currentPage <= 1 ? "#94a3b8" : "#0f172a",
                        cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px"
                      }}
                    >
                      <ChevronLeft size={14} /> Previous
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
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        background: currentPage >= totalPages ? "#f1f5f9" : "#ffffff",
                        border: "1px solid var(--sp-border)",
                        color: currentPage >= totalPages ? "#94a3b8" : "#0f172a",
                        cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px"
                      }}
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ================= VIEW DETAILS MODAL (LIGHT THEME) ================= */}
      {selectedRequest && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.5)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "500px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            overflow: "hidden"
          }}>
            <div style={{
              padding: "16px 22px",
              background: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ fontWeight: "800", color: "#0f172a", fontSize: "16px" }}>
                Requisition Breakdown • REQ-{selectedRequest.productId}
              </div>
              <button onClick={() => setSelectedRequest(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{
                background: "#f0fdf4",
                padding: "14px 18px",
                borderRadius: "10px",
                border: "1px solid #bbf7d0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <div style={{ fontWeight: "800", fontSize: "16px", color: "#0f172a" }}>{selectedRequest.name}</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>{selectedRequest.category?.categoryName || "General Item"}</div>
                </div>
                <div style={{ fontSize: "20px", fontWeight: "900", color: "#15803d" }}>
                  ₹{selectedRequest.totalPrice}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Department</span>
                  <strong style={{ color: "#0f172a" }}>{selectedRequest.department?.departmentName || "-"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Requested On</span>
                  <strong style={{ color: "#0f172a" }}>{selectedRequest.createdDate ? new Date(selectedRequest.createdDate).toLocaleDateString() : "-"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Quantity</span>
                  <strong style={{ color: "#0f172a" }}>{selectedRequest.numberOfQuantities} Units</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Rate / Unit</span>
                  <strong style={{ color: "#0f172a" }}>₹{selectedRequest.pricePerProduct}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Status</span>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>

              {selectedRequest.description && (
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <span style={{ color: "#64748b", fontSize: "12px", display: "block", marginBottom: "4px", fontWeight: "700" }}>Description / Justification</span>
                  <p style={{ margin: 0, fontSize: "13px", color: "#334155" }}>{selectedRequest.description}</p>
                </div>
              )}

              <button
                onClick={() => setSelectedRequest(null)}
                className="raise-button"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= RATE PRODUCT & SUPPLIER MODAL (LIGHT THEME) ================= */}
      {ratingRequest && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.5)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "460px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            overflow: "hidden"
          }}>
            <div style={{
              padding: "16px 22px",
              background: "#fefce8",
              borderBottom: "1px solid #fef08a",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ fontWeight: "800", color: "#a16207", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Star size={18} fill="#a16207" /> Rate Product & Supplier
              </div>
              <button onClick={() => setRatingRequest(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitRating} style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <strong style={{ color: "#0f172a", display: "block" }}>{ratingRequest.name}</strong>
                <span style={{ fontSize: "12px", color: "#64748b" }}>REQ-{ratingRequest.productId} • ₹{ratingRequest.totalPrice}</span>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>Select Supplier to Rate</label>
                <select
                  value={ratingSupplierId}
                  onChange={e => setRatingSupplierId(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px" }}
                >
                  {suppliers.map(s => (
                    <option key={s.supplierId} value={s.supplierId}>{s.supplierName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>Star Rating (1 to 5)</label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingValue(star)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "2px"
                      }}
                    >
                      <Star
                        size={26}
                        color={star <= ratingValue ? "#f59e0b" : "#cbd5e1"}
                        fill={star <= ratingValue ? "#f59e0b" : "none"}
                      />
                    </button>
                  ))}
                  <span style={{ marginLeft: "8px", fontWeight: "800", color: "#d97706", fontSize: "15px" }}>
                    {ratingValue} / 5
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>Feedback / Review</label>
                <textarea
                  placeholder="Share delivery speed, item quality, or packaging feedback..."
                  rows={3}
                  value={ratingReview}
                  onChange={e => setRatingReview(e.target.value)}
                  style={{ width: "100%", padding: "10px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <button
                  type="button"
                  onClick={() => setRatingRequest(null)}
                  className="download-button"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="raise-button"
                  style={{ flex: 2, justifyContent: "center" }}
                >
                  {submittingRating ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyRequests;
