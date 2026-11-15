import React, { useState, useEffect } from 'react';
import { HelpCircle, Send, CheckCircle2, MessageSquare, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { Complaint } from '../types';

export const ComplaintsPage: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [category, setCategory] = useState('Deal Dispute');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchComplaints = () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.getMyComplaints()
      .then((data) => {
        setComplaints(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    setSubmitting(true);
    try {
      await api.submitComplaint({
        category,
        subject,
        description
      });
      setSubmitting(false);
      setSuccess(true);
      setSubject('');
      setDescription('');
      setTimeout(() => {
        setSuccess(false);
        fetchComplaints();
      }, 1500);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div className="mb-6">
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a' }}>
          {t.support}
        </h1>
        <p style={{ color: '#64748b' }}>
          {language === 'te' 
            ? 'ఏదైనా సమస్య, డీల్ వివాదం లేదా సాంకేతిక సాయం కోసం మీ ఫిర్యాదును నమోదు చేయండి' 
            : 'Submit support inquiries, deal dispute reports, or report platform issues'}
        </p>
      </div>

      <div className="grid grid-cols-2 md-grid-cols-1 gap-8">
        {/* Form Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
            Submit a New Support Ticket
          </h3>

          {success && (
            <div className="p-3 bg-green-100 text-green-800 rounded flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} />
              <span>Complaint lodged successfully! Our admin team will investigate.</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-select">
                <option value="Deal Dispute">Deal Dispute / Crop Quality Issue</option>
                <option value="Payment Issue">Payment Issue / Double Deduction</option>
                <option value="Labour Grievance">Labour Grievance / Non-Payment of Wages</option>
                <option value="Shop Grievance">Shop / Substandard Seeds or Inputs</option>
                <option value="Technical App Feedback">Bug / App Suggestion</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of the issue"
                className="form-input"
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Detailed Description</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what happened, including dates or other party details..."
                className="form-textarea"
              />
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary w-full" style={{ width: '100%' }}>
              <Send size={16} />
              <span>{submitting ? 'Submitting...' : 'Submit Support Ticket'}</span>
            </button>
          </form>
        </div>

        {/* Complaints History */}
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
            Your Tickets ({complaints.length})
          </h3>

          {!user ? (
            <div className="card text-center p-8 text-muted">Please log in to view support tickets.</div>
          ) : complaints.length === 0 ? (
            <div className="card text-center p-8 text-muted">
              <CheckCircle2 size={36} className="mx-auto mb-2 text-green-600 opacity-60" />
              <p>No open or past tickets found.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {complaints.map((c) => (
                <div key={c.id} className="card p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="badge badge-purple">{c.category}</span>
                    <span className={`badge ${c.status === 'Resolved' ? 'badge-green' : 'badge-amber'}`}>
                      {c.status}
                    </span>
                  </div>
                  <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                    {c.subject}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                    {c.description}
                  </p>
                  {c.admin_response && (
                    <div className="p-2 bg-blue-50 text-blue-900 rounded text-xs">
                      <strong>Admin Resolution:</strong> {c.admin_response}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
