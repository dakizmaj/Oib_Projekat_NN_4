import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProcessingAPI } from "../api/processing/ProcessingAPI";
import { ProcessingRequest, ProcessingResult } from "../models/processing/ProcessingTypes";
import { useAuth } from "../hooks/useAuthHook";

const processingAPI = new ProcessingAPI();

export const ProcessingPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [formData, setFormData] = useState({
    perfumeName: "",
    perfumeType: "parfem" as "parfem" | "kolonjska voda",
    quantity: 1,
    netVolume: 150 as 150 | 250,
    plantCommonName: "",
  });

  const handleStartProcessing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setResult(null);

    try {
      const request: ProcessingRequest = {
        perfumeName: formData.perfumeName,
        perfumeType: formData.perfumeType,
        quantity: formData.quantity,
        netVolume: formData.netVolume,
        plantCommonName: formData.plantCommonName,
      };

      const processingResult = await processingAPI.startProcessing(request, token);
      setResult(processingResult);
    } catch (error: any) {
      console.error("Failed to process:", error);
      alert(error.response?.data?.message || "Greška pri procesiranju!");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFormData({
      perfumeName: "",
      perfumeType: "parfem" as "parfem" | "kolonjska voda",
      quantity: 1,
      netVolume: 150 as 150 | 250,
      plantCommonName: "",
    });
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
      <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
        {/* Processing Form */}
        <div className="window" style={{ padding: "24px", marginBottom: "24px" }}>
          <h3 style={{ marginTop: 0 }}>Pokreni Procesiranje</h3>
          <form onSubmit={handleStartProcessing}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>
                  Naziv Parfema
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.perfumeName}
                  onChange={(e) => setFormData({ ...formData, perfumeName: e.target.value })}
                  required
                  placeholder="npr. Rose Garden"
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>
                  Obično Ime Biljke
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.plantCommonName}
                  onChange={(e) => setFormData({ ...formData, plantCommonName: e.target.value })}
                  required
                  placeholder="npr. Ruža"
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>
                  Tip Parfema
                </label>
                <select
                  className="input"
                  value={formData.perfumeType}
                  onChange={(e) => setFormData({ ...formData, perfumeType: e.target.value as "parfem" | "kolonjska voda" })}
                >
                  <option value="parfem">Parfem</option>
                  <option value="kolonjska voda">Kolonjska Voda</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>
                  Zapremina (ml)
                </label>
                <select
                  className="input"
                  value={formData.netVolume}
                  onChange={(e) => setFormData({ ...formData, netVolume: parseInt(e.target.value) as 150 | 250 })}
                >
                  <option value="150">150 ml</option>
                  <option value="250">250 ml</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>
                  Količina Parfema: {formData.quantity}
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  style={{ width: "100%" }}
                />
                <div style={{ fontSize: "12px", color: "var(--win11-text-secondary)", marginTop: "4px" }}>
                  Potrebno biljaka: {Math.ceil((formData.quantity * formData.netVolume) / 50)}
                </div>
              </div>
            </div>

            <div style={{ marginTop: "24px" }}>
              <button type="submit" className="btn-accent" disabled={loading}>
                {loading ? "Procesiranje..." : "⚗️ Pokreni Procesiranje"}
              </button>
            </div>
          </form>
        </div>

        {/* Processing Result */}
        {result && (
          <div className="window" style={{ padding: "24px" }}>
            <h3 style={{ marginTop: 0, color: "var(--win11-accent)" }}>✅ Procesiranje Uspešno</h3>
            
            <div style={{ padding: "16px", background: "var(--win11-bg)", borderRadius: "8px", marginBottom: "16px" }}>
              <p style={{ margin: 0, fontSize: "14px" }}>{result.message}</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <div style={{ padding: "16px", background: "var(--win11-bg)", borderRadius: "8px" }}>
                <div style={{ fontSize: "12px", color: "var(--win11-text-secondary)", marginBottom: "4px" }}>
                  Kreirano Parfema
                </div>
                <div style={{ fontSize: "28px", fontWeight: 600, color: "#10b981" }}>
                  {result.perfumes.length}
                </div>
              </div>
              <div style={{ padding: "16px", background: "var(--win11-bg)", borderRadius: "8px" }}>
                <div style={{ fontSize: "12px", color: "var(--win11-text-secondary)", marginBottom: "4px" }}>
                  Iskorišćeno Biljaka
                </div>
                <div style={{ fontSize: "28px", fontWeight: 600, color: "#6366f1" }}>
                  {result.plantsUsed}
                </div>
              </div>
            </div>

            <h4>Kreirani Parfemi:</h4>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--win11-bg)", borderBottom: "1px solid var(--win11-divider)" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600 }}>Naziv</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600 }}>Tip</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600 }}>Zapremina</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600 }}>Datum Proizvodnje</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600 }}>Datum Isteka</th>
                  </tr>
                </thead>
                <tbody>
                  {result.perfumes.map((perfume, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid var(--win11-divider)" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>{perfume.perfumeName}</td>
                      <td style={{ padding: "12px 16px" }}>{perfume.perfumeType}</td>
                      <td style={{ padding: "12px 16px" }}>{perfume.netVolume} ml</td>
                      <td style={{ padding: "12px 16px" }}>{perfume.productionDate}</td>
                      <td style={{ padding: "12px 16px" }}>{perfume.expirationDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
              <button className="btn-accent" onClick={() => navigate("/perfumes")}>
                Prikaži Sve Parfeme
              </button>
              <button className="btn-ghost" onClick={handleReset}>
                Novo Procesiranje
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
