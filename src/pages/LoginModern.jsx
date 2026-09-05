import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest, storeAuthSession } from "../lib/auth";

export default function LoginModern({ setUser }) {
  const { role = "customer" } = useParams();
  const navigate = useNavigate();

  const [loginMethod, setLoginMethod] = useState("password");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [devOtp, setDevOtp] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!userId.trim()) newErrors.userId = "Email or phone number is required";
    if (loginMethod === "password" && !password) newErrors.password = "Password is required";
    if (loginMethod === "otp" && otp.length !== 6) newErrors.otp = "Enter a valid 6-digit OTP";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const finishLogin = (payload) => {
    storeAuthSession({
      user: payload.user,
      token: payload.token,
      rememberMe,
    });
    setUser?.(payload.user);
    navigate(payload.user.role === "admin" ? "/admin" : "/home");
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setAuthError("");
    setStatusMessage("");

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload =
        loginMethod === "password"
          ? await apiRequest("/auth/login", {
              method: "POST",
              body: JSON.stringify({
                identifier: userId.trim(),
                password,
                role,
              }),
            })
          : await apiRequest("/auth/login/verify-otp", {
              method: "POST",
              body: JSON.stringify({
                identifier: userId.trim(),
                otp,
                role,
              }),
            });

      finishLogin(payload);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    setAuthError("");
    setStatusMessage("");

    if (!userId.trim()) {
      setErrors({ userId: "Email or phone number is required" });
      return;
    }

    setIsLoading(true);
    try {
      const payload = await apiRequest("/auth/login/request-otp", {
        method: "POST",
        body: JSON.stringify({
          identifier: userId.trim(),
          role,
        }),
      });

      setStatusMessage(payload.message);
      setDevOtp(payload.devOtp || "");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setUserId(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "1rem",
    },
    card: {
      background: "white",
      borderRadius: "24px",
      padding: "2rem",
      width: "100%",
      maxWidth: "440px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    },
    header: { textAlign: "center", marginBottom: "2rem" },
    iconBox: {
      width: "64px",
      height: "64px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      borderRadius: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 1rem auto",
      fontSize: "32px",
      color: "white",
      fontWeight: "bold",
    },
    title: { fontSize: "28px", fontWeight: "bold", color: "#1a202c", marginBottom: "0.5rem" },
    subtitle: { color: "#718096", fontSize: "14px" },
    formGroup: { marginBottom: "1.25rem" },
    label: { display: "block", fontSize: "14px", fontWeight: "500", color: "#4a5568", marginBottom: "0.5rem" },
    input: {
      width: "100%",
      padding: "12px 16px",
      border: "2px solid #e2e8f0",
      borderRadius: "12px",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
    },
    inputError: { borderColor: "#f56565" },
    errorText: { color: "#f56565", fontSize: "12px", marginTop: "0.5rem" },
    toggleGroup: { display: "flex", gap: "12px", marginBottom: "1.25rem", background: "#f7fafc", padding: "4px", borderRadius: "12px" },
    toggleButton: { flex: 1, padding: "10px", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", background: "transparent", color: "#4a5568" },
    toggleButtonActive: { background: "white", color: "#667eea", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
    checkboxGroup: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" },
    checkbox: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" },
    forgotLink: { fontSize: "14px", color: "#667eea", textDecoration: "none" },
    loginButton: {
      width: "100%",
      padding: "14px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      marginBottom: "1rem",
    },
    loginButtonDisabled: { opacity: 0.7, cursor: "not-allowed" },
    signupButton: {
      width: "100%",
      padding: "12px",
      background: "transparent",
      color: "#667eea",
      border: "2px solid #667eea",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
    },
    googleButton: {
      width: "100%",
      padding: "12px",
      background: "white",
      color: "#4a5568",
      border: "2px solid #e2e8f0",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      marginTop: "1rem",
    },
    divider: { textAlign: "center", margin: "1.5rem 0", position: "relative" },
    dividerLine: { borderTop: "1px solid #e2e8f0", position: "absolute", top: "50%", left: 0, right: 0 },
    dividerText: { background: "white", display: "inline-block", padding: "0 1rem", color: "#a0aec0", fontSize: "12px", position: "relative", zIndex: 1 },
    footer: { textAlign: "center", marginTop: "1.5rem", fontSize: "12px", color: "#a0aec0" },
    footerLink: { color: "#667eea", textDecoration: "none" },
    hintText: { fontSize: "12px", color: "#a0aec0", marginTop: "0.5rem" },
    helperButton: { width: "100%", padding: "12px", background: "#edf2f7", color: "#2d3748", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginBottom: "1rem" },
    successBox: { background: "#ecfdf5", color: "#166534", borderRadius: "12px", padding: "12px", fontSize: "13px", marginBottom: "1rem" },
    errorBox: { background: "#fef2f2", color: "#b91c1c", borderRadius: "12px", padding: "12px", fontSize: "13px", marginBottom: "1rem" },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconBox}>{role === "admin" ? "A" : "U"}</div>
          <h2 style={styles.title}>{role === "admin" ? "Admin Portal" : "Welcome Back"}</h2>
          <p style={styles.subtitle}>
            {role === "admin" ? "Access the admin dashboard" : "Sign in to your customer account"}
          </p>
        </div>

        {statusMessage && <div style={styles.successBox}>{statusMessage}</div>}
        {devOtp && <div style={styles.successBox}>Local dev OTP: <strong>{devOtp}</strong></div>}
        {authError && <div style={styles.errorBox}>{authError}</div>}

        <form onSubmit={handleSignIn}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email or Phone Number</label>
            <input
              type="text"
              placeholder="Enter your email or phone"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                if (errors.userId) setErrors({ ...errors, userId: "" });
              }}
              style={{ ...styles.input, ...(errors.userId ? styles.inputError : {}) }}
            />
            {errors.userId && <div style={styles.errorText}>{errors.userId}</div>}
          </div>

          <div style={styles.toggleGroup}>
            <button
              type="button"
              onClick={() => {
                setLoginMethod("password");
                setErrors({});
                setStatusMessage("");
                setDevOtp("");
              }}
              style={{ ...styles.toggleButton, ...(loginMethod === "password" ? styles.toggleButtonActive : {}) }}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod("otp");
                setErrors({});
              }}
              style={{ ...styles.toggleButton, ...(loginMethod === "otp" ? styles.toggleButtonActive : {}) }}
            >
              OTP
            </button>
          </div>

          {loginMethod === "password" && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                style={{ ...styles.input, ...(errors.password ? styles.inputError : {}) }}
              />
              {errors.password && <div style={styles.errorText}>{errors.password}</div>}
            </div>
          )}

          {loginMethod === "otp" && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>One-Time Password</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setOtp(value);
                    if (errors.otp) setErrors({ ...errors, otp: "" });
                  }}
                  style={{
                    ...styles.input,
                    ...(errors.otp ? styles.inputError : {}),
                    fontFamily: "monospace",
                    fontSize: "18px",
                    letterSpacing: "2px",
                    textAlign: "center",
                  }}
                />
                {errors.otp && <div style={styles.errorText}>{errors.otp}</div>}
                <div style={styles.hintText}>Generate a local OTP first, then use it here to finish sign in.</div>
              </div>

              <button type="button" onClick={handleRequestOtp} disabled={isLoading} style={styles.helperButton}>
                Generate OTP
              </button>
            </>
          )}

          <div style={styles.checkboxGroup}>
            <label style={styles.checkbox}>
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <span>Remember me</span>
            </label>
            <Link to={`/forgot-password?userId=${encodeURIComponent(userId)}`} style={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={isLoading} style={{ ...styles.loginButton, ...(isLoading ? styles.loginButtonDisabled : {}) }}>
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          {role !== "admin" && (
            <button type="button" onClick={() => navigate(`/signup/${role}`)} style={styles.signupButton}>
              Create New Account
            </button>
          )}
        </form>

        <div style={styles.divider}>
          <div style={styles.dividerLine}></div>
          <div style={styles.dividerText}>Or continue with</div>
        </div>

        <button
          onClick={() => setAuthError("Google login is not configured for this local MySQL setup.")}
          style={styles.googleButton}
          type="button"
        >
          Sign in with Google
        </button>

        <div style={styles.footer}>
          <span>By signing in, you agree to our </span>
          <Link to="/terms" style={styles.footerLink}>Terms of Service</Link>
          <span> and </span>
          <Link to="/privacy" style={styles.footerLink}>Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
