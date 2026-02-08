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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPackForm, setShowPackForm] = useState(false);
  const [packFormData, setPackFormData] = useState({
    perfumeType: '',
    quantity: 2,
    netVolume: 150,
    warehouseId: 1,
    sender: '',
    destinationAddress: '',
    plantCommonName: 'Lavanda'
  });

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

  const handleSendPackages = async () => {
    try {
      setLoading(true);
      
      // If no packages available, use auto-pack mode
      if (packages.length === 0) {
        const result = await warehouseAPI.sendPackages({
          packIfNotAvailable: true,
          packParams: packFormData
        });
        setMessage(`✅ ${result.message}`);
      } else {
        // Send all available PACKAGED packages
        const result = await warehouseAPI.sendPackages({
          packIfNotAvailable: false
        });
        setMessage(`✅ ${result.message} (${result.sentCount} paketa)`);
      }
      
      // Reload data
      await loadData();
      
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      console.error('Failed to send packages:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Greška pri slanju paketa';
      setMessage(`Greška: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePackPerfumes = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!packFormData.perfumeType || !packFormData.sender || !packFormData.destinationAddress) {
      setMessage('Molimo popunite sva polja');
      return;
    }

    try {
      setLoading(true);
      const result = await warehouseAPI.packPerfumes(packFormData);
      setMessage(`✅ Uspešno pakovano! Paket ID: ${result.packageId}, Parfemi: ${result.perfumeIds}`);
      setShowPackForm(false);
      setPackFormData({
        perfumeType: '',
        quantity: 2,
        netVolume: 150,
        warehouseId: 1,
        sender: '',
        destinationAddress: '',
        plantCommonName: 'Lavanda'
      });
      
      // Reload data
      await loadData();
      
      setTimeout(() => setMessage(null), 7000);
    } catch (error: any) {
      console.error('Failed to pack perfumes:', error);
      setMessage(`Greška: ${error.response?.data?.error || 'Nepoznata greška'}`);
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
        <button 
          className="btn-pack-perfumes"
          onClick={() => setShowPackForm(!showPackForm)}
        >
          {showPackForm ? '❌ Zatvori' : '📦 Pakovati parfeme'}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('Greška') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {showPackForm && (
        <div className="pack-form-container">
          <form className="pack-form" onSubmit={handlePackPerfumes}>
            <h3>Pakovati parfeme</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Tip parfema:</label>
                <input
                  type="text"
                  value={packFormData.perfumeType}
                  onChange={(e) => setPackFormData({...packFormData, perfumeType: e.target.value})}
                  placeholder="npr. koloko"
                  required
                />
              </div>

              <div className="form-group">
                <label>Biljka (common name):</label>
                <input
                  type="text"
                  value={packFormData.plantCommonName}
                  onChange={(e) => setPackFormData({...packFormData, plantCommonName: e.target.value})}
                  placeholder="npr. Lavanda"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Količina:</label>
                <input
                  type="number"
                  value={packFormData.quantity}
                  onChange={(e) => setPackFormData({...packFormData, quantity: parseInt(e.target.value)})}
                  min="1"
                  max="10"
                  required
                />
              </div>

              <div className="form-group">
                <label>Zapremina (ml):</label>
                <select
                  value={packFormData.netVolume}
                  onChange={(e) => setPackFormData({...packFormData, netVolume: parseInt(e.target.value)})}
                >
                  <option value="50">50ml</option>
                  <option value="100">100ml</option>
                  <option value="150">150ml</option>
                </select>
              </div>

              <div className="form-group">
                <label>Skladište:</label>
                <select
                  value={packFormData.warehouseId}
                  onChange={(e) => setPackFormData({...packFormData, warehouseId: parseInt(e.target.value)})}
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pošiljalac:</label>
                <input
                  type="text"
                  value={packFormData.sender}
                  onChange={(e) => setPackFormData({...packFormData, sender: e.target.value})}
                  placeholder="Ime pošiljaoca"
                  required
                />
              </div>

              <div className="form-group">
                <label>Adresa destinacije:</label>
                <input
                  type="text"
                  value={packFormData.destinationAddress}
                  onChange={(e) => setPackFormData({...packFormData, destinationAddress: e.target.value})}
                  placeholder="npr. Belgrade"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Pakovanje...' : '✅ Pakovati'}
            </button>
            
            <div style={{marginTop: '10px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '0.9em'}}>
              💡 <strong>Savет:</strong> Ako nema dostupnih paketa, kliknite "Pošalji" i sistem će automatski pakovati parfeme pre slanja.
            </div>
          </form>
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
            <button 
              className="send-btn"
              onClick={handleSendPackages}
              disabled={loading || packages.length === 0}
            >
              {packages.length > 0 ? `📦 Pošalji sve (${packages.length})` : '📦 Auto-pack i pošalji'}
            </button>
          </div>

          {loading ? (
            <div className="loading">Učitavanje...</div>
          ) : packages.length === 0 ? (
            <div className="no-packages">
              <p>Nema paketa za slanje</p>
              <p style={{fontSize: '0.9em', color: '#666', marginTop: '10px'}}>
                💡 Kliknite "Auto-pack i pošalji" da automatski pakujete i pošaljete parfeme
              </p>
            </div>
          ) : (
            <div className="packages-table-container">
              <table className="packages-table">
                <thead>
                  <tr>
                    <th>ID paketa</th>
                    <th>Pošiljalac</th>
                    <th>Broj parfema</th>
                    <th>Parfem IDs</th>
                    <th>Skladište</th>
                    <th>Adresa</th>
                    <th>Datum kreiranja</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map(pkg => (
                    <tr key={pkg.id}>
                      <td>{pkg.packageId}</td>
                      <td>{pkg.sender}</td>
                      <td>{pkg.perfumeCount}</td>
                      <td>
                        {pkg.perfumeIds ? (
                          <span className="perfume-ids">{pkg.perfumeIds}</span>
                        ) : (
                          <span style={{color: '#999'}}>-</span>
                        )}
                      </td>
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
