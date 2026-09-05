import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { fetchAdminDashboard, updateOrderStatus } from "./lib/store";

export default function UltraDashboard({ deliveryPeople = [], setDeliveryPeople, orders = [], setOrders }) {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("");
  const [adminPhoto, setAdminPhoto] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const savedProfile = localStorage.getItem("adminProfile");
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      if (profile.fullName) setAdminName(profile.fullName.split(" ")[0]);
      if (profile.profilePhoto) setAdminPhoto(profile.profilePhoto);
    }

    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      if (!adminName && user.name) setAdminName(user.name.split(" ")[0]);
      if (!adminPhoto && user.profilePhoto) setAdminPhoto(user.profilePhoto);
    }
  }, [adminName, adminPhoto]);

  useEffect(() => {
    let ignore = false;
    async function loadDashboard() {
      setLoading(true);
      try {
        const data = await fetchAdminDashboard();
        if (!ignore) {
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Dashboard load failed:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadDashboard();
    return () => {
      ignore = true;
    };
  }, [setOrders]);

  const salesData = dashboardData?.salesData || [];
  const medicineData = dashboardData?.medicineData || [];
  const recentOrders = useMemo(() => dashboardData?.recentOrders || orders || [], [dashboardData, orders]);
  const filteredOrders = useMemo(
    () =>
      recentOrders.filter((order) =>
        `${order.customerName} ${order.medicine} ${order.deliveryPartner || ""} ${order.id}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [recentOrders, search]
  );
  const deliverySummary = dashboardData?.deliverySummary || {
    totalPartners: deliveryPeople.length,
    activeOrders: orders.filter((order) => order.status?.toLowerCase() !== "delivered").length,
    completedDeliveries: deliveryPeople.reduce((sum, partner) => sum + (partner.orders || 0), 0),
  };

  const handleOrderStatusChange = async (orderId, status) => {
    try {
      const response = await updateOrderStatus(orderId, status);
      const updatedOrder = response.order;
      setOrders?.((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)));
      setDashboardData((prev) =>
        prev
          ? {
              ...prev,
              recentOrders: prev.recentOrders.map((order) => (order.id === orderId ? updatedOrder : order)),
            }
          : prev
      );
      if (updatedOrder.deliveryPartner) {
        setDeliveryPeople?.((prev) =>
          prev.map((partner) =>
            partner.name === updatedOrder.deliveryPartner
              ? {
                  ...partner,
                  activeOrders:
                    status === "Delivered"
                      ? Math.max((partner.activeOrders || 1) - 1, 0)
                      : partner.activeOrders,
                  orders:
                    status === "Delivered"
                      ? (partner.orders || 0) + 1
                      : partner.orders,
                }
              : partner
          )
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(value || 0);

  return (
    <div className="wrapper">
      <div className="sidebar">
        <h2 className="logo">Pharmacy</h2>
        <p className="section">MAIN MENU</p>
        <button className="active">Dashboard</button>
        <button onClick={() => navigate("/delivery-team")}>Delivery Team</button>
        <button onClick={() => navigate("/admin/analytics")}>Analytics</button>
        <button onClick={() => navigate("/admin/alerts")}>Alerts</button>
        <button onClick={() => navigate("/admin/ai-recommendations")}>AI Insights</button>
        <button onClick={() => navigate("/admin/generate-report")}>Reports</button>
        <div className="profile-card">
          <p>Complete Profile</p>
          <button onClick={() => navigate("/profile")}>Verify Identity</button>
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <input
            className="search"
            placeholder="Search orders, customer, or delivery partner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "20px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "20px", borderRadius: "12px", color: "white" }}>
          <h3 style={{ margin: "0 0 10px 0" }}>Delivery Team Overview</h3>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <Metric label="Total Delivery Partners" value={deliverySummary.totalPartners} />
            <Metric label="Active Orders" value={deliverySummary.activeOrders} />
            <Metric label="Completed Deliveries" value={deliverySummary.completedDeliveries} />
            <Metric label="Admin" value={adminName || "Admin"} />
          </div>
        </div>

        <div className="cards">
          <div className="card green">
            <p>Today's Sales</p>
            <h2>{formatCurrency((recentOrders || []).filter((order) => new Date(order.createdAt).toDateString() === new Date().toDateString()).reduce((sum, order) => sum + Number(order.total || 0), 0))}</h2>
          </div>
          <div className="card teal">
            <p>Available Categories</p>
            <h2>{dashboardData?.stats?.totalCategories || 0}</h2>
          </div>
          <div className="card pink">
            <p>Low Stock Medicines</p>
            <h2>{dashboardData?.stats?.lowStockCount || 0}</h2>
          </div>
          <div className="card purple">
            <p>Active Deliveries</p>
            <h2>{(recentOrders || []).filter((order) => order.status === "Out for Delivery").length}</h2>
          </div>
        </div>

        {loading ? (
          <div>Loading dashboard from database...</div>
        ) : (
          <>
            <div className="graph-section">
              <div className="graph-card">
                <h3>Sales Trend</h3>
                <div className="scroll-container">
                  <div style={{ width: Math.max(salesData.length * 80, 400) }}>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" interval={0} />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="sales" stroke="#00c49f" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="graph-card">
                <h3>Top Medicines by Units Sold</h3>
                <div className="scroll-container">
                  <div style={{ width: Math.max(medicineData.length * 100, 400) }}>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={medicineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" interval={0} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="qty" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            <div className="table-card">
              <h3>Recent Orders</h3>
              <div className="scroll-container">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Delivery Partner</th>
                      <th>Status</th>
                      <th>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.customerName}</td>
                        <td>{order.medicine}</td>
                        <td>{formatCurrency(order.totalPrice || order.total)}</td>
                        <td>{order.paymentMethod?.toUpperCase()} / {order.paymentStatus}</td>
                        <td>{order.deliveryPartner || "Unassigned"}</td>
                        <td>
                          <span className={`status-badge status-${order.status?.toLowerCase().replace(/\s/g, "-")}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <select value={order.status} onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}>
                            <option>Processing</option>
                            <option>Out for Delivery</option>
                            <option>Delivered</option>
                            <option>Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {adminPhoto && (
          <div style={{ position: "fixed", top: 20, right: 24 }}>
            <img src={adminPhoto} alt="Admin" style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }} />
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>{label}</div>
      <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}
