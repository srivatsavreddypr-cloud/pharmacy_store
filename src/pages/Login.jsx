import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Login({ setUser }) {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { role } = useParams();
  const loginRole = role === "admin" ? "admin" : "customer";

  const login = () => {
    if (!name.trim()) return;
    const user = { name, role: loginRole };
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    loginRole === "admin" ? navigate("/admin") : navigate("/");
  };

  return (
    <div className="container">
      <div className="login-form" style={{maxWidth: 400, margin: '40px auto', background: 'white', borderRadius: 16, boxShadow: '0 2px 16px #0001', padding: 32}}>
        <h2 style={{color: '#0F4454', marginBottom: 24}}>{loginRole === "admin" ? "Admin Login" : "Customer Login"}</h2>
        <input style={{width: '100%', marginBottom: 16, padding: 10, borderRadius: 8, border: '1px solid #519FAD'}} placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <button style={{width: '100%', padding: 12, borderRadius: 8, background: '#519FAD', color: 'white', fontWeight: 'bold', fontSize: '1rem', border: 'none', marginTop: 8, opacity: name.trim() ? 1 : 0.5, cursor: name.trim() ? 'pointer' : 'not-allowed'}} onClick={login} disabled={!name.trim()}>Login</button>
      </div>
    </div>
  );
}