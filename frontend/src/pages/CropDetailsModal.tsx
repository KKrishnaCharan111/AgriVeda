import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, ShieldCheck, Tag, Send, CheckCircle2 } from 'lucide-react';
import type { CropListing, BuyerOffer } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

interface CropDetailsModalProps {
  crop: CropListing | null;
  onClose: () => void;
  onOpenAuth: () => void;
  onOfferSuccess?: () => void;
}

export const CropDetailsModal: React.FC<CropDetailsModalProps> = ({ crop, onClose, onOpenAuth, onOfferSuccess }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [offers, setOffers] = useState<BuyerOffer[]>([]);
  const [offeredPrice, setOfferedPrice] = useState<number>(crop ? crop.expected_price_per_unit : 0);
  const [quantity, setQuantity] = useState<number>(crop ? crop.quantity : 1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (crop) {
      setOfferedPrice(crop.expected_price_per_unit);
      setQuantity(crop.quantity);
      if (user) {
        api.getCropOffers(crop.id)
          .then((data) => setOffers(data))
          .catch(() => {});
      }
    }
  }, [crop, user]);

  if (!crop) return null;

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.createOffer(crop.id, {
        listing_id: crop.id,
        offered_price_per_unit: Number(offeredPrice),
        quantity: Number(quantity),
        message
      });
      setSuccess("Your offer has been sent to the farmer!");
      setLoading(false);
      setMessage('');
      api.getCropOffers(crop.id).then((data) => setOffers(data));
      if (onOfferSuccess) onOfferSuccess();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to submit offer');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
        >
          <X size={20} />
        </button>

        {/* Crop Header */}
        <div className="flex items-center gap-3 mb-4">
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '14px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem'
          }}>
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-green">{crop.category}</span>
              <span className="badge badge-amber">{crop.quality_grade}</span>
              {crop.organic_certified && (
                <span className="badge badge-blue">
                  <ShieldCheck size={12} />
                  Organic Certified
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>
              {language === 'te' && crop.crop_name_te ? crop.crop_name_te : crop.crop_name}
            </h2>
            <div className="flex items-center gap-1 text-xs text-muted">
              <MapPin size={13} />
              <span>{crop.village ? `${crop.village}, ` : ''}{crop.district}, {crop.state}</span>
            </div>
          </div>
        </div>

        {/* Price & Quantity Grid */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg mb-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Expected Price</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#166534' }}>
              ₹{crop.expected_price_per_unit.toLocaleString('en-IN')} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>/ {crop.unit}</span>
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Available Quantity</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              {crop.quantity} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>{crop.unit}</span>
            </div>
          </div>
        </div>

        {crop.description && (
          <div className="mb-4">
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Description & Quality Notes</h4>
            <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>{crop.description}</p>
          </div>
        )}

        {/* Farmer Contact Info */}
        <div className="card mb-4" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.875rem' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone size={18} className="text-green-700" />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#166534' }}>
                  {crop.farmer_name || 'Farmer Ramesh'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {crop.farmer_phone ? `+91 ${crop.farmer_phone}` : 'Verified AgriVeda Farmer'}
                </div>
              </div>
            </div>
            {crop.farmer_phone && (
              <a 
                href={`tel:${crop.farmer_phone}`} 
                className="btn btn-primary btn-sm"
              >
                Call Farmer
              </a>
            )}
          </div>
        </div>

        {/* Send Purchase Offer Form (For Buyers) */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
            Send Purchase Offer & Negotiate
          </h4>

          {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
          {success && (
            <div className="flex items-center gap-1 text-xs text-green-700 bg-green-100 p-2 rounded mb-2">
              <CheckCircle2 size={14} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSendOffer}>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Offered Price (₹ / {crop.unit})</label>
                <input
                  type="number"
                  required
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(Number(e.target.value))}
                  className="form-input"
                />
              </div>
              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Quantity to Buy ({crop.unit})</label>
                <input
                  type="number"
                  required
                  max={crop.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Message / Negotiation Terms</label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Can collect directly from farm by tomorrow evening"
                className="form-input"
              />
            </div>

            <div className="flex items-center justify-between">
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                Total Deal Offer: <span style={{ color: '#166534' }}>₹{(offeredPrice * quantity).toLocaleString('en-IN')}</span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                <Send size={16} />
                <span>{loading ? 'Sending...' : 'Send Offer'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
