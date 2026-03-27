import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, Suspense, lazy } from 'react';
import { useAuthStore } from './store/authStore';
import { useDataStore } from './store/dataStore';
import { isSupabaseConfigured } from './lib/supabase';
import { ErrorBoundary } from './components/ErrorBoundary';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages (Keep Home/Auth eager for speed)
import { HomePage } from './pages/public/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';

// Lazy Loaded Pages
const AboutPage = lazy(() => import('./pages/public/AboutPage').then(m => ({ default: m.AboutPage })));
const CampaignsPage = lazy(() => import('./pages/public/CampaignsPage').then(m => ({ default: m.CampaignsPage })));
const LiveInventoryPage = lazy(() => import('./pages/shared/LiveInventoryPage').then(m => ({ default: m.LiveInventoryPage })));

// Donor Pages
const DonorDashboard = lazy(() => import('./pages/donor/DonorDashboard').then(m => ({ default: m.DonorDashboard })));
const DonorRequests = lazy(() => import('./pages/donor/DonorRequests').then(m => ({ default: m.DonorRequests })));
const DonorDonations = lazy(() => import('./pages/donor/DonorDonations').then(m => ({ default: m.DonorDonations })));
const DonorRewards = lazy(() => import('./pages/donor/DonorRewards').then(m => ({ default: m.DonorRewards })));
const DonateBlood = lazy(() => import('./pages/donor/DonateBlood').then(m => ({ default: m.DonateBlood })));
const DonorCampaigns = lazy(() => import('./pages/donor/DonorCampaigns').then(m => ({ default: m.DonorCampaigns })));

// Requester Pages
const RequesterDashboard = lazy(() => import('./pages/requester/RequesterDashboard').then(m => ({ default: m.RequesterDashboard })));
const NewRequest = lazy(() => import('./pages/requester/NewRequest').then(m => ({ default: m.NewRequest })));
const MyRequests = lazy(() => import('./pages/requester/MyRequests').then(m => ({ default: m.MyRequests })));

// Hospital Pages
const HospitalDashboard = lazy(() => import('./pages/hospital/HospitalDashboard').then(m => ({ default: m.HospitalDashboard })));
const HospitalRequests = lazy(() => import('./pages/hospital/HospitalRequests'));
const HospitalInventory = lazy(() => import('./pages/hospital/HospitalInventory').then(m => ({ default: m.HospitalInventory })));
const HospitalDonations = lazy(() => import('./pages/hospital/HospitalDonations').then(m => ({ default: m.HospitalDonations })));
const HospitalCampaigns = lazy(() => import('./pages/hospital/HospitalCampaigns').then(m => ({ default: m.HospitalCampaigns })));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminRequests = lazy(() => import('./pages/admin/AdminRequests').then(m => ({ default: m.AdminRequests })));
const AdminDonors = lazy(() => import('./pages/admin/AdminDonors').then(m => ({ default: m.AdminDonors })));
const AdminHospitals = lazy(() => import('./pages/admin/AdminHospitals').then(m => ({ default: m.AdminHospitals })));
const AdminCampaigns = lazy(() => import('./pages/admin/AdminCampaigns').then(m => ({ default: m.AdminCampaigns })));
const AdminReports = lazy(() => import('./pages/admin/AdminReports').then(m => ({ default: m.AdminReports })));
const AdminRewards = lazy(() => import('./pages/admin/AdminRewards').then(m => ({ default: m.AdminRewards })));

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
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<AppLoading />}>
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
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
