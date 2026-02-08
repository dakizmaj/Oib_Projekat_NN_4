import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuthHook";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--win11-bg)" }}>
      {/* Header */}
      <div
        style={{
          background: "var(--win11-surface)",
          borderBottom: "1px solid var(--win11-divider)",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="/icon.png" width="32" height="32" alt="Logo" />
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
            OIB Warehouse Management
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "14px", fontWeight: 600 }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ fontSize: "12px", color: "var(--win11-text-secondary)" }}>
              {user?.email}
            </div>
          </div>
          <button className="btn-accent" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: "24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ marginBottom: "24px" }}>Dashboard</h2>

          {/* Navigation Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Plants Card */}
            <div
              className="window"
              style={{
                padding: "24px",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onClick={() => navigate("/plants")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🌱</div>
              <h3 style={{ margin: "0 0 8px 0" }}>Proizvodnja Biljaka</h3>
              <p style={{ margin: 0, color: "var(--win11-text-secondary)", fontSize: "14px" }}>
                Upravljanje sadnjom, berbom i statusom biljaka
              </p>
            </div>

            {/* Processing Card */}
            <div
              className="window"
              style={{
                padding: "24px",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onClick={() => navigate("/processing")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚗️</div>
              <h3 style={{ margin: "0 0 8px 0" }}>Prerada Sirovina</h3>
              <p style={{ margin: 0, color: "var(--win11-text-secondary)", fontSize: "14px" }}>
                Konverzija biljaka u parfeme sa balansom arome
              </p>
            </div>

            {/* Perfumes Card */}
            <div
              className="window"
              style={{
                padding: "24px",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onClick={() => navigate("/perfumes")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>💎</div>
              <h3 style={{ margin: "0 0 8px 0" }}>Parfemi</h3>
              <p style={{ margin: 0, color: "var(--win11-text-secondary)", fontSize: "14px" }}>
                Pregled gotovih proizvoda i inventara
              </p>
            </div>

            {/* Warehouse Card */}
            <div
              className="window"
              style={{
                padding: "24px",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onClick={() => navigate("/warehouse")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>📦</div>
              <h3 style={{ margin: "0 0 8px 0" }}>Skladišta</h3>
              <p style={{ margin: 0, color: "var(--win11-text-secondary)", fontSize: "14px" }}>
                Upravljanje skladištima i paketima za slanje
              </p>
            </div>

            {/* Sales Card */}
            <div
              className="window"
              style={{
                padding: "24px",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onClick={() => navigate("/sales")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🛒</div>
              <h3 style={{ margin: "0 0 8px 0" }}>Prodaja</h3>
              <p style={{ margin: 0, color: "var(--win11-text-secondary)", fontSize: "14px" }}>
                Katalog parfema i prodaja sa fiskalnim računima
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
