import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, Users, CreditCard, LogOut, Bell, Menu, ShoppingCart, ChevronDown,
  Download, CheckCircle, Search, Eye, X, Shield, RefreshCw, DollarSign, Truck
} from "lucide-react";
import "./Dashboard.css";

const API_URL = "http://localhost:8080";

function Payment() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
    fetchPayments();
  }, [navigate]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/payment`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSB = async (userId, username) => {
    try {
      const res = await fetch(`${API_URL}/payment/csb/${userId}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `user_${userId}_${username || "CSB"}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert("No CSB records available for download for this user.");
      }
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const handleExportAllPayments = () => {
    if (payments.length === 0) return;

    const headers = [
      "Payment ID", "Transaction ID", "Product", "Requester",
      "Supplier", "Bank Name", "Account Holder", "Amount", "Method", "Date", "Status"
    ];

    const rows = payments.map(p => [
      p.paymentId,
      p.transactionId,
      p.product?.name || "Product",
      p.product?.user?.username || "Employee",
      p.supplier?.supplierName || "Supplier",
      p.account?.bankName || "-",
      p.account?.accountHolderName || "-",
      `₹${p.amount || p.product?.totalPrice}`,
      p.paymentMethod || "UPI",
      p.paymentDate ? new Date(p.paymentDate).toLocaleString() : "-",
      p.paymentStatus || "COMPLETED"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SmartProcure_All_Payments_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const filteredPayments = payments.filter((p) => {
    const q = search.toLowerCase().trim();
    return (
      !q ||
      p.transactionId?.toLowerCase().includes(q) ||
      p.product?.name?.toLowerCase().includes(q) ||
      p.product?.user?.username?.toLowerCase().includes(q) ||
      p.supplier?.supplierName?.toLowerCase().includes(q) ||
      p.account?.bankName?.toLowerCase().includes(q) ||
      p.account?.accountHolderName?.toLowerCase().includes(q) ||
      p.paymentMethod?.toLowerCase().includes(q) ||
      String(p.paymentId).includes(q)
    );
  });

  const totalDisbursed = payments.reduce((sum, p) => sum + (p.amount || p.product?.totalPrice || 0), 0);

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
          <Link to="/suppliers" className="sidebar-item">
            <Users size={19} /><span>Suppliers Directory</span>
          </Link>
          <Link to="/payment" className="sidebar-item active">
            <CreditCard size={19} /><span>Payment History</span>
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
            <button className="notification-button" onClick={fetchPayments} title="Refresh Payments">
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
              <h1>Disbursement & Payment History</h1>
              <p className="welcome-text">Review settled procurement transactions, verify MPIN authorizations, and download CSB settlement files.</p>
            </div>
            <div className="heading-actions">
              <button className="download-button" onClick={handleExportAllPayments}>
                <Download size={16} />
                <span>Export All Transactions</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "18px",
            marginBottom: "24px"
          }}>
            <div style={{
              background: "linear-gradient(180deg, #0d1e34 0%, #081424 100%)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: "14px",
              padding: "18px 22px"
            }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Total Transactions</span>
              <div style={{ fontSize: "28px", fontWeight: "900", color: "#38bdf8", marginTop: "4px" }}>{payments.length}</div>
            </div>

            <div style={{
              background: "linear-gradient(180deg, #0c231b 0%, #06140f 100%)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              borderRadius: "14px",
              padding: "18px 22px"
            }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Total Disbursed Amount</span>
              <div style={{ fontSize: "28px", fontWeight: "900", color: "#34d399", marginTop: "4px" }}>₹{totalDisbursed}</div>
            </div>

            <div style={{
              background: "linear-gradient(180deg, #17122b 0%, #0c0918 100%)",
              border: "1px solid rgba(139, 92, 246, 0.25)",
              borderRadius: "14px",
              padding: "18px 22px"
            }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Security Status</span>
              <div style={{ fontSize: "22px", fontWeight: "800", color: "#c084fc", marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Shield size={20} /> 100% MPIN Verified
              </div>
            </div>
          </div>

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
              <div style={{ fontWeight: "700", color: "#ffffff", fontSize: "14px" }}>
                Settlement Records
              </div>

              <div style={{ position: "relative", minWidth: "280px" }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                <input
                  type="text"
                  placeholder="Search TXN ID, item, supplier..."
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
                  <p>Loading disbursement transactions...</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>TXN ID</th>
                      <th>Product & Requester</th>
                      <th>Supplier Partner</th>
                      <th>Bank & Account</th>
                      <th>Amount Disbursed</th>
                      <th>Mode</th>
                      <th>Date</th>
                      <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((p) => (
                        <tr key={p.paymentId}>
                          <td>
                            <span style={{
                              fontFamily: "monospace",
                              fontWeight: "700",
                              color: "#38bdf8",
                              background: "rgba(56, 189, 248, 0.12)",
                              padding: "4px 8px",
                              borderRadius: "6px"
                            }}>
                              {p.transactionId || `TXN-${p.paymentId}`}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: "#ffffff", display: "block" }}>{p.product?.name || "Product Item"}</strong>
                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                              By {p.product?.user?.username || "Employee"} (REQ-{p.product?.productId})
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: "#cbd5e1" }}>{p.supplier?.supplierName || "Supplier"}</strong>
                          </td>
                          <td>
                            <div style={{ fontSize: "13px" }}>
                              <span style={{ color: "#ffffff", fontWeight: "600" }}>{p.account?.bankName || "Corporate Bank"}</span>
                              <div style={{ fontSize: "11px", color: "#94a3b8" }}>{p.account?.accountNumber || "****"}</div>
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: "#34d399", fontSize: "15px" }}>₹{p.amount || p.product?.totalPrice}</strong>
                          </td>
                          <td>
                            <span style={{
                              padding: "3px 8px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: "700",
                              background: "rgba(0, 180, 216, 0.15)",
                              color: "#38bdf8"
                            }}>
                              {p.paymentMethod || "UPI"}
                            </span>
                          </td>
                          <td style={{ color: "#94a3b8", fontSize: "13px" }}>
                            {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "Completed"}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                              <button
                                onClick={() => setSelectedPayment(p)}
                                title="View Payment Details"
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  background: "rgba(255, 255, 255, 0.08)",
                                  border: "1px solid rgba(255, 255, 255, 0.1)",
                                  color: "#38bdf8",
                                  cursor: "pointer"
                                }}
                              >
                                <Eye size={14} />
                              </button>
                              {p.product?.user?.userId && (
                                <button
                                  onClick={() => handleDownloadCSB(p.product.user.userId, p.product.user.username)}
                                  title="Download User CSB CSV"
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    background: "rgba(16, 185, 129, 0.15)",
                                    border: "1px solid rgba(16, 185, 129, 0.4)",
                                    color: "#34d399",
                                    cursor: "pointer"
                                  }}
                                >
                                  <Download size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                          No payment records found. Payments executed in Admin Dashboard will appear here.
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

      {/* ================= PAYMENT DETAILS MODAL ================= */}
      {selectedPayment && (
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
              <div style={{ fontWeight: "800", color: "#ffffff", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <CreditCard size={18} color="#38bdf8" /> Transaction Receipt
              </div>
              <button onClick={() => setSelectedPayment(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{
                background: "rgba(16, 185, 129, 0.12)",
                padding: "16px 20px",
                borderRadius: "12px",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#34d399", textTransform: "uppercase" }}>Disbursed Amount</span>
                  <div style={{ fontSize: "24px", fontWeight: "900", color: "#ffffff", marginTop: "2px" }}>
                    ₹{selectedPayment.amount || selectedPayment.product?.totalPrice}
                  </div>
                </div>
                <div style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  background: "#10b981",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: "800",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  <CheckCircle size={14} /> COMPLETED
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                <div>
                  <span style={{ color: "#94a3b8", display: "block" }}>Transaction ID</span>
                  <strong style={{ color: "#38bdf8", fontFamily: "monospace" }}>{selectedPayment.transactionId || "-"}</strong>
                </div>
                <div>
                  <span style={{ color: "#94a3b8", display: "block" }}>Payment Mode</span>
                  <strong style={{ color: "#ffffff" }}>{selectedPayment.paymentMethod || "UPI"}</strong>
                </div>
                <div>
                  <span style={{ color: "#94a3b8", display: "block" }}>Product Requisition</span>
                  <strong style={{ color: "#ffffff" }}>{selectedPayment.product?.name || "-"}</strong>
                </div>
                <div>
                  <span style={{ color: "#94a3b8", display: "block" }}>Requester Employee</span>
                  <strong style={{ color: "#ffffff" }}>{selectedPayment.product?.user?.username || "-"}</strong>
                </div>
                <div>
                  <span style={{ color: "#94a3b8", display: "block" }}>Settlement Supplier</span>
                  <strong style={{ color: "#ffffff" }}>{selectedPayment.supplier?.supplierName || "-"}</strong>
                </div>
                <div>
                  <span style={{ color: "#94a3b8", display: "block" }}>Debit Account</span>
                  <strong style={{ color: "#ffffff" }}>{selectedPayment.account?.bankName || "-"}</strong>
                </div>
                <div>
                  <span style={{ color: "#94a3b8", display: "block" }}>Account Number</span>
                  <strong style={{ color: "#ffffff" }}>{selectedPayment.account?.accountNumber || "-"}</strong>
                </div>
                <div>
                  <span style={{ color: "#94a3b8", display: "block" }}>Timestamp</span>
                  <strong style={{ color: "#ffffff" }}>{selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate).toLocaleString() : "-"}</strong>
                </div>
              </div>

              <div style={{
                background: "rgba(0,0,0,0.3)",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                color: "#10b981"
              }}>
                <Shield size={16} /> Verified and authenticated via secure supplier MPIN authorization.
              </div>

              <button
                onClick={() => setSelectedPayment(null)}
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  background: "var(--sp-primary-gradient)",
                  border: "none",
                  color: "#ffffff",
                  fontWeight: "700",
                  cursor: "pointer",
                  marginTop: "6px"
                }}
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payment;
