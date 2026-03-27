import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import type { UserRole } from '../../types';

interface DashboardLayoutProps {
  allowedRole: UserRole;
}

export function DashboardLayout({ allowedRole }: DashboardLayoutProps) {
  const { user, isAuthenticated, error } = useAuthStore();

  // Show error state if there's an authentication error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Authentication Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              Refresh Page
            </button>
            <button 
              onClick={() => window.location.href = '/login'} 
              className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Enhanced loading state with more information
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 bg-rose-200 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-16 h-16 bg-rose-600 rounded-full animate-ping opacity-20"></div>
          </div>
          <div className="space-y-2">
            <p className="text-slate-600 font-medium">Loading your profile...</p>
            <p className="text-slate-400 text-sm">Please wait while we set up your dashboard</p>
          </div>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== allowedRole) {
    return <Navigate to={`/${user?.role}`} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Sidebar />
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
