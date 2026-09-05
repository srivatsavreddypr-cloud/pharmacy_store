import { useState } from "react";

export default function Inventory({ medicines, addToCart, loading = false }) {
  const [search, setSearch] = useState("");

  const filteredMedicines = medicines.filter((medicine) =>
    `${medicine.name} ${medicine.category}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: 24 }}>
      <input
        className="search"
        placeholder="Search medicines or category"
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", maxWidth: 420, padding: 12, borderRadius: 10, border: "1px solid #cbd5e1", marginBottom: 24 }}
      />

      {loading ? (
        <div>Loading inventory from database...</div>
      ) : (
        <div className="grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {filteredMedicines.map((medicine) => (
            <div className="card" key={medicine.id} style={{ background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <img src={medicine.image || "https://via.placeholder.com/150"} alt={medicine.name} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10 }} />
              <h3>{medicine.name}</h3>
              <p style={{ color: "#64748b" }}>{medicine.category}</p>
              <p>Rs {medicine.price}</p>
              <p style={{ color: medicine.stock > 10 ? "#16a34a" : "#dc2626" }}>Stock: {medicine.stock}</p>
              <button onClick={() => addToCart(medicine)} disabled={medicine.stock < 1}>
                {medicine.stock < 1 ? "Out of Stock" : "Add"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
