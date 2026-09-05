import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import "./Analytics.css";
import { fetchAdminAnalytics } from "../lib/store";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("weekly");
  const [data, setData] = useState({
    stats: {},
    salesData: [],
    topProducts: [],
    categoryData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      try {
        const response = await fetchAdminAnalytics(timeRange);
        if (!ignore) setData(response);
      } catch (error) {
        console.error("Analytics load failed:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [timeRange]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(value || 0);

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="time-range-selector">
          <button className={timeRange === "weekly" ? "active" : ""} onClick={() => setTimeRange("weekly")}>Weekly</button>
          <button className={timeRange === "monthly" ? "active" : ""} onClick={() => setTimeRange("monthly")}>Monthly</button>
          <button className={timeRange === "yearly" ? "active" : ""} onClick={() => setTimeRange("yearly")}>Yearly</button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Sales" value={formatCurrency(data.stats.totalSales)} />
        <StatCard title="Total Orders" value={data.stats.totalOrders || 0} />
        <StatCard title="Avg Order Value" value={formatCurrency(data.stats.averageOrderValue)} />
        <StatCard title="Active Customers" value={data.stats.activeCustomers || 0} />
      </div>

      {loading ? (
        <div>Loading analytics from database...</div>
      ) : (
        <>
          <div className="chart-card">
            <h3>Sales Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={timeRange === "weekly" ? "day" : "month"} />
                <YAxis />
                <Tooltip formatter={(value, name) => (name === "sales" ? formatCurrency(value) : value)} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} name="sales" />
                <Line type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} name="orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="charts-row">
            <div className="chart-card">
              <h3>Top Selling Products</h3>
              <div className="products-list">
                {data.topProducts.map((product, index) => (
                  <div key={product.name} className="product-item">
                    <div className="product-info">
                      <span className="product-rank">#{index + 1}</span>
                      <span className="product-name">{product.name}</span>
                    </div>
                    <div className="product-stats">
                      <span className="product-sales">{formatCurrency(product.sales)}</span>
                      <span className="product-quantity">{product.quantity} units</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card">
              <h3>Sales by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {data.categoryData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}
