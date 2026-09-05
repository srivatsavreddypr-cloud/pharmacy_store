import { useMemo } from "react";

export default function Orders({ orders }) {
  const currentOrders = useMemo(
    () => orders?.filter((order) => order.status?.toLowerCase() !== "delivered"),
    [orders]
  );

  const deliveredOrders = useMemo(
    () => orders?.filter((order) => order.status?.toLowerCase() === "delivered"),
    [orders]
  );

  const getStatusStyle = (status) => {
    const normalized = status?.toLowerCase();
    if (normalized === "processing") return { bg: "#fff3cd", color: "#856404" };
    if (normalized === "out for delivery") return { bg: "#d1ecf1", color: "#0c5460" };
    if (normalized === "delivered") return { bg: "#d4edda", color: "#155724" };
    return { bg: "#e2e3e5", color: "#383d41" };
  };

  const getStepIndex = (status) => {
    const normalized = status?.toLowerCase();
    if (normalized === "processing") return 0;
    if (normalized === "out for delivery") return 1;
    if (normalized === "delivered") return 2;
    return 0;
  };

  const OrderCard = ({ order }) => {
    const statusStyle = getStatusStyle(order.status);

    return (
      <div style={{ background: "#fff", borderRadius: "16px", padding: "18px", marginBottom: "16px", boxShadow: "0 6px 18px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "10px", border: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: "600", color: "#0F4454" }}>Order #{order.id}</div>
          <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: "4px 10px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600" }}>
            {order.status}
          </span>
        </div>

        <div style={{ fontSize: "0.95rem", color: "#334155" }}>
          <b>Items:</b> {order.items.map((item) => `${item.name} (x${item.qty})`).join(", ")}
        </div>

        {order.address && (
          <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
            Address: {order.address.label}, {order.address.details}
          </div>
        )}

        <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
          Payment: <b>{order.paymentMethod?.toUpperCase()}</b> / {order.paymentStatus}
        </div>

        {order.deliveryPartner && (
          <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
            Delivery by <b>{order.deliveryPartner}</b>{order.deliveryPartnerPhone ? ` (${order.deliveryPartnerPhone})` : ""}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", borderTop: "1px dashed #e2e8f0", paddingTop: "10px" }}>
          <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
            {new Date(order.createdAt).toLocaleString()}
          </div>

          <div style={{ fontWeight: "700", color: "#0F4454" }}>
            Rs {order.total}
          </div>
        </div>

        <div style={{ marginTop: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b", marginBottom: "4px" }}>
            <span>Processing</span>
            <span>Out for Delivery</span>
            <span>Delivered</span>
          </div>

          <div style={{ position: "relative", height: "6px", background: "#e2e8f0", borderRadius: "10px" }}>
            <div style={{ width: `${(getStepIndex(order.status) / 2) * 100}%`, height: "100%", background: "#22c55e", borderRadius: "10px", transition: "0.4s" }} />
          </div>
        </div>
      </div>
    );
  };

  const Section = ({ title, color, ordersList, emptyText }) => (
    <div style={{ marginBottom: "32px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <h3 style={{ color, margin: 0 }}>{title}</h3>
        <span style={{ background: "#e2e8f0", padding: "4px 10px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: "600" }}>
          {ordersList.length}
        </span>
      </div>

      {ordersList.length > 0 ? (
        ordersList.map((order) => <OrderCard key={order.id} order={order} />)
      ) : (
        <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", textAlign: "center", color: "#94a3b8", border: "1px dashed #cbd5e1" }}>
          {emptyText}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: "800px", margin: "32px auto", padding: "0 16px" }}>
      <h2 style={{ color: "#0F4454", marginBottom: "24px", fontWeight: "700" }}>
        Your Orders
      </h2>

      <Section title="Current Orders" color="#f59e0b" ordersList={currentOrders || []} emptyText="No active orders right now." />
      <Section title="Delivered Orders" color="#22c55e" ordersList={deliveredOrders || []} emptyText="No delivered orders yet." />
    </div>
  );
}
