import React from 'react';
import { Sprout, ShieldCheck, Heart, PhoneCall, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { language, t } = useLanguage();

  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '3.5rem 0 2rem 0', marginTop: '4rem' }}>
      <div className="container">
        <div className="grid grid-cols-4 md-grid-cols-1 gap-8 mb-8">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div style={{
                background: '#15803d',
                borderRadius: '8px',
                padding: '6px',
                color: '#fff',
                display: 'flex'
              }}>
                <Sprout size={20} />
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>AgriVeda</span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem', color: '#cbd5e1' }}>
              {t.tagline}
              <br />
              <strong>{t.subtagline}</strong>
            </p>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Empowering farmers, agricultural labourers, buyers, and local shops across India with transparent digital commerce and AI advisory.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
              {language === 'te' ? 'వేదిక విభాగాలు' : 'Platform Portals'}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <li><button onClick={() => onNavigate('marketplace')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>{t.marketplace}</button></li>
              <li><button onClick={() => onNavigate('labour')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>{t.labour}</button></li>
              <li><button onClick={() => onNavigate('shops')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>{t.shops}</button></li>
              <li><button onClick={() => onNavigate('pricing')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>{t.pricing}</button></li>
            </ul>
          </div>

          {/* Smart Features */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
              {language === 'te' ? 'స్మార్ట్ సేవలు' : 'Smart Agriculture'}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <li><button onClick={() => onNavigate('crop-doctor')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>{t.cropDoctor}</button></li>
              <li><button onClick={() => onNavigate('problem-solver')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>{t.problemSolver}</button></li>
              <li><button onClick={() => onNavigate('weather')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>{t.weatherAlerts}</button></li>
              <li><button onClick={() => onNavigate('market-prices')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>{t.marketPrices}</button></li>
              <li><button onClick={() => onNavigate('schemes')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>{t.govSchemes}</button></li>
              <li><button onClick={() => onNavigate('calendar')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>{t.farmingAssistant}</button></li>
            </ul>
          </div>

          {/* Trust & Policy */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
              {language === 'te' ? 'విశ్వసనీయత & మద్దతు' : 'Trust & Policies'}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <li><button onClick={() => onNavigate('refunds')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>{t.refunds}</button></li>
              <li><button onClick={() => onNavigate('complaints')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>{t.support}</button></li>
              <li><button onClick={() => onNavigate('admin-dashboard')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>{t.adminRole}</button></li>
            </ul>
            <div className="mt-4 p-3 rounded" style={{ background: '#1e293b', fontSize: '0.75rem', lineHeight: 1.4 }}>
              <ShieldCheck size={16} className="text-green-400 mb-1" />
              <div>Zero-budget development verified architecture. Built for farmers across India.</div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div style={{ borderTop: '1px solid #334155', paddingTop: '1.5rem', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
          <p className="mb-2">
            <strong>Important Legal Disclaimer:</strong> AgriVeda is an independent digital marketplace and agricultural problem-solving technology platform. AgriVeda is NOT a government portal or affiliated with any government agency, ministry, or banking institution. Government scheme information and market prices are aggregated from public domain portals (such as Agmarknet and official portals) for informational guidance only. AgriVeda does not guarantee eligibility, crop yield, or subsidy payouts.
          </p>
          <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
            <div>
              © 2026 AgriVeda Technologies. All rights reserved.
            </div>
            <div className="flex items-center gap-1">
              <span>Made with</span> <Heart size={14} className="text-red-500 fill-red-500" /> <span>for Indian Farmers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
