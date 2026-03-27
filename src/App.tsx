import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { useDataStore } from './store/dataStore';
import { isSupabaseConfigured } from './lib/supabase';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { CampaignsPage } from './pages/public/CampaignsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { LiveInventoryPage } from './pages/shared/LiveInventoryPage';

// Donor Pages
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { DonorRequests } from './pages/donor/DonorRequests';
import { DonorDonations } from './pages/donor/DonorDonations';
import { DonorRewards } from './pages/donor/DonorRewards';
import { DonateBlood } from './pages/donor/DonateBlood';
import { DonorCampaigns } from './pages/donor/DonorCampaigns';

// Requester Pages
import { RequesterDashboard } from './pages/requester/RequesterDashboard';
import { NewRequest } from './pages/requester/NewRequest';
import { MyRequests } from './pages/requester/MyRequests';

// Hospital Pages
import { HospitalDashboard } from './pages/hospital/HospitalDashboard';
import HospitalRequests from './pages/hospital/HospitalRequests';
import { HospitalInventory } from './pages/hospital/HospitalInventory';
import { HospitalDonations } from './pages/hospital/HospitalDonations';
import { HospitalCampaigns } from './pages/hospital/HospitalCampaigns';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminRequests } from './pages/admin/AdminRequests';
import { AdminDonors } from './pages/admin/AdminDonors';
import { AdminHospitals } from './pages/admin/AdminHospitals';
import { AdminCampaigns } from './pages/admin/AdminCampaigns';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminRewards } from './pages/admin/AdminRewards';

// Configuration Error Component
function ConfigurationError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-lg mx-auto p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Configuration Required</h1>
        <div className="text-left bg-slate-50 rounded-lg p-4 mb-6">
          <p className="text-slate-600 mb-2">This application needs Supabase configuration:</p>
          <ul className="text-sm text-slate-500 space-y-1">
            <li>• VITE_SUPABASE_URL</li>
            <li>• VITE_SUPABASE_ANON_KEY</li>
          </ul>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-slate-500">For Vercel deployment, add these as Environment Variables in your Vercel Dashboard.</p>
          <p className="text-sm text-slate-500">For local development, copy <code className="bg-slate-200 px-2 py-1 rounded">.env.example</code> to <code className="bg-slate-200 px-2 py-1 rounded">.env.local</code> and fill in your values.</p>
        </div>
      </div>
    </div>
  );
}

// Loading Component
function AppLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-20 h-20 bg-rose-200 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-20 h-20 bg-rose-600 rounded-full animate-ping opacity-20"></div>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-slate-700">Hemalink</h1>
          <p className="text-slate-500">Initializing application...</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { initialize: initializeAuth } = useAuthStore();
  const { fetchInitialData, subscribeToRealtime } = useDataStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('🚀 Initializing Hemalink application...');
        
        // Check configuration first
        if (!isSupabaseConfigured) {
          console.error('❌ Supabase not configured');
          setIsInitializing(false);
          return;
        }

        // Initialize auth and data
        await initializeAuth();
        await fetchInitialData();
        subscribeToRealtime();
        
        console.log('✅ Application initialized successfully');
      } catch (error) {
        console.error('❌ Application initialization failed:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initApp();
  }, [initializeAuth, fetchInitialData, subscribeToRealtime]);

  // Show configuration error if Supabase is not configured
  if (!isSupabaseConfigured && !isInitializing) {
    return <ConfigurationError />;
  }

  // Show loading while initializing
  if (isInitializing) {
    return <AppLoading />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
        </Route>

        {/* Donor Routes */}
        <Route path="/donor" element={<DashboardLayout allowedRole="donor" />}>
          <Route index element={<DonorDashboard />} />
          <Route path="requests" element={<DonorRequests />} />
          <Route path="donations" element={<DonorDonations />} />
          <Route path="rewards" element={<DonorRewards />} />
          <Route path="donate" element={<DonateBlood />} />
          <Route path="inventory" element={<LiveInventoryPage />} />
          <Route path="campaigns" element={<DonorCampaigns />} />
        </Route>

        {/* Requester Routes */}
        <Route path="/requester" element={<DashboardLayout allowedRole="requester" />}>
          <Route index element={<RequesterDashboard />} />
          <Route path="inventory" element={<LiveInventoryPage />} />
          <Route path="new-request" element={<NewRequest />} />
          <Route path="my-requests" element={<MyRequests />} />
        </Route>

        {/* Hospital Routes */}
        <Route path="/hospital" element={<DashboardLayout allowedRole="hospital" />}>
          <Route index element={<HospitalDashboard />} />
          <Route path="requests" element={<HospitalRequests />} />
          <Route path="donations" element={<HospitalDonations />} />
          <Route path="inventory" element={<HospitalInventory />} />
          <Route path="campaigns" element={<HospitalCampaigns />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<DashboardLayout allowedRole="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="donors" element={<AdminDonors />} />
          <Route path="hospitals" element={<AdminHospitals />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="rewards" element={<AdminRewards />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
