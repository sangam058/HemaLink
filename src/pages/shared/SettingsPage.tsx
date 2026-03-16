import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Lock, Eye, EyeOff, Shield, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function SettingsPage() {
  const { } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    requests: true,
    campaigns: true,
    rewards: true,
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-600">Manage your account preferences</p>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Notifications</h3>
              <p className="text-sm text-slate-500">Configure how you receive notifications</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
              { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
              { key: 'requests', label: 'Blood Requests', desc: 'Notifications for new blood requests' },
              { key: 'campaigns', label: 'Campaigns', desc: 'Updates about blood donation campaigns' },
              { key: 'rewards', label: 'Rewards', desc: 'Notifications about points and badges' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div>
                  <div className="font-medium text-slate-800">{item.label}</div>
                  <div className="text-sm text-slate-500">{item.desc}</div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications[item.key as keyof typeof notifications] ? 'bg-rose-600' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      notifications[item.key as keyof typeof notifications] ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Security</h3>
              <p className="text-sm text-slate-500">Manage your password and security settings</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Current Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
            />
            <Button>Update Password</Button>
          </div>
        </Card>
      </motion.div>

      {/* Privacy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Privacy</h3>
              <p className="text-sm text-slate-500">Control your privacy settings</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div>
                <div className="font-medium text-slate-800">Profile Visibility</div>
                <div className="text-sm text-slate-500">Allow others to see your profile</div>
              </div>
              <button className="relative w-12 h-6 rounded-full bg-rose-600 transition-colors">
                <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow translate-x-7" />
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-slate-800">Show on Leaderboard</div>
                <div className="text-sm text-slate-500">Display your name on public leaderboards</div>
              </div>
              <button className="relative w-12 h-6 rounded-full bg-rose-600 transition-colors">
                <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow translate-x-7" />
              </button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-red-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Danger Zone</h3>
              <p className="text-sm text-red-600">Irreversible actions</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-800">Delete Account</div>
                <div className="text-sm text-slate-500">Permanently delete your account and all data</div>
              </div>
              <Button variant="danger" size="sm">
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
