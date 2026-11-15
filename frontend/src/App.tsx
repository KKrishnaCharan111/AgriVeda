import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './pages/AuthModal';

import { HomePage } from './pages/HomePage';
import { CropMarketplacePage } from './pages/CropMarketplacePage';
import { LabourJobsPage } from './pages/LabourJobsPage';
import { ShopMarketplacePage } from './pages/ShopMarketplacePage';
import { CropDoctorPage } from './pages/CropDoctorPage';
import { ProblemSolverPage } from './pages/ProblemSolverPage';
import { WeatherPage } from './pages/WeatherPage';
import { MarketPricesPage } from './pages/MarketPricesPage';
import { GovernmentSchemesPage } from './pages/GovernmentSchemesPage';
import { FarmingCalendarPage } from './pages/FarmingCalendarPage';
import { PricingPage } from './pages/PricingPage';
import { RefundsPage } from './pages/RefundsPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { ProfilePage } from './pages/ProfilePage';

import { FarmerDashboard } from './pages/FarmerDashboard';
import { LabourDashboard } from './pages/LabourDashboard';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { ShopDashboard } from './pages/ShopDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

const MainLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const { user } = useAuth();

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} onOpenAuth={handleOpenAuth} />;
      case 'marketplace':
        return <CropMarketplacePage onOpenAuth={handleOpenAuth} />;
      case 'labour':
        return <LabourJobsPage onOpenAuth={handleOpenAuth} />;
      case 'shops':
        return <ShopMarketplacePage onOpenAuth={handleOpenAuth} />;
      case 'crop-doctor':
        return <CropDoctorPage onOpenAuth={() => handleOpenAuth('login')} />;
      case 'problem-solver':
        return <ProblemSolverPage onOpenAuth={() => handleOpenAuth('login')} />;
      case 'weather':
        return <WeatherPage />;
      case 'market-prices':
        return <MarketPricesPage />;
      case 'schemes':
        return <GovernmentSchemesPage />;
      case 'calendar':
        return <FarmingCalendarPage onOpenAuth={() => handleOpenAuth('login')} />;
      case 'pricing':
        return <PricingPage onOpenAuth={() => handleOpenAuth('login')} />;
      case 'refunds':
        return <RefundsPage onOpenAuth={() => handleOpenAuth('login')} />;
      case 'complaints':
        return <ComplaintsPage onOpenAuth={() => handleOpenAuth('login')} />;
      case 'profile':
        return <ProfilePage />;
      
      // Role Dashboards
      case 'farmer-dashboard':
        return <FarmerDashboard onNavigate={setCurrentPage} />;
      case 'labour-dashboard':
        return <LabourDashboard onNavigate={setCurrentPage} />;
      case 'buyer-dashboard':
        return <BuyerDashboard onNavigate={setCurrentPage} />;
      case 'shop-dashboard':
        return <ShopDashboard onNavigate={setCurrentPage} />;
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={setCurrentPage} />;
      default:
        return <HomePage onNavigate={setCurrentPage} onOpenAuth={handleOpenAuth} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <Navbar 
        onNavigate={setCurrentPage} 
        currentPage={currentPage} 
        onOpenAuth={handleOpenAuth} 
      />

      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>

      <Footer onNavigate={setCurrentPage} />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {}}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainLayout />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
