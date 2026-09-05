import React, { useEffect, useMemo, useState } from "react";
import "./EmergencyOrder.css";
import {
  createProcurementOrder,
  fetchProcurementOrders,
  fetchVendors,
} from "./lib/store";

export default function EmergencyOrder({ medicines = [] }) {
  const [cart, setCart] = useState([]);
  const [urgency, setUrgency] = useState("high");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [recentOrders, setRecentOrders] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [supplierRows, orderRows] = await Promise.all([
          fetchVendors("supplier"),
          fetchProcurementOrders("emergency"),
        ]);
        if (!ignore) {
          setSuppliers(supplierRows);
          setRecentOrders(orderRows.slice(0, 5));
          if (supplierRows[0]) setSelectedSupplier(String(supplierRows[0].id));
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

  const filteredMedicines = useMemo(
    () =>
      medicines.filter((medicine) =>
        `${medicine.name} ${medicine.category}`.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [medicines, searchTerm]
  );

  const placeEmergencyOrder = async () => {
    if (cart.length === 0) {
      setStatusMessage("Please add items to your emergency order.");
      return;
    }
    if (!selectedSupplier) {
      setStatusMessage("Please choose a supplier.");
      return;
    }

    setSubmitting(true);
    setStatusMessage("");
    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const response = await createProcurementOrder({
        vendorId: Number(selectedSupplier),
        vendorType: "supplier",
        source: "emergency",
        urgency,
        notes: specialInstructions,
        createdByUserId: currentUser.id || null,
        items: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
      });
      setRecentOrders((prev) => [response.order, ...prev].slice(0, 5));
      setCart([]);
      setSpecialInstructions("");
      setStatusMessage(response.message);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="emergency-order-container">
      <div className="emergency-header">
        <h1>Emergency Order</h1>
        <p>Send urgent supplier requests for critical medicines with tracked priority.</p>
      </div>

      {statusMessage ? <div className="success-message">{statusMessage}</div> : null}

      <div className="emergency-content">
        <div className="medicines-section">
          <h2>Available Medicines</h2>
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="medicines-grid">
            {filteredMedicines.map((medicine) => (
              <div key={medicine.id} className="medicine-card">
                <div className="medicine-info">
                  <h4>{medicine.name}</h4>
                  <p className="category">{medicine.category}</p>
                  <p className="price">Rs {medicine.price}</p>
                  <p className="stock">Stock: {medicine.stock} units</p>
                </div>
                <button onClick={() => addToCart(medicine)} className="add-btn">
                  Add to Order
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="order-section">
          <h2>Emergency Order Cart</h2>

          <div className="urgency-section">
            <label>Priority Level:</label>
            <div className="urgency-buttons">
              <button
                className={`urgency-btn ${urgency === "high" ? "active high" : ""}`}
                onClick={() => setUrgency("high")}
              >
                High (2 hrs)
              </button>
              <button
                className={`urgency-btn ${urgency === "medium" ? "active medium" : ""}`}
                onClick={() => setUrgency("medium")}
              >
                Medium (4 hrs)
              </button>
              <button
                className={`urgency-btn ${urgency === "low" ? "active low" : ""}`}
                onClick={() => setUrgency("low")}
              >
                Low (6 hrs)
              </button>
            </div>
          </div>

          <div className="instructions-section">
            <label>Supplier:</label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="search-input"
            >
              <option value="">Choose supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name} - {supplier.location}
                </option>
              ))}
            </select>
          </div>

          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>No items in emergency order</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p>Rs {item.price} each</p>
                    </div>
                    <div className="item-controls">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                        min="1"
                        className="quantity-input"
                      />
                      <button onClick={() => removeFromCart(item.id)} className="remove-btn">
                        Remove
                      </button>
                    </div>
                    <div className="item-total">Rs {(item.price * item.quantity).toFixed(0)}</div>
                  </div>
                ))}
              </div>

              <div className="order-total">
                <strong>Total Amount:</strong>
                <strong>Rs {calculateTotal().toFixed(0)}</strong>
              </div>
            </>
          )}

          <div className="instructions-section">
            <label>Special Instructions:</label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Add any special instructions (e.g., urgent delivery, call before delivery, etc.)"
              rows="3"
            />
          </div>

          <button
            onClick={placeEmergencyOrder}
            className="place-order-btn"
            disabled={cart.length === 0 || submitting}
          >
            {submitting ? "Placing..." : "Place Emergency Order"}
          </button>

          {recentOrders.length > 0 ? (
            <div style={{ marginTop: 20 }}>
              <h3>Recent Emergency Requests</h3>
              {recentOrders.map((order) => (
                <div key={order.id} className="cart-item">
                  <div className="item-info">
                    <h4>#{order.id} - {order.vendorName}</h4>
                    <p>{order.status}</p>
                  </div>
                  <div className="item-total">Rs {order.total.toFixed(0)}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
