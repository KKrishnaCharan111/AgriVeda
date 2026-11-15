import React, { useState, useEffect } from 'react';
import { CloudSun, Droplets, Wind, AlertTriangle, Calendar, MapPin, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { WeatherData } from '../types';

export const WeatherPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [district, setDistrict] = useState('Guntur');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = (targetDistrict: string) => {
    setLoading(true);
    api.getWeather(targetDistrict)
      .then((data) => {
        setWeather(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchWeather(district);
  }, [district]);

  const districts = [
    "Guntur", "Krishna", "Vijayawada", "East Godavari", "West Godavari",
    "Kurnool", "Anantapur", "Chittoor", "Prakasam", "Nellore",
    "Visakhapatnam", "Hyderabad", "Warangal", "Khammam", "Nizamabad"
  ];

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-amber flex items-center gap-1">
              <CloudSun size={13} />
              Live Forecasting
            </span>
            <span className="badge badge-green">Open-Meteo & IMD Advisory</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a' }}>
            {t.weatherAlerts}
          </h1>
          <p style={{ color: '#64748b' }}>
            {language === 'te' 
              ? 'మీ జిల్లా ప్రస్తుత వ్యవసాయ వాతావరణం, వర్ష సూచన మరియు పిచికారీ సలహాలు' 
              : 'Accurate location-based weather reports, precipitation forecasts, and farming advisories'}
          </p>
        </div>

        {/* District Selector */}
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-green-700" />
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="form-select"
            style={{ fontWeight: 600, minWidth: '180px' }}
          >
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card text-center p-12 text-muted">
          <RefreshCw size={36} className="animate-spin mx-auto mb-2 text-green-600" />
          <p>Fetching satellite weather telemetry for {district}...</p>
        </div>
      ) : weather ? (
        <div>
          {/* Main Weather Card */}
          <div 
            className="card mb-6" 
            style={{ 
              background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)', 
              color: '#ffffff',
              padding: '2rem',
              borderRadius: '20px'
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>
                  {weather.state}
                </span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>
                  {weather.district}
                </h2>
                <div style={{ fontSize: '1.1rem', color: '#bbf7d0', fontWeight: 600 }}>
                  {language === 'te' ? weather.weather_condition_te : weather.weather_condition}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1 }}>
                  {weather.temperature}°C
                </div>
                <div style={{ fontSize: '0.85rem', color: '#bbf7d0', marginTop: '0.25rem' }}>
                  High: {weather.temperature_max}°C | Low: {weather.temperature_min}°C
                </div>
              </div>
            </div>

            {/* Weather Metrics Bar */}
            <div className="grid grid-cols-3 md-grid-cols-1 gap-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <div className="flex items-center gap-3">
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
                  <Droplets size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#bbf7d0' }}>Relative Humidity</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{weather.humidity}%</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
                  <Wind size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#bbf7d0' }}>Wind Speed</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{weather.wind_speed} km/h</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
                  <CloudSun size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#bbf7d0' }}>Rainfall</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{weather.rainfall_mm} mm</div>
                </div>
              </div>
            </div>
          </div>

          {/* Advisory & Warnings Grid */}
          <div className="grid grid-cols-2 md-grid-cols-1 gap-6">
            {/* Warning Alert Card */}
            <div className="card" style={{ border: weather.warning_level !== 'Green' ? '2px solid #f59e0b' : '1px solid #e2e8f0' }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={20} className={weather.warning_level !== 'Green' ? 'text-amber-600' : 'text-green-600'} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  {language === 'te' ? 'వ్యవసాయ హెచ్చరిక & సలహా' : 'Agricultural Advisory Alert'}
                </h3>
                <span className={`badge ${weather.warning_level === 'Green' ? 'badge-green' : 'badge-amber'}`}>
                  {weather.warning_level} Code
                </span>
              </div>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#334155' }}>
                {language === 'te' ? weather.weather_warning_te : weather.weather_warning}
              </p>
            </div>

            {/* 48-Hour Forecast Card */}
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={20} className="text-blue-600" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  {language === 'te' ? 'రాబోయే 48 గంటల వర్ష సూచన' : '48-Hour Weather Forecast'}
                </h3>
              </div>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#334155', marginBottom: '1rem' }}>
                {language === 'te' ? weather.forecast_summary_te : weather.forecast_summary}
              </p>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Data Source: <strong>{weather.source}</strong> (Updated: {new Date(weather.last_updated).toLocaleTimeString()})
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
