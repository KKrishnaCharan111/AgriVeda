import React, { useState, useEffect } from 'react';
import { Users, Briefcase, MapPin, CheckCircle2, Clock, Phone, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { JobApplication, JobListing } from '../types';

export const LabourDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [myApplications, setMyApplications] = useState<JobApplication[]>([]);
  const [nearbyJobs, setNearbyJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [skills, setSkills] = useState(user?.labour_profile?.skills || 'Harvesting, Planting, Spraying');
  const [wage, setWage] = useState(user?.labour_profile?.daily_wage_expected || 650);
  const [availability, setAvailability] = useState(user?.labour_profile?.availability_status || 'available');
  const [savingProf, setSavingProf] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      api.getMyApplications(),
      api.getJobs()
    ]).then(([apps, jobs]) => {
      setMyApplications(apps);
      setNearbyJobs(jobs.slice(0, 4));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProf(true);
    try {
      await api.updateMe({
        skills,
        daily_wage_expected: Number(wage),
        availability_status: availability
      });
      setSavingProf(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      setSavingProf(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Header Banner */}
      <div className="card mb-6" style={{ background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)', color: '#fff', padding: '1.75rem', borderRadius: '18px' }}>
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
              <Users size={30} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>
                  {language === 'te' ? 'నమోదిత వ్యవసాయ కూలీ' : 'Agricultural Worker'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#fef3c7' }}>
                  {user.village ? `${user.village}, ` : ''}{user.district}
                </span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>
                {user.full_name}
              </h1>
              <div style={{ fontSize: '0.85rem', color: '#fef3c7' }}>
                Expected Wage: <strong>₹{wage} / day</strong> | Status: <strong>{availability === 'available' ? 'Available for Farm Work' : 'Currently Busy'}</strong>
              </div>
            </div>
          </div>

          <button onClick={() => onNavigate('labour')} className="btn btn-secondary" style={{ background: '#ffffff', color: '#92400e' }}>
            Browse Farm Jobs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 md-grid-cols-1 gap-8">
        {/* Left: Applications and Nearby Jobs */}
        <div style={{ gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            {language === 'te' ? 'నా దరఖాస్తులు (My Job Applications)' : 'My Job Applications'} ({myApplications.length})
          </h2>

          {loading ? (
            <div className="card text-center p-8 text-muted">Loading applications...</div>
          ) : myApplications.length === 0 ? (
            <div className="card text-center p-8 text-muted mb-6">
              <p>You have not applied to any farm jobs yet.</p>
              <button onClick={() => onNavigate('labour')} className="btn btn-primary btn-sm mt-3">
                Find Farm Work Now
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mb-8">
              {myApplications.map((app) => (
                <div key={app.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge ${app.status === 'accepted' ? 'badge-green' : app.status === 'completed' ? 'badge-blue' : 'badge-amber'}`}>
                        {app.status}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Applied on {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                      {app.job_title}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Daily Wage: <strong>₹{app.daily_wage}</strong> | Proposed: <strong>₹{app.proposed_wage || app.daily_wage}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="badge badge-green">
                      {app.status === 'accepted' ? 'Hired by Farmer' : 'Reviewing'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommended Jobs */}
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            {language === 'te' ? 'మీ సమీపంలో అందుబాటులో ఉన్న పనులు' : 'Recommended Farm Work Nearby'}
          </h2>
          <div className="grid grid-cols-2 md-grid-cols-1 gap-4">
            {nearbyJobs.map((j) => (
              <div key={j.id} className="card p-4 flex flex-col justify-between">
                <div>
                  <span className="badge badge-green mb-1">{j.work_type}</span>
                  <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{j.title}</h4>
                  <div className="text-xs text-muted mb-2">
                    {j.village}, {j.district} • Starts {j.start_date}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontWeight: 800, color: '#166534' }}>₹{j.daily_wage} / day</span>
                  <button onClick={() => onNavigate('labour')} className="btn btn-primary btn-sm">
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Worker Profile Settings */}
        <div>
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
              Worker Profile & Skills
            </h3>

            {saveSuccess && (
              <div className="p-2 bg-green-100 text-green-800 rounded text-xs mb-3 flex items-center gap-1">
                <CheckCircle2 size={14} />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Agricultural Skills</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Harvesting, Planting, Spraying, Tractor"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expected Daily Wage (₹)</label>
                <input
                  type="number"
                  value={wage}
                  onChange={(e) => setWage(Number(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Availability Status</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="form-select"
                >
                  <option value="available">Available for Work (పని కోసం సిద్ధంగా ఉన్నాను)</option>
                  <option value="busy">Busy on other farm (ప్రస్తుతం వేరే పనిలో ఉన్నాను)</option>
                </select>
              </div>

              <button type="submit" disabled={savingProf} className="btn btn-primary w-full" style={{ width: '100%' }}>
                {savingProf ? 'Saving...' : 'Update Worker Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
