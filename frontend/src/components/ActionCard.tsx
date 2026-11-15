import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  onClick: () => void;
  accentColor?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  badge,
  onClick,
  accentColor = '#15803d'
}) => {
  return (
    <div
      onClick={onClick}
      className="card card-interactive flex flex-col justify-between"
      style={{
        padding: '1.5rem',
        borderLeft: `5px solid ${accentColor}`,
        minHeight: '180px'
      }}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(21, 128, 61, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor
            }}
          >
            {icon}
          </div>
          {badge && <span className="badge badge-green">{badge}</span>}
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem', color: '#0f172a' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.4 }}>
          {description}
        </p>
      </div>

      <div className="flex items-center gap-1 mt-4" style={{ color: accentColor, fontWeight: 600, fontSize: '0.9rem' }}>
        <span>Explore Now</span>
        <ArrowRight size={16} />
      </div>
    </div>
  );
};
