import React, { useEffect, useState } from 'react';
import { CloudSun, Droplets, Wind, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import type { WeatherData } from '../types';
import { useLanguage } from '../context/LanguageContext';

export const WeatherWidget: React.FC<{ district?: string; onClick?: () => void }> = ({
  district = 'Guntur',
  onClick
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    let isMounted = true;
    api.getWeather(district)
      .then((data) => {
        if (isMounted) {
          setWeather(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [district]);

  if (loading) {
    return (
      <div className="card flex items-center justify-center p-4 text-muted">
        <p>Loading weather...</p>
      </div>
    );
  }

  if (!weather) return null;

  const isWarning = weather.warning_level && weather.warning_level !== 'Green';

  return (
    <div 
      className={`card card-interactive ${isWarning ? 'border-amber-300 bg-amber-50' : 'bg-white'}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CloudSun className="text-green-600" size={24} />
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>{weather.district}, {weather.state}</h4>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {language === 'te' ? weather.weather_condition_te : weather.weather_condition}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#166534' }}>
            {weather.temperature}°C
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted mt-2" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
        <span className="flex items-center gap-1">
          <Droplets size={14} className="text-blue-500" />
          {weather.humidity}% {language === 'te' ? 'తేమ' : 'Humidity'}
        </span>
        <span className="flex items-center gap-1">
          <Wind size={14} className="text-slate-500" />
          {weather.wind_speed} km/h
        </span>
      </div>

      {isWarning && (
        <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-amber-800 bg-amber-100 p-1.5 rounded">
          <AlertTriangle size={14} />
          <span>{language === 'te' ? weather.weather_warning_te : weather.weather_warning}</span>
        </div>
      )}
    </div>
  );
};
