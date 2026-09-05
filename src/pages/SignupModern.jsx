import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest, storeAuthSession } from "../lib/auth";

export default function SignupModern({ setUser }) {
  const { role = "customer" } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    businessName: "",
    businessAddress: "",
    verification: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const payload = await apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          role,
        }),
      });

      storeAuthSession({
        user: payload.user,
        token: payload.token,
        rememberMe: true,
      });
      setUser?.(payload.user);

      navigate(role === "admin" ? "/admin" : "/home");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f7fa" }}>
      <div style={{ background: "#f7fafd", borderRadius: 24, boxShadow: "0 8px 32px #0001", padding: 40, width: 400, maxWidth: "95vw" }}>
        <h2 style={{ textAlign: "center", color: "#2d3748", marginBottom: 8 }}>{role === "admin" ? "Admin Sign Up" : "Customer Sign Up"}</h2>
        {error && (
          <div style={{ background: "#fef2f2", color: "#b91c1c", borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSignup}>
          <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required style={inputStyle} />
          <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} required style={inputStyle} />
          <input name="mobile" placeholder="Mobile Number" value={form.mobile} onChange={handleChange} required style={inputStyle} />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required minLength={6} style={inputStyle} />
          {role === "admin" && (
            <>
              <input name="businessName" placeholder="Business Name" value={form.businessName} onChange={handleChange} required style={inputStyle} />
              <input name="businessAddress" placeholder="Business Address" value={form.businessAddress} onChange={handleChange} required style={inputStyle} />
              <input name="verification" placeholder="Verification Document URL or ID" value={form.verification} onChange={handleChange} required style={inputStyle} />
            </>
          )}
          <button type="submit" disabled={isLoading} style={{ width: "100%", padding: 14, borderRadius: 12, background: "#e2e8f0", color: "#2d3748", fontWeight: 700, fontSize: 16, border: "none", boxShadow: "0 2px 8px #0001", marginBottom: 16, cursor: "pointer", opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        <div style={{ textAlign: "center", fontSize: 14, color: "#7b8794" }}>
          Already have an account? <Link to={role === "admin" ? "/login/admin" : "/login/customer"} style={{ color: "#2d3748", fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  background: "#f1f5f9",
  fontSize: 15,
  marginBottom: 12,
};
