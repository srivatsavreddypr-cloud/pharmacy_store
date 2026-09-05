import React, { useEffect, useMemo, useState } from "react";
import "./OrderFromSeller.css";
import {
  createProcurementOrder,
  fetchProcurementOrders,
  fetchVendors,
} from "../lib/store";

export default function OrderFromSeller({ medicines = [] }) {
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState("");
  const [cart, setCart] = useState([]);
  const [orderNotes, setOrderNotes] = useState("");
  const [recentOrders, setRecentOrders] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [sellerRows, orderRows] = await Promise.all([
          fetchVendors("seller"),
          fetchProcurementOrders("seller-order"),
        ]);
        if (!ignore) {
          setSellers(sellerRows);
          setRecentOrders(orderRows.slice(0, 5));
        }
      } catch (error) {
        if (!ignore) setStatusMessage(error.message);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  const visibleMedicines = useMemo(
    () => medicines.filter((medicine) => medicine.stock > 0),
    [medicines]
  );

  const addToCart = (medicine) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === medicine.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...medicine, quantity: 1 }];
    });
  };

  const removeFromCart = (medicineId) => {
    setCart((prev) => prev.filter((item) => item.id !== medicineId));
  };

  const updateQuantity = (medicineId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === medicineId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const calculateTotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const placeOrder = async () => {
    if (!selectedSeller) {
      setStatusMessage("Please select a seller.");
      return;
    }
    if (cart.length === 0) {
      setStatusMessage("Please add items to your order.");
      return;
    }

    setSubmitting(true);
    setStatusMessage("");
    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const response = await createProcurementOrder({
        vendorId: Number(selectedSeller),
        vendorType: "seller",
        source: "seller-order",
        notes: orderNotes,
        createdByUserId: currentUser.id || null,
        items: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
      });
      setRecentOrders((prev) => [response.order, ...prev].slice(0, 5));
      setCart([]);
      setSelectedSeller("");
      setOrderNotes("");
      setStatusMessage(response.message);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="order-from-seller-container">
      <div className="order-header">
        <h1>Order Medicine from Seller</h1>
        <p>Place bulk orders directly from seller records stored in MySQL.</p>
      </div>

      {statusMessage && <div className="success-message">{statusMessage}</div>}

      <div className="order-content">
        <div className="order-left">
          <div className="seller-section">
            <h3>Select Seller / Distributor</h3>
            <div className="seller-list">
              {sellers.map((seller) => (
                <div
                  key={seller.id}
                  className={`seller-card ${selectedSeller === String(seller.id) ? "selected" : ""}`}
                  onClick={() => setSelectedSeller(String(seller.id))}
                >
                  <div className="seller-info">
                    <h4>{seller.name}</h4>
                    <p>{seller.location || "Location unavailable"}</p>
                    <div className="rating">{seller.rating.toFixed(1)} / 5</div>
                  </div>
                  {selectedSeller === String(seller.id) ? (
                    <div className="selected-badge">Selected</div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="notes-section">
            <h3>Order Notes</h3>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Add any special instructions for the seller..."
              rows="3"
            />
          </div>

          {recentOrders.length > 0 ? (
            <div className="notes-section">
              <h3>Recent Seller Orders</h3>
              {recentOrders.map((order) => (
                <div key={order.id} style={{ padding: "10px 0", borderBottom: "1px solid #e2e8f0" }}>
                  <div style={{ fontWeight: 600 }}>
                    #{order.id} - {order.vendorName}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
                    {order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#0f172a" }}>
                    Rs {order.total.toFixed(0)} / {order.status}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="order-right">
          <div className="medicines-section">
            <h3>Available Medicines</h3>
            <div className="medicines-grid">
              {visibleMedicines.map((medicine) => (
                <div key={medicine.id} className="medicine-card">
                  <div className="medicine-info">
                    <h4>{medicine.name}</h4>
                    <p className="manufacturer">{medicine.category}</p>
                    <p className="price">Rs {medicine.price}</p>
                    <p className="stock">In Stock: {medicine.stock} units</p>
                  </div>
                  <button onClick={() => addToCart(medicine)} className="add-to-cart-btn">
                    Add to Order
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {cart.length > 0 ? (
        <div className="cart-section">
          <h3>Order Cart</h3>
          <div className="cart-items">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>Rs {item.price}</td>
                    <td>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                        min="1"
                        className="quantity-input"
                      />
                    </td>
                    <td>Rs {(item.price * item.quantity).toFixed(0)}</td>
                    <td>
                      <button onClick={() => removeFromCart(item.id)} className="remove-btn">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className="total-label">
                    Total Amount:
                  </td>
                  <td className="total-amount">Rs {calculateTotal().toFixed(0)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <button onClick={placeOrder} className="place-order-btn" disabled={submitting}>
            {submitting ? "Placing..." : "Place Order"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
