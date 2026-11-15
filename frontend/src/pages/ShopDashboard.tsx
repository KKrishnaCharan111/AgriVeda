import React, { useState, useEffect } from 'react';
import { ShoppingBag, Tractor, ShieldCheck, Plus, CheckCircle2, Phone, Send, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { ShopProduct, EquipmentRental } from '../types';
import { PaymentCheckoutModal } from './PaymentCheckoutModal';

export const ShopDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [rentals, setRentals] = useState<EquipmentRental[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Product Modal
  const [isAddProdOpen, setIsAddProdOpen] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodCat, setProdCat] = useState('Seeds');
  const [prodBrand, setProdBrand] = useState('');
  const [prodPrice, setProdPrice] = useState(850);
  const [prodUnit, setProdUnit] = useState('Bag (25kg)');
  const [prodDesc, setProdDesc] = useState('');

  // Promotion Checkout Modal
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  const fetchShopData = () => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      api.getProducts(),
      api.getRentals(),
      api.getMyShopEnquiries()
    ]).then(([prods, rents, enqs]) => {
      setProducts(prods.filter((p) => p.shop_id === user.id));
      setRentals(rents.filter((r) => r.shop_id === user.id));
      setEnquiries(enqs);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchShopData();
  }, [user]);

  if (!user) return null;

  const prof = user.shop_profile;
  const isVerified = prof?.is_verified || false;

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProduct({
        name: prodName,
        category: prodCat,
        brand: prodBrand,
        price: Number(prodPrice),
        unit: prodUnit,
        description: prodDesc
      });
      setIsAddProdOpen(false);
      setProdName('');
      fetchShopData();
    } catch {
      alert("Failed to add product");
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Shop Header Banner */}
      <div className="card mb-6" style={{ background: 'linear-gradient(135deg, #581c87 0%, #7e22ce 100%)', color: '#fff', padding: '1.75rem', borderRadius: '18px' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingBag size={30} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {isVerified ? (
                  <span className="badge badge-green flex items-center gap-1">
                    <ShieldCheck size={12} />
                    Official Verified Shop
                  </span>
                ) : (
                  <span className="badge badge-amber">Verification Pending Admin Audit</span>
                )}
                {prof?.is_featured && <span className="badge badge-blue">★ Featured Store</span>}
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>
                {prof?.shop_name || user.full_name}
              </h1>
              <div style={{ fontSize: '0.85rem', color: '#f3e8ff' }}>
                Owner: <strong>{prof?.owner_name || user.full_name}</strong> | Address: <strong>{prof?.address || `${user.village}, ${user.district}`}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPromoModalOpen(true)}
              className="btn btn-secondary"
              style={{ background: '#fef3c7', color: '#78350f', border: 'none' }}
            >
              ★ Promote Shop (₹49)
            </button>
            <button
              onClick={() => setIsAddProdOpen(true)}
              className="btn btn-secondary"
              style={{ background: '#ffffff', color: '#581c87' }}
            >
              <Plus size={18} />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 md-grid-cols-1 gap-8">
        {/* Left Column: My Products & Rentals */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              My Listed Products ({products.length})
            </h2>
            <button onClick={() => setIsAddProdOpen(true)} className="btn btn-primary btn-sm">
              + New Product
            </button>
          </div>

          {loading ? (
            <div className="card text-center p-6 text-muted">Loading inventory...</div>
          ) : products.length === 0 ? (
            <div className="card text-center p-6 text-muted mb-6">
              <p>No products listed yet in your store.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mb-8">
              {products.map((p) => (
                <div key={p.id} className="card p-3 flex items-center justify-between">
                  <div>
                    <span className="badge badge-green mb-1">{p.category}</span>
                    <h4 style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</h4>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Price: <strong style={{ color: '#166534' }}>₹{p.price} / {p.unit}</strong> | Brand: {p.brand}
                    </div>
                  </div>
                  <span className="badge badge-green">In Stock</span>
                </div>
              ))}
            </div>
          )}

          {/* Customer Enquiries */}
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            Direct Farmer Enquiries ({enquiries.length})
          </h2>
          {enquiries.length === 0 ? (
            <div className="card text-center p-6 text-muted">
              <p>No customer enquiries received yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {enquiries.map((e) => (
                <div key={e.id} className="card p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="badge badge-blue">Product: {e.product_name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(e.created_at).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{e.customer_name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>"{e.message}"</div>
                  <a href={`tel:${e.contact_phone}`} className="btn btn-outline btn-sm inline-flex items-center gap-1.5">
                    <Phone size={14} className="text-green-600" />
                    <span>Call Customer (+91 {e.contact_phone})</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Verification & Promotion Info */}
        <div>
          <div className="card mb-6">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
              Store Verification
            </h3>
            <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              {isVerified ? (
                <div className="p-3 bg-green-50 text-green-900 rounded border border-green-200">
                  <ShieldCheck size={20} className="text-green-600 mb-1" />
                  <div>Your shop has verified credentials on AgriVeda. Farmers trust verified sellers for seeds and chemicals.</div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 text-amber-900 rounded border border-amber-200">
                  <div>Your business license is pending admin verification. Unverified shops cannot display the official verified badge until reviewed.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddProdOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <button onClick={() => setIsAddProdOpen(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', border: 'none', background: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Add Agri Product / Seed
            </h3>
            <form onSubmit={handleCreateProduct}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input type="text" required value={prodName} onChange={(e) => setProdName(e.target.value)} placeholder="e.g. Certified Paddy Seeds BPT 5204" className="form-input" />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select value={prodCat} onChange={(e) => setProdCat(e.target.value)} className="form-select">
                    <option value="Seeds">Seeds (విత్తనాలు)</option>
                    <option value="Fertilizers">Fertilizers (ఎరువులు)</option>
                    <option value="Pesticides">Pesticides (మందులు)</option>
                    <option value="Farming Tools">Tools & Sprayers (పరికరాలు)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input type="text" value={prodBrand} onChange={(e) => setProdBrand(e.target.value)} placeholder="e.g. AgriBio" className="form-input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input type="number" required value={prodPrice} onChange={(e) => setProdPrice(Number(e.target.value))} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <input type="text" value={prodUnit} onChange={(e) => setProdUnit(e.target.value)} className="form-input" />
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Description</label>
                <textarea rows={2} value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} placeholder="Product quality, batch, and germination guarantee..." className="form-textarea" />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddProdOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promotion Modal */}
      <PaymentCheckoutModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        plan={{
          purpose: 'featured_promotion',
          title: 'Featured Store Promotion Campaign',
          amount: 49,
          description: 'Highlight your shop at the top of local farmer search results for 15 days.'
        }}
        onSuccess={() => alert("Promotion campaign activated!")}
      />
    </div>
  );
};
