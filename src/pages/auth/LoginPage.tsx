import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building2, Heart, Shield } from 'lucide-react';
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

  const demoCredentials: Record<UserRole, { email: string; password: string }> = {
    donor: { email: '', password: '' },
    requester: { email: '', password: '' },
    hospital: { email: '', password: '' },
    admin: { email: 'sangam@gmail.com', password: 'sangam362004' },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password, role);
      if (success) {
        navigate(`/${role}`);
      } else {
        setError('Invalid credentials. Try the demo credentials below.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    const creds = demoCredentials[role];
    if (!creds.email) {
      setError('Please sign up to create a new account for this role.');
      return;
    }
    setEmail(creds.email);
    setPassword(creds.password);
    setIsLoading(true);
    
    const success = await login(creds.email, creds.password, role);
    if (success) {
      navigate(`/${role}`);
    } else {
      setError('Login failed. Please check your credentials.');
    }
    setIsLoading(false);
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
                className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1 ${
                  role === r.id
                    ? 'border-rose-500 bg-rose-50 text-rose-600'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {r.icon}
                <span className="text-xs font-medium">{r.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              icon={<Mail className="w-5 h-5" />}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              icon={<Lock className="w-5 h-5" />}
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

          {role === 'admin' && (
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleDemoLogin}
                isLoading={isLoading}
              >
                Login as Admin
              </Button>
            </div>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600">Don't have an account? </span>
            <Link to="/signup" className="text-rose-600 font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </Card>

        <div className="mt-6 p-4 bg-slate-800 rounded-xl text-sm">
          <p className="text-slate-300 font-medium mb-2">Getting Started:</p>
          <div className="text-slate-400 space-y-1">
            <p>• <strong>New users:</strong> Click "Sign up" to create an account</p>
            <p>• <strong>Admin:</strong> sangam@gmail.com / sangam362004</p>
          </div>
          <p className="text-slate-500 mt-2">Register as Donor, Requester, or Hospital to get started!</p>
        </div>
      </motion.div>
    </div>
  );
}
