import React, { useState } from 'react';
import { X, ShieldCheck, QrCode, CreditCard, Smartphone, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    purpose: string;
    title: string;
    amount: number;
    description: string;
  } | null;
  onSuccess: () => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  plan,
  onSuccess
}) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [paymentMethod, setPaymentMethod] = useState('upi_phonepe');
  const [upiId, setUpiId] = useState('');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen || !plan) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Create unique payment order
      const order = await api.createPaymentOrder({
        purpose: plan.purpose,
        amount: plan.amount,
        description: plan.description,
        idempotency_key: `idemp-${user?.id}-${plan.purpose}-${Date.now()}`
      });

      // 2. Process checkout with chosen payment method
      const checkoutRes = await api.checkoutPayment({
        order_id: order.id,
        payment_method: paymentMethod,
        upi_id: upiId || undefined,
        simulate_failure: simulateFailure
      });

      setLoading(false);
      setResult(checkoutRes);

      if (checkoutRes.success) {
        setTimeout(() => {
          onSuccess();
          onClose();
          setResult(null);
        }, 2000);
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Payment failed');
    }
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
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 p-1.5 rounded mb-2">
            <ShieldCheck size={14} />
            <span>256-Bit Encrypted Secure Checkout (Zero-Budget Sandbox)</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            {plan.title}
          </h2>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#166534', margin: '0.25rem 0' }}>
            ₹{plan.amount.toLocaleString('en-IN')}
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {plan.description}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-800 rounded text-xs mb-3">
            {error}
          </div>
        )}

        {result && (
          <div className={`p-4 rounded mb-4 ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className="flex items-center gap-2 font-bold mb-1">
              {result.success ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              <span>{result.message}</span>
            </div>
            {result.transaction_reference && (
              <div style={{ fontSize: '0.8rem' }}>Ref: {result.transaction_reference}</div>
            )}
          </div>
        )}

        {!result && (
          <form onSubmit={handlePay}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Select Payment Method</label>
              <div className="flex flex-col gap-2">
                <label className="card p-2 flex items-center justify-between cursor-pointer" style={{ border: paymentMethod === 'upi_phonepe' ? '2px solid #16a34a' : '1px solid #e2e8f0' }}>
                  <div className="flex items-center gap-2">
                    <Smartphone size={18} className="text-purple-600" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>PhonePe UPI</span>
                  </div>
                  <input type="radio" name="paymethod" checked={paymentMethod === 'upi_phonepe'} onChange={() => setPaymentMethod('upi_phonepe')} />
                </label>

                <label className="card p-2 flex items-center justify-between cursor-pointer" style={{ border: paymentMethod === 'upi_gpay' ? '2px solid #16a34a' : '1px solid #e2e8f0' }}>
                  <div className="flex items-center gap-2">
                    <Smartphone size={18} className="text-blue-600" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Google Pay UPI</span>
                  </div>
                  <input type="radio" name="paymethod" checked={paymentMethod === 'upi_gpay'} onChange={() => setPaymentMethod('upi_gpay')} />
                </label>

                <label className="card p-2 flex items-center justify-between cursor-pointer" style={{ border: paymentMethod === 'upi_paytm' ? '2px solid #16a34a' : '1px solid #e2e8f0' }}>
                  <div className="flex items-center gap-2">
                    <Smartphone size={18} className="text-cyan-600" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Paytm UPI</span>
                  </div>
                  <input type="radio" name="paymethod" checked={paymentMethod === 'upi_paytm'} onChange={() => setPaymentMethod('upi_paytm')} />
                </label>

                <label className="card p-2 flex items-center justify-between cursor-pointer" style={{ border: paymentMethod === 'upi_qr' ? '2px solid #16a34a' : '1px solid #e2e8f0' }}>
                  <div className="flex items-center gap-2">
                    <QrCode size={18} className="text-slate-700" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Scan UPI QR Code</span>
                  </div>
                  <input type="radio" name="paymethod" checked={paymentMethod === 'upi_qr'} onChange={() => setPaymentMethod('upi_qr')} />
                </label>

                <label className="card p-2 flex items-center justify-between cursor-pointer" style={{ border: paymentMethod === 'debit_card' ? '2px solid #16a34a' : '1px solid #e2e8f0' }}>
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-emerald-700" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Debit / Credit Card</span>
                  </div>
                  <input type="radio" name="paymethod" checked={paymentMethod === 'debit_card'} onChange={() => setPaymentMethod('debit_card')} />
                </label>
              </div>
            </div>

            {/* Sandbox Simulation Notice */}
            <div className="p-3 bg-slate-50 border rounded-lg mb-4 text-xs text-slate-600">
              <div className="flex items-center justify-between mb-1">
                <strong>Simulate Sandbox Response:</strong>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                  />
                  <span>Simulate Bank Failure</span>
                </label>
              </div>
              <div>This runs on AgriVeda's secure sandbox environment without charging real money.</div>
            </div>

            <div className="flex items-center justify-between">
              <button type="button" onClick={onClose} className="btn btn-outline">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem' }}
              >
                {loading ? 'Processing Payment...' : `Pay ₹${plan.amount.toLocaleString('en-IN')}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
