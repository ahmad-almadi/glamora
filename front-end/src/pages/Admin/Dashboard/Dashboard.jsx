import "./Dashboard.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../../utils/api";
import { handleApiError } from "../../../utils/errorHandler";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Chart colors matching admin theme
const COLORS = ["#FFCF40", "#3B82F6", "#10B981", "#8B5CF6", "#EF4444"];

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    customers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [statusChartData, setStatusChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Using api instance - token is automatically attached, auto-logout on 401/403
      const res = await api.get("/admin/dashboard");
      const data = res.data;

      //updating state with the data from your API
      setStats({
        revenue: data.stats.revenue,
        orders: data.stats.orders,
        products: data.stats.products,
        customers: data.stats.customers,
      });

      // Map backend data to frontend format
      setRecentOrders(
        data.recentOrders.map((order) => ({
          id: `#${order.id.slice(-6).toUpperCase()}`,
          customer: order.user?.name || "Unknown",
          amount: order.totalAmount,
          status: order.status,
          date: new Date(order.createdAt).toLocaleDateString(),
        })),
      );

      setTopProducts(
        data.topProducts.map((product) => ({
          ...product,
          sales: 0, // Not yet available from backend
          revenue: 0, // Not yet available from backend
        })),
      );

      setLowStockProducts(data.lowStockProducts);

      // Set chart data
      if (data.chartData) {
        setRevenueChartData(data.chartData.revenueByDay || []);
        setStatusChartData(data.chartData.ordersByStatus || []);
      }

      setLoading(false);
    } catch (err) {
      handleApiError(err, setError, "Dashboard Data Fetch");
      setLoading(false);
    }
  };

  //returns a CSS class name depending on the status of an order
  const getStatusClass = (status) => {
    if (!status) return "info";
    switch (status.toLowerCase()) {
      case "delivered":
        return "success";
      case "shipped":
        return "info";
      case "processing":
        return "warning";
      case "pending":
        return "pending";
      case "cancelled":
        return "danger";
      default:
        return "info";
    }
  };

  //to format numbers as currency.
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    //loading animation
    return (
      <div
        className="dashboard-page"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid rgba(255,207,64,0.3)",
            borderTop: "3px solid #FFCF40",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <style>
          {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
        </style>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="page-header-admin">
        <h1 className="page-title-admin">Dashboard</h1>
        <p className="page-subtitle-admin">
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="admin-error-alert">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="stat-cards-grid">
        {/* Total Revenue - Yellow */}
        <div className="stat-card yellow">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div>
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">{formatCurrency(stats.revenue)}</div>
            </div>
          </div>
        </div>

        {/* Total Orders - Blue */}
        <div className="stat-card blue">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper">
              <i className="fas fa-shopping-bag"></i>
            </div>
            <div>
              <div className="stat-label">Total Orders</div>
              <div className="stat-value">{stats.orders}</div>
            </div>
          </div>
        </div>

        {/* Total Products - Green */}
        <div className="stat-card green">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper">
              <i className="fas fa-tshirt"></i>
            </div>
            <div>
              <div className="stat-label">Total Products</div>
              <div className="stat-value">{stats.products}</div>
            </div>
          </div>
        </div>

        {/* Total Customers - Purple */}
        <div className="stat-card purple">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper">
              <i className="fas fa-users"></i>
            </div>
            <div>
              <div className="stat-label">Total Customers</div>
              <div className="stat-value">{stats.customers}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Revenue Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Revenue (Last 7 Days)</h3>
          </div>
          <div className="chart-container">
            {revenueChartData.length > 0 ? (
              //order revenue area chart
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={revenueChartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#FFCF40" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#FFCF40"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis dataKey="day" stroke="#888" fontSize={12} />
                  <YAxis
                    stroke="#888"
                    fontSize={12}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1f2937",
                      border: "1px solid rgba(255,207,64,0.3)",
                      borderRadius: "8px",
                      color: "#fff",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    itemStyle={{ color: "#fff" }}
                    labelStyle={{ color: "#9ca3af" }}
                    formatter={(value) => [`$${value}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FFCF40"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state chart-empty-state">
                <p>No revenue data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Orders by Status</h3>
          </div>
          <div className="chart-container">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#1f2937",
                      border: "1px solid rgba(255,207,64,0.3)",
                      borderRadius: "8px",
                      color: "#fff",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    itemStyle={{ color: "#fff" }}
                    formatter={(value, name) => [value, name]}
                  />
                  <Legend
                    wrapperStyle={{ color: "#ccc", fontSize: "12px" }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state chart-empty-state">
                <p>No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Widgets Section */}
      <div className="dashboard-grid">
        {/* Top Products */}
        <div className="widget-card">
          <div className="widget-header">
            <h3 className="widget-title">Top Products</h3>
            <Link to="/admin/products" className="widget-link">
              View All
            </Link>
          </div>
          {topProducts.length > 0 ? (
            topProducts.map((product, index) => (
              <div key={product.id} className="top-product-item">
                <span
                  className={`product-rank ${index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "bronze" : ""}`}
                >
                  {index + 1}
                </span>
                <img
                  src={
                    product.imageUrl
                      ? product.imageUrl.startsWith("http")
                        ? product.imageUrl
                        : `http://localhost:3000${product.imageUrl.startsWith("/") ? "" : "/"}${product.imageUrl}`
                      : "https://via.placeholder.com/44"
                  }
                  alt={product.name}
                  className="product-thumb"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className="product-info-widget">
                  <div className="product-name-widget">{product.name}</div>
                  <div className="product-sales"></div>{" "}
                  {/* Removed mock sales count */}
                </div>
                <div className="product-revenue">
                  {formatCurrency(product.price)}
                </div>{" "}
                {/* Show Price instead of mock revenue */}
              </div>
            ))
          ) : (
            <div className="empty-state">
              <i className="fas fa-box-open"></i>
              <p>No products yet</p>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="widget-card">
          <div className="widget-header">
            <h3 className="widget-title">Low Stock Alerts</h3>
            <Link to="/admin/products" className="widget-link">
              Manage
            </Link>
          </div>
          {lowStockProducts.length > 0 ? (
            lowStockProducts.map((product) => (
              <div key={product.id} className="alert-item">
                <div className="alert-icon">
                  <img
                    src={
                      product.imageUrl
                        ? product.imageUrl.startsWith("http")
                          ? product.imageUrl
                          : `http://localhost:3000${product.imageUrl.startsWith("/") ? "" : "/"}${product.imageUrl}`
                        : "https://via.placeholder.com/44"
                    }
                    alt={product.name}
                    className="product-thumb"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <div className="alert-content">
                  <div className="alert-title">{product.name}</div>
                  <div className="alert-text">
                    Only {product.quantity} items left
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ padding: "1.5rem" }}>
              <i
                className="fas fa-check-circle"
                style={{ color: "var(--admin-success)" }}
              ></i>
              <p>All products well stocked</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="orders-section">
        <div className="section-header">
          <h3 className="section-title">Recent Orders</h3>
          <Link to="/admin/orders" className="widget-link">
            View All Orders
          </Link>
        </div>
        <div
          className="admin-table-wrapper"
          style={{ background: "transparent", border: "none" }}
        >
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "300px" }}>Order ID</th>
                <th style={{ width: "500px" }}>Customer</th>
                <th style={{ width: "300px" }}>Date</th>
                <th style={{ width: "300px" }}>Amount</th>
                <th style={{ width: "200px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span className="order-id">{order.id}</span>
                  </td>
                  <td>
                    <div className="order-customer">
                      <div className="customer-avatar-small">
                        {order.customer.charAt(0)}
                      </div>
                      <span className="customer-name">{order.customer}</span>
                    </div>
                  </td>
                  <td>{order.date}</td>
                  <td>
                    <span className="order-amount">
                      {formatCurrency(order.amount)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${getStatusClass(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
