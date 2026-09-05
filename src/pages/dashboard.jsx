import "../Dashboard.css";
import { useState } from "react";

export default function Dashboard({
  medicines,setMedicines,
  deliveryPeople,setDeliveryPeople,
  orders
}) {

  const [med,setMed]=useState("");

  const addMed=()=>{
    setMedicines([...medicines,{
      id:Date.now(),name:med,price:20,stock:5
    }]);
  };

  const restock=(id)=>{
    setMedicines(medicines.map(m=>
      m.id===id?{...m,stock:m.stock+20}:m
    ));
    alert("Supplier order placed");
  };

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>

      <input placeholder="New medicine"
        onChange={e=>setMed(e.target.value)} />
      <button onClick={addMed}>Add</button>

      <div className="grid">
        {medicines.map(m=>(
          <div className="card" key={m.id}>
            {m.name}
            <p>Stock:{m.stock}</p>

            {m.stock<5 && <div className="alert">Low Stock</div>}

            <button onClick={()=>restock(m.id)}>
              Order from Supplier
            </button>
          </div>
        ))}
      </div>

      <h3>Orders</h3>
      {orders.map((o,i)=>(
        <div key={i} className="card">
          {o.item.name} → {o.status}
        </div>
      ))}
    </div>
  );
}
