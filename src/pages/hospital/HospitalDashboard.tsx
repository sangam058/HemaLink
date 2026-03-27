import { motion } from 'framer-motion';
import { Droplets, Package, Calendar, Users, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useNavigate } from 'react-router-dom';
import type { Hospital } from '../../types';

export function HospitalDashboard() {
  const { user, isLoading: authLoading } = useAuthStore();
  const { requests, donations, inventory, campaigns, isLoading: dataLoading } = useDataStore();
  const navigate = useNavigate();
  const hospital = user as Hospital;

  const isLoading = authLoading || (dataLoading && inventory.length === 0);

  const hospitalRequests = requests.filter((r) => r.hospitalId === user?.id && r.status !== 'cancelled');
  const hospitalDonations = donations.filter((d) => d.hospitalId === user?.id && d.status !== 'cancelled');
  const hospitalInventory = inventory.filter((i) => i.hospitalId === user?.id);
  const hospitalCampaigns = campaigns.filter((c) => c.hospitalId === user?.id && c.status !== 'cancelled');

  const pendingRequests = hospitalRequests.filter((r) => r.status === 'pending' || r.status === 'donor_assigned');
  const pendingDonations = hospitalDonations.filter((d) => d.status === 'scheduled' || d.status === 'awaiting_confirmation');
  const totalUnits = hospitalInventory.reduce((sum, i) => sum + i.units, 0);
  const lowStockItems = hospitalInventory.filter((i) => i.units < 10);

  const stats = [
    { icon: <Droplets className="w-6 h-6" />, value: pendingRequests.length, label: 'Pending Requests', color: 'rose' },
    { icon: <Users className="w-6 h-6" />, value: pendingDonations.length, label: 'Pending Donations', color: 'blue' },
    { icon: <Package className="w-6 h-6" />, value: totalUnits, label: 'Units in Stock', color: 'emerald' },
    { icon: <Calendar className="w-6 h-6" />, value: hospitalCampaigns.length, label: 'Campaigns', color: 'purple' },
  ];

  if (isLoading) {
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

  if (hospital?.status === 'pending_approval') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Pending Approval</h2>
          <p className="text-slate-600 mb-4">
            Your hospital registration is pending admin approval. You'll be notified once your account is verified.
          </p>
          <Badge variant="warning">Status: Pending Approval</Badge>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white"
      >
        <h1 className="text-2xl font-bold mb-2">Welcome, {hospital?.hospitalName}</h1>
        <p className="text-emerald-100">Manage your blood inventory, requests, and donations</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 bg-${stat.color}-100 text-${stat.color}-600 rounded-xl mb-3`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-amber-200 bg-amber-50">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              <h3 className="text-lg font-semibold text-amber-800">Low Stock Alert</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {lowStockItems.map((item) => (
                <div key={item.id} className="px-4 py-2 bg-white rounded-lg border border-amber-200">
                  <span className="font-semibold text-amber-800">{item.bloodGroup}</span>
                  <span className="text-amber-600 ml-2">{item.units} units</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Pending Requests</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/hospital/requests')}>
              View All
            </Button>
          </div>
          {pendingRequests.length === 0 ? (
            <p className="text-center py-8 text-slate-500">No pending requests</p>
          ) : (
            <div className="space-y-3">
              {pendingRequests.slice(0, 4).map((request) => (
                <div key={request.id} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-rose-600">{request.bloodGroup}</span>
                      <span className="text-slate-600">{request.units} units</span>
                      <Badge variant={request.priority === 'emergency' ? 'danger' : 'warning'}>
                        {request.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">{request.requesterName}</p>
                  </div>
                  <Badge variant={request.status === 'donor_assigned' ? 'info' : 'warning'}>
                    {request.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Blood Inventory */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Blood Inventory</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/hospital/inventory')}>
              Manage
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => {
              const item = hospitalInventory.find((i) => i.bloodGroup === bg);
              const units = item?.units || 0;
              const isLow = units < 10;
              return (
                <div
                  key={bg}
                  className={`p-3 rounded-xl text-center ${
                    isLow ? 'bg-red-50 border-2 border-red-200' : 'bg-slate-50'
                  }`}
                >
                  <div className={`text-lg font-bold ${isLow ? 'text-red-600' : 'text-slate-800'}`}>
                    {bg}
                  </div>
                  <div className={`text-sm ${isLow ? 'text-red-500' : 'text-slate-500'}`}>
                    {units} units
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Pending Donations */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Pending Donations</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/hospital/donations')}>
            View All
          </Button>
        </div>
        {pendingDonations.length === 0 ? (
          <p className="text-center py-8 text-slate-500">No pending donations</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Donor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Blood Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Units</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Scheduled</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingDonations.slice(0, 5).map((donation) => (
                  <tr key={donation.id} className="border-b border-slate-50">
                    <td className="py-3 px-4 text-slate-800">{donation.donorName}</td>
                    <td className="py-3 px-4 font-semibold text-rose-600">{donation.bloodGroup}</td>
                    <td className="py-3 px-4 text-slate-600">{donation.units}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(donation.scheduledDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="info">{donation.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
