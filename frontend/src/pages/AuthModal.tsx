import React, { useState } from 'react';
import { X, Tractor, Users, Briefcase, ShoppingBag, ShieldCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login', onSuccess }) => {
  const { login, register } = useAuth();
  const { language, t } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<UserRole>('farmer');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [district, setDistrict] = useState('Guntur');
  const [village, setVillage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(phone, password);
      } else {
        await register({
          phone,
          password,
          full_name: fullName,
          role,
          preferred_language: language,
          state: 'Andhra Pradesh',
          district,
          village
        });
      }
      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Operation failed');
    }
  };

  // Quick Demo Login helper for immediate testing
  const handleQuickDemo = (demoPhone: string, demoPass: string) => {
    setPhone(demoPhone);
    setPassword(demoPass);
    setMode('login');
    login(demoPhone, demoPass)
      .then(() => {
        onClose();
        if (onSuccess) onSuccess();
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
        >
          <X size={20} />
        </button>

        <div className="mb-4">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            {mode === 'login' ? t.login : t.register}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            {mode === 'login' 
              ? (language === 'te' ? 'మీ ఖాతాలోకి ప్రవేశించండి' : 'Access your AgriVeda dashboard') 
              : (language === 'te' ? 'కొత్త అగ్రివేద ఖాతాను సృష్టించండి' : 'Create a new free account on AgriVeda')}
          </p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Demo Fast-Login Pill Buttons */}
        <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '0.75rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            ⚡ 1-Click Demo Accounts (Local Testing)
          </div>
          <div className="flex flex-wrap gap-1">
            <button 
              type="button" 
              onClick={() => handleQuickDemo('9123456780', 'farmer123')}
              className="btn btn-sm btn-outline" 
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            >
              <Tractor size={12} className="text-green-600" /> Farmer
            </button>
            <button 
              type="button" 
              onClick={() => handleQuickDemo('9123456781', 'labour123')}
              className="btn btn-sm btn-outline" 
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            >
              <Users size={12} className="text-amber-600" /> Labour
            </button>
            <button 
              type="button" 
              onClick={() => handleQuickDemo('9123456782', 'buyer123')}
              className="btn btn-sm btn-outline" 
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            >
              <Briefcase size={12} className="text-blue-600" /> Buyer
            </button>
            <button 
              type="button" 
              onClick={() => handleQuickDemo('9123456783', 'shop123')}
              className="btn btn-sm btn-outline" 
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            >
              <ShoppingBag size={12} className="text-purple-600" /> Shop
            </button>
            <button 
              type="button" 
              onClick={() => handleQuickDemo('9876543210', 'admin123')}
              className="btn btn-sm btn-outline" 
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            >
              <ShieldCheck size={12} className="text-red-600" /> Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              {/* Role Selector Grid */}
              <div className="form-group">
                <label className="form-label">{t.selectRole}</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div
                    onClick={() => setRole('farmer')}
                    className={`card card-interactive p-2 flex items-center gap-2 ${role === 'farmer' ? 'border-green-600 bg-green-50' : ''}`}
                    style={{ padding: '0.6rem', border: role === 'farmer' ? '2px solid #16a34a' : '1px solid #e2e8f0' }}
                  >
                    <Tractor size={18} className="text-green-600" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.farmer}</span>
                  </div>

                  <div
                    onClick={() => setRole('labour')}
                    className={`card card-interactive p-2 flex items-center gap-2 ${role === 'labour' ? 'border-amber-600 bg-amber-50' : ''}`}
                    style={{ padding: '0.6rem', border: role === 'labour' ? '2px solid #d97706' : '1px solid #e2e8f0' }}
                  >
                    <Users size={18} className="text-amber-600" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.labourRole}</span>
                  </div>

                  <div
                    onClick={() => setRole('buyer')}
                    className={`card card-interactive p-2 flex items-center gap-2 ${role === 'buyer' ? 'border-blue-600 bg-blue-50' : ''}`}
                    style={{ padding: '0.6rem', border: role === 'buyer' ? '2px solid #2563eb' : '1px solid #e2e8f0' }}
                  >
                    <Briefcase size={18} className="text-blue-600" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.buyer}</span>
                  </div>

                  <div
                    onClick={() => setRole('shop')}
                    className={`card card-interactive p-2 flex items-center gap-2 ${role === 'shop' ? 'border-purple-600 bg-purple-50' : ''}`}
                    style={{ padding: '0.6rem', border: role === 'shop' ? '2px solid #9333ea' : '1px solid #e2e8f0' }}
                  >
                    <ShoppingBag size={18} className="text-purple-600" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.shopRole}</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t.fullName}</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Reddy"
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="form-group">
                  <label className="form-label">{t.district}</label>
                  <select 
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="form-select"
                  >
                    <option value="Guntur">Guntur</option>
                    <option value="Krishna">Krishna</option>
                    <option value="East Godavari">East Godavari</option>
                    <option value="West Godavari">West Godavari</option>
                    <option value="Kurnool">Kurnool</option>
                    <option value="Anantapur">Anantapur</option>
                    <option value="Chittoor">Chittoor</option>
                    <option value="Warangal">Warangal</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t.village}</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Tenali"
                    className="form-input"
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">{t.phone}</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.password}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
          >
            {loading ? 'Please wait...' : (mode === 'login' ? t.login : t.register)}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem' }}>
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={() => setMode('register')} 
                style={{ background: 'none', border: 'none', color: '#15803d', fontWeight: 700, cursor: 'pointer' }}
              >
                {t.register}
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button 
                type="button" 
                onClick={() => setMode('login')} 
                style={{ background: 'none', border: 'none', color: '#15803d', fontWeight: 700, cursor: 'pointer' }}
              >
                {t.login}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
