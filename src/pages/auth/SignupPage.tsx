import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building2, Heart, Phone, MapPin } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import type { UserRole, BloodGroup } from '../../types';

export function SignupPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>('donor');
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
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuthStore();
  const navigate = useNavigate();

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
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
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
        navigate(`/${role}`);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
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
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="HemaLink" className="w-12 h-12" />
            <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
              HemaLink
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>
          <p className="text-slate-600">Join our life-saving community</p>
        </div>

        <Card>
          {/* Progress Steps */}
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
            {/* Step 1: Role Selection */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-slate-800 text-center mb-4">
                  I want to register as:
                </h3>
                <div className="space-y-3">
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 text-left ${
                        role === r.id
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        role === r.id ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {r.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{r.label}</div>
                        <div className="text-sm text-slate-500">{r.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <Button type="button" className="w-full mt-4" onClick={() => setStep(2)}>
                  Continue
                </Button>
              </motion.div>
            )}

            {/* Step 2: Account Details */}
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
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  icon={<Lock className="w-5 h-5" />}
                  required
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  icon={<Lock className="w-5 h-5" />}
                  required
                />

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

            {/* Step 3: Location */}
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
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
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
