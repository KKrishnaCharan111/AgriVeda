import React, { useState, useEffect } from 'react';
import { Tractor, Plus, TrendingUp, CloudSun, Calendar, Stethoscope, CheckCircle2, MessageSquare, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { CropListing, BuyerOffer, JobListing } from '../types';
import { SellCropModal } from './SellCropModal';
import { WeatherWidget } from '../components/WeatherWidget';

export const FarmerDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [myCrops, setMyCrops] = useState<CropListing[]>([]);
  const [myJobs, setMyJobs] = useState<JobListing[]>([]);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFarmerData = () => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      api.getCrops(),
      api.getJobs()
    ]).then(([allCrops, allJobs]) => {
      setMyCrops(allCrops.filter((c) => c.farmer_id === user.id));
      setMyJobs(allJobs.filter((j) => j.farmer_id === user.id));
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchFarmerData();
  }, [user]);

  if (!user) return null;

  const prof = user.farmer_profile;

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Farmer Greeting Banner */}
      <div className="card mb-6" style={{ background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)', color: '#fff', padding: '1.75rem', borderRadius: '18px' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Tractor size={30} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-green" style={{ background: '#dcfce7', color: '#166534' }}>
                  {language === 'te' ? 'ధ్రువీకరించబడిన రైతు' : 'Verified Farmer'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#bbf7d0' }}>
                  {user.village ? `${user.village}, ` : ''}{user.district}, {user.state}
                </span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>
                {language === 'te' ? `స్వాగతం, ${user.full_name}` : `Welcome back, ${user.full_name}`}
              </h1>
              <div style={{ fontSize: '0.85rem', color: '#dcfce7' }}>
                Farm: <strong>{prof?.farm_size_acres || 5.5} Acres</strong> | Crops: <strong>{prof?.primary_crops || 'Paddy, Chilli, Cotton'}</strong> | Irrigation: <strong>{prof?.irrigation_type || 'Borewell'}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSellModalOpen(true)}
              className="btn btn-secondary flex items-center gap-1.5"
              style={{ background: '#ffffff', color: '#166534' }}
            >
              <Plus size={18} />
              <span>{t.sellCrop}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Action Shortcuts */}
      <div className="grid grid-cols-4 md-grid-cols-1 gap-4 mb-8">
        <div 
          onClick={() => onNavigate('crop-doctor')}
          className="card card-interactive p-3 flex items-center gap-3"
          style={{ borderLeft: '4px solid #16a34a' }}
        >
          <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '10px', color: '#166534' }}>
            <Stethoscope size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.cropDoctor}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Check plant disease</div>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('problem-solver')}
          className="card card-interactive p-3 flex items-center gap-3"
          style={{ borderLeft: '4px solid #2563eb' }}
        >
          <div style={{ background: '#dbeafe', padding: '10px', borderRadius: '10px', color: '#1e40af' }}>
            <MessageSquare size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.problemSolver}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Voice speech helper</div>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('calendar')}
          className="card card-interactive p-3 flex items-center gap-3"
          style={{ borderLeft: '4px solid #f59e0b' }}
        >
          <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '10px', color: '#92400e' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.farmingAssistant}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Sowing & fertilizer tasks</div>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('market-prices')}
          className="card card-interactive p-3 flex items-center gap-3"
          style={{ borderLeft: '4px solid #059669' }}
        >
          <div style={{ background: '#d1fae5', padding: '10px', borderRadius: '10px', color: '#065f46' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.marketPrices}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Check mandi rates</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 md-grid-cols-1 gap-8">
        {/* Left Column: My Listed Crops */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              {language === 'te' ? 'నా పంటల జాబితా (My Crop Listings)' : 'My Crop Listings'} ({myCrops.length})
            </h2>
            <button onClick={() => setIsSellModalOpen(true)} className="btn btn-outline btn-sm">
              + Add New Crop
            </button>
          </div>

          {loading ? (
            <div className="card text-center p-8 text-muted">Loading your crops...</div>
          ) : myCrops.length === 0 ? (
            <div className="card text-center p-8">
              <Tractor size={36} className="text-muted mx-auto mb-2" />
              <p>You have not listed any crops yet.</p>
              <button onClick={() => setIsSellModalOpen(true)} className="btn btn-primary btn-sm mt-3">
                List Crop for Sale
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {myCrops.map((c) => (
                <div key={c.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-green">{c.category}</span>
                      <span className="badge badge-blue">{c.status}</span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                      {language === 'te' && c.crop_name_te ? c.crop_name_te : c.crop_name}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Qty: <strong>{c.quantity} {c.unit}</strong> | Expected: <strong style={{ color: '#166534' }}>₹{c.expected_price_per_unit} / {c.unit}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => onNavigate('marketplace')} className="btn btn-secondary btn-sm">
                      View Offers
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* My Posted Farm Jobs */}
          <div className="mt-8">
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
              {language === 'te' ? 'నేను పోస్ట్ చేసిన పనులు (Labour Requirements)' : 'My Posted Farm Labour Requirements'} ({myJobs.length})
            </h2>

            {myJobs.length === 0 ? (
              <div className="card text-center p-6 text-muted">
                <p>No active farm work requirements posted.</p>
                <button onClick={() => onNavigate('labour')} className="btn btn-outline btn-sm mt-2">
                  Post Labour Job
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {myJobs.map((j) => (
                  <div key={j.id} className="card p-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge badge-amber">{j.work_type}</span>
                        <span className="badge badge-green">{j.crop_type}</span>
                      </div>
                      <h4 style={{ fontWeight: 700, color: '#0f172a' }}>{j.title}</h4>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Workers: <strong>{j.workers_needed}</strong> | Wage: <strong>₹{j.daily_wage}/day</strong> | Starts: <strong>{j.start_date}</strong>
                      </div>
                    </div>
                    <button onClick={() => onNavigate('labour')} className="btn btn-outline btn-sm">
                      View Applicants
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Weather & Mandi Rates */}
        <div>
          <div className="mb-4">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
              Today's Farm Weather
            </h3>
            <WeatherWidget district={user.district} onClick={() => onNavigate('weather')} />
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                Mandi Price Trends
              </h3>
              <button onClick={() => onNavigate('market-prices')} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                All Prices
              </button>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between p-2 rounded" style={{ background: '#f8fafc' }}>
                <span>Red Chilli (Guntur Yard)</span>
                <strong style={{ color: '#166534' }}>₹19,600 / Qtl</strong>
              </div>
              <div className="flex items-center justify-between p-2 rounded" style={{ background: '#f8fafc' }}>
                <span>Paddy BPT 5204 (Tenali)</span>
                <strong style={{ color: '#166534' }}>₹2,420 / Qtl</strong>
              </div>
              <div className="flex items-center justify-between p-2 rounded" style={{ background: '#f8fafc' }}>
                <span>Bt Cotton (Adoni Mandi)</span>
                <strong style={{ color: '#166534' }}>₹7,180 / Qtl</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SellCropModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        onSuccess={fetchFarmerData}
      />
    </div>
  );
};
