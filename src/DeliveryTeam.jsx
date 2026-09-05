import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { clearAuthSession } from "./lib/auth";
import { createDeliveryPartner, deleteDeliveryPartner } from "./lib/store";

function getAdminDisplayState() {
  const savedProfile = localStorage.getItem("adminProfile");
  if (savedProfile) {
    const profile = JSON.parse(savedProfile);
    return {
      adminName: profile.fullName ? profile.fullName.split(" ")[0] : "",
      adminPhoto: profile.profilePhoto || null,
    };
  }

  const currentUser = localStorage.getItem("user");
  if (currentUser) {
    const user = JSON.parse(currentUser);
    return {
      adminName: user.name ? user.name.split(" ")[0] : "",
      adminPhoto: user.profilePhoto || null,
    };
  }

  return { adminName: "", adminPhoto: null };
}

export default function DeliveryTeam({ deliveryPeople = [], setDeliveryPeople, orders = [] }) {
  const navigate = useNavigate();
  const [initialAdminState] = useState(() => getAdminDisplayState());
  const [adminName] = useState(initialAdminState.adminName);
  const [adminPhoto] = useState(initialAdminState.adminPhoto);
  const [newDeliveryName, setNewDeliveryName] = useState("");
  const [newDeliveryPhone, setNewDeliveryPhone] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [search, setSearch] = useState("");

  const handleAddDeliveryPerson = async () => {
    if (!newDeliveryName.trim() || !newDeliveryPhone.trim()) return;

    try {
      const createdPartner = await createDeliveryPartner({
        name: newDeliveryName.trim(),
        phone: newDeliveryPhone.trim(),
      });
      setDeliveryPeople?.((prev) => [...(prev || []), createdPartner]);
      setNewDeliveryName("");
      setNewDeliveryPhone("");
      setStatusMessage("Delivery partner added successfully.");
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleDeleteDeliveryPerson = async (id) => {
    if (!window.confirm("Are you sure you want to remove this delivery person?")) return;

    try {
      await deleteDeliveryPartner(id);
      setDeliveryPeople?.((prev) => prev.filter((person) => person.id !== id));
      setStatusMessage("Delivery partner removed.");
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  const getOrdersForDeliveryPerson = (personName) =>
    (orders || []).filter((order) => order.deliveryPartner === personName);

  const filteredDeliveryPeople = (deliveryPeople || []).filter((person) =>
    `${person.name} ${person.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="wrapper">
      <div className="sidebar">
        <h2 className="logo">Pharmacy</h2>
        <p className="section">MAIN MENU</p>
        <button onClick={() => navigate("/admin")}>Dashboard</button>
        <button className="active">Delivery Team</button>
        <div className="profile-card">
          <p>Complete Profile</p>
          <button onClick={() => navigate("/profile")}>Verify Identity</button>
        </div>
      </div>

      <div className="main">
        <div className="fixed-admin">
          {adminPhoto ? (
            <img src={adminPhoto} alt="Admin" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <img src="https://i.pravatar.cc/40" alt="Admin" />
          )}
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>

        <div className="topbar">
          <input
            className="search"
            placeholder="Search delivery team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <h1 className="welcome">Delivery Team Management</h1>
        {adminName && <p style={{ color: "#64748b", marginBottom: 20 }}>Hello {adminName}, these assignments are now loaded from MySQL.</p>}
        {statusMessage && (
          <div style={{ background: "#eff6ff", color: "#1d4ed8", padding: 12, borderRadius: 10, marginBottom: 20 }}>
            {statusMessage}
          </div>
        )}

        <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: "20px" }}>
          <h3 style={{ marginTop: 0, color: "#0F4454" }}>Add New Delivery Partner</h3>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
            <input value={newDeliveryName} onChange={(e) => setNewDeliveryName(e.target.value)} placeholder="Delivery Person Name" style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
            <input value={newDeliveryPhone} onChange={(e) => setNewDeliveryPhone(e.target.value)} placeholder="Phone Number" style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
            <button onClick={handleAddDeliveryPerson} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer" }}>
              Add Delivery Person
            </button>
          </div>
        </div>

        <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <h3 style={{ marginTop: 0, color: "#0F4454" }}>Delivery Team ({filteredDeliveryPeople.length || 0})</h3>
          {filteredDeliveryPeople.length === 0 ? (
            <p style={{ color: "#64748b", textAlign: "center", padding: "40px" }}>No delivery team members added yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {filteredDeliveryPeople.map((person) => {
                const assignedOrders = getOrdersForDeliveryPerson(person.name);
                const activeOrders = assignedOrders.filter((order) => order.status?.toLowerCase() !== "delivered");

                return (
                  <div key={person.id} style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                    <div style={{ padding: "16px", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0" }}>
                      <div>
                        <div style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: "5px" }}>{person.name}</div>
                        <div style={{ fontSize: "0.9rem", color: "#64748b" }}>Phone {person.phone}</div>
                        <div style={{ fontSize: "0.9rem", color: "#0f5132", fontWeight: "500" }}>
                          Completed Deliveries: {person.orders || 0}
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "#e67e22", fontWeight: "500" }}>
                          Active Orders: {person.activeOrders ?? activeOrders.length}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteDeliveryPerson(person.id)} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "0.85rem" }}>
                        Remove
                      </button>
                    </div>

                    {assignedOrders.length > 0 && (
                      <div style={{ padding: "16px", background: "#fff" }}>
                        <h4 style={{ margin: "0 0 10px 0", fontSize: "0.9rem", color: "#334155" }}>Assigned Orders</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {assignedOrders.map((order) => (
                            <div key={order.id} style={{ padding: "10px", background: "#f1f5f9", borderRadius: "8px", fontSize: "0.85rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                  <strong>Order #{order.id}</strong> - {order.customerName}
                                  <br />
                                  <span style={{ color: "#64748b" }}>{order.medicine} x{order.qty} - Rs {order.totalPrice}</span>
                                </div>
                                <span className={`status-badge status-${order.status?.toLowerCase().replace(/\s/g, "-")}`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
