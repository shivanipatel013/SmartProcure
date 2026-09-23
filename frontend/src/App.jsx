import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RaiseRequest from "./pages/RaiseRequest";
import MyRequests from "./pages/MyRequests";
import TrackOrders from "./pages/TrackOrders";
import AdminDashboard from "./pages/AdminDashboard";
import SupplierDashboard from "./pages/SupplierDashboard";

function App() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User Flow */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/raise-request" element={<RaiseRequest />} />
      <Route path="/my-requests" element={<MyRequests />} />
      <Route path="/employee/my-requests" element={<MyRequests />} />
      <Route path="/track-orders" element={<TrackOrders />} />
      <Route path="/orders/track" element={<TrackOrders />} />

      {/* Admin Flow (1 Dedicated Page) */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* Supplier Flow (1 Dedicated Page) */}
      <Route path="/supplier" element={<SupplierDashboard />} />
      <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
      <Route path="/supplier/orders" element={<SupplierDashboard />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;