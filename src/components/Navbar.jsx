import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { clearAuthSession } from "../lib/auth";

export default function Navbar({ user, setUser, cart = [] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    clearAuthSession();
    setUser(null);
    setTimeout(() => {
      navigate("/");
    }, 0);
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Load profile data based on user type
  useEffect(() => {
    const loadProfileData = () => {
      if (!user) return;
      
      const adminStatus = user?.isAdmin === true || user?.role === "admin";
      setIsAdmin(adminStatus);
      
      let photo = null;
      let name = "";
      
      if (adminStatus) {
        // Load ADMIN data
        const adminProfile = localStorage.getItem("adminProfile");
        if (adminProfile) {
          const profile = JSON.parse(adminProfile);
          photo = profile.profilePhoto || null;
          name = profile.fullName ? profile.fullName.split(" ")[0] : "";
        }
        
        // If no admin profile, use user data
        if (!photo && user?.profilePhoto) {
          photo = user.profilePhoto;
        }
        if (!name && user?.name) {
          name = user.name.split(" ")[0];
        }
        
        // Set default admin photo if still nothing
        if (!photo) {
          photo = "https://i.pravatar.cc/150?img=7";
        }
        if (!name) {
          name = "Admin";
        }
      } else {
        // Load CUSTOMER data
        const customerProfile = localStorage.getItem("customerProfile");
        if (customerProfile) {
          const profile = JSON.parse(customerProfile);
          photo = profile.profilePhoto || null;
          name = profile.fullName ? profile.fullName.split(" ")[0] : "";
        }
        
        // If no customer profile, use user data
        if (!photo && user?.profilePhoto) {
          photo = user.profilePhoto;
        }
        if (!name && user?.name) {
          name = user.name.split(" ")[0];
        }
        
        // Set default customer photo if still nothing
        if (!photo) {
          photo = "https://i.pravatar.cc/150?img=8";
        }
        if (!name) {
          name = "Customer";
        }
      }
      
      setProfilePhoto(photo);
      setUserName(name);
    };
    
    loadProfileData();
  }, [user]);

  const goToAdminDashboard = () => {
    navigate('/admin');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  return (
    <>
      <style>{`
        .nav-item {
          text-decoration: none;
          color: #2d3748;
          font-weight: 600;
          padding: 8px 14px;
          transition: 0.3s;
          white-space: nowrap;
          min-height: 40px;
          display: flex;
          align-items: center;
          border-radius: 6px;
          font-size: 15px;
        }

        .nav-item:hover {
          color: #0ea5e9;
          background: rgba(14, 165, 233, 0.08);
        }

        .nav-item.active {
          color: #0ea5e9;
          background: rgba(14, 165, 233, 0.12);
          font-weight: 700;
        }

        .cart-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cart-badge {
          position: absolute;
          top: -10px;
          right: -12px;
          background: #ef4444;
          color: white;
          font-size: 11px;
          font-weight: bold;
          padding: 3px 6px;
          border-radius: 50%;
          min-width: 18px;
          text-align: center;
          animation: pop 0.3s ease;
        }

        @keyframes pop {
          0% { transform: scale(0.6); }
          100% { transform: scale(1); }
        }

        .admin-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          display: inline-block;
          transition: all 0.2s ease;
        }

        .admin-badge.clickable:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
        }

        .notification-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          padding: 2px 5px;
          border-radius: 50%;
          min-width: 16px;
          text-align: center;
        }

        .nav-icon {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }

        .nav-dropdown {
          position: relative;
        }

        .dropdown-content {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          min-width: 220px;
          box-shadow: 0 8px 16px rgba(0,0,0,0.15);
          border-radius: 8px;
          z-index: 1100;
          margin-top: 8px;
        }

        .dropdown-content.open {
          display: block;
        }

        .nav-dropdown:hover .dropdown-content {
          display: block;
        }

        .dropdown-content a {
          padding: 12px 16px;
          display: block;
          text-decoration: none;
          color: #2d3748;
          font-weight: 500;
          transition: 0.2s;
        }

        .dropdown-content a:first-child {
          border-radius: 8px 8px 0 0;
        }

        .dropdown-content a:last-child {
          border-radius: 0 0 8px 8px;
        }

        .dropdown-content a:hover {
          background: #f0f4f8;
          color: #0ea5e9;
        }

        .separator {
          width: 1px;
          height: 30px;
          background: #e2e8f0;
          margin: 0 8px;
        }

        .right-section {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0; /* prevents squeezing */
        }

        .profile-section {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 5px 12px;
          border-radius: 40px;
          transition: all 0.2s ease;
          background: rgba(14, 165, 233, 0.05);
        }

        .profile-section:hover {
          background: rgba(14, 165, 233, 0.1);
          transform: translateY(-1px);
        }

        .profile-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #0ea5e9;
          transition: 0.2s;
        }

        .profile-info {
          text-align: right;
        }

        .welcome-text {
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          margin: 0;
          line-height: 1.2;
        }

        .user-name {
          font-size: 16px;
          font-weight: 700;
          color: #0F4454;
          margin: 0;
          line-height: 1.3;
        }

        .user-role {
          font-size: 11px;
          color: #0ea5e9;
          margin: 0;
          font-weight: 500;
        }

        .logout-btn-nav {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 20px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
          white-space: nowrap;
          font-size: 14px;
        }

        .logout-btn-nav:hover {
          background: #dc2626;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .logo-icon {
          font-size: 28px;
        }

        .logo-text {
          font-size: 22px;
          font-weight: 700;
          background: linear-gradient(135deg, #0F4454 0%, #0ea5e9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .left-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }

       /* ================= BASE ================= */
        .nav-center {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        /* Remove rigid spacing */
        .right-section {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0; /* prevents squeezing */
        }

        /* ================= HAMBURGER ================= */
        .hamburger {
          display: none;
          font-size: 24px;
          background: none;
          border: none;
          cursor: pointer;
        }

        /* ===== TABLET ===== */
        @media (max-width: 1100px) {

          .nav-item span:last-child {
            display: none; /* show only icons */
          }

          .profile-info {
            display: none;
          }
        }

        /* ===== SMALL LAPTOP ===== */
        @media (max-width: 900px) {

          .hamburger {
            display: block;
          }

          .nav-center {
            display: none;
            flex-direction: column;
            width: 100%;
            background: white;
            margin-top: 10px;
            border-radius: 10px;
            overflow: hidden;
          }

          .nav-center.open {
            display: flex;
          }

          .nav-item {
            width: 100%;
            padding: 12px 20px;
          }
        }

        /* ===== MOBILE ===== */
        @media (max-width: 600px) {

          nav {
            padding: 0.6rem 1rem;
          }

          .logo-text {
            font-size: 16px;
          }

          .logout-btn-nav {
            padding: 6px 10px;
            font-size: 12px;
          }
        }
      `}</style>

      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        padding: "0.8rem 2.5rem",
        background: "#f7fafd",
        boxShadow: "0 2px 12px rgba(224, 229, 236, 0.8)",
        position:"sticky",
        minHeight: "60px",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        width: "100%"
      }}>
        {/* Left Section - Logo and Admin Badge */}
        <div className="left-section">
          <div className="logo-section">
            <span className="logo-icon">💊</span>
            <h2 className="logo-text">PharmaCare</h2>
          </div>
          
          {isAdmin && (
            <>
              <div className="separator"></div>
              <span
                className="admin-badge clickable"
                onClick={goToAdminDashboard}
                style={{ cursor: "pointer" }}
                title="Click to go to Admin Dashboard"
              >
                👑 Admin Panel
              </span>
            </>
          )}
        </div>

        {/* Center Section - Navigation Items */}
          <div className={`nav-center ${menuOpen ? "open" : ""}`}>
          {isAdmin && (
            <>
              <NavLink to="/admin/analytics" className={({ isActive }) => `nav-item nav-icon ${isActive ? 'active' : ''}`}>
                <span>📊</span>
                <span>Analytics</span>
              </NavLink>
              <NavLink to="/admin/alerts" className={({ isActive }) => `nav-item nav-icon ${isActive ? 'active' : ''}`}>
                <span style={{ position: "relative" }}>
                  🔔
                  <span className="notification-badge">3</span>
                </span>
                <span>Alerts</span>
              </NavLink>
              <NavLink to="/admin/ai-recommendations" className={({ isActive }) => `nav-item nav-icon ${isActive ? 'active' : ''}`}>
                <span>🤖</span>
                <span>AI Insights</span>
              </NavLink>
              <NavLink to="/admin/order-from-seller" className={({ isActive }) => `nav-item nav-icon ${isActive ? 'active' : ''}`}>
                <span>📦</span>
                <span>Order from Seller</span>
              </NavLink>
              <div className="nav-dropdown" ref={dropdownRef}>
                <div
                  className="nav-item nav-icon"
                  style={{ cursor: "pointer" }}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span>⚡</span>
                  <span>Quick Actions</span>
                  <span style={{ marginLeft: "4px" }}>{dropdownOpen ? '▴' : '▾'}</span>
                </div>
                <div className={`dropdown-content ${dropdownOpen ? 'open' : ''}`}>
                  <NavLink to="/admin/restock" onClick={() => setDropdownOpen(false)}>🔄 Restock Low Items</NavLink>
                  <NavLink to="/admin/bulk-discount" onClick={() => setDropdownOpen(false)}>🏷️ Apply Bulk Discount</NavLink>
                  <NavLink to="/admin/emergency-order" onClick={() => setDropdownOpen(false)}>🚨 Emergency Order</NavLink>
                  <NavLink to="/admin/generate-report" onClick={() => setDropdownOpen(false)}>📄 Generate Report</NavLink>
                </div>
              </div>
            </>
          )}

          {!isAdmin && (
            <>
              <NavLink to="/home" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span>🏠</span>
                <span>Home</span>
              </NavLink>
              <NavLink to="/inventory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span>🛍️</span>
                <span>Shop</span>
              </NavLink>
              <NavLink to="/cart" className={({ isActive }) => `nav-item cart-link ${isActive ? 'active' : ''}`}>
                <span style={{ position: "relative" }}>
                  🛒
                  {totalItems > 0 && (
                    <span key={totalItems} className="cart-badge">
                      {totalItems}
                    </span>
                  )}
                </span>
                <span>Cart</span>
              </NavLink>
              <NavLink to="/orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span>📋</span>
                <span>Orders</span>
              </NavLink>
            </>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✖" : "☰"}
        </button> 

        {/* Right Section - Profile and Logout */}
        <div className="right-section">
          <div className="profile-section" onClick={() => navigate("/profile")}>
            <div className="profile-info">
              <p className="welcome-text">Welcome,</p>
              <p className="user-name">{userName}</p>
              <p className="user-role">{isAdmin ? "Administrator" : "Customer"}</p>
            </div>
            <img
              src={profilePhoto}
              alt="Profile"
              className="profile-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = isAdmin ? "https://i.pravatar.cc/150?img=7" : "https://i.pravatar.cc/150?img=8";
              }}
            />
          </div>
          <button onClick={logout} className="logout-btn-nav">
            Logout
          </button>
        </div>
      </nav>

      {/* <style>{`
        body {
          padding-top: 100px;
        }
      `}</style> */}
    </>
  );
}
