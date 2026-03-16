import { motion } from 'framer-motion';
import { Droplets, Clock, CheckCircle, Plus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function RequesterDashboard() {
  const { user } = useAuthStore();
  const { requests } = useDataStore();
  const navigate = useNavigate();

  // Filter out cancelled requests from main view
  const myRequests = requests.filter((r) => r.requesterId === user?.id && r.status !== 'cancelled');
  const pending = myRequests.filter((r) => r.status === 'pending');
  const inProgress = myRequests.filter((r) => r.status === 'donor_assigned' || r.status === 'in_progress');
  const fulfilled = myRequests.filter((r) => r.status === 'fulfilled');

  const stats = [
    { icon: <Droplets className="w-6 h-6" />, value: myRequests.length, label: 'Total Requests', color: 'rose' },
    { icon: <Clock className="w-6 h-6" />, value: pending.length, label: 'Pending', color: 'amber' },
    { icon: <CheckCircle className="w-6 h-6" />, value: inProgress.length, label: 'In Progress', color: 'blue' },
    { icon: <CheckCircle className="w-6 h-6" />, value: fulfilled.length, label: 'Fulfilled', color: 'emerald' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'donor_assigned': return <Badge variant="info">Donor Assigned</Badge>;
      case 'in_progress': return <Badge variant="info">In Progress</Badge>;
      case 'fulfilled': return <Badge variant="success">Fulfilled</Badge>;
      case 'rejected': return <Badge variant="danger">Rejected</Badge>;
      default: return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-slate-600">Manage your blood requests</p>
        </div>
        <Button onClick={() => navigate('/requester/new-request')}>
          <Plus className="w-5 h-5 mr-2" /> New Request
        </Button>
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

      {/* Recent Requests */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Recent Requests</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/requester/my-requests')}>
            View All
          </Button>
        </div>

        {myRequests.length === 0 ? (
          <div className="text-center py-12">
            <Droplets className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Requests Yet</h3>
            <p className="text-slate-600 mb-4">Create your first blood request</p>
            <Button onClick={() => navigate('/requester/new-request')}>
              <Plus className="w-5 h-5 mr-2" /> Create Request
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Blood Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Units</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Hospital</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Date Needed</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Donor</th>
                </tr>
              </thead>
              <tbody>
                {myRequests.slice(0, 5).map((request) => (
                  <tr key={request.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-rose-600">{request.bloodGroup}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{request.units}</td>
                    <td className="py-3 px-4 text-slate-600">{request.hospitalName || 'N/A'}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(request.dateNeeded).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(request.status)}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {request.assignedDonorName || '-'}
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
