import React, { useState } from 'react';
import { 
  Sprout, Globe, Bell, User as UserIcon, LogOut, Menu, X, 
  Stethoscope, CloudSun, TrendingUp, BookOpen, MessageSquare, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { RoleBadge } from './RoleBadge';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, onOpenAuth }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [smartMenuOpen, setSmartMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'te' ? 'en' : 'te');
  };

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setSmartMenuOpen(false);
  };

  const getDashboardPage = () => {
    if (!user) return 'home';
    switch (user.role) {
      case 'farmer': return 'farmer-dashboard';
      case 'labour': return 'labour-dashboard';
      case 'buyer': return 'buyer-dashboard';
      case 'shop': return 'shop-dashboard';
      case 'admin': return 'admin-dashboard';
      default: return 'home';
    }
  };

  return (
    <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container flex items-center justify-between" style={{ height: '70px' }}>
        {/* Brand Logo */}
        <div 
          onClick={() => handleNav('home')}
          className="flex items-center gap-2 cursor-pointer"
          style={{ cursor: 'pointer' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #15803d, #22c55e)',
            borderRadius: '12px',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 6px rgba(21, 128, 61, 0.3)'
          }}>
            <Sprout size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#166534', letterSpacing: '-0.5px' }}>
              AgriVeda
            </div>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {language === 'te' ? 'స్మార్ట్ వ్యవసాయం' : 'Smart Agriculture'}
            </div>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="flex items-center gap-1" style={{ display: window.innerWidth > 900 ? 'flex' : 'none' }}>
          <button 
            onClick={() => handleNav('home')}
            className={`btn btn-sm ${currentPage === 'home' ? 'btn-secondary' : 'btn-outline'}`}
            style={{ border: 'none' }}
          >
            {t.home}
          </button>
          <button 
            onClick={() => handleNav('marketplace')}
            className={`btn btn-sm ${currentPage === 'marketplace' ? 'btn-secondary' : 'btn-outline'}`}
            style={{ border: 'none' }}
          >
            {t.marketplace}
          </button>
          <button 
            onClick={() => handleNav('labour')}
            className={`btn btn-sm ${currentPage === 'labour' ? 'btn-secondary' : 'btn-outline'}`}
            style={{ border: 'none' }}
          >
            {t.labour}
          </button>
          <button 
            onClick={() => handleNav('shops')}
            className={`btn btn-sm ${currentPage === 'shops' ? 'btn-secondary' : 'btn-outline'}`}
            style={{ border: 'none' }}
          >
            {t.shops}
          </button>

          {/* Smart Features Dropdown Toggle */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setSmartMenuOpen(!smartMenuOpen)}
              className="btn btn-sm btn-outline"
              style={{ border: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <span>{language === 'te' ? 'స్మార్ట్ సేవలు' : 'Smart Hub'}</span>
              <span style={{ fontSize: '0.7rem' }}>▼</span>
            </button>

            {smartMenuOpen && (
              <div 
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '0.5rem',
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  width: '240px',
                  padding: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  zIndex: 200
                }}
              >
                <button 
                  onClick={() => handleNav('crop-doctor')}
                  className="btn btn-sm btn-outline text-left justify-start"
                  style={{ border: 'none', justifyContent: 'flex-start' }}
                >
                  <Stethoscope size={16} className="text-green-600" />
                  <span>{t.cropDoctor}</span>
                </button>
                <button 
                  onClick={() => handleNav('problem-solver')}
                  className="btn btn-sm btn-outline text-left justify-start"
                  style={{ border: 'none', justifyContent: 'flex-start' }}
                >
                  <MessageSquare size={16} className="text-blue-600" />
                  <span>{t.problemSolver}</span>
                </button>
                <button 
                  onClick={() => handleNav('weather')}
                  className="btn btn-sm btn-outline text-left justify-start"
                  style={{ border: 'none', justifyContent: 'flex-start' }}
                >
                  <CloudSun size={16} className="text-amber-500" />
                  <span>{t.weatherAlerts}</span>
                </button>
                <button 
                  onClick={() => handleNav('market-prices')}
                  className="btn btn-sm btn-outline text-left justify-start"
                  style={{ border: 'none', justifyContent: 'flex-start' }}
                >
                  <TrendingUp size={16} className="text-emerald-600" />
                  <span>{t.marketPrices}</span>
                </button>
                <button 
                  onClick={() => handleNav('schemes')}
                  className="btn btn-sm btn-outline text-left justify-start"
                  style={{ border: 'none', justifyContent: 'flex-start' }}
                >
                  <BookOpen size={16} className="text-purple-600" />
                  <span>{t.govSchemes}</span>
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => handleNav('pricing')}
            className={`btn btn-sm ${currentPage === 'pricing' ? 'btn-secondary' : 'btn-outline'}`}
            style={{ border: 'none' }}
          >
            {t.pricing}
          </button>
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Language Toggle Button */}
          <button 
            onClick={toggleLanguage}
            className="btn btn-outline btn-sm flex items-center gap-1"
            title="Switch Language"
            style={{ fontWeight: 600 }}
          >
            <Globe size={15} />
            <span>{language === 'te' ? 'English' : 'తెలుగు'}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleNav(getDashboardPage())}
                className="btn btn-primary btn-sm flex items-center gap-2"
              >
                <UserIcon size={16} />
                <span>{user.full_name.split(' ')[0]}</span>
                <RoleBadge role={user.role} />
              </button>

              <button 
                onClick={logout}
                className="btn btn-outline btn-sm"
                title="Logout"
                style={{ padding: '0.4rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onOpenAuth('login')}
                className="btn btn-outline btn-sm"
              >
                {t.login}
              </button>
              <button 
                onClick={() => onOpenAuth('register')}
                className="btn btn-primary btn-sm"
              >
                {t.register}
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-outline btn-sm"
            style={{ display: window.innerWidth <= 900 ? 'flex' : 'none', padding: '0.4rem' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{ background: '#fff', borderTop: '1px solid #e2e8f0', padding: '1rem' }} className="flex flex-col gap-2">
          <button onClick={() => handleNav('home')} className="btn btn-outline text-left justify-start">{t.home}</button>
          <button onClick={() => handleNav('marketplace')} className="btn btn-outline text-left justify-start">{t.marketplace}</button>
          <button onClick={() => handleNav('labour')} className="btn btn-outline text-left justify-start">{t.labour}</button>
          <button onClick={() => handleNav('shops')} className="btn btn-outline text-left justify-start">{t.shops}</button>
          <button onClick={() => handleNav('crop-doctor')} className="btn btn-outline text-left justify-start">{t.cropDoctor}</button>
          <button onClick={() => handleNav('problem-solver')} className="btn btn-outline text-left justify-start">{t.problemSolver}</button>
          <button onClick={() => handleNav('weather')} className="btn btn-outline text-left justify-start">{t.weatherAlerts}</button>
          <button onClick={() => handleNav('market-prices')} className="btn btn-outline text-left justify-start">{t.marketPrices}</button>
          <button onClick={() => handleNav('schemes')} className="btn btn-outline text-left justify-start">{t.govSchemes}</button>
          <button onClick={() => handleNav('pricing')} className="btn btn-outline text-left justify-start">{t.pricing}</button>
          {user && (
            <button onClick={() => handleNav(getDashboardPage())} className="btn btn-primary text-left justify-start">
              {t.dashboard} ({user.role})
            </button>
          )}
        </div>
      )}
    </header>
  );
};
