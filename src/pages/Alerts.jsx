import React, { useEffect, useState } from "react";
import "./Alerts.css";
import { fetchAdminAlerts } from "../lib/store";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function loadAlerts() {
      try {
        const response = await fetchAdminAlerts();
        setAlerts(response);
      } catch (error) {
        console.error("Alerts load failed:", error);
      }
    }
    loadAlerts();
  }, []);

  const markAsRead = (id) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)));
  };

  const deleteAlert = (id) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map((alert) => ({ ...alert, read: true })));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      case "low": return "#10b981";
      default: return "#3b82f6";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "low-stock": return "!";
      case "expiry": return "E";
      case "order": return "O";
      case "delivery": return "D";
      case "payment": return "P";
      default: return "N";
    }
  };

  const filteredAlerts = filter === "all" ? alerts : alerts.filter((alert) => (filter === "unread" ? !alert.read : alert.type === filter));
  const unreadCount = alerts.filter((alert) => !alert.read).length;

  return (
    <div className="alerts-container">
      <div className="alerts-header">
        <div>
          <h1>Alerts & Notifications</h1>
          <p className="unread-badge">{unreadCount} unread alerts</p>
        </div>
        <div className="alerts-actions">
          <button onClick={markAllAsRead} className="mark-all-btn">Mark All as Read</button>
        </div>
      </div>

      <div className="alerts-filters">
        {["all", "unread", "low-stock", "order", "payment", "delivery"].map((item) => (
          <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
            {item}
          </button>
        ))}
      </div>

      <div className="alerts-list">
        {filteredAlerts.length === 0 ? (
          <div className="no-alerts">
            <span>OK</span>
            <p>No alerts to display</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div key={alert.id} className={`alert-card ${!alert.read ? "unread" : ""}`} onClick={() => markAsRead(alert.id)}>
              <div className="alert-icon" style={{ background: getSeverityColor(alert.severity) }}>
                {getTypeIcon(alert.type)}
              </div>
              <div className="alert-content">
                <div className="alert-header">
                  <h3>{alert.title}</h3>
                  <span className="alert-time">{new Date(alert.date).toLocaleString()}</span>
                </div>
                <p className="alert-message">{alert.message}</p>
                {alert.medicine && (
                  <div className="alert-details">
                    <span>{alert.medicine}</span>
                    {alert.currentStock ? <span>Stock: {alert.currentStock}</span> : null}
                  </div>
                )}
              </div>
              <button
                className="delete-alert"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteAlert(alert.id);
                }}
              >
                x
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
