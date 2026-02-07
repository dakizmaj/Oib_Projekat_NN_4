import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuthHook";
import { ProcessingAPI } from "../api/processing/ProcessingAPI";
import { PerfumeDTO } from "../models/perfumes/PerfumeDTO";

const processingAPI = new ProcessingAPI();

export const PerfumesPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [perfumes, setPerfumes] = useState<PerfumeDTO[]>([]);
  const [filteredPerfumes, setFilteredPerfumes] = useState<PerfumeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "parfem" | "kolonjska voda">("all");

  useEffect(() => {
    loadPerfumes();
  }, []);

  useEffect(() => {
    if (filterType === "all") {
      setFilteredPerfumes(perfumes);
    } else {
      setFilteredPerfumes(perfumes.filter(p => p.perfumeType === filterType));
    }
  }, [filterType, perfumes]);

  const loadPerfumes = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await processingAPI.getAllPerfumes(token);
      setPerfumes(data);
      setFilteredPerfumes(data);
    } catch (error) {
      console.error("Failed to load perfumes:", error);
      alert("Greška pri učitavanju parfema!");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("sr-RS", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const stats = {
    total: perfumes.length,
    parfem: perfumes.filter(p => p.perfumeType === "parfem").length,
    kolonjskaVoda: perfumes.filter(p => p.perfumeType === "kolonjska voda").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--win11-bg)" }}>
      {/* Header */}
      <div style={{ background: "var(--win11-surface)", padding: "16px 24px", borderBottom: "1px solid var(--win11-divider)", display: "flex", alignItems: "center", gap: "16px" }}>
        <button className="btn-ghost" onClick={() => navigate("/dashboard")} style={{ padding: "8px 12px" }}>
          ← Back
        </button>
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
          🧴 Parfemi
        </h1>
      </div>

      {/* Content */}
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Statistics Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div className="window" style={{ padding: "20px", cursor: "pointer", transition: "transform 0.2s" }} onClick={() => setFilterType("all")}>
            <div style={{ fontSize: "12px", color: "var(--win11-text-secondary)", marginBottom: "8px" }}>
              Ukupno Parfema
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--win11-accent)" }}>
              {stats.total}
            </div>
          </div>

          <div className="window" style={{ padding: "20px", cursor: "pointer", transition: "transform 0.2s" }} onClick={() => setFilterType("parfem")}>
            <div style={{ fontSize: "12px", color: "var(--win11-text-secondary)", marginBottom: "8px" }}>
              Parfem
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "#8b5cf6" }}>
              {stats.parfem}
            </div>
          </div>

          <div className="window" style={{ padding: "20px", cursor: "pointer", transition: "transform 0.2s" }} onClick={() => setFilterType("kolonjska voda")}>
            <div style={{ fontSize: "12px", color: "var(--win11-text-secondary)", marginBottom: "8px" }}>
              Kolonjska Voda
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "#06b6d4" }}>
              {stats.kolonjskaVoda}
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="window" style={{ padding: "16px", marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "14px", fontWeight: 600 }}>Filter:</span>
            <button
              className={filterType === "all" ? "btn-accent" : "btn-ghost"}
              onClick={() => setFilterType("all")}
              style={{ padding: "6px 16px" }}
            >
              Svi ({stats.total})
            </button>
            <button
              className={filterType === "parfem" ? "btn-accent" : "btn-ghost"}
              onClick={() => setFilterType("parfem")}
              style={{ padding: "6px 16px" }}
            >
              Parfem ({stats.parfem})
            </button>
            <button
              className={filterType === "kolonjska voda" ? "btn-accent" : "btn-ghost"}
              onClick={() => setFilterType("kolonjska voda")}
              style={{ padding: "6px 16px" }}
            >
              Kolonjska Voda ({stats.kolonjskaVoda})
            </button>
          </div>
        </div>

        {/* Perfumes Table */}
        <div className="window" style={{ padding: "24px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "16px" }}>
            {filterType === "all" ? "Svi Parfemi" : filterType === "parfem" ? "Parfemi" : "Kolonjske Vode"} ({filteredPerfumes.length})
          </h3>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--win11-text-secondary)" }}>
              Učitavanje...
            </div>
          ) : filteredPerfumes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--win11-text-secondary)" }}>
              Nema parfema za prikaz.
            </div>
          ) : (
            <div style={{ overflowX: "auto", maxHeight: "600px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, background: "var(--win11-surface)", zIndex: 1 }}>
                  <tr style={{ borderBottom: "2px solid var(--win11-divider)" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600 }}>ID</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600 }}>Serijski Broj</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600 }}>Naziv</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600 }}>Tip</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600 }}>Zapremina</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600 }}>Proizveden</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600 }}>Ističe</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPerfumes.map((perfume) => (
                    <tr key={perfume.id} style={{ borderBottom: "1px solid var(--win11-divider)" }}>
                      <td style={{ padding: "12px 16px", color: "var(--win11-text-secondary)" }}>#{perfume.id}</td>
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: "13px" }}>
                        {perfume.serialNumber || "-"}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>{perfume.perfumeName}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: 500,
                          background: perfume.perfumeType === "parfem" ? "#8b5cf620" : "#06b6d420",
                          color: perfume.perfumeType === "parfem" ? "#8b5cf6" : "#06b6d4",
                        }}>
                          {perfume.perfumeType}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>{perfume.netVolume} ml</td>
                      <td style={{ padding: "12px 16px" }}>{formatDate(perfume.productionDate)}</td>
                      <td style={{ padding: "12px 16px" }}>{formatDate(perfume.expirationDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
            <button className="btn-accent" onClick={() => navigate("/processing")}>
              ⚗️ Novo Procesiranje
            </button>
            <button className="btn-ghost" onClick={loadPerfumes}>
              🔄 Osveži
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
