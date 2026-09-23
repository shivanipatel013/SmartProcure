import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Package,
  Truck,
  CreditCard,
  FileText,
  AlertTriangle,
  X,
  CheckCheck,
  ExternalLink,
  Clock
} from "lucide-react";
import "./NotificationBell.css";

const API_URL = "http://localhost:8080";

export default function NotificationBell({ currentUser }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState("ALL"); // ALL | UNREAD
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const resolveUser = () => {
    if (currentUser) return currentUser;
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const user = resolveUser();

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const role = user.role || "USER";
      const userIdParam = user.userId ? `&userId=${user.userId}` : "";
      const res = await fetch(`${API_URL}/notifications?role=${encodeURIComponent(role)}${userIdParam}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      // quiet fail for background polling
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 12000);
    return () => clearInterval(interval);
  }, [user?.userId, user?.role]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH"
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.notificationId === id ? { ...n, read: true, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      const role = user.role || "USER";
      const userIdParam = user.userId ? `&userId=${user.userId}` : "";
      const res = await fetch(`${API_URL}/notifications/read-all?role=${encodeURIComponent(role)}${userIdParam}`, {
        method: "PATCH"
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const handleViewDetails = (n) => {
    setOpen(false);
    if (!n.isRead && !n.read) {
      handleMarkAsRead(n.notificationId);
    }

    const role = user?.role?.toUpperCase();
    if (role === "ADMIN") {
      navigate("/admin");
    } else if (role === "SUPPLIER") {
      navigate("/supplier/dashboard");
    } else {
      if (n.referenceType === "ORDER" || n.type?.includes("ORDER")) {
        navigate("/track-orders");
      } else {
        navigate("/employee/my-requests");
      }
    }
  };

  const renderIcon = (type) => {
    const t = (type || "").toUpperCase();
    if (t.includes("APPROVED") || t.includes("DELIVERED") || t.includes("RECEIVED")) {
      return (
        <div className="notification-icon-wrapper success">
          <CheckCircle2 size={18} />
        </div>
      );
    }
    if (t.includes("REJECTED") || t.includes("FAILED") || t.includes("CANCEL")) {
      return (
        <div className="notification-icon-wrapper error">
          <XCircle size={18} />
        </div>
      );
    }
    if (t.includes("PAYMENT")) {
      return (
        <div className="notification-icon-wrapper success">
          <CreditCard size={18} />
        </div>
      );
    }
    if (t.includes("SHIPPED") || t.includes("OUT_FOR_DELIVERY")) {
      return (
        <div className="notification-icon-wrapper warning">
          <Truck size={18} />
        </div>
      );
    }
    if (t.includes("ORDER")) {
      return (
        <div className="notification-icon-wrapper info">
          <Package size={18} />
        </div>
      );
    }
    return (
      <div className="notification-icon-wrapper info">
        <FileText size={18} />
      </div>
    );
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  const filteredList = notifications.filter((n) => {
    const isUnread = !n.read && !n.isRead;
    if (activeTab === "UNREAD") return isUnread;
    return true;
  });

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        type="button"
        className="notification-bell-btn"
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        title="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          {/* Header */}
          <div className="notification-panel-header">
            <div className="notification-panel-title">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="notification-count-tag">{unreadCount} new</span>
              )}
            </div>
            <div className="notification-panel-actions">
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="notification-mark-all-btn"
                  onClick={handleMarkAllAsRead}
                  title="Mark all as read"
                >
                  <CheckCheck size={14} style={{ display: "inline", marginRight: "3px" }} />
                  Mark All Read
                </button>
              )}
              <button
                type="button"
                className="notification-panel-close"
                onClick={() => setOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="notification-filter-tabs">
            <button
              type="button"
              className={`notification-filter-tab ${activeTab === "ALL" ? "active" : ""}`}
              onClick={() => setActiveTab("ALL")}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              className={`notification-filter-tab ${activeTab === "UNREAD" ? "active" : ""}`}
              onClick={() => setActiveTab("UNREAD")}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* List */}
          <div className="notification-list">
            {filteredList.length === 0 ? (
              <div className="notification-empty">
                <Bell size={28} />
                <p>{activeTab === "UNREAD" ? "No unread notifications" : "No notifications yet"}</p>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                  Status updates and events will appear here.
                </span>
              </div>
            ) : (
              filteredList.map((n) => {
                const isItemUnread = !n.read && !n.isRead;
                return (
                  <div
                    key={n.notificationId}
                    className={`notification-item ${isItemUnread ? "unread" : ""}`}
                    onClick={() => handleViewDetails(n)}
                  >
                    {renderIcon(n.type)}
                    <div className="notification-content">
                      <div className="notification-header-row">
                        <span className="notification-item-title">{n.title}</span>
                        <span className="notification-time">{formatTime(n.createdAt)}</span>
                      </div>
                      <p className="notification-item-msg">{n.message}</p>
                      <div className="notification-footer-actions">
                        <button
                          type="button"
                          className="notification-action-btn primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(n);
                          }}
                        >
                          View Details
                        </button>
                        {isItemUnread && (
                          <button
                            type="button"
                            className="notification-action-btn"
                            onClick={(e) => handleMarkAsRead(n.notificationId, e)}
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                    {isItemUnread && <div className="notification-unread-dot" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
