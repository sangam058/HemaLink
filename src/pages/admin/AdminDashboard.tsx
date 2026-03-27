import { motion } from 'framer-motion';
import { Users, Building2, Droplets, Calendar, TrendingUp, Award, AlertTriangle, CheckCircle } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const { requests, donations, hospitals, donors, campaigns, isLoading } = useDataStore();
  const navigate = useNavigate();

  if (isLoading && donors.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton height={120} className="w-full" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={120} />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton height={300} />
          <Skeleton height={300} />
        </div>
      </div>
    );
  }

  // Get hospitals and donors from stores
  const uniqueHospitals = hospitals;
  const uniqueDonors = donors;

  const pendingHospitals = uniqueHospitals.filter((h) => h.status === 'pending_approval');
  const activeHospitals = uniqueHospitals.filter((h) => h.status === 'active');
  
  // Calculate stats including mock data if necessary
  const completedDonations = donations.filter((d) => d.status === 'completed');
  const totalDonationsCount = completedDonations.length || (donations.length > 0 ? donations.length : 0);
  const totalUnits = completedDonations.reduce((sum, d) => sum + d.units, 0) || (campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + (c.collectedUnits || 0), 0) : 0);
  
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const fulfilledRequests = requests.filter((r) => r.status === 'fulfilled');
  const activeCampaigns = campaigns.filter((c) => c.status !== 'cancelled');

  const stats = [
    { icon: <Users className="w-6 h-6" />, value: uniqueDonors.length, label: 'Total Donors', color: 'rose', trend: '' },
    { icon: <Building2 className="w-6 h-6" />, value: activeHospitals.length || (uniqueHospitals.length > 0 ? uniqueHospitals.length : 0), label: 'Active Hospitals', color: 'emerald', trend: '+5%' },
    { icon: <Droplets className="w-6 h-6" />, value: totalUnits, label: 'Units Collected', color: 'blue', trend: '+18%' },
    { icon: <Calendar className="w-6 h-6" />, value: activeCampaigns.length, label: 'Active Campaigns', color: 'purple', trend: '' },
  ];

  // Generate recent activity from actual data
  const recentActivity: { type: string; message: string; time: string }[] = [];
  
  // Add recent donations
  donations.slice(0, 2).forEach(d => {
    recentActivity.push({
      type: 'donation',
      message: `${d.donorName} ${d.status === 'completed' ? 'completed' : 'scheduled'} a donation at ${d.hospitalName}`,
      time: new Date(d.createdAt).toLocaleDateString('en-IN')
    });
  });

  // Add recent requests
  requests.slice(0, 2).forEach(r => {
    recentActivity.push({
      type: 'request',
      message: `${r.requesterName} requested ${r.bloodGroup} blood - ${r.status}`,
      time: new Date(r.createdAt).toLocaleDateString('en-IN')
    });
  });

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white"
      >
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-slate-300">Monitor and manage the HemaLink platform</p>
      </motion.div>

      {/* Pending Approvals Alert */}
      {pendingHospitals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-amber-200 bg-amber-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <div>
                  <h3 className="font-semibold text-amber-800">{pendingHospitals.length} Hospital(s) Pending Approval</h3>
                  <p className="text-sm text-amber-600">Review and approve new hospital registrations</p>
                </div>
              </div>
              <Button size="sm" onClick={() => navigate('/admin/hospitals')}>
                Review Now
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 bg-${stat.color}-100 text-${stat.color}-600 rounded-xl flex items-center justify-center`}>
                  {stat.icon}
                </div>
                <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> {stat.trend}
                </span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Request Overview */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Request Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-800">Pending Requests</div>
                  <div className="text-sm text-slate-500">Awaiting donor assignment</div>
                </div>
              </div>
              <span className="text-2xl font-bold text-amber-600">{pendingRequests.length}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-800">Fulfilled Requests</div>
                  <div className="text-sm text-slate-500">Successfully completed</div>
                </div>
              </div>
              <span className="text-2xl font-bold text-emerald-600">{fulfilledRequests.length}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-800">Total Donations</div>
                  <div className="text-sm text-slate-500">Verified donations</div>
                </div>
              </div>
              <span className="text-2xl font-bold text-rose-600">{totalDonationsCount}</span>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                <div className={`w-2 h-2 mt-2 rounded-full ${
                  activity.type === 'donation' ? 'bg-rose-500' :
                  activity.type === 'hospital' ? 'bg-emerald-500' :
                  activity.type === 'request' ? 'bg-blue-500' : 'bg-purple-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{activity.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Donors */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Top Donors</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/donors')}>
            View All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Donor</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Blood Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Donations</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Points</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Level</th>
              </tr>
            </thead>
            <tbody>
              {uniqueDonors
                .sort((a, b) => b.points - a.points)
                .slice(0, 5)
                .map((donor, index) => (
                  <tr key={donor.id} className="border-b border-slate-50">
                    <td className="py-3 px-4">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-amber-100 text-amber-600' :
                        index === 1 ? 'bg-slate-200 text-slate-600' :
                        index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{donor.name}</td>
                    <td className="py-3 px-4 font-semibold text-rose-600">{donor.bloodGroup}</td>
                    <td className="py-3 px-4 text-slate-600">{donor.totalDonations}</td>
                    <td className="py-3 px-4 font-medium text-amber-600">{donor.points}</td>
                    <td className="py-3 px-4">
                      <Badge variant="info">Level {donor.level}</Badge>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
