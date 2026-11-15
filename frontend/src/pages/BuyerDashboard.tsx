import React, { useState, useEffect } from 'react';
import { Briefcase, ShoppingBag, ShieldCheck, CheckCircle2, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { CropDeal, BuyerOffer } from '../types';
import { PaymentCheckoutModal } from './PaymentCheckoutModal';

export const BuyerDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [myDeals, setMyDeals] = useState<CropDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.getMyDeals()
      .then((deals) => {
        setMyDeals(deals);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const prof = user.buyer_profile;
  const isPro = prof?.is_pro || false;

  const handleUpdateDealStatus = async (dealId: number, newStatus: string) => {
    try {
      await api.updateDealStatus(dealId, { deal_status: newStatus });
      api.getMyDeals().then((data) => setMyDeals(data));
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Header Banner */}
      <div className="card mb-6" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: '#fff', padding: '1.75rem', borderRadius: '18px' }}>
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
              <Briefcase size={30} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="badge" style={{ background: '#dbeafe', color: '#1e40af' }}>
                  {prof?.business_type || 'Crop Trader & Buyer'}
                </span>
                {isPro ? (
                  <span className="badge badge-green flex items-center gap-1">
                    <ShieldCheck size={12} />
                    Buyer Pro Active
                  </span>
                ) : (
                  <span className="badge badge-amber">Standard Buyer</span>
                )}
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>
                {prof?.company_name || user.full_name}
              </h1>
              <div style={{ fontSize: '0.85rem', color: '#bfdbfe' }}>
                District: <strong>{user.district}, {user.state}</strong> | GST: <strong>{prof?.gst_number || 'Registered Trader'}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isPro && (
              <button 
                onClick={() => setIsProModalOpen(true)}
                className="btn btn-secondary" 
                style={{ background: '#fef3c7', color: '#92400e', border: 'none' }}
              >
                ★ Upgrade to Buyer Pro (₹199/mo)
              </button>
            )}
            <button onClick={() => onNavigate('marketplace')} className="btn btn-secondary" style={{ background: '#ffffff', color: '#1e40af' }}>
              Search Available Crops
            </button>
          </div>
        </div>
      </div>

      {/* Main Deals & Purchase Tracker */}
      <div className="grid grid-cols-3 md-grid-cols-1 gap-8">
        <div style={{ gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            My Crop Deals & Purchase Negotiations ({myDeals.length})
          </h2>

          {loading ? (
            <div className="card text-center p-8 text-muted">Loading your deals...</div>
          ) : myDeals.length === 0 ? (
            <div className="card text-center p-8">
              <ShoppingBag size={36} className="text-muted mx-auto mb-2" />
              <p>You have not initiated any crop purchases yet.</p>
              <button onClick={() => onNavigate('marketplace')} className="btn btn-primary btn-sm mt-3">
                Explore Crop Marketplace
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {myDeals.map((deal) => (
                <div key={deal.id} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge badge-green">{deal.crop_name || 'Crop'}</span>
                    <span className="badge badge-blue">Status: {deal.deal_status}</span>
                  </div>

                  <div className="grid grid-cols-2 md-grid-cols-1 gap-2 mb-3">
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Agreed Deal Value</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534' }}>
                        ₹{deal.total_deal_value.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {deal.agreed_quantity} units @ ₹{deal.agreed_price_per_unit}/unit
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Farmer / Seller</span>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        {deal.farmer_name || 'Farmer Ramesh'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Platform Fee: ₹{deal.platform_commission_amount} ({deal.platform_commission_percent}%)
                      </div>
                    </div>
                  </div>

                  {/* Deal Workflow Status Actions */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }} className="flex items-center justify-between flex-wrap gap-2">
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Update Deal Workflow:
                    </span>
                    <div className="flex items-center gap-2">
                      {deal.deal_status !== 'Completed' && (
                        <button
                          onClick={() => handleUpdateDealStatus(deal.id, 'Completed')}
                          className="btn btn-primary btn-sm"
                        >
                          Confirm Delivery & Complete
                        </button>
                      )}
                      {deal.deal_status !== 'Cancelled' && deal.deal_status !== 'Completed' && (
                        <button
                          onClick={() => handleUpdateDealStatus(deal.id, 'Cancelled')}
                          className="btn btn-outline btn-sm text-red-600"
                        >
                          Cancel Deal
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Buyer Pro Benefits */}
        <div>
          <div className="card" style={{ border: '1px solid #bbf7d0', background: isPro ? '#f0fdf4' : '#fff' }}>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={20} className="text-green-600" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                Buyer Pro Plan Status
              </h3>
            </div>

            {isPro ? (
              <div>
                <span className="badge badge-green mb-2">Pro Subscription Active</span>
                <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
                  You have access to verified farmer contact details, priority offer delivery, and advanced search filters across all Indian districts.
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>
                  Upgrade to Buyer Pro (₹199/month) for direct farmer telephone numbers, priority offer notifications, and trade dispute protection.
                </p>
                <button onClick={() => setIsProModalOpen(true)} className="btn btn-primary w-full" style={{ width: '100%' }}>
                  Upgrade to Pro
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <PaymentCheckoutModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        plan={{
          purpose: 'buyer_pro',
          title: 'Buyer Pro Monthly Subscription',
          amount: 199,
          description: 'Advanced filters, direct farmer contact details, and priority deal notifications.'
        }}
        onSuccess={() => alert("Buyer Pro activated successfully!")}
      />
    </div>
  );
};
