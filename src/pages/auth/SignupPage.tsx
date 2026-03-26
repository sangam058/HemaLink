import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building2, Heart, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import type { UserRole, BloodGroup } from '../../types';

export function SignupPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>('donor');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    bloodGroup: 'O+' as BloodGroup,
    address: '',
    city: '',
    state: '',
    country: 'India',
    hospitalName: '',
    licenseNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signup, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [role, clearError]);

  const roles = [
    { id: 'donor' as UserRole, label: 'Blood Donor', icon: <Heart className="w-6 h-6" />, desc: 'Donate blood and save lives' },
    { id: 'requester' as UserRole, label: 'Blood Requester', icon: <User className="w-6 h-6" />, desc: 'Request blood for patients' },
    { id: 'hospital' as UserRole, label: 'Hospital/Blood Bank', icon: <Building2 className="w-6 h-6" />, desc: 'Manage blood inventory' },
  ];

  const bloodGroups: { value: BloodGroup; label: string }[] = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    setIsLoading(true);

    try {
      const success = await signup({
        email: formData.email,
        password: formData.password,
        name: role === 'hospital' ? formData.hospitalName : formData.name,
        phone: formData.phone,
        role,
        bloodGroup: role !== 'hospital' ? formData.bloodGroup : undefined,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
        },
        hospitalName: role === 'hospital' ? formData.hospitalName : undefined,
        licenseNumber: role === 'hospital' ? formData.licenseNumber : undefined,
      });

      if (success) {
        const user = useAuthStore.getState().user;
        if (user) {
          navigate(`/${role}`);
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 mb-4 shadow-inner">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Mission: Saving Lives</h2>
          <p className="text-slate-500 font-medium text-sm">Join the HemaLink network of dedicated lifesavers.</p>
        </div>

        <Card>
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  step >= s
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {s}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-slate-800 text-center mb-4">
                  I want to register as:
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 text-center ${role === r.id
                        ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-lg shadow-rose-200/50 scale-105'
                        : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex justify-center mb-2">{r.icon}</div>
                      <div className="text-xs font-bold leading-tight">{r.label}</div>
                    </button>
                  ))}
                </div>
                <Button type="button" className="w-full mt-4" onClick={() => setStep(2)}>
                  Continue
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-slate-800 text-center mb-4">
                  Account Details
                </h3>
                
                {role === 'hospital' ? (
                  <>
                    <Input
                      label="Hospital Name"
                      name="hospitalName"
                      value={formData.hospitalName}
                      onChange={handleChange}
                      placeholder="Enter hospital name"
                      icon={<Building2 className="w-5 h-5" />}
                      required
                    />
                    <Input
                      label="License Number"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      placeholder="Enter license number"
                      required
                    />
                  </>
                ) : (
                  <>
                    <Input
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      icon={<User className="w-5 h-5" />}
                      required
                    />
                    <Select
                      label="Blood Group"
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })}
                      options={bloodGroups}
                    />
                  </>
                )}

                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  icon={<Mail className="w-5 h-5" />}
                  required
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  icon={<Phone className="w-5 h-5" />}
                  required
                />
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
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
                  required
                />
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  icon={<Lock className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-1 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-slate-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  }
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

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="button" className="flex-1" onClick={() => setStep(3)}>
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-slate-800 text-center mb-4">
                  Location Details
                </h3>
                <Input
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  icon={<MapPin className="w-5 h-5" />}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    required
                  />
                  <Input
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    required
                  />
                </div>
                 <Input
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
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

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" isLoading={isLoading}>
                    Create Account
                  </Button>
                </div>
              </motion.div>
            )}
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600">Already have an account? </span>
            <Link to="/login" className="text-rose-600 font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
