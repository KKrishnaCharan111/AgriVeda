import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, Plus, X, Sprout, Droplets, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { FarmingReminder } from '../types';

export const FarmingCalendarPage: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [reminders, setReminders] = useState<FarmingReminder[]>([]);
  const [loading, setLoading] = useState(true);

  // New Reminder Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [cropName, setCropName] = useState('Paddy');
  const [stage, setStage] = useState('Fertilization');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('2026-11-25');
  const [desc, setDesc] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const fetchReminders = () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.getReminders()
      .then((data) => {
        setReminders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchReminders();
  }, [user]);

  const handleToggle = async (id: number) => {
    try {
      await api.toggleReminder(id);
      setReminders((prev) => prev.map((r) => r.id === id ? { ...r, is_completed: !r.is_completed } : r));
    } catch {
      // ignore
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    setAddLoading(true);
    try {
      await api.createReminder({
        crop_name: cropName,
        stage,
        title_en: title,
        title_te: title,
        description_en: desc,
        description_te: desc,
        due_date: dueDate
      });
      setAddLoading(false);
      setIsAddOpen(false);
      fetchReminders();
    } catch {
      setAddLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-blue flex items-center gap-1">
              <Calendar size={13} />
              Crop Stage Management
            </span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a' }}>
            {t.farmingAssistant}
          </h1>
          <p style={{ color: '#64748b' }}>
            {language === 'te' 
              ? 'పంట కాలానికి అనుగుణంగా విత్తడం, నీటిపారుదల, ఎరువులు మరియు కోత సమయాల క్యాలెండర్' 
              : 'Stage-by-stage agronomy reminders for optimum crop health and higher yield'}
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) onOpenAuth();
            else setIsAddOpen(true);
          }}
          className="btn btn-primary btn-lg flex items-center gap-2"
        >
          <Plus size={20} />
          <span>{language === 'te' ? 'కొత్త రిమైండర్ జోడించండి' : 'Add Reminder'}</span>
        </button>
      </div>

      {!user ? (
        <div className="card text-center p-8">
          <Calendar size={48} className="mx-auto mb-3 text-green-600 opacity-60" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Login to Track Your Farming Calendar
          </h3>
          <p style={{ color: '#64748b', marginBottom: '1.25rem' }}>
            Receive personalized reminders for fertilizer top-dressing, spraying schedules, and harvesting for your crops.
          </p>
          <button onClick={onOpenAuth} className="btn btn-primary">
            {t.login}
          </button>
        </div>
      ) : loading ? (
        <div className="card text-center p-8 text-muted">Loading farming calendar...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {reminders.map((r) => (
            <div
              key={r.id}
              className="card flex items-center justify-between gap-4"
              style={{
                padding: '1.25rem',
                borderLeft: r.is_completed ? '5px solid #94a3b8' : '5px solid #16a34a',
                opacity: r.is_completed ? 0.7 : 1
              }}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={r.is_completed}
                  onChange={() => handleToggle(r.id)}
                  style={{ width: '20px', height: '20px', marginTop: '0.2rem', cursor: 'pointer' }}
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge badge-green">{r.crop_name}</span>
                    <span className="badge badge-amber">{r.stage}</span>
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Clock size={12} />
                      Due: {r.due_date}
                    </span>
                  </div>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: r.is_completed ? '#64748b' : '#0f172a',
                    textDecoration: r.is_completed ? 'line-through' : 'none'
                  }}>
                    {language === 'te' && r.title_te ? r.title_te : r.title_en}
                  </h3>
                  {r.description_en && (
                    <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem' }}>
                      {language === 'te' && r.description_te ? r.description_te : r.description_en}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => handleToggle(r.id)}
                  className={`btn btn-sm ${r.is_completed ? 'btn-outline' : 'btn-secondary'}`}
                >
                  {r.is_completed ? 'Mark Pending' : 'Mark Done'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Reminder Modal */}
      {isAddOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <button onClick={() => setIsAddOpen(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', border: 'none', background: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Add Farming Calendar Reminder
            </h3>
            <form onSubmit={handleAddReminder}>
              <div className="form-group">
                <label className="form-label">Crop Name</label>
                <input
                  type="text"
                  required
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="form-group">
                  <label className="form-label">Stage</label>
                  <select value={stage} onChange={(e) => setStage(e.target.value)} className="form-select">
                    <option value="Sowing">Sowing (విత్తనం)</option>
                    <option value="Irrigation">Irrigation (నీరు పెట్టడం)</option>
                    <option value="Fertilization">Fertilization (ఎరువులు)</option>
                    <option value="Pest Prevention">Pest Prevention (పిచికారీ)</option>
                    <option value="Harvesting">Harvesting (పంట కోత)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="form-input" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reminder Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Urea top-dressing 30 days after transplanting"
                  className="form-input"
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Dosage / Notes</label>
                <textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. 25 kg Urea per acre in evening." className="form-textarea" />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={addLoading} className="btn btn-primary">
                  {addLoading ? 'Saving...' : 'Save Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
