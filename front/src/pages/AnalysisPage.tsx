import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnalysisAPI } from '../api/analysis/AnalysisAPI';
import { ReceiptDTO, Revenue, MonthData, YearData } from '../models/analysis/AnalysisDTO';
import './AnalysisPage.css';

const analysisAPI = new AnalysisAPI();

export function AnalysisPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'receipts' | 'monthly' | 'yearly'>('overview');
  
  const [receipts, setReceipts] = useState<ReceiptDTO[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [topProducts, setTopProducts] = useState<string[]>([]);
  const [topRevenue, setTopRevenue] = useState<number>(0);
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [yearlyData, setYearlyData] = useState<YearData[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [receiptsData, revenueData, topData, topRevData, monthData, yearData] = await Promise.all([
        analysisAPI.getAllReceipts().catch(() => []),
        analysisAPI.getRevenue().catch(() => ({ revenue: 0 })),
        analysisAPI.getTopTen().catch(() => []),
        analysisAPI.getTopTenRevenue().catch(() => ({ revenue: 0 })),
        analysisAPI.getRevenueByMonth().catch(() => []),
        analysisAPI.getRevenueByYear().catch(() => [])
      ]);

      setReceipts(receiptsData);
      setTotalRevenue(revenueData.revenue);
      setTopProducts(topData);
      setTopRevenue(topRevData.revenue);
      setMonthlyData(monthData);
      setYearlyData(yearData);
    } catch (error) {
      console.error('Failed to load analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'];

  return (
    <div className="analysis-page">
      <div className="analysis-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          ← Nazad
        </button>
        <h1>📊 Analiza podataka</h1>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Pregled
        </button>
        <button 
          className={`tab ${activeTab === 'receipts' ? 'active' : ''}`}
          onClick={() => setActiveTab('receipts')}
        >
          Računi ({receipts.length})
        </button>
        <button 
          className={`tab ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          Mesečni pregled
        </button>
        <button 
          className={`tab ${activeTab === 'yearly' ? 'active' : ''}`}
          onClick={() => setActiveTab('yearly')}
        >
          Godišnji pregled
        </button>
      </div>

      {loading ? (
        <div className="loading">Učitavanje podataka...</div>
      ) : (
        <div className="analysis-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-value">{(totalRevenue || 0).toLocaleString()} RSD</div>
                  <div className="stat-label">Ukupna zarada</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🧾</div>
                  <div className="stat-value">{receipts.length}</div>
                  <div className="stat-label">Broj računa</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-value">{(topRevenue || 0).toLocaleString()} RSD</div>
                  <div className="stat-label">Zarada Top 10</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📈</div>
                  <div className="stat-value">{receipts.length > 0 ? Math.round((totalRevenue || 0) / receipts.length) : 0} RSD</div>
                  <div className="stat-label">Prosečan račun</div>
                </div>
              </div>

              <div className="top-products-section">
                <h2>🏆 Top 10 najprodavanijih parfema</h2>
                {topProducts.length > 0 ? (
                  <div className="top-products-list">
                    {topProducts.map((product, index) => (
                      <div key={index} className="top-product-item">
                        <span className="rank">#{index + 1}</span>
                        <span className="product-name">{product}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">Nema podataka o prodaji</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'receipts' && (
            <div className="receipts-section">
              <h2>Svi fiskalni računi</h2>
              {receipts.length > 0 ? (
                <div className="table-container">
                  <table className="receipts-table">
                    <thead>
                      <tr>
                        <th>Tip prodaje</th>
                        <th>Način plaćanja</th>
                        <th>Parfemi</th>
                        <th>Količina</th>
                        <th>Iznos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receipts.map((receipt, index) => (
                        <tr key={index}>
                          <td>{receipt.tipProdaje}</td>
                          <td>{receipt.nacinPlacanja}</td>
                          <td>{receipt.spisakParfema.join(', ')}</td>
                          <td>{receipt.kolicina}</td>
                          <td className="amount">{receipt.iznos.toLocaleString()} RSD</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">Nema kreiranih računa</p>
              )}
            </div>
          )}

          {activeTab === 'monthly' && (
            <div className="monthly-section">
              <h2>📅 Prihod po mesecima</h2>
              {monthlyData.length > 0 ? (
                <div className="chart-container">
                  <div className="bar-chart">
                    {monthlyData.map((data, index) => {
                      const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));
                      const height = (data.revenue / maxRevenue) * 100;
                      const monthIndex = parseInt(data.month) - 1;
                      
                      return (
                        <div key={index} className="bar-item">
                          <div className="bar-wrapper">
                            <div 
                              className="bar" 
                              style={{ height: `${height}%` }}
                              title={`${data.revenue.toLocaleString()} RSD`}
                            ></div>
                          </div>
                          <div className="bar-value">{data.revenue.toLocaleString()}</div>
                          <div className="bar-label">{monthNames[monthIndex] || data.month}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="no-data">Nema podataka za mesečni pregled</p>
              )}
            </div>
          )}

          {activeTab === 'yearly' && (
            <div className="yearly-section">
              <h2>📆 Prihod po godinama</h2>
              {yearlyData.length > 0 ? (
                <div className="chart-container">
                  <div className="bar-chart">
                    {yearlyData.map((data, index) => {
                      const maxRevenue = Math.max(...yearlyData.map(d => d.revenue));
                      const height = (data.revenue / maxRevenue) * 100;
                      
                      return (
                        <div key={index} className="bar-item">
                          <div className="bar-wrapper">
                            <div 
                              className="bar bar-year" 
                              style={{ height: `${height}%` }}
                              title={`${data.revenue.toLocaleString()} RSD`}
                            ></div>
                          </div>
                          <div className="bar-value">{data.revenue.toLocaleString()}</div>
                          <div className="bar-label">{data.year}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="no-data">Nema podataka za godišnji pregled</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
