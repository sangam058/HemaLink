import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Edit2, Save } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import type { Donor, Hospital } from '../../types';

export function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.location?.address || '',
    city: user?.location?.city || '',
    state: user?.location?.state || '',
  });

  const handleSave = () => {
    updateProfile({
      name: formData.name,
      phone: formData.phone,
      location: {
        ...user?.location!,
        address: formData.address,
        city: formData.city,
        state: formData.state,
      },
    });
    setIsEditing(false);
  };

  const donor = user?.role === 'donor' ? (user as Donor) : null;
  const hospital = user?.role === 'hospital' ? (user as Hospital) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
        <p className="text-slate-600">Manage your account information</p>
      </motion.div>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="relative">
          <div className="absolute top-4 right-4">
            {!isEditing ? (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-1" /> Edit
              </Button>
            ) : (
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar name={user?.name || ''} size="xl" />
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xl font-bold mb-2"
                />
              ) : (
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{user?.name}</h2>
              )}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <Badge variant="info" className="capitalize">{user?.role}</Badge>
                {donor?.bloodGroup && (
                  <Badge variant="danger">{donor.bloodGroup}</Badge>
                )}
                {hospital?.status && (
                  <Badge variant={hospital.status === 'active' ? 'success' : 'warning'}>
                    {hospital.status.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Stats for Donor */}
          {donor && (
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-rose-600">{donor.totalDonations}</div>
                <div className="text-sm text-slate-500">Donations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{donor.points}</div>
                <div className="text-sm text-slate-500">Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">Level {donor.level}</div>
                <div className="text-sm text-slate-500">Rank</div>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Email</div>
                <div className="text-slate-800">{user?.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-500">Phone</div>
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                ) : (
                  <div className="text-slate-800">{user?.phone}</div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Location */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Location</h3>
          {isEditing ? (
            <div className="space-y-4">
              <Input
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <Input
                  label="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <div className="text-slate-800">{user?.location?.address}</div>
                <div className="text-sm text-slate-500">
                  {user?.location?.city}, {user?.location?.state}, {user?.location?.country}
                </div>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Account Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Account Type</span>
              <span className="text-slate-800 capitalize">{user?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Member Since</span>
              <span className="text-slate-800">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Verified</span>
              <Badge variant={user?.isVerified ? 'success' : 'warning'}>
                {user?.isVerified ? 'Yes' : 'Pending'}
              </Badge>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
