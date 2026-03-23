import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { notifications, markNotificationRead } = useDataStore();
  const navigate = useNavigate();

  const userNotifications = notifications.filter((n) => n.userId === user?.id);
  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const handleLogout = async () => {
    await logout();
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'donor':
        return '/donor';
      case 'requester':
        return '/requester';
      case 'hospital':
        return '/hospital';
      case 'admin':
        return '/admin';
      default:
        return '/';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="HemaLink" className="w-10 h-10" />
            <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
              HemaLink
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                <Link to="/about" className="text-slate-600 hover:text-rose-600 transition-colors">
                  About
                </Link>
                <Link to="/campaigns" className="text-slate-600 hover:text-rose-600 transition-colors">
                  Campaigns
                </Link>
                <Link to="/login" className="text-slate-600 hover:text-rose-600 transition-colors">
                  Login
                </Link>
                <Button onClick={() => navigate('/signup')} size="sm">
                  Get Started
                </Button>
              </>
            ) : (
              <>
                <Link
                  to={getDashboardLink()}
                  className="text-slate-600 hover:text-rose-600 transition-colors"
                >
                  Dashboard
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Bell className="w-5 h-5 text-slate-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
                      >
                        <div className="p-4 border-b border-slate-100">
                          <h3 className="font-semibold text-slate-800">Notifications</h3>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {userNotifications.length === 0 ? (
                            <p className="p-4 text-center text-slate-500">No notifications</p>
                          ) : (
                            userNotifications.slice(0, 5).map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => {
                                  markNotificationRead(notif.id);
                                  if (notif.link) navigate(notif.link);
                                  setIsNotifOpen(false);
                                }}
                                className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${
                                  !notif.isRead ? 'bg-rose-50/50' : ''
                                }`}
                              >
                                <p className="font-medium text-sm text-slate-800">{notif.title}</p>
                                <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Avatar name={user?.name || ''} size="sm" />
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
                      >
                        <div className="p-4 border-b border-slate-100">
                          <p className="font-semibold text-slate-800">{user?.name}</p>
                          <p className="text-sm text-slate-500 capitalize">{user?.role}</p>
                        </div>
                        <div className="p-2">
                          <Link
                            to={`${getDashboardLink()}/profile`}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <User className="w-4 h-4 text-slate-500" />
                            <span className="text-sm text-slate-700">Profile</span>
                          </Link>
                          <Link
                            to={`${getDashboardLink()}/settings`}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-slate-500" />
                            <span className="text-sm text-slate-700">Settings</span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600">Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200"
          >
            <div className="px-4 py-4 space-y-3">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/about"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-slate-600"
                  >
                    About
                  </Link>
                  <Link
                    to="/campaigns"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-slate-600"
                  >
                    Campaigns
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-slate-600"
                  >
                    Login
                  </Link>
                  <Button onClick={() => { navigate('/signup'); setIsMenuOpen(false); }} className="w-full">
                    Get Started
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-slate-600"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={`${getDashboardLink()}/profile`}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-slate-600"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="block w-full text-left py-2 text-red-600"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
