import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { apiRequest } from "../lib/auth";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialUserId = queryParams.get("userId") || "";

  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(initialUserId);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (message || error) {
      const t = setTimeout(() => {
        setMessage("");
        setError("");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [message, error]);

  useEffect(() => {
    if (step !== 2 || timer === 0) {
      if (timer === 0) setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, step]);

  const getStrength = () => {
    if (newPassword.length < 6) return "Weak";
    if (/[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword)) {
      return "Strong";
    }
    return "Medium";
  };

  const sendOtp = async () => {
    setError("");
    setMessage("");

    if (!userId) {
      setError("Please enter Email or Mobile number");
      return;
    }

    setIsLoading(true);
    try {
      const payload = await apiRequest("/auth/forgot-password/request-otp", {
        method: "POST",
        body: JSON.stringify({ identifier: userId.trim() }),
      });

      setDevOtp(payload.devOtp || "");
      setMessage(payload.message);
      setStep(2);
      setTimer(30);
      setCanResend(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = () => {
    setError("");
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    setMessage("OTP verified");
    setStep(3);
  };

  const resetPassword = async () => {
    setError("");
    setMessage("");

    if (getStrength() === "Weak") {
      setError("Password is too weak");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const payload = await apiRequest("/auth/forgot-password/reset", {
        method: "POST",
        body: JSON.stringify({
          identifier: userId.trim(),
          otp,
          newPassword,
        }),
      });

      setMessage(payload.message);
      setTimeout(() => navigate("/login/customer"), 1200);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Reset Password</h2>

        {error && <div style={errorMsg}>{error}</div>}
        {message && <div style={successMsg}>{message}</div>}
        {devOtp && <div style={successMsg}>Local dev OTP: {devOtp}</div>}

        {step === 1 && (
          <>
            <input type="text" placeholder="Email or Mobile" value={userId} onChange={(e) => setUserId(e.target.value)} style={input} />
            <button style={btn} onClick={sendOtp} disabled={isLoading}>
              {isLoading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} style={input} maxLength={6} />
            <button style={btn} onClick={verifyOtp}>Verify OTP</button>
            <div style={{ textAlign: "center", marginTop: 10 }}>
              {canResend ? (
                <button onClick={sendOtp} style={linkBtn} disabled={isLoading}>Resend OTP</button>
              ) : (
                <span style={timerText}>Resend in {timer}s</span>
              )}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={inputWrap}>
              <input type={showPassword ? "text" : "password"} placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={input} />
              <span style={icon} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div style={strengthText(getStrength())}>Strength: {getStrength()}</div>

            <div style={inputWrap}>
              <input type={showConfirm ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={input} />
              <span style={icon} onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {confirmPassword && newPassword !== confirmPassword && <div style={errorMsgSmall}>Passwords do not match</div>}

            <button style={btn} onClick={resetPassword} disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const container = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#eef4fb",
  padding: "1rem",
};

const card = {
  background: "#ffffff",
  padding: "2rem",
  borderRadius: "1.2rem",
  width: "100%",
  maxWidth: "380px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
};

const title = {
  textAlign: "center",
  marginBottom: "1rem",
};

const input = {
  width: "100%",
  padding: "12px 40px 12px 12px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  marginBottom: "12px",
  boxSizing: "border-box",
};

const inputWrap = {
  position: "relative",
  marginBottom: "12px",
};

const icon = {
  position: "absolute",
  right: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  cursor: "pointer",
};

const btn = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  background: "#2b6cb0",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

const linkBtn = {
  border: "none",
  background: "none",
  color: "#2b6cb0",
  cursor: "pointer",
  textDecoration: "underline",
};

const timerText = {
  fontSize: "14px",
  color: "#718096",
};

const errorMsg = {
  background: "#ffe5e5",
  color: "#c53030",
  padding: "10px",
  borderRadius: "8px",
  marginBottom: "10px",
  textAlign: "center",
};

const successMsg = {
  background: "#e6fffa",
  color: "#2f855a",
  padding: "10px",
  borderRadius: "8px",
  marginBottom: "10px",
  textAlign: "center",
};

const errorMsgSmall = {
  color: "#c53030",
  fontSize: "13px",
};

const strengthText = (strength) => ({
  fontSize: "13px",
  marginBottom: "10px",
  color: strength === "Strong" ? "green" : strength === "Medium" ? "orange" : "red",
});
