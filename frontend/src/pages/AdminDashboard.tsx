import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, ShoppingCart, DollarSign, RotateCcw, 
  AlertTriangle, CheckCircle2, XCircle, Search, RefreshCw, FileText 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { AdminStats, RefundRequest, Complaint } from '../types';

export const AdminDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'refunds' | 'complaints' | 'audit'>('overview');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [refundsList, setRefundsList] = useState<RefundRequest[]>([]);
  const [complaintsList, setComplaintsList] = useState<Complaint[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Refund Action State
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Complaint Resolve State
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolveText, setResolveText] = useState('');

  const fetchAdminData = () => {
    setLoading(true);
    Promise.all([
      api.getAdminStats(),
      api.getAllUsers(),
      api.getAllRefunds(),
      api.getAllComplaints(),
      api.getAuditLogs()
    ]).then(([st, usr, rfs, cmp, aud]) => {
      setStats(st);
      setUsersList(usr);
      setRefundsList(rfs);
      setComplaintsList(cmp);
      setAuditLogs(aud);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <ShieldCheck size={48} className="text-red-600 mx-auto mb-3" />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Admin Access Restricted</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
          You must be logged in as an Administrator (e.g., demo phone <code>9876543210</code>) to access platform management.
        </p>
      </div>
    );
  }

  const handleToggleUser = async (userId: number) => {
    try {
      await api.toggleUserActive(userId);
      api.getAllUsers().then((data) => setUsersList(data));
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleVerifyShop = async (shopId: number) => {
    try {
      await api.verifyShop(shopId);
      api.getAllUsers().then((data) => setUsersList(data));
      api.getAdminStats().then((data) => setStats(data));
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleRefundAction = async (action: 'approve' | 'reject' | 'process_refund') => {
    if (!selectedRefund) return;
    setActionLoading(true);
    try {
      await api.adminRefundAction(selectedRefund.id, {
        action,
        admin_notes: adminNotes || `Admin executed ${action}`
      });
      setActionLoading(false);
      setSelectedRefund(null);
      setAdminNotes('');
      fetchAdminData();
    } catch (err: any) {
      setActionLoading(false);
      alert(err.message || 'Refund action failed');
    }
  };

  const handleResolveComplaint = async () => {
    if (!selectedComplaint) return;
    try {
      await api.resolveComplaint(selectedComplaint.id, {
        status: 'Resolved',
        admin_response: resolveText
      });
      setSelectedComplaint(null);
      setResolveText('');
      api.getAllComplaints().then((data) => setComplaintsList(data));
    } catch (err: any) {
      alert(err.message || 'Failed to resolve complaint');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Title Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-red flex items-center gap-1">
              <ShieldCheck size={13} />
              Platform SuperAdmin
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
            AgriVeda Administration & Audit Portal
          </h1>
          <p style={{ color: '#64748b' }}>
            Complete control over accounts, verification, marketplace deals, refunds, and financial reporting.
          </p>
        </div>

        <button onClick={fetchAdminData} className="btn btn-outline btn-sm flex items-center gap-1.5">
          <RefreshCw size={14} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button onClick={() => setActiveTab('overview')} className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}>
          Overview & Metrics
        </button>
        <button onClick={() => setActiveTab('users')} className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}>
          Users & Shop Verification ({usersList.length})
        </button>
        <button onClick={() => setActiveTab('refunds')} className={`tab-btn ${activeTab === 'refunds' ? 'active' : ''}`}>
          Refund Requests ({refundsList.length})
        </button>
        <button onClick={() => setActiveTab('complaints')} className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}>
          User Complaints ({complaintsList.length})
        </button>
        <button onClick={() => setActiveTab('audit')} className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}>
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && stats && (
        <div>
          {/* Stats Grid */}
          <div className="grid grid-cols-4 md-grid-cols-2 gap-4 mb-8">
            <div className="card p-4">
              <div className="text-xs text-muted font-bold uppercase mb-1">Total Users</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{stats.total_users}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {stats.total_farmers} Farmers • {stats.total_buyers} Buyers • {stats.total_shops} Shops
              </div>
            </div>

            <div className="card p-4">
              <div className="text-xs text-muted font-bold uppercase mb-1">Gross Deal Value</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#166534' }}>₹{stats.total_deals_value.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{stats.total_deals} Completed Deals</div>
            </div>

            <div className="card p-4">
              <div className="text-xs text-muted font-bold uppercase mb-1">Platform Revenue</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2563eb' }}>₹{stats.total_revenue.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Subscriptions + Promotions</div>
            </div>

            <div className="card p-4">
              <div className="text-xs text-muted font-bold uppercase mb-1">Pending Action</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: stats.pending_refund_requests > 0 ? '#dc2626' : '#16a34a' }}>
                {stats.pending_refund_requests + stats.open_complaints}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {stats.pending_refund_requests} Refunds • {stats.open_complaints} Complaints
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users & Verification */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>User / Business</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Phone</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Location</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Verification</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Account Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{u.full_name}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>{u.phone}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className="badge badge-purple">{u.role}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#64748b' }}>{u.district}, {u.state}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {u.is_verified ? (
                        <span className="badge badge-green">Verified</span>
                      ) : (
                        <span className="badge badge-amber">Unverified</span>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {u.is_active ? <span className="badge badge-green">Active</span> : <span className="badge badge-red">Inactive</span>}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      {u.role === 'shop' && (
                        <button onClick={() => handleVerifyShop(u.id)} className="btn btn-outline btn-sm mr-2" style={{ marginRight: '0.5rem' }}>
                          Toggle Verify Badge
                        </button>
                      )}
                      <button onClick={() => handleToggleUser(u.id)} className="btn btn-outline btn-sm">
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Refunds Management */}
      {activeTab === 'refunds' && (
        <div>
          <div className="card mb-4" style={{ borderLeft: '4px solid #16a34a' }}>
            <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Admin Refund Control Guidelines</h4>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              Refunds are tied directly to gateway transaction IDs. Clicking "Process Refund" records an official gateway settlement ID, preventing duplicate claims and logging the action to the audit ledger.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {refundsList.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Refund Number: </span>
                    <strong>{r.refund_number}</strong> (Txn: {r.transaction_reference})
                  </div>
                  <span className={`badge ${r.status === 'Refunded' ? 'badge-green' : r.status === 'Rejected' ? 'badge-red' : 'badge-amber'}`}>
                    {r.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 md-grid-cols-1 gap-2 text-sm text-slate-700 mb-2">
                  <div><strong>Customer:</strong> {r.user_name} ({r.user_phone})</div>
                  <div><strong>Amount Requested:</strong> ₹{r.amount_requested}</div>
                  <div><strong>Reason:</strong> {r.reason}</div>
                </div>

                <div className="p-2 bg-slate-50 rounded text-xs mb-3">
                  <strong>Explanation:</strong> {r.explanation}
                </div>

                {r.status !== 'Refunded' && r.status !== 'Rejected' && (
                  <div className="flex items-center gap-2 pt-2 border-t" style={{ borderTop: '1px solid #f1f5f9' }}>
                    <button
                      onClick={() => {
                        setSelectedRefund(r);
                        setAdminNotes("Refund approved and processed through payment gateway simulator.");
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      Process Refund (₹{r.amount_requested})
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRefund(r);
                        handleRefundAction('reject');
                      }}
                      className="btn btn-outline btn-sm text-red-600"
                    >
                      Reject Request
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Refund Action Modal */}
          {selectedRefund && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '480px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Execute Gateway Refund: {selectedRefund.refund_number}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                  Refund amount: <strong>₹{selectedRefund.amount_requested}</strong>
                </p>

                <div className="form-group mb-4">
                  <label className="form-label">Audit Notes</label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="form-textarea"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button onClick={() => setSelectedRefund(null)} className="btn btn-outline">Cancel</button>
                  <button onClick={() => handleRefundAction('process_refund')} disabled={actionLoading} className="btn btn-primary">
                    {actionLoading ? 'Processing...' : 'Confirm Gateway Refund'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Complaints */}
      {activeTab === 'complaints' && (
        <div className="flex flex-col gap-3">
          {complaintsList.map((c) => (
            <div key={c.id} className="card p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="badge badge-purple">{c.category}</span>
                <span className={`badge ${c.status === 'Resolved' ? 'badge-green' : 'badge-amber'}`}>
                  {c.status}
                </span>
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{c.subject}</h4>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                From: {c.user_name} ({c.user_phone}) • {new Date(c.created_at).toLocaleDateString()}
              </div>
              <p style={{ fontSize: '0.875rem', color: '#334155', marginBottom: '0.75rem' }}>{c.description}</p>

              {c.status !== 'Resolved' && (
                <div className="flex items-center gap-2 pt-2 border-t" style={{ borderTop: '1px solid #f1f5f9' }}>
                  <input
                    type="text"
                    value={resolveText}
                    onChange={(e) => setResolveText(e.target.value)}
                    placeholder="Enter resolution notes for user..."
                    className="form-input"
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                  />
                  <button
                    onClick={() => {
                      setSelectedComplaint(c);
                      handleResolveComplaint();
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    Resolve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Target</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#166534' }}>
                      {log.action}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {log.target_entity} #{log.target_id}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
