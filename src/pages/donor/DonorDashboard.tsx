import { motion } from 'framer-motion';
import { Heart, Droplets, Award, Calendar, Clock, Plus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import type { Donor } from '../../types';

export function DonorDashboard() {
  const { user } = useAuthStore();
  const { requests, donations, campaigns } = useDataStore();
  const navigate = useNavigate();
  const donor = user as Donor;

  const myDonations = donations.filter((d) => d.donorId === user?.id);
  const completedDonations = myDonations.filter((d) => d.status === 'completed');
  const scheduledDonations = myDonations.filter((d) => d.status === 'scheduled');
  
  // Get all pending requests (show all blood types) - exclude cancelled
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const matchingRequests = pendingRequests.filter((r) => r.bloodGroup === donor?.bloodGroup);
  // Only show upcoming and ongoing campaigns, not cancelled
  const upcomingCampaigns = campaigns.filter((c) => c.status === 'upcoming' || c.status === 'ongoing');

  const stats = [
    { icon: <Heart className="w-6 h-6" />, value: completedDonations.length, label: 'Total Donations', color: 'bg-rose-100 text-rose-600' },
    { icon: <Award className="w-6 h-6" />, value: donor?.points || 0, label: 'Reward Points', color: 'bg-amber-100 text-amber-600' },
    { icon: <Droplets className="w-6 h-6" />, value: pendingRequests.length, label: 'Pending Requests', color: 'bg-blue-100 text-blue-600' },
    { icon: <Calendar className="w-6 h-6" />, value: scheduledDonations.length, label: 'Scheduled', color: 'bg-emerald-100 text-emerald-600' },
  ];

  const getLevelInfo = (level: number) => {
    const levels = [
      { name: 'Newcomer', min: 0 },
      { name: 'Helper', min: 100 },
      { name: 'Supporter', min: 250 },
      { name: 'Champion', min: 500 },
      { name: 'Hero', min: 1000 },
      { name: 'Legend', min: 2500 },
    ];
    return levels[level - 1] || levels[0];
  };

  const levelInfo = getLevelInfo(donor?.level || 1);
  const nextLevel = getLevelInfo((donor?.level || 1) + 1);
  const progress = ((donor?.points || 0) / nextLevel.min) * 100;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-rose-600 to-red-600 rounded-2xl p-6 text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {donor?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-rose-100">
              You're a {levelInfo.name} with {donor?.points} points. Keep donating to reach {nextLevel.name}!
            </p>
            <div className="mt-3 bg-white/20 rounded-full h-2 w-64">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-4xl font-bold">{donor?.bloodGroup}</div>
              <div className="text-sm text-rose-100">Blood Type</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Action - Donate Blood */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white cursor-pointer hover:shadow-xl transition-shadow" onClick={() => navigate('/donor/donate')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Plus className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Donate Blood</h2>
                <p className="text-emerald-100">Book a donation session at a hospital near you</p>
              </div>
            </div>
            <Button className="bg-white text-emerald-600 hover:bg-emerald-50">
              Book Now
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
          >
            <Card className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 ${stat.color} rounded-xl mb-3`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Blood Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Blood Requests</h2>
                <p className="text-sm text-slate-500">
                  {matchingRequests.length} matching your blood type ({donor?.bloodGroup})
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/donor/requests')}>
                View All ({pendingRequests.length})
              </Button>
            </div>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Droplets className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No pending requests at the moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.slice(0, 3).map((request) => (
                  <div
                    key={request.id}
                    className="p-4 bg-slate-50 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{request.bloodGroup}</span>
                        <Badge variant={request.priority === 'emergency' ? 'danger' : request.priority === 'urgent' ? 'warning' : 'default'}>
                          {request.priority}
                        </Badge>
                        {request.bloodGroup === donor?.bloodGroup && (
                          <Badge variant="success">Match</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{request.hospitalName}</p>
                      <p className="text-xs text-slate-400">{request.units} units needed</p>
                    </div>
                    <Button size="sm" onClick={() => navigate('/donor/requests')}>
                      Respond
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Upcoming Campaigns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Upcoming Campaigns</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/donor/campaigns')}>
                View All
              </Button>
            </div>
            {upcomingCampaigns.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No upcoming campaigns</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingCampaigns.slice(0, 3).map((campaign) => (
                  <div
                    key={campaign.id}
                    className="p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-800">{campaign.name}</h4>
                        <p className="text-sm text-slate-500">{campaign.hospitalName}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(campaign.startDate).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      <Badge variant="info">Upcoming</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Donations</h2>
          {myDonations.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No donations yet. Start your journey today!</p>
              <Button className="mt-4" onClick={() => navigate('/donor/donate')}>
                Donate Blood
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Hospital</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Units</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {myDonations.slice(0, 5).map((donation) => (
                    <tr key={donation.id} className="border-b border-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-800">
                        {new Date(donation.scheduledDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{donation.hospitalName}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{donation.units}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            donation.status === 'completed' ? 'success' :
                            donation.status === 'scheduled' ? 'info' :
                            donation.status === 'cancelled' ? 'danger' : 'warning'
                          }
                        >
                          {donation.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-amber-600">
                        +{donation.pointsEarned}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
