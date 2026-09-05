import React, { useEffect, useState } from "react";
import "./BulkDiscount.css";
import { applyBulkDiscount } from "./lib/store";

export default function BulkDiscount({ medicines = [], setMedicines }) {
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localMedicines, setLocalMedicines] = useState([]);

  useEffect(() => {
    setLocalMedicines(medicines);
  }, [medicines]);

  const toggleSelectMedicine = (id) => {
    setSelectedMedicines((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedMedicines.length === localMedicines.length) {
      setSelectedMedicines([]);
    } else {
      setSelectedMedicines(localMedicines.map((medicine) => medicine.id));
    }
  };

  const applyDiscount = async () => {
    if (selectedMedicines.length === 0) {
      setStatusMessage("Please select at least one medicine.");
      return;
    }
    if (!discountValue || Number(discountValue) <= 0) {
      setStatusMessage("Please enter a valid discount value.");
      return;
    }
    if (discountType === "percentage" && Number(discountValue) > 100) {
      setStatusMessage("Percentage discount cannot exceed 100%.");
      return;
    }

    setSubmitting(true);
    setStatusMessage("");
    try {
      const response = await applyBulkDiscount({
        medicineIds: selectedMedicines,
        discountType,
        discountValue: Number(discountValue),
        minQuantity: minQuantity ? Number(minQuantity) : null,
        validUntil: validUntil || null,
        promoCode: promoCode.trim(),
      });

      setLocalMedicines((prev) =>
        prev.map((medicine) => response.medicines.find((item) => item.id === medicine.id) || medicine)
      );
      setMedicines?.((prev) =>
        prev.map((medicine) => response.medicines.find((item) => item.id === medicine.id) || medicine)
      );
      setStatusMessage(response.message);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bulk-discount-container">
      <div className="discount-header">
        <h1>Bulk Discount Management</h1>
        <p>Apply persistent discounts to medicines and keep the catalog in sync.</p>
      </div>

      {statusMessage ? <div className="success-message">{statusMessage}</div> : null}

      <div className="discount-content">
        <div className="discount-form-section">
          <h2>Discount Settings</h2>

          <div className="form-group">
            <label>Discount Type:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="percentage"
                  checked={discountType === "percentage"}
                  onChange={(e) => setDiscountType(e.target.value)}
                />
                Percentage (%)
              </label>
              <label>
                <input
                  type="radio"
                  value="fixed"
                  checked={discountType === "fixed"}
                  onChange={(e) => setDiscountType(e.target.value)}
                />
                Fixed Amount (Rs)
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Discount Value:</label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={
                discountType === "percentage"
                  ? "Enter percentage (e.g., 20)"
                  : "Enter amount (e.g., 50)"
              }
              className="discount-input"
            />
          </div>

          <div className="form-group">
            <label>Minimum Quantity (Optional):</label>
            <input
              type="number"
              value={minQuantity}
              onChange={(e) => setMinQuantity(e.target.value)}
              placeholder="Minimum quantity for discount"
              className="discount-input"
            />
          </div>

          <div className="form-group">
            <label>Valid Until:</label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="discount-input"
            />
          </div>

          <div className="form-group">
            <label>Promo Code (Optional):</label>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promo code"
              className="discount-input"
            />
          </div>

          <button onClick={applyDiscount} className="apply-discount-btn" disabled={submitting}>
            {submitting ? "Applying..." : "Apply Discount"}
          </button>
        </div>

        <div className="medicines-section">
          <div className="medicines-header">
            <h2>Select Medicines</h2>
            <button onClick={selectAll} className="select-all-btn">
              {selectedMedicines.length === localMedicines.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="medicines-list">
            <table className="medicines-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Medicine</th>
                  <th>Original Price</th>
                  <th>Current Discount</th>
                  <th>Discounted Price</th>
                </tr>
              </thead>
              <tbody>
                {localMedicines.map((medicine) => {
                  const discountedPrice = medicine.price * (1 - (medicine.discount || 0) / 100);
                  return (
                    <tr key={medicine.id} className={selectedMedicines.includes(medicine.id) ? "selected" : ""}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedMedicines.includes(medicine.id)}
                          onChange={() => toggleSelectMedicine(medicine.id)}
                        />
                      </td>
                      <td className="medicine-name">{medicine.name}</td>
                      <td>Rs {medicine.price}</td>
                      <td>
                        {medicine.discount > 0 ? (
                          <span className="discount-badge">{medicine.discount.toFixed(0)}% OFF</span>
                        ) : null}
                      </td>
                      <td className="discounted-price">
                        {medicine.discount > 0 ? (
                          <>
                            <span className="old-price">Rs {medicine.price}</span>
                            <span className="new-price">Rs {discountedPrice.toFixed(2)}</span>
                          </>
                        ) : (
                          <span>Rs {medicine.price}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
