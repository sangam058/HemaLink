import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="HemaLink" className="w-10 h-10" />
                <span className="text-xl font-bold">HemaLink</span>
              </div>
              <p className="text-slate-400 text-sm">
                Connecting blood donors with those in need. Every drop counts in saving lives.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/about" className="hover:text-rose-400 transition-colors">About Us</Link></li>
                <li><Link to="/campaigns" className="hover:text-rose-400 transition-colors">Campaigns</Link></li>
                <li><Link to="/signup" className="hover:text-rose-400 transition-colors">Become a Donor</Link></li>
                <li><Link to="/login" className="hover:text-rose-400 transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Partners</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/signup" className="hover:text-rose-400 transition-colors">Register Hospital</Link></li>
                <li><Link to="/about" className="hover:text-rose-400 transition-colors">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> support@hemalink.com
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> +1 (800) HEMA-LINK
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Global Operations
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-slate-400 text-sm">
              © 2025 HemaLink. All rights reserved.
            </p>
            <p className="text-slate-400 text-sm flex items-center gap-1 mt-2 md:mt-0">
              Made with <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> for humanity
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
