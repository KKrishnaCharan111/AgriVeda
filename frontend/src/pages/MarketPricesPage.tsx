import React, { useState, useEffect } from 'react';
import { TrendingUp, MapPin, Search, Filter, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { MarketPrice } from '../types';

export const MarketPricesPage: React.FC = () => {
  const { language, t } = useLanguage();

  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  const fetchPrices = () => {
    setLoading(true);
    let params = [];
    if (selectedCrop !== 'All') params.push(`crop=${encodeURIComponent(selectedCrop)}`);
    if (selectedDistrict !== 'All') params.push(`district=${encodeURIComponent(selectedDistrict)}`);

    api.getMarketPrices(params.join('&'))
      .then((data) => {
        setPrices(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPrices();
  }, [selectedCrop, selectedDistrict]);

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Title */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-green flex items-center gap-1">
            <TrendingUp size={13} />
            Agmarknet & Mandi Live Feeds
          </span>
          <span className="badge badge-blue">Verified Prices</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a' }}>
          {t.marketPrices}
        </h1>
        <p style={{ color: '#64748b' }}>
          {language === 'te' 
            ? 'సమీప వ్యవసాయ మార్కెట్ యార్డుల తాజా కనీస, గరిష్ట మరియు సగటు మోడల్ ధరల వివరాలు' 
            : 'Track daily mandi arrival prices across Andhra Pradesh and Telangana agricultural markets'}
        </p>
      </div>

      {/* Filter Row */}
      <div className="card mb-6" style={{ padding: '1rem' }}>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Crop:</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="form-select"
              style={{ width: 'auto', minWidth: '160px' }}
            >
              <option value="All">All Crops (అన్ని పంటలు)</option>
              <option value="Red Chilli">Red Chilli (ఎర్ర మిరప)</option>
              <option value="Paddy">Paddy (వరి)</option>
              <option value="Cotton">Cotton (పత్తి)</option>
              <option value="Tomato">Tomato (టమాటా)</option>
              <option value="Turmeric">Turmeric (పసుపు)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>District:</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="form-select"
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="All">All Districts</option>
              <option value="Guntur">Guntur</option>
              <option value="Krishna">Krishna</option>
              <option value="Kurnool">Kurnool</option>
              <option value="Warangal">Warangal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mandi Table */}
      {loading ? (
        <div className="card text-center p-8 text-muted">Loading mandi prices...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '0.875rem 1rem' }}>Crop & Variety</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Mandi / Market Yard</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Location</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Min Price</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Modal Price</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Max Price</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Arrival Date</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Data Source</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        {language === 'te' && p.crop_name_te ? p.crop_name_te : p.crop_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.variety}</div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>
                      {p.market_name}
                    </td>
                    <td style={{ padding: '1rem', color: '#475569' }}>
                      {p.district}, {p.state}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>
                      ₹{p.min_price.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: '#166534', fontSize: '1rem' }}>
                      ₹{p.modal_price.toLocaleString('en-IN')}
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}> /{p.unit}</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>
                      ₹{p.max_price.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>
                      {p.arrival_date}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-green flex items-center gap-1" style={{ fontSize: '0.7rem' }}>
                        <ShieldCheck size={11} />
                        {p.data_source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
