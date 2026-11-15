import React, { useState } from 'react';
import { Check, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { PaymentCheckoutModal } from './PaymentCheckoutModal';

export const PricingPage: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

  const plans = [
    {
      purpose: 'buyer_pro',
      title: t.buyerProTitle,
      price: 199,
      unit: '/ month',
      description: t.buyerProDesc,
      recommended: true,
      features: [
        'Advanced crop search by state, district, and price range',
        'Direct farmer contact phone numbers',
        'Priority offer delivery & notifications',
        'Deal completion & tracking dashboard',
        'Commercial purchase analytics'
      ]
    },
    {
      purpose: 'shop_listing',
      title: t.shopListingTitle,
      price: 99,
      unit: '/ month',
      description: t.shopListingDesc,
      recommended: false,
      features: [
        'List seeds, bio-fertilizers, and pesticides',
        'List tractor and harvester equipment rentals',
        'Receive direct farmer enquiries with phone alerts',
        'Update inventory and product pricing anytime',
        'Eligible for Official Store Verification'
      ]
    },
    {
      purpose: 'featured_promotion',
      title: t.featuredPromotionTitle,
      price: 49,
      unit: '/ 15-day campaign',
      description: 'Highlight your shop or crop listing at the top of search results.',
      recommended: false,
      features: [
        'Top placement in crop and shop search results',
        'Highlighted card styling with "Featured" tag',
        'Up to 3x more direct farmer calls',
        'Active for 15 days per campaign',
        'Detailed view statistics'
      ]
    }
  ];

  return (
    <div className="container" style={{ padding: '3rem 1.25rem' }}>
      <div className="text-center mb-10">
        <span className="badge badge-green mb-2">Transparent Agritech Pricing</span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          {language === 'te' ? 'అగ్రివేద ప్లాన్లు & సభ్యత్వాలు' : 'AgriVeda Plans & Subscriptions'}
        </h1>
        <p style={{ color: '#64748b', maxWidth: '640px', margin: '0 auto' }}>
          {language === 'te' 
            ? 'రైతులకు ప్రాథమిక సేవలు ఎల్లప్పుడూ ఉచితం. వ్యాపారాలు మరియు కొనుగోలుదారుల కోసం సరసమైన ప్లాన్లు.' 
            : 'Basic farmer services remain 100% free. Affordable plans for professional crop buyers and local agricultural stores.'}
        </p>
      </div>

      <div className="grid grid-cols-3 md-grid-cols-1 gap-6 mb-12">
        {plans.map((p) => (
          <div
            key={p.purpose}
            className="card flex flex-col justify-between"
            style={{
              padding: '2rem',
              border: p.recommended ? '2px solid #16a34a' : '1px solid #e2e8f0',
              position: 'relative',
              background: '#ffffff'
            }}
          >
            {p.recommended && (
              <span 
                className="badge badge-green"
                style={{ position: 'absolute', top: '-12px', right: '20px', padding: '0.35rem 0.75rem' }}
              >
                ★ Most Popular
              </span>
            )}

            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                {p.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem', minHeight: '40px' }}>
                {p.description}
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#166534' }}>
                  ₹{p.price}
                </span>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}> {p.unit}</span>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Included Benefits:
                </span>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.75rem' }}>
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  onOpenAuth();
                } else {
                  setSelectedPlan(p);
                }
              }}
              className={`btn w-full ${p.recommended ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.75rem' }}
            >
              {t.payNow}
            </button>
          </div>
        ))}
      </div>

      {/* Free Farmer Guarantee Note */}
      <div className="card text-center p-6" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#166534', marginBottom: '0.35rem' }}>
          🌾 100% Free for Farmers & Agricultural Labour
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#475569', maxWidth: '680px', margin: '0 auto' }}>
          Listing crops for sale, applying for farm jobs, checking weather warnings, mandi prices, government schemes, and using Crop Doctor are completely free for all Indian farmers.
        </p>
      </div>

      {/* Checkout Modal */}
      <PaymentCheckoutModal
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        plan={selectedPlan}
        onSuccess={() => alert("Subscription activated successfully!")}
      />
    </div>
  );
};
