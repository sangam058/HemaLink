import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Droplets,
  Heart,
  Calendar,
  Award,
  History,
  Package,
  Users,
  Building2,
  BarChart3,
  Settings,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface SidebarLink {
  to: string;
  icon: React.ReactNode;
  label: string;
}

export function Sidebar() {
  const { user } = useAuthStore();

  const getLinks = (): SidebarLink[] => {
    const base = `/${user?.role}`;
    switch (user?.role) {
      case 'donor':
        return [
          { to: base, icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
          { to: `${base}/donate`, icon: <Heart className="w-5 h-5" />, label: 'Donate Blood' },
          { to: `${base}/requests`, icon: <Droplets className="w-5 h-5" />, label: 'Blood Requests' },
          { to: `${base}/donations`, icon: <History className="w-5 h-5" />, label: 'My Donations' },
          { to: `${base}/campaigns`, icon: <Calendar className="w-5 h-5" />, label: 'Campaigns' },
          { to: `${base}/rewards`, icon: <Award className="w-5 h-5" />, label: 'Rewards' },
        ];
      case 'requester':
        return [
          { to: base, icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
          { to: `${base}/new-request`, icon: <Droplets className="w-5 h-5" />, label: 'New Request' },
          { to: `${base}/my-requests`, icon: <FileText className="w-5 h-5" />, label: 'My Requests' },
          { to: `${base}/messages`, icon: <MessageSquare className="w-5 h-5" />, label: 'Messages' },
          { to: `${base}/history`, icon: <History className="w-5 h-5" />, label: 'History' },
        ];
      case 'hospital':
        return [
          { to: base, icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
          { to: `${base}/requests`, icon: <Droplets className="w-5 h-5" />, label: 'Requests' },
          { to: `${base}/donations`, icon: <Heart className="w-5 h-5" />, label: 'Donations' },
          { to: `${base}/inventory`, icon: <Package className="w-5 h-5" />, label: 'Inventory' },
          { to: `${base}/campaigns`, icon: <Calendar className="w-5 h-5" />, label: 'Campaigns' },
          { to: `${base}/history`, icon: <History className="w-5 h-5" />, label: 'History' },
        ];
      case 'admin':
        return [
          { to: base, icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
          { to: `${base}/hospitals`, icon: <Building2 className="w-5 h-5" />, label: 'Hospitals' },
          { to: `${base}/donors`, icon: <Users className="w-5 h-5" />, label: 'Donors' },
          { to: `${base}/requests`, icon: <Droplets className="w-5 h-5" />, label: 'Requests' },
          { to: `${base}/campaigns`, icon: <Calendar className="w-5 h-5" />, label: 'Campaigns' },
          { to: `${base}/rewards`, icon: <Award className="w-5 h-5" />, label: 'Rewards' },
          { to: `${base}/reports`, icon: <BarChart3 className="w-5 h-5" />, label: 'Reports' },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 overflow-y-auto hidden lg:block">
      <nav className="p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === `/${user?.role}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-500/25'
                  : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {link.icon}
                <span className="font-medium">{link.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute right-0 w-1 h-8 bg-white rounded-l-full"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
        <NavLink
          to={`/${user?.role}/settings`}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive ? 'bg-slate-100 text-slate-800' : 'text-slate-600 hover:bg-slate-100'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
