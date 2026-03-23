import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building2, Heart, Shield, Info } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import type { UserRole } from '../../types';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('donor');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const roles = [
    { id: 'donor' as UserRole, label: 'Donor', icon: <Heart className="w-5 h-5" />, color: 'rose' },
    { id: 'requester' as UserRole, label: 'Requester', icon: <User className="w-5 h-5" />, color: 'blue' },
    { id: 'hospital' as UserRole, label: 'Hospital', icon: <Building2 className="w-5 h-5" />, color: 'emerald' },
    { id: 'admin' as UserRole, label: 'Admin', icon: <Shield className="w-5 h-5" />, color: 'purple' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password, role);
      if (success) {
        navigate(`/${role}`);
      } else {
        setError('Invalid credentials. Please check your email and password.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillAdminCreds = () => {
    setEmail('sangam362004@gmail.com');
    setPassword('sangam362004');
    setRole('admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="HemaLink" className="w-12 h-12" />
            <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
              HemaLink
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Welcome Back</h1>
          <p className="text-slate-600">Sign in to continue saving lives</p>
        </div>

        <Card>
          {/* Role Selection */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1 ${role === r.id
                    ? 'border-rose-500 bg-rose-50 text-rose-600'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
              >
                {r.icon}
                <span className="text-xs font-medium">{r.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              icon={<Mail className="w-5 h-5" />}
              autoComplete="off"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              icon={<Lock className="w-5 h-5" />}
              autoComplete="new-password"
              required
            />

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600">Don't have an account? </span>
            <Link to="/signup" className="text-rose-600 font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </Card>

        {/* Admin Helper Box */}
        <div className="mt-6 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <span>Admin Access</span>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            To view the Admin Panel, use the credentials below.
          </p>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-xs text-slate-500">
              <p>User: <span className="font-mono text-slate-800">sangam362004@gmail.com</span></p>
              <p>Pass: <span className="font-mono text-slate-800">sangam362004</span></p>
            </div>
            <button 
              onClick={fillAdminCreds}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded"
            >
              Fill Form
            </button>
          </div>
          <div className="mt-3 flex items-start gap-2 text-xs text-slate-500 bg-blue-50/50 p-2 rounded">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <p>Ensure you run the "Admin SQL" script in your Supabase editor to activate this user.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
