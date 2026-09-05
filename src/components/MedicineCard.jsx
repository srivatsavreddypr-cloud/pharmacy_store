function MedicineCard({ med, addToCart }) {
  return (
    <div className="card">
      <span className="badge">In Stock</span>

      <h3>{med.name}</h3>
      <p>₹{med.price}</p>
      <p>Stock: {med.stock}</p>

      <button onClick={() => addToCart(med)}>
        Add to Cart
      </button>
    </div>
  );
}

export default MedicineCard;