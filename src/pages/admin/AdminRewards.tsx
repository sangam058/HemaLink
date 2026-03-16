import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Gift, Search, Plus, Star, Trophy } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Avatar } from '../../components/ui/Avatar';
import type { Donor } from '../../types';

export function AdminRewards() {
  const { registeredUsers } = useAuthStore();
  const { donors, donations, addNotification } = useDataStore();
  const [search, setSearch] = useState('');
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rewardPoints, setRewardPoints] = useState('100');
  const [rewardReason, setRewardReason] = useState('');

  // Get donors from both stores
  const registeredDonors = Object.values(registeredUsers)
    .filter((u: any) => u.role === 'donor') as Donor[];
  const allDonors = [...donors, ...registeredDonors];
  const uniqueDonors = allDonors.filter((d, index, self) => 
    index === self.findIndex((t) => t.id === d.id)
  );

  const filteredDonors = uniqueDonors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase()) ||
    d.bloodGroup.toLowerCase().includes(search.toLowerCase())
  );

  const getLevelName = (level: number) => {
    const levels = ['Newcomer', 'Helper', 'Supporter', 'Champion', 'Hero', 'Legend'];
    return levels[level - 1] || 'Newcomer';
  };

  const getLevelFromPoints = (points: number) => {
    if (points >= 2500) return 6;
    if (points >= 1000) return 5;
    if (points >= 500) return 4;
    if (points >= 250) return 3;
    if (points >= 100) return 2;
    return 1;
  };

  const handleAllocateReward = () => {
    if (!selectedDonor || !rewardPoints || !rewardReason) return;

    const points = parseInt(rewardPoints);
    const newTotalPoints = (selectedDonor.points || 0) + points;
    const newLevel = getLevelFromPoints(newTotalPoints);

    // Update donor in registered users
    const { registeredUsers: users } = useAuthStore.getState();
    if (users[selectedDonor.email]) {
      const updatedUser = {
        ...users[selectedDonor.email],
        points: newTotalPoints,
        level: newLevel,
      };
      useAuthStore.setState({
        registeredUsers: { ...users, [selectedDonor.email]: updatedUser }
      });
    }

    // Send notification to donor
    addNotification({
      userId: selectedDonor.id,
      title: 'Reward Points Received! 🎉',
      message: `You received ${points} points! Reason: ${rewardReason}`,
      type: 'reward',
      link: '/donor/rewards',
    });

    setIsModalOpen(false);
    setSelectedDonor(null);
    setRewardPoints('100');
    setRewardReason('');
  };

  const totalPointsDistributed = uniqueDonors.reduce((sum, d) => sum + (d.points || 0), 0);
  const completedDonations = donations.filter(d => d.status === 'completed');
  const totalPointsFromDonations = completedDonations.reduce((sum, d) => sum + d.pointsEarned, 0);

  const rewardPresets = [
    { points: 50, reason: 'First-time donor bonus' },
    { points: 100, reason: 'Successful donation completion' },
    { points: 150, reason: 'Emergency response bonus' },
    { points: 200, reason: 'Campaign participation bonus' },
    { points: 500, reason: 'Outstanding contribution award' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Rewards Management</h1>
        <p className="text-slate-600">Allocate reward points to donors</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <Award className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-800">{totalPointsDistributed}</div>
          <div className="text-sm text-slate-500">Total Points Distributed</div>
        </Card>
        <Card className="text-center">
          <Gift className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-800">{totalPointsFromDonations}</div>
          <div className="text-sm text-slate-500">Points from Donations</div>
        </Card>
        <Card className="text-center">
          <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-800">{uniqueDonors.filter(d => d.level >= 3).length}</div>
          <div className="text-sm text-slate-500">High-Level Donors</div>
        </Card>
        <Card className="text-center">
          <Trophy className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-800">{uniqueDonors.filter(d => d.level >= 5).length}</div>
          <div className="text-sm text-slate-500">Hero+ Level Donors</div>
        </Card>
      </div>

      {/* Reward Presets Info */}
      <Card>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Reward Point Guidelines</h3>
        <div className="grid md:grid-cols-5 gap-3">
          {rewardPresets.map((preset) => (
            <div key={preset.reason} className="p-3 bg-slate-50 rounded-lg text-center">
              <div className="text-xl font-bold text-amber-600">{preset.points}</div>
              <div className="text-xs text-slate-500">{preset.reason}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search donors by name, email, or blood group..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Donors List */}
      {filteredDonors.length === 0 ? (
        <Card className="text-center py-12">
          <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No Donors Found</h3>
          <p className="text-slate-600">No donors match your search or no donors registered yet.</p>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Donor</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Blood Type</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Donations</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Points</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Level</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonors.map((donor, index) => (
                  <motion.tr
                    key={donor.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar name={donor.name} size="sm" />
                        <div>
                          <div className="font-medium text-slate-800">{donor.name}</div>
                          <div className="text-sm text-slate-500">{donor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-rose-600">{donor.bloodGroup}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{donor.totalDonations || 0}</td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-amber-600">{donor.points || 0}</span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="info">{getLevelName(donor.level || 1)}</Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedDonor(donor);
                          setIsModalOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Points
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Allocate Reward Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Allocate Reward Points"
        size="lg"
      >
        {selectedDonor && (
          <div className="space-y-6">
            {/* Donor Info */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-4">
                <Avatar name={selectedDonor.name} size="lg" />
                <div>
                  <h4 className="font-semibold text-slate-800">{selectedDonor.name}</h4>
                  <p className="text-sm text-slate-500">{selectedDonor.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="danger">{selectedDonor.bloodGroup}</Badge>
                    <Badge variant="info">{getLevelName(selectedDonor.level || 1)}</Badge>
                    <span className="text-sm text-amber-600 font-medium">{selectedDonor.points || 0} points</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Quick Presets</label>
              <div className="flex flex-wrap gap-2">
                {rewardPresets.map((preset) => (
                  <button
                    key={preset.reason}
                    onClick={() => {
                      setRewardPoints(String(preset.points));
                      setRewardReason(preset.reason);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                      rewardPoints === String(preset.points) && rewardReason === preset.reason
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    +{preset.points} pts
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Points */}
            <Input
              label="Points to Allocate"
              type="number"
              min="1"
              value={rewardPoints}
              onChange={(e) => setRewardPoints(e.target.value)}
              placeholder="Enter points"
            />

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason</label>
              <textarea
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                rows={3}
                value={rewardReason}
                onChange={(e) => setRewardReason(e.target.value)}
                placeholder="Enter reason for reward allocation..."
              />
            </div>

            {/* Preview */}
            <div className="p-4 bg-amber-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600">New Total Points</p>
                  <p className="text-2xl font-bold text-amber-700">
                    {(selectedDonor.points || 0) + parseInt(rewardPoints || '0')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-amber-600">New Level</p>
                  <p className="text-lg font-bold text-amber-700">
                    {getLevelName(getLevelFromPoints((selectedDonor.points || 0) + parseInt(rewardPoints || '0')))}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleAllocateReward}
                disabled={!rewardPoints || !rewardReason}
              >
                <Gift className="w-4 h-4 mr-2" /> Allocate Points
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
