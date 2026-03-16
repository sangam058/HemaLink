import { motion } from 'framer-motion';
import { Award, Star, Trophy, Target, Gift } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import type { Donor } from '../../types';

export function DonorRewards() {
  const { user } = useAuthStore();
  const donor = user as Donor;

  const levels = [
    { level: 1, name: 'Newcomer', minPoints: 0, icon: '🌱', color: 'slate' },
    { level: 2, name: 'Helper', minPoints: 100, icon: '🤝', color: 'blue' },
    { level: 3, name: 'Supporter', minPoints: 250, icon: '⭐', color: 'amber' },
    { level: 4, name: 'Champion', minPoints: 500, icon: '🏆', color: 'orange' },
    { level: 5, name: 'Hero', minPoints: 1000, icon: '🦸', color: 'rose' },
    { level: 6, name: 'Legend', minPoints: 2500, icon: '👑', color: 'purple' },
  ];

  const currentLevel = levels.find((l) => l.level === donor?.level) || levels[0];
  const nextLevel = levels.find((l) => l.level === (donor?.level || 0) + 1);
  const progress = nextLevel ? ((donor?.points || 0) / nextLevel.minPoints) * 100 : 100;

  const badges = [
    { id: '1', name: 'First Donation', icon: '🩸', description: 'Completed your first donation', earned: (donor?.totalDonations || 0) >= 1 },
    { id: '2', name: 'Life Saver', icon: '💝', description: 'Saved 5 lives', earned: (donor?.totalDonations || 0) >= 5 },
    { id: '3', name: 'Regular Donor', icon: '🔄', description: 'Donated 10 times', earned: (donor?.totalDonations || 0) >= 10 },
    { id: '4', name: 'Blood Hero', icon: '🦸', description: 'Donated 25 times', earned: (donor?.totalDonations || 0) >= 25 },
    { id: '5', name: 'Campaign Star', icon: '🌟', description: 'Participated in a campaign', earned: false },
    { id: '6', name: 'Emergency Responder', icon: '🚨', description: 'Responded to an emergency', earned: false },
  ];

  const rewards = [
    { points: 100, name: '$5 Coffee Voucher', available: (donor?.points || 0) >= 100 },
    { points: 250, name: 'HemaLink T-Shirt', available: (donor?.points || 0) >= 250 },
    { points: 500, name: '$25 Gift Card', available: (donor?.points || 0) >= 500 },
    { points: 1000, name: 'Premium Membership', available: (donor?.points || 0) >= 1000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Rewards & Achievements</h1>
        <p className="text-slate-600">Track your progress and earn rewards</p>
      </div>

      {/* Current Level */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-r from-rose-600 to-red-600 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl">
                {currentLevel.icon}
              </div>
              <div>
                <p className="text-rose-100 text-sm">Current Level</p>
                <h2 className="text-3xl font-bold">{currentLevel.name}</h2>
                <p className="text-rose-100">Level {currentLevel.level}</p>
              </div>
            </div>
            <div className="flex-1 max-w-md">
              <div className="flex justify-between text-sm mb-2">
                <span>{donor?.points || 0} points</span>
                {nextLevel && <span>{nextLevel.minPoints} points</span>}
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-white rounded-full"
                />
              </div>
              {nextLevel && (
                <p className="text-sm text-rose-100 mt-2">
                  {nextLevel.minPoints - (donor?.points || 0)} points to {nextLevel.name}
                </p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Award className="w-6 h-6" />, value: donor?.points || 0, label: 'Total Points' },
          { icon: <Trophy className="w-6 h-6" />, value: donor?.level || 1, label: 'Current Level' },
          { icon: <Star className="w-6 h-6" />, value: badges.filter(b => b.earned).length, label: 'Badges Earned' },
          { icon: <Target className="w-6 h-6" />, value: donor?.totalDonations || 0, label: 'Donations' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 text-rose-600 rounded-xl mb-3">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Level Progress */}
      <Card>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Level Progress</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {levels.map((level) => (
            <div
              key={level.level}
              className={`text-center p-4 rounded-xl ${
                level.level <= (donor?.level || 1)
                  ? 'bg-rose-50 border-2 border-rose-200'
                  : 'bg-slate-50 border-2 border-transparent'
              }`}
            >
              <div className="text-3xl mb-2">{level.icon}</div>
              <div className="font-medium text-sm text-slate-800">{level.name}</div>
              <div className="text-xs text-slate-500">{level.minPoints}+ pts</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Badges */}
      <Card>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Badges</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`text-center p-4 rounded-xl border-2 transition-all ${
                badge.earned
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-slate-50 border-slate-200 opacity-50'
              }`}
            >
              <div className="text-4xl mb-2">{badge.icon}</div>
              <div className="font-medium text-sm text-slate-800">{badge.name}</div>
              <div className="text-xs text-slate-500">{badge.description}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Redeemable Rewards */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Redeem Rewards</h3>
          <Badge variant="info">{donor?.points || 0} points available</Badge>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {rewards.map((reward) => (
            <div
              key={reward.name}
              className={`p-4 rounded-xl border-2 ${
                reward.available
                  ? 'border-rose-200 bg-rose-50'
                  : 'border-slate-200 bg-slate-50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Gift className={`w-6 h-6 ${reward.available ? 'text-rose-600' : 'text-slate-400'}`} />
                <span className="font-medium text-slate-800">{reward.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{reward.points} points</span>
                <button
                  disabled={!reward.available}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    reward.available
                      ? 'bg-rose-600 text-white hover:bg-rose-700'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Redeem
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
