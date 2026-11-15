import React, { useState } from 'react';
import { Stethoscope, Upload, AlertTriangle, ShieldCheck, CheckCircle2, Phone, Mic, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { VoiceMicButton, SpeakButton } from '../components/VoiceMicButton';
import { api } from '../services/api';
import type { CropDoctorResult } from '../types';

export const CropDoctorPage: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [cropType, setCropType] = useState('Chilli');
  const [symptoms, setSymptoms] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<CropDoctorResult | null>(null);

  // Expert Callback Request State
  const [expertCallbackRequested, setExpertCallbackRequested] = useState(false);
  const [expertPhone, setExpertPhone] = useState(user?.phone || '');
  const [expertLoading, setExpertLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      alert("Please describe the symptoms observed on your crop.");
      return;
    }

    setAnalyzing(true);
    let uploadedImageUrl = undefined;

    try {
      if (imageFile && user) {
        try {
          const uploadRes = await api.uploadCropImage(imageFile);
          uploadedImageUrl = uploadRes.image_url;
        } catch {
          // Continue if mock image
        }
      }

      const res = await api.analyzeCrop({
        crop_type: cropType,
        symptoms: symptoms.trim(),
        image_url: uploadedImageUrl,
        language
      });
      setResult(res);
      setAnalyzing(false);
    } catch (err: any) {
      setAnalyzing(false);
      alert(err.message || "Analysis could not be completed.");
    }
  };

  const handleExpertRequest = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setExpertLoading(true);
    try {
      await api.requestExpertContact({
        crop_doctor_request_id: result?.id,
        farmer_name: user.full_name,
        farmer_phone: expertPhone || user.phone,
        crop_name: cropType,
        issue_summary: symptoms
      });
      setExpertLoading(false);
      setExpertCallbackRequested(true);
    } catch {
      setExpertLoading(false);
      alert("Failed to submit request.");
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Title */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-green flex items-center gap-1">
            <Stethoscope size={13} />
            AI Agronomy Intelligence
          </span>
          <span className="badge badge-amber">
            {language === 'te' ? 'రైతు రక్షణ సూచనలు' : 'Expert-Verified Agronomy'}
          </span>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a' }}>
          {t.cropDoctor}
        </h1>
        <p style={{ color: '#64748b', maxWidth: '720px' }}>
          {language === 'te' 
            ? 'మీ పంట తెగులు లేదా వ్యాధి లక్షణాలను తెలపండి. ఏఐ వ్యవసాయ పరిజ్ఞానం ద్వారా తక్షణ నివారణ మరియు రక్షణ సలహాలు పొందండి.' 
            : 'Describe your crop symptoms or upload a photo to receive preliminary diagnosis, organic treatment, and safety advice.'}
        </p>
      </div>

      <div className="grid grid-cols-2 md-grid-cols-1 gap-8">
        {/* Left Form */}
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
            {language === 'te' ? 'పంట సమస్య వివరాలు' : 'Enter Crop Symptoms'}
          </h3>

          <form onSubmit={handleAnalyze}>
            <div className="form-group">
              <label className="form-label">{language === 'te' ? 'పంట పేరు' : 'Crop Type'}</label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="form-select"
              >
                <option value="Chilli">Chilli / Mirchi (మిరప)</option>
                <option value="Tomato">Tomato (టమాటా)</option>
                <option value="Paddy">Paddy / Rice (వరి)</option>
                <option value="Cotton">Cotton (పత్తి)</option>
                <option value="Groundnut">Groundnut (వేరుశనగ)</option>
                <option value="Maize">Maize (మొక్కజొన్న)</option>
                <option value="Turmeric">Turmeric (పసుపు)</option>
              </select>
            </div>

            {/* Symptoms Input with Voice Mic */}
            <div className="form-group">
              <div className="flex items-center justify-between mb-1">
                <label className="form-label mb-0">
                  {language === 'te' ? 'లక్షణాలు / సమస్య వివరణ' : 'Observed Symptoms'}
                </label>
                <VoiceMicButton onTranscript={(txt) => setSymptoms((prev) => `${prev} ${txt}`.trim())} />
              </div>
              <textarea
                rows={4}
                required
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder={language === 'te' ? 'ఉదా: ఆకులు ముడుచుకుపోతున్నాయి లేదా పసుపు రంగులోకి మారుతున్నాయి...' : 'e.g. Leaves turning yellow with brown spots and curling at tips...'}
                className="form-textarea"
              />
            </div>

            {/* Photo Upload */}
            <div className="form-group mb-4">
              <label className="form-label">{language === 'te' ? 'పంట ఫోటో అప్‌లోడ్ (ఐచ్ఛికం)' : 'Upload Crop Photo (Optional)'}</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-input"
                style={{ padding: '0.4rem' }}
              />
              {imagePreview && (
                <div className="mt-2" style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                  <img src={imagePreview} alt="Crop sample" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={analyzing}
              className="btn btn-primary btn-lg w-full"
              style={{ width: '100%' }}
            >
              {analyzing ? 'Analyzing Agronomy Knowledge...' : (language === 'te' ? 'తెగులు నిర్ధారణ చేయండి' : 'Run Crop Diagnosis')}
            </button>
          </form>
        </div>

        {/* Right Result Card */}
        <div>
          {result ? (
            <div className="card" style={{ border: '2px solid #bbf7d0', background: '#f0fdf4' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="badge badge-green flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  Confidence: {Math.round(result.confidence_score * 100)}%
                </span>
                <span className="badge badge-amber">
                  Severity: {result.severity}
                </span>
                <SpeakButton text={language === 'te' ? result.detected_disease_te : result.detected_disease} />
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#166534', marginBottom: '0.25rem' }}>
                {language === 'te' ? result.detected_disease_te : result.detected_disease}
              </h2>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>
                English Name: <em>{result.detected_disease}</em>
              </div>

              {/* Causes */}
              <div className="p-3 bg-white rounded mb-3" style={{ border: '1px solid #dcfce7' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                  {language === 'te' ? 'కారణాలు (Causes)' : 'Possible Causes'}
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
                  {language === 'te' ? result.possible_causes_te : result.possible_causes}
                </p>
              </div>

              {/* Treatment */}
              <div className="p-3 bg-white rounded mb-3" style={{ border: '1px solid #dcfce7' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>
                  {language === 'te' ? 'నివారణ చర్యలు (Treatment Guidance)' : 'Treatment & Management'}
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#1e293b', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                  {language === 'te' ? result.treatment_recommendations_te : result.treatment_recommendations}
                </p>
              </div>

              {/* Prevention */}
              <div className="p-3 bg-white rounded mb-3" style={{ border: '1px solid #dcfce7' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                  {language === 'te' ? 'ముందస్తు జాగ్రత్తలు (Prevention)' : 'Long-term Prevention'}
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
                  {language === 'te' ? result.prevention_guide_te : result.prevention_guide}
                </p>
              </div>

              {/* Safety Warning Alert */}
              <div className="p-3 bg-amber-50 rounded mb-4" style={{ border: '1px solid #fde68a' }}>
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs mb-1">
                  <AlertTriangle size={15} />
                  <span>{language === 'te' ? 'రక్షణ హెచ్చరిక' : 'Important Safety Warning'}</span>
                </div>
                <p style={{ fontSize: '0.825rem', color: '#78350f', lineHeight: 1.4 }}>
                  {language === 'te' ? result.safety_warnings_te : result.safety_warnings}
                </p>
              </div>

              {/* Expert Callback Request Box */}
              <div className="p-4 bg-white rounded" style={{ border: '1px solid #cbd5e1' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Phone size={18} className="text-green-600" />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    {language === 'te' ? 'వ్యవసాయ నిపుణుడి సంప్రదింపు' : 'Need Expert Agronomist Consultation?'}
                  </h4>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  {language === 'te' 
                    ? 'తీవ్రమైన కేసుల కోసం మీ ఫోన్ నంబర్‌కు కృషి విజ్ఞాన కేంద్రం (KVK) నిపుణుల ఉచిత కాల్‌బ్యాక్ అభ్యర్థించండి.' 
                    : 'Request an official agricultural expert callback for confirmation.'}
                </p>

                {expertCallbackRequested ? (
                  <div className="p-2 bg-green-100 text-green-800 rounded text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>Callback request submitted successfully! An expert will connect with you.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="tel"
                      value={expertPhone}
                      onChange={(e) => setExpertPhone(e.target.value)}
                      placeholder="Your 10-digit mobile number"
                      className="form-input"
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                    />
                    <button
                      type="button"
                      onClick={handleExpertRequest}
                      disabled={expertLoading}
                      className="btn btn-secondary btn-sm"
                    >
                      {expertLoading ? 'Requesting...' : 'Request Callback'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card text-center p-12 text-muted">
              <Stethoscope size={48} className="mx-auto mb-3 text-green-600 opacity-60" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                {language === 'te' ? 'లక్షణాలు నమోదు చేసి నిర్ధారణ ప్రారంభించండి' : 'Ready for Plant Diagnosis'}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '360px', margin: '0 auto' }}>
                {language === 'te' 
                  ? 'మీ పంట ఆకుల రంగు, మచ్చలు లేదా తెగులు లక్షణాలు ఎడమవైపు నమోదు చేయండి.' 
                  : 'Enter your plant symptoms on the left to see instant causes, treatments, and dosages.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
