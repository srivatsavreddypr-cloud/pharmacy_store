import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Dashboard.css";
import { updateUserProfile } from "../lib/store";

export default function Profile({ user, setUser }) {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const currentUser = user || JSON.parse(localStorage.getItem("user") || "null");
    if (!currentUser) return;

    setIsAdmin(currentUser?.isAdmin === true || currentUser?.role === "admin");
    setFullName(currentUser.name || "");
    setEmail(currentUser.email || "");
    setPhone(currentUser.phone || "");
    setProfilePhoto(currentUser.profilePhoto || "");
    setPhotoPreview(currentUser.profilePhoto || "");
    setAdminName(currentUser.name ? currentUser.name.split(" ")[0] : "");
  }, [user]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setSavedMessage("File size should be less than 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSavedMessage("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result || "";
      setProfilePhoto(base64String);
      setPhotoPreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    const currentUser = user || JSON.parse(localStorage.getItem("user") || "null");
    if (!currentUser?.id) {
      setSavedMessage("Please sign in again before saving your profile.");
      return;
    }

    setSaving(true);
    setSavedMessage("");
    try {
      const response = await updateUserProfile(currentUser.id, {
        name: fullName,
        email,
        phone,
        profilePhoto,
      });
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser?.(response.user);
      setAdminName(response.user.name ? response.user.name.split(" ")[0] : "");
      setSavedMessage("Profile saved successfully.");
    } catch (error) {
      setSavedMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const displayPhoto = photoPreview || profilePhoto || "https://i.pravatar.cc/150?img=8";

  return (
    <div className="wrapper">
      <div className="sidebar">
        <div className="sidebar-header" style={{ textAlign: "center", marginBottom: "20px" }}>
          <div className="navbar-logo" style={{ marginBottom: "10px" }}>
            <img
              src={displayPhoto}
              alt="Profile"
              className="sidebar-logo-img"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                objectFit: "cover",
                marginBottom: "10px",
              }}
            />
          </div>
          <h2 className="logo">Pharmacy</h2>
          {adminName ? (
            <p style={{ color: "#fff", marginTop: "10px", fontSize: "14px" }}>
              Welcome, {adminName}!
            </p>
          ) : null}
        </div>

        <p className="section">PROFILE</p>
        <button className="active">My Profile</button>
        <button onClick={handleBack}>Back</button>
      </div>

      <div className="main">
        <div className="topbar">
          <h2>{isAdmin ? "Admin Profile" : "Customer Profile"}</h2>
          <div className="user-info" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src={displayPhoto}
              alt="User Avatar"
              className="topbar-avatar"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #0ea5e9",
              }}
            />
            <span style={{ fontWeight: "500" }}>{adminName || (isAdmin ? "Admin" : "Customer")}</span>
          </div>
        </div>

        <div
          style={{
            maxWidth: "600px",
            margin: "30px auto",
            background: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ color: "#0F4454", marginBottom: "20px" }}>
            {isAdmin ? "Admin Profile Information" : "Customer Profile Information"}
          </h2>

          {savedMessage ? (
            <div
              style={{
                background: "#dcfce7",
                color: "#166534",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              {savedMessage}
            </div>
          ) : null}

          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <img
                src={displayPhoto}
                alt="Profile"
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  border: "3px solid #0ea5e9",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                onClick={() => document.getElementById("photoUpload").click()}
              />
              <button
                onClick={() => document.getElementById("photoUpload").click()}
                style={{
                  position: "absolute",
                  bottom: "5px",
                  right: "5px",
                  background: "#0ea5e9",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                }}
              >
                +
              </button>
            </div>
            <input
              type="file"
              id="photoUpload"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: "none" }}
            />
            <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
              Click the photo to upload a new image
            </p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2d3748" }}>
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Enter your full name"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2d3748" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Enter your email"
            />
          </div>

          <div style={{ marginBottom: "30px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2d3748" }}>
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Enter your phone number"
            />
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              style={{
                background: "#0ea5e9",
                color: "white",
                border: "none",
                padding: "12px 30px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
            <button
              onClick={handleBack}
              style={{
                background: "#e2e8f0",
                color: "#2d3748",
                border: "none",
                padding: "12px 30px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
