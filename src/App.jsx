import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginModern from "./pages/LoginModern";
import ForgotPassword from "./pages/ForgotPassword";
import SignupModern from "./pages/SignupModern";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Inventory from "./pages/Inventory";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Dashboard from "./Dashboard";
import DeliveryTeam from "./DeliveryTeam";
import OrderFromSeller from "./components/OrderFromSeller"; // Import the new component
import Profile from "./pages/Profile"; // Import Profile page

// Import admin page components (create these if needed)
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import AIInsights from "./pages/AIInsights";
import Restock from "./Restock";
import BulkDiscount from "./BulkDiscount";
import EmergencyOrder from "./EmergencyOrder";
import GenerateReport from "./GenerateReport";
import {
  fetchDeliveryPartners,
  fetchMedicines,
  fetchOrders,
} from "./lib/store";

function AppContent() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });

  const [medicines, setMedicines] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  const [orders, setOrders] = useState([]);
  const [deliveryPeople, setDeliveryPeople] = useState([]);

  // Sync user across tabs
  useEffect(() => {
    const onStorage = () => {
      const u = localStorage.getItem("user");
      setUser(u ? JSON.parse(u) : null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Ensure user updates instantly in same tab
  useEffect(() => {
    const u = localStorage.getItem("user");
    setUser(u ? JSON.parse(u) : null);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadAppData() {
      if (!user) {
        setMedicines([]);
        setOrders([]);
        setDeliveryPeople([]);
        return;
      }

      setDataLoading(true);
      try {
        const [medicineData, deliveryData, orderData] = await Promise.all([
          fetchMedicines(),
          fetchDeliveryPartners(),
          fetchOrders(user.role === "admin" ? undefined : user.id),
        ]);

        if (!ignore) {
          setMedicines(medicineData);
          setDeliveryPeople(deliveryData);
          setOrders(orderData);
        }
      } catch (error) {
        console.error("Failed to load app data:", error);
      } finally {
        if (!ignore) setDataLoading(false);
      }
    }

    loadAppData();
    return () => {
      ignore = true;
    };
  }, [user]);

  // Add to cart
  const addToCart = (m) => {
    const idx = cart.findIndex(item => item.id === m.id);
    let updated;

    if (idx !== -1) {
      updated = cart.map((item, i) =>
        i === idx ? { ...item, qty: (item.qty || 1) + 1 } : item
      );
    } else {
      updated = [...cart, { ...m, qty: 1 }];
    }

    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // Remove from cart
  const removeFromCart = (id) => {
    let updated = cart
      .map(item =>
        item.id === id
          ? { ...item, qty: (item.qty || 1) - 1 }
          : item
      )
      .filter(item => (item.qty || 1) > 0);

    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // Keep cart synced
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const location = useLocation();

  // NAVBAR LOGIC - Hide navbar on landing, login, and signup pages
  const hideNavbar =
    location.pathname === "/" ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/signup");

  return (
    <>
      {user && !hideNavbar && (
        <Navbar user={user} setUser={setUser} cart={cart} />
      )}

      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<Navigate to="/login/customer" replace />} />
        <Route path="/login/:role" element={<LoginModern setUser={setUser} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup/:role" element={<SignupModern setUser={setUser} />} />
        <Route path="/" element={<Landing />} />

        {/* Customer Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute user={user}>
              <Home
                cart={cart}
                addToCart={addToCart}
                orders={orders}
                medicines={medicines}
                loading={dataLoading}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute user={user}>
              <Inventory medicines={medicines} addToCart={addToCart} loading={dataLoading} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute user={user}>
              <Cart
                cart={cart}
                setCart={setCart}
                medicines={medicines}
                setMedicines={setMedicines}
                setOrders={setOrders}
                orders={orders}
                deliveryPeople={deliveryPeople}
                setDeliveryPeople={setDeliveryPeople}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute user={user}>
              <Orders orders={orders} setOrders={setOrders} deliveryPeople={deliveryPeople} />
            </ProtectedRoute>
          }
        />

        {/* Profile Route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <Profile user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} requiredRole="admin">
              <Dashboard
                setUser={setUser}
                medicines={medicines}
                setMedicines={setMedicines}
                deliveryPeople={deliveryPeople}
                setDeliveryPeople={setDeliveryPeople}
                orders={orders}
                setOrders={setOrders}
              />
            </ProtectedRoute>
          }
        />

        {/* Admin Analytics Route */}
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute user={user} requiredRole="admin">
              <Analytics />
            </ProtectedRoute>
          }
        />

        {/* Admin Alerts Route */}
        <Route
          path="/admin/alerts"
          element={
            <ProtectedRoute user={user} requiredRole="admin">
              <Alerts />
            </ProtectedRoute>
          }
        />

        {/* Admin AI Insights Route */}
        <Route
          path="/admin/ai-recommendations"
          element={
            <ProtectedRoute user={user} requiredRole="admin">
              <AIInsights />
            </ProtectedRoute>
          }
        />

        {/* Admin Order from Seller Route */}
        <Route
          path="/admin/order-from-seller"
          element={
            <ProtectedRoute user={user} requiredRole="admin">
              <OrderFromSeller medicines={medicines} />
            </ProtectedRoute>
          }
        />

        {/* Admin Restock Route */}
        <Route
          path="/admin/restock"
          element={
            <ProtectedRoute user={user} requiredRole="admin">
              <Restock medicines={medicines} />
            </ProtectedRoute>
          }
        />

        {/* Admin Bulk Discount Route */}
        <Route
          path="/admin/bulk-discount"
          element={
            <ProtectedRoute user={user} requiredRole="admin">
              <BulkDiscount medicines={medicines} setMedicines={setMedicines} />
            </ProtectedRoute>
          }
        />

        {/* Admin Emergency Order Route */}
        <Route
          path="/admin/emergency-order"
          element={
            <ProtectedRoute user={user} requiredRole="admin">
              <EmergencyOrder medicines={medicines} />
            </ProtectedRoute>
          }
        />

        {/* Admin Generate Report Route */}
        <Route
          path="/admin/generate-report"
          element={
            <ProtectedRoute user={user} requiredRole="admin">
              <GenerateReport orders={orders} medicines={medicines} />
            </ProtectedRoute>
          }
        />

        {/* Delivery Team Management Route (Admin only) */}
        <Route
          path="/delivery-team"
          element={
            <ProtectedRoute user={user} requiredRole="admin">
              <DeliveryTeam
                deliveryPeople={deliveryPeople}
                setDeliveryPeople={setDeliveryPeople}
                orders={orders}
                setOrders={setOrders}
              />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home or landing based on auth */}
        <Route
          path="*"
          element={
            user ? (
              user.role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/home" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppContent />
    </BrowserRouter>
  );
}
