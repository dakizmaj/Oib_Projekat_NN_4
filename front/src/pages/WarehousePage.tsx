import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WarehouseAPI } from '../api/warehouse/WarehouseAPI';
import { WarehouseDTO, PackagingDTO } from '../models/warehouse/WarehouseDTO';
import './WarehousePage.css';

const warehouseAPI = new WarehouseAPI();

export function WarehousePage() {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<WarehouseDTO[]>([]);
  const [packages, setPackages] = useState<PackagingDTO[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [warehousesData, packagesData] = await Promise.all([
        warehouseAPI.getAllWarehouses(),
        warehouseAPI.getAllPackages(),
      ]);
      setWarehouses(warehousesData);
      
      // Filter only PACKAGED packages
      const packedPackages = packagesData.filter(pkg => 
        pkg.packageStatus === 'PACKSTATUS_PACKAGED'
      );
      setPackages(packedPackages);
    } catch (error) {
      console.error('Failed to load warehouse data:', error);
      setMessage('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = (packageId: number) => {
    setSelectedPackages(prev => {
      if (prev.includes(packageId)) {
        return prev.filter(id => id !== packageId);
      }
      return [...prev, packageId];
    });
  };

  const handleSendPackages = async () => {
    if (selectedPackages.length === 0) {
      setMessage('Molimo izaberite pakete za slanje');
      return;
    }

    try {
      setLoading(true);
      const result = await warehouseAPI.sendPackages(selectedPackages);
      setMessage(`${result.message} (${result.sentCount} paketa)`);
      setSelectedPackages([]);
      
      // Reload data
      await loadData();
      
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Failed to send packages:', error);
      setMessage('Greška pri slanju paketa');
    } finally {
      setLoading(false);
    }
  };

  const getCapacityPercentage = (warehouse: WarehouseDTO): number => {
    return (warehouse.currentCapacity / warehouse.maxCapacity) * 100;
  };

  const getCapacityColor = (percentage: number): string => {
    if (percentage < 50) return '#4caf50';
    if (percentage < 80) return '#ff9800';
    return '#f44336';
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('sr-RS');
  };

  return (
    <div className="warehouse-page">
      <div className="warehouse-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          ← Nazad
        </button>
        <h1>Skladišta i paketi</h1>
      </div>

      {message && (
        <div className={`message ${message.includes('Greška') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="warehouse-container">
        {/* Left side - Warehouses */}
        <div className="warehouses-section">
          <h2>Skladišta</h2>
          <div className="warehouses-list">
            {warehouses.map(warehouse => {
              const percentage = getCapacityPercentage(warehouse);
              return (
                <div key={warehouse.id} className="warehouse-card">
                  <h3>{warehouse.name}</h3>
                  <p className="warehouse-location">{warehouse.location}</p>
                  
                  <div className="capacity-info">
                    <span>Popunjenost: {warehouse.currentCapacity} / {warehouse.maxCapacity}</span>
                    <span className="capacity-percentage">{percentage.toFixed(0)}%</span>
                  </div>
                  
                  <div className="capacity-bar">
                    <div 
                      className="capacity-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getCapacityColor(percentage)
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right side - Packages */}
        <div className="packages-section">
          <div className="packages-header">
            <h2>Paketi za slanje</h2>
            {selectedPackages.length > 0 && (
              <button 
                className="send-btn"
                onClick={handleSendPackages}
                disabled={loading}
              >
                Pošalji ({selectedPackages.length})
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading">Učitavanje...</div>
          ) : packages.length === 0 ? (
            <div className="no-packages">Nema paketa za slanje</div>
          ) : (
            <div className="packages-table-container">
              <table className="packages-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectedPackages.length === packages.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPackages(packages.map(p => p.id!));
                          } else {
                            setSelectedPackages([]);
                          }
                        }}
                      />
                    </th>
                    <th>ID paketa</th>
                    <th>Pošiljalac</th>
                    <th>Broj parfema</th>
                    <th>Skladište</th>
                    <th>Adresa</th>
                    <th>Datum kreiranja</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map(pkg => (
                    <tr key={pkg.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedPackages.includes(pkg.id!)}
                          onChange={() => handlePackageSelect(pkg.id!)}
                        />
                      </td>
                      <td>{pkg.packageId}</td>
                      <td>{pkg.sender}</td>
                      <td>{pkg.perfumeCount}</td>
                      <td>{pkg.warehouseName}</td>
                      <td>{pkg.destinationAddress}</td>
                      <td>{formatDate(pkg.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
