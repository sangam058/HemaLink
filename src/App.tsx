import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';

// Store
import { useAuthStore } from './store/authStore';
import { useDataStore } from './store/dataStore';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { CampaignsPage } from './pages/public/CampaignsPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';

// Donor Pages
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { DonateBlood } from './pages/donor/DonateBlood';
import { DonorRequests } from './pages/donor/DonorRequests';
import { DonorDonations } from './pages/donor/DonorDonations';
import { DonorCampaigns } from './pages/donor/DonorCampaigns';
import { DonorRewards } from './pages/donor/DonorRewards';

// Requester Pages
import { RequesterDashboard } from './pages/requester/RequesterDashboard';
import { NewRequest } from './pages/requester/NewRequest';
import { MyRequests } from './pages/requester/MyRequests';

// Hospital Pages
import { HospitalDashboard } from './pages/hospital/HospitalDashboard';
import { HospitalInventory } from './pages/hospital/HospitalInventory';
import { HospitalDonations } from './pages/hospital/HospitalDonations';
import { HospitalCampaigns } from './pages/hospital/HospitalCampaigns';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminHospitals } from './pages/admin/AdminHospitals';
import { AdminDonors } from './pages/admin/AdminDonors';
import { AdminRequests } from './pages/admin/AdminRequests';
import { AdminCampaigns } from './pages/admin/AdminCampaigns';
import { AdminRewards } from './pages/admin/AdminRewards';
import { AdminReports } from './pages/admin/AdminReports';

// Shared Pages
import { ProfilePage } from './pages/shared/ProfilePage';
import { SettingsPage } from './pages/shared/SettingsPage';

function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const fetchInitialData = useDataStore((state) => state.fetchInitialData);
  const subscribeToRealtime = useDataStore((state) => state.subscribeToRealtime);

  useEffect(() => {
    initializeAuth();
    fetchInitialData();
    subscribeToRealtime();
  }, [initializeAuth, fetchInitialData, subscribeToRealtime]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Donor Routes */}
        <Route path="/donor" element={<DashboardLayout allowedRole="donor" />}>
          <Route index element={<DonorDashboard />} />
          <Route path="donate" element={<DonateBlood />} />
          <Route path="requests" element={<DonorRequests />} />
          <Route path="donations" element={<DonorDonations />} />
          <Route path="campaigns" element={<DonorCampaigns />} />
          <Route path="rewards" element={<DonorRewards />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Requester Routes */}
        <Route path="/requester" element={<DashboardLayout allowedRole="requester" />}>
          <Route index element={<RequesterDashboard />} />
          <Route path="new-request" element={<NewRequest />} />
          <Route path="my-requests" element={<MyRequests />} />
          <Route path="messages" element={<MyRequests />} />
          <Route path="history" element={<MyRequests />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Hospital Routes */}
        <Route path="/hospital" element={<DashboardLayout allowedRole="hospital" />}>
          <Route index element={<HospitalDashboard />} />
          <Route path="requests" element={<HospitalDashboard />} />
          <Route path="donations" element={<HospitalDonations />} />
          <Route path="inventory" element={<HospitalInventory />} />
          <Route path="campaigns" element={<HospitalCampaigns />} />
          <Route path="history" element={<HospitalDonations />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<DashboardLayout allowedRole="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="hospitals" element={<AdminHospitals />} />
          <Route path="donors" element={<AdminDonors />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
          <Route path="rewards" element={<AdminRewards />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
