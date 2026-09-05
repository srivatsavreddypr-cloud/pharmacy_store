import { useMemo, useRef, useState } from "react";
import { createOrder } from "../lib/store";

export default function Cart({
  cart,
  setCart,
  setOrders,
  orders,
  deliveryPeople,
  setDeliveryPeople,
  addToCart,
  medicines,
  setMedicines,
}) {
  const [addresses] = useState([
    { id: 1, label: "Home", details: "123 Main St, City" },
    { id: 2, label: "Work", details: "456 Office Rd, City" },
  ]);
  const [selectedAddress, setSelectedAddress] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const logRef = useRef(null);

  const removeFromCart = (id) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: (item.qty || 1) - 1 } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const totalMRP = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * (item.qty || 1), 0),
    [cart]
  );
  const totalDiscount = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.price * ((item.discount || 0) / 100) * (item.qty || 1),
        0
      ),
    [cart]
  );
  const deliveryFee = cart.length > 0 ? 7 : 0;
  const totalAmount = totalMRP - totalDiscount + deliveryFee;

  const placeOrder = async () => {
    if (cart.length === 0) return;

    const currentUser = JSON.parse(localStorage.getItem("user")) || {};
    if (!currentUser.id) {
      setStatusMessage("Please sign in again before placing an order.");
      return;
    }

    setPlacingOrder(true);
    setStatusMessage("");

    try {
      const response = await createOrder({
        userId: currentUser.id,
        items: cart.map((item) => ({ id: item.id, qty: item.qty || 1 })),
        paymentMethod,
        address: addresses.find((address) => address.id === selectedAddress),
      });

      setOrders((prev) => [response.order, ...prev]);
      setDeliveryPeople((prev) =>
        prev.map((partner) =>
          partner.name === response.order.deliveryPartner
            ? { ...partner, activeOrders: (partner.activeOrders || 0) + 1 }
            : partner
        )
      );
      setMedicines((prev) =>
        prev.map((medicine) => {
          const cartItem = cart.find((item) => item.id === medicine.id);
          return cartItem
            ? { ...medicine, stock: medicine.stock - (cartItem.qty || 1) }
            : medicine;
        })
      );
      setCart([]);
      localStorage.setItem("cart", JSON.stringify([]));
      setStatusMessage(response.message);
      if (logRef.current) {
        logRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "24px", padding: "32px", flexWrap: "wrap" }}>
      <div style={{ flex: "2", minWidth: "300px" }}>
        <h2 style={{ color: "#0F4454", marginBottom: "20px" }}>Your Shopping Cart</h2>

        {cart.length === 0 && (
          <div style={{ textAlign: "center", padding: "50px", border: "2px dashed #cbd5e1", borderRadius: "12px", backgroundColor: "#f8fafc", color: "#64748b" }}>
            <p style={{ fontSize: "1.2rem" }}>Your cart is empty.</p>
            <p style={{ fontSize: "0.9rem" }}>Add some medicines to get started.</p>
          </div>
        )}

        {cart.length > 0 &&
          cart.map((item) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", marginBottom: "12px", background: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <img src={item.image || "https://via.placeholder.com/60"} alt={item.name} style={{ width: "60px", height: "60px", borderRadius: "8px", objectFit: "cover" }} />
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{item.name}</div>
                  <div style={{ color: "#22c55e", fontWeight: "600" }}>
                    Rs {(item.price * (1 - (item.discount || 0) / 100)).toFixed(2)}
                    {item.discount > 0 && (
                      <span style={{ textDecoration: "line-through", color: "#94a3b8", marginLeft: "8px", fontSize: "0.9rem" }}>
                        Rs {item.price}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", background: "#f1f5f9", borderRadius: "8px", padding: "4px" }}>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: "#ef4444", color: "#fff", border: "none", width: "30px", height: "30px", borderRadius: "6px", cursor: "pointer" }}>-</button>
                  <span style={{ margin: "0 12px", fontWeight: "bold" }}>{item.qty || 1}</span>
                  <button onClick={() => addToCart(item)} style={{ background: "#22c55e", color: "#fff", border: "none", width: "30px", height: "30px", borderRadius: "6px", cursor: "pointer" }}>+</button>
                </div>

                <button onClick={() => setCart((prev) => prev.filter((i) => i.id !== item.id))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.9rem", fontWeight: "500" }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
      </div>

      <div style={{ flex: "1", minWidth: "300px" }}>
        <div ref={logRef} style={{ background: "#fff", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", position: "sticky", top: "20px" }}>
          <h3 style={{ marginBottom: "16px" }}>Delivery Address</h3>
          <select
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(Number(e.target.value))}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "20px" }}
            disabled={cart.length === 0}
          >
            {addresses.map((address) => (
              <option key={address.id} value={address.id}>
                {address.label}: {address.details}
              </option>
            ))}
          </select>

          <h3 style={{ marginBottom: "16px" }}>Payment Option</h3>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "20px" }}
            disabled={cart.length === 0}
          >
            <option value="cod">Cash on Delivery</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
          </select>

          <h3 style={{ marginBottom: "16px", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>Order Summary</h3>
          <div style={{ display: "flex", justifyContent: "space-between", margin: "8px 0" }}>
            <span>Items Total</span>
            <span>Rs {totalMRP.toFixed(0)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", margin: "8px 0", color: "#16a34a" }}>
            <span>Discount</span>
            <span>- Rs {totalDiscount.toFixed(0)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", margin: "8px 0" }}>
            <span>Delivery Fee</span>
            <span>Rs {deliveryFee}</span>
          </div>
          <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid #eee" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "800", fontSize: "1.2rem", color: "#0F4454" }}>
            <span>Total Amount</span>
            <span>Rs {totalAmount.toFixed(0)}</span>
          </div>

          <div style={{ marginTop: 16, fontSize: 14, color: "#64748b" }}>
            Delivery partner will be auto-assigned from the database based on current load.
          </div>

          {statusMessage && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "#eff6ff", color: "#1d4ed8", fontSize: 14 }}>
              {statusMessage}
            </div>
          )}

          <button
            onClick={placeOrder}
            style={{ marginTop: "24px", width: "100%", background: cart.length === 0 ? "#ccc" : "#0F4454", color: "#fff", padding: "14px", borderRadius: "10px", border: "none", fontWeight: "bold", fontSize: "1rem", cursor: cart.length === 0 ? "not-allowed" : "pointer", opacity: cart.length === 0 ? 0.7 : 1 }}
            disabled={cart.length === 0 || placingOrder}
          >
            {placingOrder ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
