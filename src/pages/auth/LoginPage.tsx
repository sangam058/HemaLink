import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building2, Heart, Shield, Eye, EyeOff, Droplets } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import type { UserRole } from '../../types';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('donor');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [role, clearError]);

  const roles = [
    { id: 'donor' as UserRole, label: 'Donor', icon: <Heart className="w-5 h-5" />, color: 'rose' },
    { id: 'requester' as UserRole, label: 'Requester', icon: <User className="w-5 h-5" />, color: 'blue' },
    { id: 'hospital' as UserRole, label: 'Hospital', icon: <Building2 className="w-5 h-5" />, color: 'emerald' },
    { id: 'admin' as UserRole, label: 'Admin', icon: <Shield className="w-5 h-5" />, color: 'purple' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password, role);
      if (success) {
        navigate(`/${role}`);
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 mb-4 shadow-inner">
            <Droplets className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500">Every drop counts. Sign in to continue saving lives.</p>
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
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              icon={<Lock className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-slate-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              }
              autoComplete="new-password"
              required
            />

            {error && (
              <div className={`p-3 text-sm rounded-lg ${
                error.toLowerCase().includes('successful') 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
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

      </motion.div>
    </div>
  );
}
