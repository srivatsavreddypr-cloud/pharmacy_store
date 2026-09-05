import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPredictionSymptoms, predictDisease } from "../lib/store";

export default function Home({ addToCart, orders = [], medicines = [], loading = false }) {
  const [user, setUser] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [symptomSearch, setSymptomSearch] = useState("");
  const [predictionTouched, setPredictionTouched] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionError, setPredictionError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    setUser(u);
    if (!u) navigate("/login/customer");
  }, [navigate]);

  useEffect(() => {
    let ignore = false;
    async function loadSymptoms() {
      try {
        const response = await fetchPredictionSymptoms();
        if (!ignore) setSymptoms(response);
      } catch (error) {
        if (!ignore) setPredictionError(error.message);
      }
    }
    loadSymptoms();
    return () => {
      ignore = true;
    };
  }, []);

  const customerOrders = useMemo(
    () => (orders || []).filter((order) => order.userId && user?.id && order.userId === user.id),
    [orders, user]
  );

  const openOrders = useMemo(
    () => customerOrders.filter((order) => order.status?.toLowerCase() !== "delivered"),
    [customerOrders]
  );

  const categories = useMemo(() => {
    const categoryMap = new Map();
    medicines.forEach((medicine) => {
      const current = categoryMap.get(medicine.category) || 0;
      categoryMap.set(medicine.category, current + 1);
    });
    return Array.from(categoryMap.entries()).map(([name, count], index) => ({
      name,
      count,
      color: ["#f7c59f", "#b5ead7", "#f9e79f", "#b2c7f7", "#f4b6c2", "#d9c2f0"][index % 6],
    }));
  }, [medicines]);

  const featuredMedicines = useMemo(() => medicines.slice(0, 6), [medicines]);

  const filteredSymptoms = useMemo(
    () =>
      symptoms.filter((symptom) =>
        symptom.replaceAll("_", " ").toLowerCase().includes(symptomSearch.toLowerCase())
      ),
    [symptoms, symptomSearch]
  );

  const recognizedSet = useMemo(
    () => new Set(predictionResult?.recognizedSymptoms || []),
    [predictionResult]
  );

  if (!user) return null;

  const handleAdd = (medicine) => {
    addToCart(medicine);
    setAddedId(medicine.id);
    setTimeout(() => setAddedId(null), 800);
  };

  const toggleSymptom = (symptom) => {
    setPredictionTouched(true);
    setPredictionResult(null);
    setPredictionError("");
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((item) => item !== symptom)
        : prev.length >= 8
          ? prev
          : [...prev, symptom]
    );
  };

  const clearPredictionState = () => {
    setSelectedSymptoms([]);
    setPredictionResult(null);
    setPredictionError("");
    setPredictionTouched(false);
    setSymptomSearch("");
  };

  const handlePredictDisease = async () => {
    if (selectedSymptoms.length === 0) {
      setPredictionError("Select at least one symptom.");
      return;
    }

    setPredictionLoading(true);
    setPredictionError("");
    try {
      const result = await predictDisease(selectedSymptoms);
      setPredictionResult(result);
    } catch (error) {
      setPredictionError(error.message);
    } finally {
      setPredictionLoading(false);
    }
  };

  const spentAmount = customerOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: "2.3rem", color: "#0F4454", marginBottom: 8 }}>
        Welcome to PharmaCare
      </h1>

      <p style={{ fontSize: "1.1rem", color: "#519FAD", marginBottom: 32 }}>
        Live inventory, tracked orders, and delivery updates from your pharmacy database
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 28 }}>
        <StatCard title="Available Medicines" value={medicines.length} tone="#0ea5e9" />
        <StatCard title="Open Orders" value={openOrders.length} tone="#f59e0b" />
        <StatCard title="Delivered Orders" value={customerOrders.filter((order) => order.status === "Delivered").length} tone="#22c55e" />
        <StatCard title="Total Spend" value={`Rs ${spentAmount.toFixed(0)}`} tone="#8b5cf6" />
      </div>

      <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)", borderRadius: 20, padding: 24, marginBottom: 28, boxShadow: "0 8px 24px rgba(15,68,84,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 18 }}>
          <div>
            <h2 style={{ marginTop: 0, color: "#0F4454", marginBottom: 8 }}>Disease Prediction</h2>
            <p style={{ color: "#475569", marginBottom: 0, maxWidth: 720 }}>
              Search symptoms, build a symptom set, and get a fast prediction with a medicine suggestion from your catalog when available.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ background: "#fff", borderRadius: 14, padding: "10px 14px", minWidth: 120, boxShadow: "0 2px 12px rgba(15,68,84,0.08)" }}>
              <div style={{ fontSize: 12, color: "#64748b" }}>Selected</div>
              <div style={{ fontWeight: 800, fontSize: 24, color: "#0F4454" }}>{selectedSymptoms.length}/8</div>
            </div>
            <div style={{ background: "#fff", borderRadius: 14, padding: "10px 14px", minWidth: 120, boxShadow: "0 2px 12px rgba(15,68,84,0.08)" }}>
              <div style={{ fontSize: 12, color: "#64748b" }}>Available</div>
              <div style={{ fontWeight: 800, fontSize: 24, color: "#0ea5e9" }}>{filteredSymptoms.length}</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(300px, 1fr)", gap: 20, alignItems: "start" }}>
          <div style={{ background: "rgba(255,255,255,0.72)", borderRadius: 18, padding: 18, border: "1px solid rgba(14,165,233,0.12)" }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
              <input
                type="text"
                value={symptomSearch}
                onChange={(e) => setSymptomSearch(e.target.value)}
                placeholder="Search symptoms like headache, cough, fever..."
                style={{
                  flex: "1 1 260px",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #bae6fd",
                  outline: "none",
                  background: "#fff",
                }}
              />
              <button
                type="button"
                onClick={clearPredictionState}
                style={{
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  color: "#334155",
                  borderRadius: 12,
                  padding: "11px 14px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Clear All
              </button>
            </div>

            {selectedSymptoms.length > 0 ? (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>Selected symptoms</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {selectedSymptoms.map((symptom) => (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => toggleSymptom(symptom)}
                      style={{
                        border: "none",
                        borderRadius: 999,
                        padding: "8px 12px",
                        background: "#0F4454",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {symptom.replace(/_/g, " ")}
                      <span style={{ opacity: 0.75 }}>x</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 16, padding: 14, borderRadius: 14, background: "#eff6ff", color: "#1d4ed8", fontSize: 14 }}>
                Start by selecting one or more symptoms. You can choose up to 8.
              </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, maxHeight: 260, overflowY: "auto", paddingRight: 4 }}>
              {filteredSymptoms.map((symptom) => {
                const active = selectedSymptoms.includes(symptom);
                const disabled = !active && selectedSymptoms.length >= 8;
                return (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    disabled={disabled}
                    style={{
                      border: active ? "none" : "1px solid #cbd5e1",
                      borderRadius: 999,
                      padding: "9px 14px",
                      cursor: disabled ? "not-allowed" : "pointer",
                      background: active ? "#0ea5e9" : disabled ? "#f1f5f9" : "#fff",
                      color: active ? "#fff" : disabled ? "#94a3b8" : "#0f172a",
                      fontSize: 13,
                      boxShadow: active ? "0 8px 18px rgba(14,165,233,0.22)" : "none",
                      transition: "0.2s ease",
                    }}
                  >
                    {symptom.replace(/_/g, " ")}
                  </button>
                );
              })}
            </div>

            {symptomSearch && filteredSymptoms.length === 0 ? (
              <div style={{ marginTop: 14, color: "#64748b", fontSize: 14 }}>
                No symptoms matched "{symptomSearch}".
              </div>
            ) : null}
          </div>

          <div style={{ background: "#fff", borderRadius: 18, padding: 18, boxShadow: "0 8px 22px rgba(15,68,84,0.08)" }}>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>Prediction workspace</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#0F4454", marginBottom: 12 }}>
              {predictionResult ? predictionResult.disease : "Ready to analyze"}
            </div>

            <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "#64748b" }}>Symptoms chosen</span>
                <strong>{selectedSymptoms.length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "#64748b" }}>Model-recognized</span>
                <strong>{predictionResult?.recognizedSymptoms?.length || 0}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "#64748b" }}>Catalog match</span>
                <strong>{predictionResult?.recommendedProduct ? "Available" : "Pending"}</strong>
              </div>
            </div>

            <button
              onClick={handlePredictDisease}
              disabled={predictionLoading || selectedSymptoms.length === 0}
              style={{
                width: "100%",
                background: predictionLoading ? "#38bdf8" : "#0F4454",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                padding: "13px 20px",
                cursor: predictionLoading || selectedSymptoms.length === 0 ? "not-allowed" : "pointer",
                fontWeight: 800,
                marginBottom: 14,
                boxShadow: predictionLoading ? "0 10px 22px rgba(56,189,248,0.22)" : "0 10px 22px rgba(15,68,84,0.16)",
              }}
            >
              {predictionLoading ? "Analyzing symptom pattern..." : "Predict Disease"}
            </button>

            {!predictionResult && !predictionError && predictionTouched ? (
              <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
                Choose the most relevant symptoms, then run the prediction to see the likely condition and suggested product.
              </div>
            ) : null}

            {predictionError && (
              <div style={{ marginTop: 4, background: "#fef2f2", color: "#b91c1c", padding: 12, borderRadius: 12 }}>
                {predictionError}
              </div>
            )}

            {predictionResult && (
              <div style={{ marginTop: 4 }}>
                <div style={{ marginBottom: 10, color: "#334155", fontSize: 15 }}>
                  Recommended medicine: <strong>{predictionResult.recommendedMedicine}</strong>
                </div>
                <div style={{ marginBottom: 14, color: "#475569", lineHeight: 1.6 }}>{predictionResult.advice}</div>

                {predictionResult.recognizedSymptoms?.length > 0 ? (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Recognized by model</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {selectedSymptoms.map((symptom) => {
                        const matched = recognizedSet.has(symptom);
                        return (
                          <span
                            key={symptom}
                            style={{
                              borderRadius: 999,
                              padding: "7px 10px",
                              fontSize: 12,
                              background: matched ? "#dcfce7" : "#f1f5f9",
                              color: matched ? "#166534" : "#64748b",
                              border: matched ? "1px solid #86efac" : "1px solid #e2e8f0",
                            }}
                          >
                            {symptom.replaceAll("_", " ")}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {predictionResult.recommendedProduct ? (
                  <button
                    type="button"
                    onClick={() => handleAdd(predictionResult.recommendedProduct)}
                    style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 12, padding: "11px 16px", cursor: "pointer", fontWeight: 700, width: "100%" }}
                  >
                    Add Recommended Medicine to Cart
                  </button>
                ) : (
                  <div style={{ color: "#92400e", fontSize: 14, padding: 12, background: "#fffbeb", borderRadius: 12 }}>
                    This recommendation is not in the current store catalog yet.
                  </div>
                )}

                <div style={{ marginTop: 12, fontSize: 12, color: "#94a3b8" }}>
                  Demo only. Always confirm diagnosis and treatment with a qualified doctor.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {openOrders.length > 0 ? (
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
          <div style={{ fontWeight: 700, color: "#0F4454", marginBottom: 8 }}>Your Active Orders</div>
          {openOrders.map((order) => (
            <div key={order.id} style={{ padding: "10px 0", borderBottom: "1px solid #e2e8f0" }}>
              <div><b>Order #{order.id}</b> - {order.status}</div>
              <div>Delivery: {order.deliveryPartner || "Not assigned yet"}</div>
              <div>Payment: {order.paymentMethod?.toUpperCase()} / {order.paymentStatus}</div>
              <div>Items: {order.items.map((item) => item.name).join(", ")}</div>
              <div style={{ color: "#64748b" }}>Total Rs {order.total}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginBottom: 28, color: "#64748b" }}>
          No active orders right now.
        </div>
      )}

      <div style={{ display: "flex", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
        {categories.map((category) => (
          <div
            key={category.name}
            style={{
              background: category.color,
              borderRadius: 16,
              padding: "18px 32px",
              fontWeight: 600,
              fontSize: 18,
              color: "#0F4454",
              boxShadow: "2px 2px 12px #e0e5ec",
              minWidth: 160,
            }}
          >
            <div>{category.name}</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>{category.count} medicines</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ color: "#64748b" }}>Loading medicines from database...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 28 }}>
          {featuredMedicines.map((medicine) => (
            <div
              key={medicine.id}
              style={{
                background: "#fff",
                borderRadius: 18,
                boxShadow: "2px 2px 12px #e0e5ec",
                padding: 24,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <img
                src={medicine.image || "https://via.placeholder.com/150"}
                alt={medicine.name}
                style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 12, marginBottom: 12 }}
              />
              <div style={{ fontWeight: 700, fontSize: 20, color: "#0F4454", marginBottom: 6 }}>
                {medicine.name}
              </div>
              <div style={{ fontSize: 15, color: "#519FAD", marginBottom: 8 }}>{medicine.category}</div>
              <div style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>{medicine.description}</div>
              <div style={{ fontSize: 16, marginBottom: 8 }}>
                Rs {medicine.price}
                <span style={{ color: "#22c55e", fontWeight: 600 }}>
                  {medicine.discount ? ` -${medicine.discount}%` : ""}
                </span>
              </div>
              <div style={{ color: medicine.stock > 10 ? "#16a34a" : "#dc2626", fontSize: 14 }}>
                Stock: {medicine.stock}
              </div>
              <button
                onClick={() => handleAdd(medicine)}
                disabled={medicine.stock < 1}
                style={{
                  marginTop: 10,
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  cursor: medicine.stock < 1 ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  background: addedId === medicine.id ? "#22c55e" : medicine.stock < 1 ? "#94a3b8" : "#0ea5e9",
                  color: "#fff",
                  transform: addedId === medicine.id ? "scale(1.05)" : "scale(1)",
                }}
              >
                {medicine.stock < 1 ? "Out of Stock" : addedId === medicine.id ? "Added" : "Add to Cart"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, tone }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
      <div style={{ color: "#64748b", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: "1.8rem", fontWeight: 700, color: tone }}>{value}</div>
    </div>
  );
}
