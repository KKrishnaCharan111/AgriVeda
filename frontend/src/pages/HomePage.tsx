import React, { useState } from 'react';
import { 
  Tractor, Users, ShoppingCart, Briefcase, Stethoscope, 
  CloudSun, TrendingUp, BookOpen, Calendar, MessageSquare, 
  CheckCircle2, Sparkles, Mic, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ActionCard } from '../components/ActionCard';
import { WeatherWidget } from '../components/WeatherWidget';
import { VoiceMicButton, SpeakButton } from '../components/VoiceMicButton';
import { api } from '../services/api';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenAuth }) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();

  // Quick Problem Solver inline state
  const [voiceQuery, setVoiceQuery] = useState('');
  const [solverResponse, setSolverResponse] = useState<any | null>(null);
  const [solverLoading, setSolverLoading] = useState(false);

  const handleQuickAsk = async (queryText?: string) => {
    const textToSend = queryText || voiceQuery;
    if (!textToSend.trim()) return;

    setSolverLoading(true);
    try {
      if (!user) {
        // Allow guest inquiry directly for testing
        const res = await api.askProblemSolver({
          question_text: textToSend,
          topic: "General Farming"
        });
        setSolverResponse(res);
      } else {
        const res = await api.askProblemSolver({
          question_text: textToSend,
          topic: "General Farming"
        });
        setSolverResponse(res);
      }
    } catch {
      // Fallback
      setSolverResponse({
        question_text: textToSend,
        answer_text_en: "For tomato and chilli yellow leaf symptoms: 1. Snip off lower yellow leaves. 2. Spray organic Neem Oil (5ml/L). 3. Avoid evening flood irrigation.",
        answer_text_te: "టమాటా లేదా మిరపలో ఆకులు పసుపు రంగులోకి మారితే: 1. అడుగున ఉన్న పసుపు ఆకులను తుంచండి. 2. వేపనూనె (5 మి.లీ / లీటరు నీటికి) పిచికారీ చేయండి. 3. పొలంలో నీరు నిల్వ ఉండకుండా చూసుకోండి."
      });
    } finally {
      setSolverLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
        padding: '3rem 0 2rem 0',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div className="container">
          <div className="flex justify-between items-center flex-wrap gap-6">
            <div style={{ maxWidth: '640px' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="badge badge-green flex items-center gap-1">
                  <Sparkles size={13} />
                  {language === 'te' ? 'రైతులకు నమ్మకమైన వేదిక' : 'Trusted Agriculture Platform'}
                </span>
                <span className="badge badge-blue">
                  {language === 'te' ? 'ఉచిత నమోదు' : '100% Free for Farmers'}
                </span>
              </div>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.2,
                marginBottom: '1rem',
                letterSpacing: '-0.5px'
              }}>
                {t.heroTitle}
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: '#475569',
                lineHeight: 1.6,
                marginBottom: '1.75rem'
              }}>
                {t.heroSubtitle}
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                <button 
                  onClick={() => onNavigate('marketplace')} 
                  className="btn btn-primary btn-lg"
                >
                  <ShoppingCart size={20} />
                  <span>{t.sellCrop} / {t.findBuyers}</span>
                </button>
                <button 
                  onClick={() => onNavigate('problem-solver')} 
                  className="btn btn-secondary btn-lg"
                >
                  <Mic size={20} className="text-green-700" />
                  <span>{t.problemSolver}</span>
                </button>
              </div>
            </div>

            {/* Quick Live Weather Card */}
            <div style={{ width: '100%', maxWidth: '340px' }}>
              <WeatherWidget 
                district={user?.district || "Guntur"} 
                onClick={() => onNavigate('weather')} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Voice Problem Solver Banner */}
      <section style={{ margin: '2rem 0' }}>
        <div className="container">
          <div 
            className="card" 
            style={{ 
              background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)', 
              color: '#ffffff',
              padding: '1.75rem',
              borderRadius: '20px',
              boxShadow: '0 10px 25px rgba(21, 128, 61, 0.25)'
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '14px' }}>
                  <Mic size={28} className="text-white" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                    {language === 'te' ? 'రైతు సమస్యల పరిష్కారం – వాయిస్ సహాయం' : 'Farmer Problem Solver – Voice Assistant'}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#bbf7d0' }}>
                    {language === 'te' 
                      ? 'ఇంగ్లీష్ టైపింగ్ అవసరం లేదు! మైక్ బటన్ నొక్కి మీ ప్రశ్న తెలుగులో అడగండి.' 
                      : 'No English typing required. Tap the microphone and ask in Telugu or English.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <VoiceMicButton 
                  onTranscript={(transcript) => {
                    setVoiceQuery(transcript);
                    handleQuickAsk(transcript);
                  }}
                  disabled={solverLoading}
                />
              </div>
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2" style={{ background: '#ffffff', padding: '0.4rem', borderRadius: '12px' }}>
              <input
                type="text"
                value={voiceQuery}
                onChange={(e) => setVoiceQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAsk()}
                placeholder={language === 'te' ? 'ఉదాహరణ: టమాటా పంటలో ఆకులు పసుపు రంగులోకి మారుతున్నాయి, ఏం చేయాలి?' : 'e.g. My tomato leaves are turning yellow, what should I do?'}
                style={{ flex: 1, border: 'none', outline: 'none', padding: '0.5rem 0.75rem', fontSize: '0.95rem', color: '#0f172a' }}
              />
              <button
                type="button"
                onClick={() => handleQuickAsk()}
                disabled={solverLoading}
                className="btn btn-primary btn-sm"
              >
                {solverLoading ? '...' : (language === 'te' ? 'సమాధానం పొందండి' : 'Ask Question')}
              </button>
            </div>

            {/* Instant Answer Box */}
            {solverResponse && (
              <div 
                className="mt-4 p-4 rounded" 
                style={{ background: '#ffffff', color: '#0f172a', borderRadius: '12px', border: '1px solid #bbf7d0' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="badge badge-green">
                    <CheckCircle2 size={12} />
                    {language === 'te' ? 'వ్యవసాయ సలహా' : 'Agronomy Recommendation'}
                  </span>
                  <SpeakButton text={language === 'te' ? solverResponse.answer_text_te : solverResponse.answer_text_en} />
                </div>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#1e293b' }}>
                  {language === 'te' ? solverResponse.answer_text_te : solverResponse.answer_text_en}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOUR MAIN ACTIONS CARDS */}
      <section style={{ margin: '3rem 0' }}>
        <div className="container">
          <div className="mb-6">
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
              {language === 'te' ? 'ప్రధాన సేవలు' : 'Four Core Actions'}
            </h2>
            <p style={{ color: '#64748b' }}>
              {language === 'te' ? 'రైతులు, కూలీలు, కొనుగోలుదారులు మరియు దుకాణాల కోసం ప్రధాన విభాగాలు' : 'Everything you need to buy, sell, hire, or work in one place'}
            </p>
          </div>

          <div className="grid grid-cols-4 md-grid-cols-1 gap-6">
            <ActionCard
              title={t.sellCrop}
              description={t.sellCropDesc}
              icon={<Tractor size={28} />}
              badge={language === 'te' ? 'రైతులకు ప్రత్యేకం' : 'For Farmers'}
              onClick={() => onNavigate('marketplace')}
              accentColor="#15803d"
            />
            <ActionCard
              title={t.findBuyers}
              description={t.findBuyersDesc}
              icon={<Briefcase size={28} />}
              badge={language === 'te' ? 'మంచి ధర' : 'Best Prices'}
              onClick={() => onNavigate('marketplace')}
              accentColor="#2563eb"
            />
            <ActionCard
              title={t.findFarmWork}
              description={t.findFarmWorkDesc}
              icon={<Users size={28} />}
              badge={language === 'te' ? 'కూలీలకు' : 'For Workers'}
              onClick={() => onNavigate('labour')}
              accentColor="#d97706"
            />
            <ActionCard
              title={t.findWorkers}
              description={t.findWorkersDesc}
              icon={<Users size={28} />}
              badge={language === 'te' ? 'కూలీల నియామకం' : 'Hire Workers'}
              onClick={() => onNavigate('labour')}
              accentColor="#7c3aed"
            />
          </div>
        </div>
      </section>

      {/* SIX IMPORTANT SMART FEATURES SECTION */}
      <section style={{ background: '#f8fafc', padding: '3rem 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div className="mb-8">
            <span className="badge badge-green mb-2">Smart Agritech</span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
              {language === 'te' ? 'ఆరు ముఖ్యమైన స్మార్ట్ ఫీచర్లు' : 'Six Smart Agriculture Features'}
            </h2>
            <p style={{ color: '#64748b' }}>
              {language === 'te' ? 'ఆధునిక సాంకేతిక పరిజ్ఞానంతో మీ వ్యవసాయ సమస్యలకు వేగవంతమైన పరిష్కారాలు' : 'Intelligent digital tools built specifically for Indian farming conditions'}
            </p>
          </div>

          <div className="grid grid-cols-3 md-grid-cols-1 gap-6">
            {/* Feature 1: Crop Doctor */}
            <div 
              className="card card-interactive"
              onClick={() => onNavigate('crop-doctor')}
              style={{ borderTop: '4px solid #16a34a' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '12px', color: '#166534' }}>
                  <Stethoscope size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{t.cropDoctor}</h3>
                  <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>AI Diagnosis</span>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1rem' }}>
                {t.cropDoctorDesc}
              </p>
              <div className="flex items-center gap-1 text-sm font-semibold text-green-700">
                <span>{language === 'te' ? 'వ్యాధిని గుర్తించండి' : 'Diagnose Plant'}</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Feature 2: Weather Alerts */}
            <div 
              className="card card-interactive"
              onClick={() => onNavigate('weather')}
              style={{ borderTop: '4px solid #f59e0b' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '12px', color: '#92400e' }}>
                  <CloudSun size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{t.weatherAlerts}</h3>
                  <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>Live Forecasting</span>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1rem' }}>
                {t.weatherAlertsDesc}
              </p>
              <div className="flex items-center gap-1 text-sm font-semibold text-amber-700">
                <span>{language === 'te' ? 'వాతావరణ నివేదిక' : 'View Weather'}</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Feature 3: Market Prices */}
            <div 
              className="card card-interactive"
              onClick={() => onNavigate('market-prices')}
              style={{ borderTop: '4px solid #059669' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div style={{ background: '#d1fae5', padding: '10px', borderRadius: '12px', color: '#065f46' }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{t.marketPrices}</h3>
                  <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>Agmarknet Mandi</span>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1rem' }}>
                {t.marketPricesDesc}
              </p>
              <div className="flex items-center gap-1 text-sm font-semibold text-emerald-700">
                <span>{language === 'te' ? 'ధరలు పరిశీలించండి' : 'Check Prices'}</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Feature 4: Government Schemes */}
            <div 
              className="card card-interactive"
              onClick={() => onNavigate('schemes')}
              style={{ borderTop: '4px solid #7c3aed' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div style={{ background: '#ede9fe', padding: '10px', borderRadius: '12px', color: '#5b21b6' }}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{t.govSchemes}</h3>
                  <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>Central & State</span>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1rem' }}>
                {t.govSchemesDesc}
              </p>
              <div className="flex items-center gap-1 text-sm font-semibold text-purple-700">
                <span>{language === 'te' ? 'పథకాల వివరాలు' : 'Explore Schemes'}</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Feature 5: Farming Assistant & Calendar */}
            <div 
              className="card card-interactive"
              onClick={() => onNavigate('calendar')}
              style={{ borderTop: '4px solid #2563eb' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div style={{ background: '#dbeafe', padding: '10px', borderRadius: '12px', color: '#1e40af' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{t.farmingAssistant}</h3>
                  <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>Calendar Guide</span>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1rem' }}>
                {t.farmingAssistantDesc}
              </p>
              <div className="flex items-center gap-1 text-sm font-semibold text-blue-700">
                <span>{language === 'te' ? 'క్యాలెండర్ తెరవండి' : 'Open Calendar'}</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Feature 6: Agri Shops & Rentals */}
            <div 
              className="card card-interactive"
              onClick={() => onNavigate('shops')}
              style={{ borderTop: '4px solid #ea580c' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div style={{ background: '#ffedd5', padding: '10px', borderRadius: '12px', color: '#9a3412' }}>
                  <Tractor size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{t.shops}</h3>
                  <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>Inputs & Machinery</span>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1rem' }}>
                Find verified agricultural shops, seeds, fertilizers, and tractor/harvester equipment rentals nearby.
              </p>
              <div className="flex items-center gap-1 text-sm font-semibold text-orange-700">
                <span>{language === 'te' ? 'దుకాణాలు చూడండి' : 'Browse Shops'}</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section style={{ margin: '4rem 0 1rem 0' }}>
        <div className="container">
          <div className="card text-center" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '3rem 1.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#166534', marginBottom: '0.75rem' }}>
              {language === 'te' ? 'నేడే అగ్రివేదతో ప్రారంభించండి' : 'Start with AgriVeda Today'}
            </h2>
            <p style={{ maxWidth: '600px', margin: '0 auto 1.5rem auto', color: '#475569' }}>
              {language === 'te' 
                ? 'ఉచిత నమోదు. దళారీల ప్రమేయం లేకుండా పంటలకు న్యాయమైన ధర పొందండి.' 
                : 'Free registration for all farmers. Connect with direct buyers and save on middleman commissions.'}
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              {!user ? (
                <>
                  <button onClick={() => onOpenAuth('register')} className="btn btn-primary btn-lg">
                    {t.register}
                  </button>
                  <button onClick={() => onOpenAuth('login')} className="btn btn-outline btn-lg">
                    {t.login}
                  </button>
                </>
              ) : (
                <button onClick={() => onNavigate('marketplace')} className="btn btn-primary btn-lg">
                  {t.marketplace}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
