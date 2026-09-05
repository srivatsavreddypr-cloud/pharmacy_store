import React, { useEffect, useMemo, useState } from "react";
import "./Restock.css";
import {
  createProcurementOrder,
  fetchProcurementOrders,
  fetchVendors,
} from "./lib/store";

export default function Restock({ medicines = [] }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [restockQuantity, setRestockQuantity] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [recentOrders, setRecentOrders] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const lowStockItems = useMemo(
    () =>
      medicines
        .filter((item) => item.stock < 20)
        .map((item) => ({
          ...item,
          currentStock: item.stock,
          minStock: 20,
        })),
    [medicines]
  );

  useEffect(() => {
    const initialQuantities = {};
    lowStockItems.forEach((item) => {
      initialQuantities[item.id] = Math.max(item.minStock - item.currentStock, 1);
    });
    setRestockQuantity(initialQuantities);
  }, [lowStockItems]);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [supplierRows, orderRows] = await Promise.all([
          fetchVendors("supplier"),
          fetchProcurementOrders("restock"),
        ]);
        if (!ignore) {
          setSuppliers(supplierRows);
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

  const toggleSelectItem = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const updateQuantity = (itemId, value) => {
    setRestockQuantity((prev) => ({
      ...prev,
      [itemId]: Number(value) || 0,
    }));
  };

  const calculateTotal = () =>
    selectedItems.reduce((total, itemId) => {
      const item = lowStockItems.find((entry) => entry.id === itemId);
      const quantity = restockQuantity[itemId] || 0;
      return total + (item?.price || 0) * quantity;
    }, 0);

  const placeRestockOrder = async () => {
    if (selectedItems.length === 0) {
      setStatusMessage("Please select items to restock.");
      return;
    }
    if (!selectedSupplier) {
      setStatusMessage("Please select a supplier.");
      return;
    }

    setSubmitting(true);
    setStatusMessage("");
    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const response = await createProcurementOrder({
        vendorId: Number(selectedSupplier),
        vendorType: "supplier",
        source: "restock",
        createdByUserId: currentUser.id || null,
        items: selectedItems.map((itemId) => ({
          id: itemId,
          quantity: restockQuantity[itemId] || 1,
        })),
      });
      setRecentOrders((prev) => [response.order, ...prev].slice(0, 5));
      setSelectedItems([]);
      setSelectedSupplier("");
      setStatusMessage(response.message);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="restock-container">
      <div className="restock-header">
        <h1>Restock Low Inventory Items</h1>
        <p>Review live low-stock medicines and place supplier restock orders.</p>
      </div>

      {statusMessage && <div className="success-message">{statusMessage}</div>}

      <div className="restock-content">
        <div className="low-stock-section">
          <h2>Low Stock Items</h2>
          <div className="items-table-container">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Medicine</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Min Stock</th>
                  <th>Shortage</th>
                  <th>Price</th>
                  <th>Restock Qty</th>
                  <th>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => {
                  const shortage = item.minStock - item.currentStock;
                  const quantity = restockQuantity[item.id] || 0;
                  const totalCost = item.price * quantity;

                  return (
                    <tr key={item.id} className={selectedItems.includes(item.id) ? "selected" : ""}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                        />
                      </td>
                      <td className="medicine-name">{item.name}</td>
                      <td>{item.category}</td>
                      <td className={item.currentStock < item.minStock ? "low-stock" : ""}>
                        {item.currentStock} units
                      </td>
                      <td>{item.minStock} units</td>
                      <td className="shortage">{shortage} units</td>
                      <td>Rs {item.price}</td>
                      <td>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => updateQuantity(item.id, e.target.value)}
                          min="0"
                          max="1000"
                          className="quantity-input"
                          disabled={!selectedItems.includes(item.id)}
                        />
                      </td>
                      <td className="total-cost">Rs {totalCost.toFixed(0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="order-summary-section">
          <h2>Order Summary</h2>

          <div className="supplier-selection">
            <label>Select Supplier:</label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="supplier-select"
            >
              <option value="">Choose a supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name} - {supplier.location}
                </option>
              ))}
            </select>
          </div>

          {selectedItems.length > 0 ? (
            <div className="order-items">
              <h3>Items to Restock:</h3>
              {selectedItems.map((itemId) => {
                const item = lowStockItems.find((entry) => entry.id === itemId);
                const quantity = restockQuantity[itemId] || 0;
                return (
                  <div key={itemId} className="order-item">
                    <span>{item.name}</span>
                    <span>{quantity} units</span>
                    <span>Rs {(item.price * quantity).toFixed(0)}</span>
                  </div>
                );
              })}
              <div className="order-total">
                <strong>Total Amount:</strong>
                <strong>Rs {calculateTotal().toFixed(0)}</strong>
              </div>
            </div>
          ) : null}

          <button
            onClick={placeRestockOrder}
            className="place-order-btn"
            disabled={selectedItems.length === 0 || !selectedSupplier || submitting}
          >
            {submitting ? "Placing..." : "Place Restock Order"}
          </button>

          {recentOrders.length > 0 ? (
            <div style={{ marginTop: 20 }}>
              <h3>Recent Restock Orders</h3>
              {recentOrders.map((order) => (
                <div key={order.id} className="order-item">
                  <span>#{order.id} - {order.vendorName}</span>
                  <span>{order.status}</span>
                  <span>Rs {order.total.toFixed(0)}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
