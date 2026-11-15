import React, { useState, useEffect } from 'react';
import { RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2, Clock, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { RefundRequest, PaymentTransaction } from '../types';

export const RefundsPage: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Request Form
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedTxnId, setSelectedTxnId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(199);
  const [reason, setReason] = useState('Accidental double charge');
  const [explanation, setExplanation] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchData = () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      api.getMyRefunds(),
      api.getTransactions()
    ]).then(([rList, tList]) => {
      setRefunds(rList);
      setTransactions(tList.filter((t) => t.status === 'Successful'));
      if (tList.length > 0) {
        setSelectedTxnId(tList[0].id);
        setAmount(tList[0].amount);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxnId) return;

    setSubmitLoading(true);
    setError(null);

    try {
      await api.requestRefund({
        transaction_id: selectedTxnId,
        amount_requested: Number(amount),
        reason,
        explanation
      });
      setSubmitLoading(false);
      setSuccess("Your refund request has been logged. Admin will review within 48 hours.");
      setTimeout(() => {
        setIsSubmitOpen(false);
        setSuccess(null);
        fetchData();
      }, 1500);
    } catch (err: any) {
      setSubmitLoading(false);
      setError(err.message || 'Refund request submission failed.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Refunded':
        return <span className="badge badge-green">Refunded (Completed)</span>;
      case 'Approved':
        return <span className="badge badge-blue">Approved (Pending Payout)</span>;
      case 'Under Review':
        return <span className="badge badge-amber">Under Review</span>;
      case 'Rejected':
        return <span className="badge badge-red">Rejected</span>;
      default:
        return <span className="badge badge-purple">{status}</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-blue flex items-center gap-1">
              <RotateCcw size={13} />
              Fair Consumer Protection
            </span>
            <span className="badge badge-green">Transparent Audit Logs</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a' }}>
            {t.refunds} & Refund Policy
          </h1>
          <p style={{ color: '#64748b' }}>
            {language === 'te' 
              ? 'చెల్లింపుల రీఫండ్ పాలసీ మరియు మీ రీఫండ్ అభ్యర్థనల ప్రత్యక్ష స్థితి' 
              : 'Submit refund claims for eligible transactions and track gateway settlements'}
          </p>
        </div>

        {user && transactions.length > 0 && (
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="btn btn-primary btn-lg flex items-center gap-2"
          >
            <RotateCcw size={18} />
            <span>Submit Refund Request</span>
          </button>
        )}
      </div>

      {/* Refund Policy Card */}
      <div className="card mb-8" style={{ borderLeft: '5px solid #16a34a', background: '#f8fafc' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
          AgriVeda Transparent Refund Policy
        </h3>
        <div style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
          <p className="mb-2">
            1. <strong>Eligibility:</strong> Refund claims can be submitted within 7 days of payment for duplicate transaction debits or subscriptions not activated due to technical issues.
          </p>
          <p className="mb-2">
            2. <strong>Verification:</strong> Every refund request is audited against the original payment reference. Automated duplicate refund submissions are strictly blocked.
          </p>
          <p>
            3. <strong>Settlement:</strong> Approved refunds are credited directly back to the original source UPI account or bank card through the payment gateway within 5-7 working days.
          </p>
        </div>
      </div>

      {!user ? (
        <div className="card text-center p-8">
          <p className="mb-3 text-muted">Please log in to view your payment history and submit refund requests.</p>
          <button onClick={onOpenAuth} className="btn btn-primary">{t.login}</button>
        </div>
      ) : loading ? (
        <div className="card text-center p-8 text-muted">Loading refund history...</div>
      ) : (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
            Your Refund Requests ({refunds.length})
          </h3>

          {refunds.length === 0 ? (
            <div className="card text-center p-8 text-muted">
              <CheckCircle2 size={36} className="mx-auto mb-2 text-green-600 opacity-60" />
              <p>You have no active or past refund requests.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {refunds.map((r) => (
                <div key={r.id} className="card p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Refund ID: </span>
                      <strong>{r.refund_number}</strong>
                    </div>
                    <div>{getStatusBadge(r.status)}</div>
                  </div>

                  <div className="grid grid-cols-2 md-grid-cols-1 gap-2 text-sm text-slate-700 mb-2">
                    <div><strong>Amount Requested:</strong> ₹{r.amount_requested}</div>
                    <div><strong>Amount Settled:</strong> ₹{r.amount_refunded || 0}</div>
                    <div><strong>Reason:</strong> {r.reason}</div>
                    <div><strong>Submitted Date:</strong> {new Date(r.created_at).toLocaleDateString()}</div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#475569', background: '#f8fafc', padding: '0.5rem', borderRadius: '6px' }}>
                    <strong>Explanation:</strong> {r.explanation}
                  </div>

                  {r.admin_notes && (
                    <div className="mt-2 text-xs text-blue-800 bg-blue-50 p-2 rounded">
                      <strong>Admin Update:</strong> {r.admin_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submit Refund Modal */}
      {isSubmitOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <button onClick={() => setIsSubmitOpen(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', border: 'none', background: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Submit Refund Claim
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              Select a completed transaction to request a refund.
            </p>

            {error && <div className="p-2 bg-red-100 text-red-800 rounded text-xs mb-3">{error}</div>}
            {success && <div className="p-2 bg-green-100 text-green-800 rounded text-xs mb-3">{success}</div>}

            <form onSubmit={handleSubmitRefund}>
              <div className="form-group">
                <label className="form-label">Eligible Transaction</label>
                <select
                  value={selectedTxnId || ''}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedTxnId(id);
                    const txn = transactions.find((t) => t.id === id);
                    if (txn) setAmount(txn.amount);
                  }}
                  className="form-select"
                >
                  {transactions.map((t) => (
                    <option key={t.id} value={t.id}>
                      ₹{t.amount} ({t.payment_method}) - Ref: {t.transaction_reference}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount to Refund (₹)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Refund</label>
                <select value={reason} onChange={(e) => setReason(e.target.value)} className="form-select">
                  <option value="Accidental double payment">Accidental double payment</option>
                  <option value="Service not delivered or delayed">Service not delivered or delayed</option>
                  <option value="Deal cancelled by other party">Deal cancelled by other party</option>
                  <option value="Other grievance">Other grievance</option>
                </select>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Detailed Explanation</label>
                <textarea
                  rows={3}
                  required
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Provide clear details of why you are requesting this refund..."
                  className="form-textarea"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsSubmitOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={submitLoading} className="btn btn-primary">
                  {submitLoading ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
