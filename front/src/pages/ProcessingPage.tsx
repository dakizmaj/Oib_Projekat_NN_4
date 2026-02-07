import React from "react";
import { useNavigate } from "react-router-dom";

export const ProcessingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "var(--win11-bg)" }}>
      {/* Header */}
      <div
        style={{
          background: "var(--win11-surface)",
          borderBottom: "1px solid var(--win11-divider)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <button className="btn-ghost" onClick={() => navigate("/dashboard")}>
          ← Back
        </button>
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
          ⚗️ Prerada Sirovina
        </h1>
      </div>

      {/* Content */}
      <div style={{ padding: "24px" }}>
        <p>Processing page - coming soon...</p>
      </div>
    </div>
  );
};
