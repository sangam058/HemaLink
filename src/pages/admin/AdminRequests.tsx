import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, MapPin, Clock, User, Building2, Search } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export function AdminRequests() {
  const { requests } = useDataStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredRequests = requests.filter((r) => {
    const matchesSearch = 
      r.requesterName.toLowerCase().includes(search.toLowerCase()) ||
      r.bloodGroup.toLowerCase().includes(search.toLowerCase()) ||
      (r.hospitalName?.toLowerCase().includes(search.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || r.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'donor_assigned': return <Badge variant="info">Donor Assigned</Badge>;
      case 'in_progress': return <Badge variant="info">In Progress</Badge>;
      case 'fulfilled': return <Badge variant="success">Fulfilled</Badge>;
      case 'rejected': return <Badge variant="danger">Rejected</Badge>;
      case 'cancelled': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge>Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'emergency': return <Badge variant="danger">Emergency</Badge>;
      case 'urgent': return <Badge variant="warning">Urgent</Badge>;
      default: return <Badge>Normal</Badge>;
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    assigned: requests.filter(r => r.status === 'donor_assigned').length,
    fulfilled: requests.filter(r => r.status === 'fulfilled').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Blood Requests Management</h1>
        <p className="text-slate-600">Monitor and manage all blood requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
          <div className="text-sm text-slate-500">Total Requests</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          <div className="text-sm text-slate-500">Pending</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.assigned}</div>
          <div className="text-sm text-slate-500">Donor Assigned</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-emerald-600">{stats.fulfilled}</div>
          <div className="text-sm text-slate-500">Fulfilled</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by requester, blood group, hospital..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'donor_assigned', label: 'Donor Assigned' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'fulfilled', label: 'Fulfilled' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Priority' },
              { value: 'emergency', label: 'Emergency' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'normal', label: 'Normal' },
            ]}
          />
        </div>
      </Card>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card className="text-center py-12">
          <Droplets className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No Requests Found</h3>
          <p className="text-slate-600">No blood requests match your filters.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-rose-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-rose-600">{request.bloodGroup}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800">{request.units} units</span>
                        {getPriorityBadge(request.priority)}
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-slate-500">Request ID: {request.id}</p>
                    </div>
                  </div>

                  <div className="flex-1 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-4 h-4 text-slate-400" />
                      {request.requesterName}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {request.hospitalName || 'Not specified'}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {request.location.city}, {request.location.state}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {new Date(request.dateNeeded).toLocaleDateString('en-IN')}
                    </div>
                  </div>

                  {request.assignedDonorName && (
                    <div className="px-3 py-2 bg-emerald-50 rounded-lg">
                      <p className="text-xs text-emerald-600">Assigned Donor</p>
                      <p className="font-medium text-emerald-800">{request.assignedDonorName}</p>
                    </div>
                  )}
                </div>

                {request.reason && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-sm text-slate-600"><strong>Reason:</strong> {request.reason}</p>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
