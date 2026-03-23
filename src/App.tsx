import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useDataStore } from './store/dataStore';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';

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

function App() {
  const { initialize: initializeAuth } = useAuthStore();
  const { fetchInitialData, subscribeToRealtime } = useDataStore();

  useEffect(() => {
    initializeAuth();
    fetchInitialData();
    subscribeToRealtime();
  }, [initializeAuth, fetchInitialData, subscribeToRealtime]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
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
          <Route path="campaigns" element={<DonorCampaigns />} />
        </Route>

        {/* Requester Routes */}
        <Route path="/requester" element={<DashboardLayout allowedRole="requester" />}>
          <Route index element={<RequesterDashboard />} />
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
