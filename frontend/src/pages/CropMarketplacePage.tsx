import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, MapPin, Tag, ShieldCheck, Tractor } from 'lucide-react';
import type { CropListing } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { CropDetailsModal } from './CropDetailsModal';
import { SellCropModal } from './SellCropModal';

export const CropMarketplacePage: React.FC<{ onOpenAuth: (mode: 'login' | 'register') => void }> = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [crops, setCrops] = useState<CropListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [organicOnly, setOrganicOnly] = useState(false);

  // Modals
  const [selectedCrop, setSelectedCrop] = useState<CropListing | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  const fetchCrops = () => {
    setLoading(true);
    let params = [];
    if (searchQuery.trim()) params.push(`query=${encodeURIComponent(searchQuery.trim())}`);
    if (selectedCategory !== 'All') params.push(`category=${encodeURIComponent(selectedCategory)}`);
    if (selectedDistrict !== 'All') params.push(`district=${encodeURIComponent(selectedDistrict)}`);
    if (organicOnly) params.push('organic_only=true');

    api.getCrops(params.join('&'))
      .then((data) => {
        setCrops(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCrops();
  }, [selectedCategory, selectedDistrict, organicOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCrops();
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Top Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
            {t.marketplace}
          </h1>
          <p style={{ color: '#64748b' }}>
            {language === 'te' 
              ? 'రైతుల నుండి నేరుగా తాజా పంటల కొనుగోలు మరియు అమ్మకం' 
              : 'Direct crop trading between verified farmers and wholesale buyers'}
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) {
              onOpenAuth('login');
            } else {
              setIsSellModalOpen(true);
            }
          }}
          className="btn btn-primary btn-lg flex items-center gap-2"
        >
          <Plus size={20} />
          <span>{t.sellCrop}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card mb-6" style={{ padding: '1rem' }}>
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3 items-center">
          <div className="flex-1" style={{ minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'te' ? 'పంట పేరు, రకం లేదా జిల్లాతో వెతకండి...' : 'Search by crop name, variety, district...'}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>

          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="All">All Categories</option>
            <option value="Cereals">Cereals (ధాన్యాలు)</option>
            <option value="Pulses">Pulses (పప్పులు)</option>
            <option value="Vegetables">Vegetables (కూరగాయలు)</option>
            <option value="Fruits">Fruits (పండ్లు)</option>
            <option value="Spices">Spices (మసాలాలు)</option>
            <option value="Commercial">Commercial (వాణిజ్యం)</option>
          </select>

          <select 
            value={selectedDistrict} 
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '140px' }}
          >
            <option value="All">All Districts</option>
            <option value="Guntur">Guntur</option>
            <option value="Krishna">Krishna</option>
            <option value="East Godavari">East Godavari</option>
            <option value="West Godavari">West Godavari</option>
            <option value="Kurnool">Kurnool</option>
            <option value="Anantapur">Anantapur</option>
            <option value="Warangal">Warangal</option>
          </select>

          <div className="flex items-center gap-1.5" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            <input
              type="checkbox"
              id="mktOrganic"
              checked={organicOnly}
              onChange={(e) => setOrganicOnly(e.target.checked)}
            />
            <label htmlFor="mktOrganic" style={{ cursor: 'pointer' }}>Organic</label>
          </div>

          <button type="submit" className="btn btn-secondary">
            <Filter size={16} />
            <span>Apply Filters</span>
          </button>
        </form>
      </div>

      {/* Crop Listings Grid */}
      {loading ? (
        <div className="card text-center p-8 text-muted">
          <p>Loading available crops...</p>
        </div>
      ) : crops.length === 0 ? (
        <div className="card text-center p-8">
          <Tractor size={40} className="text-muted mx-auto mb-2" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No crops found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Try clearing your search filters or be the first farmer to list a crop!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 md-grid-cols-1 gap-6">
          {crops.map((crop) => (
            <div
              key={crop.id}
              className="card card-interactive flex flex-col justify-between"
              onClick={() => setSelectedCrop(crop)}
              style={{ position: 'relative' }}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="badge badge-green">{crop.category}</span>
                  <span className="badge badge-amber">{crop.quality_grade}</span>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                    {language === 'te' && crop.crop_name_te ? crop.crop_name_te : crop.crop_name}
                  </h3>
                  {crop.organic_certified && (
                    <span title="Certified Organic">
                      <ShieldCheck size={16} className="text-green-600" />
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  Variety: <span style={{ fontWeight: 600, color: '#334155' }}>{crop.variety}</span>
                </div>

                <div className="p-3 rounded mb-3" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Expected Price</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534' }}>
                      ₹{crop.expected_price_per_unit.toLocaleString('en-IN')}
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}> / {crop.unit}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Available Qty</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                      {crop.quantity} {crop.unit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted mb-2">
                  <MapPin size={13} />
                  <span>{crop.village ? `${crop.village}, ` : ''}{crop.district}, {crop.state}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }} className="flex items-center justify-between">
                <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                  By: <strong>{crop.farmer_name || 'Farmer'}</strong>
                </span>
                <button className="btn btn-secondary btn-sm">
                  View & Offer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CropDetailsModal
        crop={selectedCrop}
        onClose={() => setSelectedCrop(null)}
        onOpenAuth={() => onOpenAuth('login')}
        onOfferSuccess={fetchCrops}
      />

      <SellCropModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        onSuccess={fetchCrops}
      />
    </div>
  );
};
