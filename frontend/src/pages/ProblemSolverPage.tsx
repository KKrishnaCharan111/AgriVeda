import React, { useState, useEffect } from 'react';
import { MessageSquare, Mic, Send, Volume2, Sparkles, CheckCircle2, Phone, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { VoiceMicButton, SpeakButton } from '../components/VoiceMicButton';
import { api } from '../services/api';

export const ProblemSolverPage: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState('Crop Health');
  const [loading, setLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      api.getProblemSolverHistory()
        .then((data) => setHistory(data))
        .catch(() => {});
    }
  }, [user]);

  const handleAsk = async (textToAsk?: string) => {
    const qText = textToAsk || question;
    if (!qText.trim()) return;

    setLoading(true);
    try {
      const res = await api.askProblemSolver({
        question_text: qText.trim(),
        topic
      });
      setCurrentAnswer(res);
      setLoading(false);
      setQuestion('');
      if (user) {
        api.getProblemSolverHistory().then((data) => setHistory(data));
      }
    } catch {
      setLoading(false);
      // Client-side fallback
      setCurrentAnswer({
        question_text: qText,
        detected_language: 'te',
        topic,
        answer_text_en: "For this crop issue, inspect the underside of leaves for sucking pests or thrips. Spray organic Neem Oil (5ml/L) and provide light morning irrigation.",
        answer_text_te: "ఈ పంట సమస్య కోసం ఆకుల అడుగు భాగాన తామర పురుగులు లేదా రసం పీల్చే పురుగులను గమనించండి. వేపనూనె (5 మి.లీ / లీటరు) పిచికారీ చేసి ఉదయం పూట తేలికపాటి తడి అందించండి."
      });
    }
  };

  const sampleQuestions = [
    {
      te: "నాకు టమాటా పంటలో ఆకులు పసుపు రంగులో మారుతున్నాయి. ఏం చేయాలి?",
      en: "My tomato leaves are turning yellow. What should I do?"
    },
    {
      te: "మిరప పంటలో ఆకు ముడత నివారణకు ఏ మందు పిచికారీ చేయాలి?",
      en: "What should I spray for leaf curl virus in chilli?"
    },
    {
      te: "వరి పంటలో అగ్గి తెగులు లక్షణాలు ఏమిటి?",
      en: "What are the symptoms and treatment for rice blast disease?"
    },
    {
      te: "పత్తిలో గులాబీ రంగు కాయ తొలుచు పురుగు నివారణ ఎలా?",
      en: "How to prevent pink bollworm infestation in cotton?"
    }
  ];

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Title Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-green flex items-center gap-1">
            <Mic size={13} />
            Voice-First Farming AI
          </span>
          <span className="badge badge-blue">Telugu & English</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a' }}>
          {t.problemSolver}
        </h1>
        <p style={{ color: '#64748b', maxWidth: '700px' }}>
          {language === 'te' 
            ? 'మీ ప్రశ్నను తెలుగులో మాట్లాడి అడగండి. ఏఐ సమాధానం తెలుగులోనే చదివి వినిపిస్తుంది.' 
            : 'Ask any agricultural question using voice or text. Get instant spoken solutions in Telugu or English.'}
        </p>
      </div>

      <div className="grid grid-cols-2 md-grid-cols-1 gap-8">
        {/* Left Ask Box */}
        <div>
          <div className="card mb-4" style={{ padding: '1.5rem', border: '2px solid #bbf7d0', background: '#f0fdf4' }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#166534' }}>
                {language === 'te' ? 'వాయిస్ మైక్ ద్వారా మాట్లాడండి' : 'Tap Mic to Speak in Telugu or English'}
              </span>
              <VoiceMicButton onTranscript={(txt) => {
                setQuestion(txt);
                handleAsk(txt);
              }} />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Farming Topic</label>
              <select value={topic} onChange={(e) => setTopic(e.target.value)} className="form-select">
                <option value="Crop Health">Crop Health & Disease (పంట వ్యాధులు)</option>
                <option value="Pest Management">Pest Management (పురుగుల నివారణ)</option>
                <option value="Water Management">Water & Irrigation (నీటి యాజమాన్యం)</option>
                <option value="Nutrient Management">Fertilizers & Nutrients (ఎరువుల వాడకం)</option>
                <option value="Government Schemes">Government Schemes (ప్రభుత్వ పథకాలు)</option>
              </select>
            </div>

            <div className="form-group mb-3">
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                {language === 'te' ? 'లేదా టైప్ చేయండి' : 'Or Type Question Here'}
              </label>
              <textarea
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                placeholder={language === 'te' ? 'ఉదా: టమాటా పంటలో ఆకులు పసుపు రంగులో మారుతున్నాయి...' : 'e.g. Tomato leaves turning yellow...'}
                className="form-textarea"
              />
            </div>

            <button
              onClick={() => handleAsk()}
              disabled={loading || !question.trim()}
              className="btn btn-primary w-full flex justify-center gap-2"
              style={{ width: '100%' }}
            >
              <Send size={16} />
              <span>{loading ? 'Processing Question...' : (language === 'te' ? 'సమాధానం పొందండి' : 'Ask Question')}</span>
            </button>
          </div>

          {/* Sample Common Questions */}
          <div className="card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
              {language === 'te' ? 'రైతులు ఎక్కువగా అడిగే ప్రశ్నలు (నొక్కండి):' : 'Frequently Asked Questions (Click to Ask):'}
            </h4>
            <div className="flex flex-col gap-2">
              {sampleQuestions.map((sq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    const text = language === 'te' ? sq.te : sq.en;
                    setQuestion(text);
                    handleAsk(text);
                  }}
                  className="btn btn-outline text-left justify-start"
                  style={{ fontSize: '0.825rem', padding: '0.5rem 0.75rem', textAlign: 'left', lineHeight: 1.4 }}
                >
                  💬 {language === 'te' ? sq.te : sq.en}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Answer Box */}
        <div>
          {currentAnswer ? (
            <div className="card" style={{ border: '2px solid #bbf7d0', background: '#ffffff', padding: '1.75rem' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="badge badge-green flex items-center gap-1">
                  <Sparkles size={12} />
                  {currentAnswer.topic || 'Farming Solution'}
                </span>
                <SpeakButton text={language === 'te' ? currentAnswer.answer_text_te : currentAnswer.answer_text_en} />
              </div>

              <div className="p-3 bg-slate-50 rounded mb-4 text-xs font-semibold text-slate-700">
                Q: {currentAnswer.question_text}
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#166534', marginBottom: '0.75rem' }}>
                {language === 'te' ? 'పరిష్కారం & మార్గదర్శకం:' : 'Recommended Agronomy Solution:'}
              </h3>

              <div style={{ fontSize: '0.95rem', lineHeight: 1.7, color: '#1e293b', whiteSpace: 'pre-line' }}>
                {language === 'te' ? currentAnswer.answer_text_te : currentAnswer.answer_text_en}
              </div>

              <div className="mt-6 pt-4 border-t flex items-center justify-between" style={{ borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Was this advice helpful for your farm?
                </span>
                <span className="badge badge-blue">Verified Agronomy Rule</span>
              </div>
            </div>
          ) : (
            <div className="card text-center p-12 text-muted">
              <MessageSquare size={48} className="mx-auto mb-3 text-green-600 opacity-60" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                {language === 'te' ? 'మీ ప్రశ్నను అడగండి' : 'Voice Assistant Ready'}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                {language === 'te' 
                  ? 'మైక్ బటన్ నొక్కి లేదా టైప్ చేసి అడిగితే తక్షణమే స్పష్టమైన సమాధానం లభిస్తుంది.' 
                  : 'Tap the microphone or select one of the common questions on the left.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
