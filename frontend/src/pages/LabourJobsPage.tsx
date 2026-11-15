import React, { useState, useEffect } from 'react';
import { Users, Plus, MapPin, Calendar, Clock, DollarSign, CheckCircle2, Phone, X } from 'lucide-react';
import type { JobListing } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

export const LabourJobsPage: React.FC<{ onOpenAuth: (mode: 'login' | 'register') => void }> = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'jobs' | 'workers'>('jobs');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Post Job Modal State
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobTitleTe, setJobTitleTe] = useState('');
  const [cropType, setCropType] = useState('Paddy');
  const [workType, setWorkType] = useState('Harvesting');
  const [workersNeeded, setWorkersNeeded] = useState(5);
  const [dailyWage, setDailyWage] = useState(650);
  const [startDate, setStartDate] = useState('2026-11-20');
  const [durationDays, setDurationDays] = useState(3);
  const [village, setVillage] = useState(user?.village || '');
  const [district, setDistrict] = useState(user?.district || 'Guntur');
  const [description, setDescription] = useState('');
  const [jobPostingLoading, setJobPostingLoading] = useState(false);

  // Apply Modal State
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [proposedWage, setProposedWage] = useState<number>(650);
  const [applyMessage, setApplyMessage] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  const fetchJobs = () => {
    setLoading(true);
    api.getJobs()
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchWorkers = () => {
    api.getWorkers().then((data) => setWorkers(data));
  };

  useEffect(() => {
    fetchJobs();
    fetchWorkers();
  }, []);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth('login');
      return;
    }

    setJobPostingLoading(true);
    try {
      await api.createJob({
        title: jobTitle,
        title_te: jobTitleTe || undefined,
        crop_type: cropType,
        work_type: workType,
        workers_needed: Number(workersNeeded),
        daily_wage: Number(dailyWage),
        start_date: startDate,
        duration_days: Number(durationDays),
        village: village || user?.village || '',
        district: district || user?.district || 'Guntur',
        description,
        contact_phone: user.phone
      });
      setJobPostingLoading(false);
      setIsPostJobOpen(false);
      fetchJobs();
    } catch {
      setJobPostingLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth('login');
      return;
    }
    if (!selectedJob) return;

    setApplyLoading(true);
    try {
      await api.applyJob(selectedJob.id, {
        job_id: selectedJob.id,
        proposed_wage: Number(proposedWage),
        message: applyMessage
      });
      setApplyLoading(false);
      setApplySuccess("Application submitted successfully to farmer!");
      setTimeout(() => {
        setSelectedJob(null);
        setApplySuccess(null);
        fetchJobs();
      }, 1500);
    } catch (err: any) {
      setApplyLoading(false);
      alert(err.message || "Failed to apply");
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
            {t.labour}
          </h1>
          <p style={{ color: '#64748b' }}>
            {language === 'te' 
              ? 'వ్యవసాయ కూలీల పనులు మరియు నైపుణ్యం కలిగిన కార్మికుల వేదిక' 
              : 'Connecting farmers with local skilled agricultural labourers'}
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) onOpenAuth('login');
            else setIsPostJobOpen(true);
          }}
          className="btn btn-primary btn-lg flex items-center gap-2"
        >
          <Plus size={20} />
          <span>{language === 'te' ? 'పని ప్రకటన ఇవ్వండి' : 'Post Farm Work'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
        >
          {language === 'te' ? 'అందుబాటులో ఉన్న పనులు (Farm Jobs)' : 'Available Farm Jobs'} ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('workers')}
          className={`tab-btn ${activeTab === 'workers' ? 'active' : ''}`}
        >
          {language === 'te' ? 'కూలీల జాబితా (Worker Directory)' : 'Skilled Workers Directory'} ({workers.length})
        </button>
      </div>

      {/* Tab 1: Farm Jobs */}
      {activeTab === 'jobs' && (
        <div>
          {loading ? (
            <div className="card text-center p-8 text-muted">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="card text-center p-8">
              <Users size={36} className="text-muted mx-auto mb-2" />
              <h3>No farm jobs posted yet</h3>
            </div>
          ) : (
            <div className="grid grid-cols-2 md-grid-cols-1 gap-4">
              {jobs.map((job) => (
                <div key={job.id} className="card flex flex-col justify-between" style={{ padding: '1.25rem' }}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="badge badge-amber">{job.work_type}</span>
                      <span className="badge badge-green">{job.crop_type}</span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                      {language === 'te' && job.title_te ? job.title_te : job.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-muted mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} />
                        {job.village ? `${job.village}, ` : ''}{job.district}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        Starts: {job.start_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        {job.duration_days} Days
                      </span>
                    </div>

                    {job.description && (
                      <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem', lineHeight: 1.4 }}>
                        {job.description}
                      </p>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }} className="flex items-center justify-between">
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Daily Wage</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534' }}>
                        ₹{job.daily_wage} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>/ day</span>
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setProposedWage(job.daily_wage);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Worker Directory */}
      {activeTab === 'workers' && (
        <div className="grid grid-cols-3 md-grid-cols-1 gap-4">
          {workers.map((w) => (
            <div key={w.id} className="card" style={{ padding: '1.25rem' }}>
              <div className="flex items-center gap-3 mb-3">
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#fef3c7',
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}>
                  {w.full_name[0]}
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{w.full_name}</h4>
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <MapPin size={12} />
                    <span>{w.village ? `${w.village}, ` : ''}{w.district}</span>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '0.75rem' }}>
                <strong>Skills:</strong> {w.skills}
              </div>

              <div className="flex items-center justify-between p-2 rounded mb-3" style={{ background: '#f8fafc' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Expected Wage</span>
                <span style={{ fontWeight: 800, color: '#166534' }}>₹{w.daily_wage_expected} / day</span>
              </div>

              <a href={`tel:${w.phone}`} className="btn btn-outline btn-sm w-full flex justify-center gap-2">
                <Phone size={14} className="text-green-600" />
                <span>Call Worker (+91 {w.phone})</span>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Post Job Modal */}
      {isPostJobOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={() => setIsPostJobOpen(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', border: 'none', background: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {language === 'te' ? 'కూలీల కోసం పని ప్రకటన' : 'Post Farm Work Requirement'}
            </h2>
            <form onSubmit={handlePostJob}>
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Chilli Picking Labourers Needed"
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="form-group">
                  <label className="form-label">Work Type</label>
                  <select value={workType} onChange={(e) => setWorkType(e.target.value)} className="form-select">
                    <option value="Harvesting">Harvesting (పంట కోత)</option>
                    <option value="Planting">Planting (నాట్లు వేయడం)</option>
                    <option value="Weeding">Weeding (కలుపు తీత)</option>
                    <option value="Irrigation">Irrigation (నీటిపారుదల)</option>
                    <option value="Spraying">Spraying (పిచికారీ)</option>
                    <option value="Tractor Operation">Tractor Driving (ట్రాక్టర్ నడపడం)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Crop Type</label>
                  <input type="text" value={cropType} onChange={(e) => setCropType(e.target.value)} className="form-input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="form-group">
                  <label className="form-label">Workers Needed</label>
                  <input type="number" min={1} value={workersNeeded} onChange={(e) => setWorkersNeeded(Number(e.target.value))} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Daily Wage (₹)</label>
                  <input type="number" min={100} value={dailyWage} onChange={(e) => setDailyWage(Number(e.target.value))} className="form-input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (Days)</label>
                  <input type="number" min={1} value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))} className="form-input" />
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Work Details & Lunch arrangements</label>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Lunch and tea provided. Looking for experienced workers." className="form-textarea" />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsPostJobOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={jobPostingLoading} className="btn btn-primary">
                  {jobPostingLoading ? 'Posting...' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {selectedJob && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <button onClick={() => setSelectedJob(null)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', border: 'none', background: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Apply for: {selectedJob.title}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              Farmer wage offered: <strong>₹{selectedJob.daily_wage} / day</strong>
            </p>

            {applySuccess && (
              <div className="p-3 bg-green-100 text-green-800 rounded flex items-center gap-2 mb-3">
                <CheckCircle2 size={16} />
                <span>{applySuccess}</span>
              </div>
            )}

            <form onSubmit={handleApply}>
              <div className="form-group">
                <label className="form-label">Your Proposed Daily Wage (₹)</label>
                <input
                  type="number"
                  required
                  value={proposedWage}
                  onChange={(e) => setProposedWage(Number(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Message / Team Size (Optional)</label>
                <input
                  type="text"
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  placeholder="e.g. Available with 4 experienced coworkers"
                  className="form-input"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setSelectedJob(null)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={applyLoading} className="btn btn-primary">
                  {applyLoading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
