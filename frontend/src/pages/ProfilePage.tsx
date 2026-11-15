import React, { useState } from 'react';
import { User, MapPin, Globe, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { RoleBadge } from '../components/RoleBadge';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [district, setDistrict] = useState(user?.district || 'Guntur');
  const [village, setVillage] = useState(user?.village || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateMe({
        full_name: fullName,
        district,
        village,
        preferred_language: language
      });
      await refreshUser();
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem', maxWidth: '640px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
        {t.profile} & Settings
      </h1>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        Manage your AgriVeda identity, regional preferences, and contact information.
      </p>

      {success && (
        <div className="p-3 bg-green-100 text-green-800 rounded flex items-center gap-2 mb-4">
          <CheckCircle2 size={16} />
          <span>Profile updated successfully!</span>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#f0fdf4',
            border: '2px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            color: '#166534',
            fontWeight: 800
          }}>
            {user.full_name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{user.full_name}</h2>
              <RoleBadge role={user.role} />
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Phone: +91 {user.phone}
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">{t.fullName}</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.language}</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="form-select"
            >
              <option value="te">తెలుగు (Telugu - Recommended)</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="form-group">
              <label className="form-label">{t.district}</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t.village}</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary w-full" style={{ width: '100%' }}>
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
