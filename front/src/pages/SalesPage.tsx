import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SalesAPI } from '../api/sales/SalesAPI';
import { PerfumeCatalogItem } from '../models/sales/SalesDTO';
import './SalesPage.css';

const salesAPI = new SalesAPI();

export function SalesPage() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<PerfumeCatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  
  const [selectedPerfume, setSelectedPerfume] = useState<PerfumeCatalogItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const data = await salesAPI.getCatalog();
      setCatalog(data);
    } catch (error) {
      console.error('Failed to load catalog:', error);
      setMessage('Greška pri učitavanju kataloga');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPerfume = (perfume: PerfumeCatalogItem) => {
    setSelectedPerfume(perfume);
    setQuantity(1);
    setCustomerName('');
    setShowPurchaseForm(true);
    setMessage(null);
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPerfume || !customerName.trim()) {
      setMessage('Molimo unesite ime kupca');
      setMessageType('error');
      return;
    }

    try {
      setLoading(true);
      const result = await salesAPI.sellPerfumes({
        perfumeId: selectedPerfume.id,
        quantity: quantity,
        customerName: customerName.trim()
      });

      if (result.success) {
        setMessage(`✅ ${result.message}\n💰 Ukupno: ${result.totalPrice} RSD\n🧾 Račun br: ${result.receiptId}`);
        setMessageType('success');
        setShowPurchaseForm(false);
        setSelectedPerfume(null);
        setCustomerName('');
        setQuantity(1);
      } else {
        setMessage(`❌ ${result.message}`);
        setMessageType('error');
      }

      setTimeout(() => setMessage(null), 8000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Greška pri kupovini';
      setMessage(`❌ ${errorMsg}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return selectedPerfume ? selectedPerfume.price * quantity : 0;
  };

  return (
    <div className="sales-page">
      <div className="sales-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          ← Nazad
        </button>
        <h1>🛒 Prodaja parfema</h1>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      <div className="sales-container">
        {/* Catalog Section */}
        <div className="catalog-section">
          <h2>Katalog parfema</h2>
          
          {loading && !showPurchaseForm ? (
            <div className="loading">Učitavanje kataloga...</div>
          ) : catalog.length === 0 ? (
            <div className="no-items">Nema dostupnih parfema</div>
          ) : (
            <div className="catalog-grid">
              {catalog.map(perfume => (
                <div 
                  key={perfume.id} 
                  className={`catalog-item ${selectedPerfume?.id === perfume.id ? 'selected' : ''}`}
                  onClick={() => handleSelectPerfume(perfume)}
                >
                  <div className="perfume-icon">🧴</div>
                  <h3>{perfume.name}</h3>
                  <p className="perfume-type">{perfume.type}</p>
                  <p className="perfume-volume">{perfume.volume} ml</p>
                  <p className="perfume-price">{perfume.price.toLocaleString()} RSD</p>
                  <button className="btn-select">
                    {selectedPerfume?.id === perfume.id ? 'Izabrano' : 'Izaberi'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Form Section */}
        {showPurchaseForm && selectedPerfume && (
          <div className="purchase-section">
            <div className="purchase-card">
              <h2>Kupovina</h2>
              
              <div className="selected-perfume-info">
                <h3>{selectedPerfume.name}</h3>
                <p>{selectedPerfume.type} - {selectedPerfume.volume} ml</p>
                <p className="unit-price">Cena: {selectedPerfume.price.toLocaleString()} RSD</p>
              </div>

              <form onSubmit={handlePurchase}>
                <div className="form-group">
                  <label>Količina:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Ime kupca:</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Unesite ime kupca"
                    required
                  />
                </div>

                <div className="total-section">
                  <h3>Ukupno:</h3>
                  <p className="total-price">{calculateTotal().toLocaleString()} RSD</p>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => {
                      setShowPurchaseForm(false);
                      setSelectedPerfume(null);
                    }}
                  >
                    Otkaži
                  </button>
                  <button 
                    type="submit" 
                    className="btn-purchase"
                    disabled={loading}
                  >
                    {loading ? 'Obrada...' : '💳 Kupi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
