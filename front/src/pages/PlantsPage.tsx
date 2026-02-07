import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlantAPI } from "../api/plants/PlantAPI";
import { PlantDTO } from "../models/plants/PlantDTO";
import { useAuth } from "../hooks/useAuthHook";

const plantAPI = new PlantAPI();

export const PlantsPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [plants, setPlants] = useState<PlantDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<PlantDTO | null>(null);
  const [aromaAdjustment, setAromaAdjustment] = useState(0);
  const [formData, setFormData] = useState({
    commonName: "",
    latinName: "",
    countryOfOrigin: "",
    aromaStrength: 3.0,
  });

  useEffect(() => {
    loadPlants();
  }, []);

  const loadPlants = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await plantAPI.getAllPlants(token);
      setPlants(data);
    } catch (error) {
      console.error("Failed to load plants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlantNewPlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    try {
      const newPlant: PlantDTO = {
        commonName: formData.commonName,
        latinName: formData.latinName,
        countryOfOrigin: formData.countryOfOrigin,
        plantingDate: new Date().toISOString().split("T")[0],
        aromaStrength: formData.aromaStrength,
        status: "posadjena",
      };
      
      await plantAPI.createPlant(newPlant, token);
      setShowForm(false);
      setFormData({ commonName: "", latinName: "", countryOfOrigin: "", aromaStrength: 3.0 });
      loadPlants();
    } catch (error) {
      console.error("Failed to plant:", error);
    }
  };

  const handleHarvest = async (plant: PlantDTO) => {
    if (!token || !plant.commonName) return;
    
    const confirmed = window.confirm(`Da li želite da uberete biljku: ${plant.commonName}?`);
    if (!confirmed) return;

    try {
      await plantAPI.harvestPlants(plant.commonName, 1, token);
      loadPlants();
    } catch (error) {
      console.error("Failed to harvest:", error);
      alert("Greška pri berbi biljke!");
    }
  };

  const handleOpenAdjustModal = (plant: PlantDTO) => {
    setSelectedPlant(plant);
    setAromaAdjustment(0);
    setShowAdjustModal(true);
  };

  const handleAdjustAroma = async () => {
    if (!token || !selectedPlant || !selectedPlant.id) return;

    try {
      await plantAPI.adjustAromaStrength(selectedPlant.id, aromaAdjustment, token);
      setShowAdjustModal(false);
      setSelectedPlant(null);
      setAromaAdjustment(0);
      loadPlants();
    } catch (error) {
      console.error("Failed to adjust aroma:", error);
      alert("Greška pri prilagođavanju arome!");
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      posadjena: "#10b981",
      ubrana: "#f59e0b",
      preradjena: "#6366f1",
    };
    return (
      <span
        style={{
          padding: "4px 12px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: 600,
          background: colors[status] + "20",
          color: colors[status],
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <>
    <div style={{ minHeight: "100vh", background: "var(--win11-bg)" }}>
      {/* Header */}
      <div
        style={{
          background: "var(--win11-surface)",
          borderBottom: "1px solid var(--win11-divider)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button className="btn-ghost" onClick={() => navigate("/dashboard")}>
            ← Back
          </button>
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
            🌱 Proizvodnja Biljaka
          </h1>
        </div>
        <button className="btn-accent" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Otkaži" : "+ Nova Biljka"}
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Plant Form */}
        {showForm && (
          <div className="window" style={{ marginBottom: "24px", padding: "24px" }}>
            <h3 style={{ marginTop: 0 }}>Posadi Novu Biljku</h3>
            <form onSubmit={handlePlantNewPlant}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>
                    Obično Ime
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.commonName}
                    onChange={(e) => setFormData({ ...formData, commonName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>
                    Latinsko Ime
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.latinName}
                    onChange={(e) => setFormData({ ...formData, latinName: e.target.value })}
                    required
                  />
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>
                    Zemlja Porekla
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.countryOfOrigin}
                    onChange={(e) => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                    required
                  />
                </div>
                </div>
              </div>
              <div style={{ marginTop: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>
                  Jačina Arome: {formData.aromaStrength.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={formData.aromaStrength}
                  onChange={(e) => setFormData({ ...formData, aromaStrength: parseFloat(e.target.value) })}
                  style={{ width: "100%" }}
                />
              </div>
              <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
                <button type="submit" className="btn-accent">
                  Posadi Biljku
                </button>
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
                  Otkaži
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Plants Table */}
        <div className="window" style={{ padding: 0, overflow: "hidden", maxHeight: "600px", display: "flex", flexDirection: "column" }}>
          {loading ? (
            <div style={{ padding: "48px", textAlign: "center" }}>
              <div className="spinner" style={{ margin: "0 auto" }}></div>
              <p style={{ marginTop: "16px" }}>Učitavanje...</p>
            </div>
          ) : plants.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--win11-text-secondary)" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🌱</div>
              <p>Nema posađenih biljaka</p>
              <button className="btn-accent" onClick={() => setShowForm(true)} style={{ marginTop: "16px" }}>
                Posadi Prvu Biljku
              </button>
            </div>
          ) : (
            <div style={{ overflow: "auto", flex: 1 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, background: "var(--win11-bg)", zIndex: 1 }}>
                  <tr style={{ borderBottom: "1px solid var(--win11-divider)" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600 }}>ID</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600 }}>Obično Ime</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600 }}>Latinsko Ime</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600 }}>Datum Sadnje</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600 }}>Jačina Arome</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600 }}>Status</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600 }}>Datum Berbe</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600 }}>Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {plants.map((plant) => (
                    <tr
                      key={plant.id}
                      style={{ borderBottom: "1px solid var(--win11-divider)" }}
                    >
                      <td style={{ padding: "12px 16px" }}>{plant.id}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>{plant.commonName}</td>
                      <td style={{ padding: "12px 16px", fontStyle: "italic", color: "var(--win11-text-secondary)" }}>
                        {plant.latinName}
                      </td>
                      <td style={{ padding: "12px 16px" }}>{plant.plantingDate}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontWeight: 600, color: "var(--win11-accent)" }}>
                          {Number(plant.aromaStrength).toFixed(1)}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>{getStatusBadge(plant.status)}</td>
                      <td style={{ padding: "12px 16px" }}>
                        {plant.harvestDate || <span style={{ color: "var(--win11-text-secondary)" }}>-</span>}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {plant.status === "posadjena" && (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              className="btn-ghost"
                              style={{ fontSize: "12px", padding: "4px 12px" }}
                              onClick={() => handleHarvest(plant)}
                              title="Uberi biljku"
                            >
                              🌾 Uberi
                            </button>
                            <button
                              className="btn-ghost"
                              style={{ fontSize: "12px", padding: "4px 12px" }}
                              onClick={() => handleOpenAdjustModal(plant)}
                              title="Prilagodi aromu"
                            >
                              ⚙️ Aroma
                            </button>
                          </div>
                        )}
                        {plant.status !== "posadjena" && (
                          <span style={{ color: "var(--win11-text-secondary)", fontSize: "12px" }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Adjust Aroma Modal */}
        {showAdjustModal && selectedPlant && (
          <div className="overlay">
            <div className="window" style={{ width: "500px", maxWidth: "90%" }}>
              <div className="titlebar">
                <div className="titlebar-icon">
                  <span>⚙️</span>
                </div>
                <span className="titlebar-title">Prilagodi Aromu</span>
                <div className="titlebar-controls">
                  <button className="titlebar-btn close" onClick={() => setShowAdjustModal(false)}>
                    <svg width="10" height="10" viewBox="0 0 10 10">
                      <path d="M0 0L10 10M10 0L0 10" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="window-content">
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ margin: 0, marginBottom: "8px" }}>
                    <strong>{selectedPlant.commonName}</strong> ({selectedPlant.latinName})
                  </p>
                  <p style={{ margin: 0, color: "var(--win11-text-secondary)", fontSize: "14px" }}>
                    Trenutna jačina arome: <strong>{Number(selectedPlant.aromaStrength).toFixed(1)}</strong>
                  </p>
                </div>
                
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>
                    Procenat promene: {aromaAdjustment > 0 ? '+' : ''}{aromaAdjustment}%
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="5"
                    value={aromaAdjustment}
                    onChange={(e) => setAromaAdjustment(parseInt(e.target.value))}
                    style={{ width: "100%" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--win11-text-secondary)", marginTop: "4px" }}>
                    <span>-50%</span>
                    <span>0%</span>
                    <span>+50%</span>
                  </div>
                  <p style={{ marginTop: "16px", padding: "12px", background: "var(--win11-bg)", borderRadius: "4px", fontSize: "14px" }}>
                    Nova jačina arome: <strong style={{ color: "var(--win11-accent)" }}>
                      {Math.max(1, Math.min(5, Number(selectedPlant.aromaStrength) * (1 + aromaAdjustment / 100))).toFixed(1)}
                    </strong>
                  </p>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button className="btn-accent" onClick={handleAdjustAroma}>
                    Primeni
                  </button>
                  <button className="btn-ghost" onClick={() => setShowAdjustModal(false)}>
                    Otkaži
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        {plants.length > 0 && (
          <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            <div className="window" style={{ padding: "16px" }}>
              <div style={{ fontSize: "12px", color: "var(--win11-text-secondary)", marginBottom: "4px" }}>
                Posađene
              </div>
              <div style={{ fontSize: "24px", fontWeight: 600, color: "#10b981" }}>
                {plants.filter((p) => p.status === "posadjena").length}
              </div>
            </div>
            <div className="window" style={{ padding: "16px" }}>
              <div style={{ fontSize: "12px", color: "var(--win11-text-secondary)", marginBottom: "4px" }}>
                Ubrane
              </div>
              <div style={{ fontSize: "24px", fontWeight: 600, color: "#f59e0b" }}>
                {plants.filter((p) => p.status === "ubrana").length}
              </div>
            </div>
            <div className="window" style={{ padding: "16px" }}>
              <div style={{ fontSize: "12px", color: "var(--win11-text-secondary)", marginBottom: "4px" }}>
                Prerađene
              </div>
              <div style={{ fontSize: "24px", fontWeight: 600, color: "#6366f1" }}>
                {plants.filter((p) => p.status === "preradjena").length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};
