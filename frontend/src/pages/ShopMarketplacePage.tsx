import React, { useState, useEffect } from 'react';
import { ShoppingBag, Tractor, ShieldCheck, Phone, MapPin, Plus, Send, X, CheckCircle2 } from 'lucide-react';
import type { ShopProduct, EquipmentRental } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

export const ShopMarketplacePage: React.FC<{ onOpenAuth: (mode: 'login' | 'register') => void }> = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'products' | 'rentals' | 'shops'>('products');
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [rentals, setRentals] = useState<EquipmentRental[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Enquiry Modal
  const [enquiryTarget, setEnquiryTarget] = useState<any | null>(null);
  const [enquiryPhone, setEnquiryPhone] = useState(user?.phone || '');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getProducts(),
      api.getRentals(),
      api.getShops()
    ]).then(([prods, rents, shps]) => {
      setProducts(prods);
      setRentals(rents);
      setShops(shps);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth('login');
      return;
    }
    if (!enquiryTarget) return;

    setEnquiryLoading(true);
    try {
      await api.createShopEnquiry({
        shop_id: enquiryTarget.shop_id || enquiryTarget.id,
        product_name: enquiryTarget.name || enquiryTarget.equipment_name || enquiryTarget.shop_name,
        customer_name: user.full_name,
        contact_phone: enquiryPhone,
        message: enquiryMessage
      });
      setEnquiryLoading(false);
      setEnquirySuccess(true);
      setTimeout(() => {
        setEnquiryTarget(null);
        setEnquirySuccess(false);
        setEnquiryMessage('');
      }, 1500);
    } catch {
      setEnquiryLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
            {t.shops}
          </h1>
          <p style={{ color: '#64748b' }}>
            {language === 'te' 
              ? 'ధ్రువీకరించబడిన విత్తనాలు, ఎరువులు, మందులు మరియు వ్యవసాయ యంత్రాల అద్దె' 
              : 'Certified seeds, bio-fertilizers, tools, and tractor/harvester machinery rentals'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          onClick={() => setActiveTab('products')}
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
        >
          {language === 'te' ? 'ఉత్పత్తులు (Seeds & Fertilizers)' : 'Farming Inputs & Seeds'} ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('rentals')}
          className={`tab-btn ${activeTab === 'rentals' ? 'active' : ''}`}
        >
          {language === 'te' ? 'యంత్రాల అద్దె (Machinery Rentals)' : 'Equipment Rentals'} ({rentals.length})
        </button>
        <button
          onClick={() => setActiveTab('shops')}
          className={`tab-btn ${activeTab === 'shops' ? 'active' : ''}`}
        >
          {language === 'te' ? 'అగ్రి షాపుల జాబితా (Shops)' : 'Verified Shops'} ({shops.length})
        </button>
      </div>

      {/* Tab 1: Products */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-3 md-grid-cols-1 gap-6">
          {products.map((p) => (
            <div key={p.id} className="card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="badge badge-green">{p.category}</span>
                  {p.is_shop_verified && (
                    <span className="badge badge-blue">
                      <ShieldCheck size={12} />
                      Verified Shop
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                  {language === 'te' && p.name_te ? p.name_te : p.name}
                </h3>
                {p.brand && (
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                    Brand: <strong>{p.brand}</strong>
                  </div>
                )}

                <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem', lineHeight: 1.4 }}>
                  {p.description}
                </p>

                <div className="p-3 rounded mb-3" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Price</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534' }}>
                    ₹{p.price.toLocaleString('en-IN')} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>/ {p.unit}</span>
                  </div>
                </div>

                <div className="text-xs text-muted mb-2">
                  Shop: <strong>{p.shop_name || 'Agri Shop'}</strong> ({p.shop_district})
                </div>
              </div>

              <div className="flex items-center gap-2" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                {p.shop_phone && (
                  <a href={`tel:${p.shop_phone}`} className="btn btn-outline btn-sm flex-1">
                    <Phone size={14} className="text-green-600" />
                    <span>Call Shop</span>
                  </a>
                )}
                <button 
                  onClick={() => setEnquiryTarget(p)}
                  className="btn btn-primary btn-sm flex-1"
                >
                  <Send size={14} />
                  <span>Enquiry</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Rentals */}
      {activeTab === 'rentals' && (
        <div className="grid grid-cols-2 md-grid-cols-1 gap-6">
          {rentals.map((r) => (
            <div key={r.id} className="card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="badge badge-amber">{r.category}</span>
                  {r.driver_included && <span className="badge badge-green">Driver Included</span>}
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                  {language === 'te' && r.equipment_name_te ? r.equipment_name_te : r.equipment_name}
                </h3>

                <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem', lineHeight: 1.4 }}>
                  {r.description}
                </p>

                <div className="grid grid-cols-2 gap-3 p-3 rounded mb-3" style={{ background: '#f8fafc' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Daily Rental</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534' }}>
                      ₹{r.daily_rate} / day
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Hourly Rate</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                      {r.hourly_rate ? `₹${r.hourly_rate} / hr` : 'On Request'}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted mb-2">
                  Provider: <strong>{r.shop_name}</strong> ({r.shop_district})
                </div>
              </div>

              <div className="flex items-center gap-2" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                {r.shop_phone && (
                  <a href={`tel:${r.shop_phone}`} className="btn btn-outline btn-sm flex-1">
                    <Phone size={14} className="text-green-600" />
                    <span>Call Provider</span>
                  </a>
                )}
                <button 
                  onClick={() => setEnquiryTarget(r)}
                  className="btn btn-primary btn-sm flex-1"
                >
                  <Send size={14} />
                  <span>Book / Enquire</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Shops */}
      {activeTab === 'shops' && (
        <div className="grid grid-cols-3 md-grid-cols-1 gap-6">
          {shops.map((s) => (
            <div key={s.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="badge badge-purple">Agri Inputs</span>
                {s.is_verified && (
                  <span className="badge badge-green flex items-center gap-1">
                    <ShieldCheck size={12} />
                    Verified Store
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                {s.shop_name}
              </h3>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                Owner: <strong>{s.owner_name}</strong>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted mb-4">
                <MapPin size={13} />
                <span>{s.address}</span>
              </div>

              <a href={`tel:${s.phone}`} className="btn btn-outline btn-sm w-full flex justify-center gap-2">
                <Phone size={14} className="text-green-600" />
                <span>Call Shop (+91 {s.phone})</span>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Enquiry Modal */}
      {enquiryTarget && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <button onClick={() => setEnquiryTarget(null)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', border: 'none', background: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Send Enquiry: {enquiryTarget.name || enquiryTarget.equipment_name || enquiryTarget.shop_name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              The shop owner will receive your query and contact phone.
            </p>

            {enquirySuccess && (
              <div className="p-3 bg-green-100 text-green-800 rounded flex items-center gap-2 mb-3">
                <CheckCircle2 size={16} />
                <span>Enquiry sent successfully to the shop owner!</span>
              </div>
            )}

            <form onSubmit={handleSendEnquiry}>
              <div className="form-group">
                <label className="form-label">Your Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={enquiryPhone}
                  onChange={(e) => setEnquiryPhone(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Message / Requirement Details</label>
                <textarea
                  rows={3}
                  required
                  value={enquiryMessage}
                  onChange={(e) => setEnquiryMessage(e.target.value)}
                  placeholder="e.g. Inquiring about seed availability for 5 acres starting this weekend."
                  className="form-textarea"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEnquiryTarget(null)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={enquiryLoading} className="btn btn-primary">
                  {enquiryLoading ? 'Sending...' : 'Send Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
