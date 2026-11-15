import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, ShieldAlert, CheckCircle2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { GovernmentScheme } from '../types';

export const GovernmentSchemesPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(1);

  useEffect(() => {
    api.getSchemes()
      .then((data) => {
        setSchemes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Title */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-purple flex items-center gap-1">
            <BookOpen size={13} />
            Central & State Portals
          </span>
          <span className="badge badge-green">Verified Direct Links</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a' }}>
          {t.govSchemes}
        </h1>
        <p style={{ color: '#64748b' }}>
          {language === 'te' 
            ? 'రైతుల కోసం కేంద్ర మరియు రాష్ట్ర ప్రభుత్వ వ్యవసాయ సబ్సిడీ మరియు ఆర్థిక సహాయ పథకాలు' 
            : 'Verified guide to agricultural subsidies, PM-KISAN, Rythu Bharosa, and crop insurance schemes'}
        </p>
      </div>

      {/* Prominent Legal Disclaimer Alert */}
      <div className="card mb-6 p-4" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px' }}>
        <div className="flex items-start gap-3">
          <ShieldAlert size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div style={{ fontSize: '0.85rem', color: '#92400e', lineHeight: 1.5 }}>
            <strong>Independent Platform Notice:</strong> AgriVeda is an independent agritech service and is NOT an official government website. AgriVeda does not collect government fees or guarantee subsidy approvals. For official registrations, always follow the verified official portal links provided below.
          </div>
        </div>
      </div>

      {/* Schemes Accordion List */}
      {loading ? (
        <div className="card text-center p-8 text-muted">Loading agricultural schemes...</div>
      ) : (
        <div className="flex flex-col gap-4">
          {schemes.map((s) => {
            const isExpanded = expandedId === s.id;
            const name = language === 'te' ? s.name_te : s.name_en;
            const desc = language === 'te' ? s.description_te : s.description_en;
            const benefits = language === 'te' ? s.benefits_te : s.benefits_en;
            const eligibility = language === 'te' ? s.eligibility_conditions_te : s.eligibility_conditions_en;
            const docs = language === 'te' ? s.required_documents_te : s.required_documents_en;
            const steps = language === 'te' ? s.application_procedure_te : s.application_procedure_en;

            return (
              <div 
                key={s.id} 
                className="card"
                style={{ padding: '1.5rem', border: isExpanded ? '2px solid #bbf7d0' : '1px solid #e2e8f0' }}
              >
                <div 
                  onClick={() => toggleExpand(s.id)}
                  className="flex items-center justify-between cursor-pointer"
                  style={{ cursor: 'pointer' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="badge badge-purple">{s.category}</span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      {name}
                    </h3>
                  </div>
                  <button className="btn btn-outline btn-sm" style={{ padding: '0.35rem 0.6rem' }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0.75rem 0', lineHeight: 1.5 }}>
                  {desc}
                </p>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '1rem' }} className="flex flex-col gap-3">
                    {/* Benefits Box */}
                    <div className="p-3 bg-green-50 rounded" style={{ border: '1px solid #dcfce7' }}>
                      <div className="text-xs font-bold text-green-900 uppercase tracking-wider mb-1">
                        💰 Financial Benefits & Subsidies
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#166534', fontWeight: 600 }}>
                        {benefits}
                      </div>
                    </div>

                    {/* Eligibility & Documents Grid */}
                    <div className="grid grid-cols-2 md-grid-cols-1 gap-3">
                      <div className="p-3 bg-slate-50 rounded" style={{ border: '1px solid #e2e8f0' }}>
                        <div className="text-xs font-bold text-slate-700 uppercase mb-1">
                          📋 Eligibility Conditions
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                          {eligibility}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded" style={{ border: '1px solid #e2e8f0' }}>
                        <div className="text-xs font-bold text-slate-700 uppercase mb-1">
                          📄 Required Documents
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                          {docs}
                        </div>
                      </div>
                    </div>

                    {/* How to Apply */}
                    <div className="p-3 bg-slate-50 rounded" style={{ border: '1px solid #e2e8f0' }}>
                      <div className="text-xs font-bold text-slate-700 uppercase mb-1">
                        🚀 Application Procedure
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                        {steps}
                      </div>
                    </div>

                    {/* Official Portal Link */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Last verified by AgriVeda: <strong>{s.last_verified_date}</strong>
                      </span>
                      <a
                        href={s.official_portal_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm flex items-center gap-1.5"
                      >
                        <span>Open Official Govt Portal</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
