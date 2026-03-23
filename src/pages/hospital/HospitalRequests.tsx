import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Clock, 
  AlertCircle, 
  Filter,
  Droplets
} from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import type { RequestStatus } from '../../types';

export default function HospitalRequests() {
  const { user } = useAuthStore();
  const { requests, updateRequestStatus } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'emergency' | 'urgent' | 'normal'>('all');

  // Filter requests for the hospital
  const hospitalRequests = requests.filter(req => {
    // Show if assigned to this hospital
    const isAssigned = req.hospitalId === user?.id;
    
    // OR if it's pending and in the same city (nearby)
    const isNearby = req.status === 'pending' && req.location.city === user?.location.city;
    
    return isAssigned || isNearby;
  });

  const filteredRequests = hospitalRequests.filter(req => {
    const matchesSearch = 
      req.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || req.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'donor_assigned': return 'info';
      case 'in_progress': return 'info';
      case 'fulfilled': return 'success';
      case 'rejected': return 'danger';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'danger';
      case 'urgent': return 'warning';
      case 'normal': return 'info';
      default: return 'default';
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!user) return;
    await updateRequestStatus(requestId, 'donor_assigned', `Hospital ${user.name} accepted the request.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blood Requests</h1>
          <p className="text-slate-600">Manage and respond to blood requests in your area.</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by patient, requester or ID..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <select
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 appearance-none bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="donor_assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
          </div>

          <div className="relative">
            <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <select
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 appearance-none bg-white"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
            >
              <option value="all">All Priorities</option>
              <option value="emergency">Emergency</option>
              <option value="urgent">Urgent</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow border-l-4 border-l-red-500">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xl">
                          {request.bloodGroup}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-slate-900">
                              {request.patientName || 'Anonymous Patient'}
                            </h3>
                            <Badge variant={getPriorityColor(request.priority)}>
                              {request.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500">Requested by: {request.requesterName}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Droplets className="w-4 h-4 text-red-500" />
                          <span>{request.units} Units required</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{request.location.address}, {request.location.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>Needed by: {new Date(request.dateNeeded).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <AlertCircle className="w-4 h-4 text-slate-400" />
                          <span>Status: <Badge variant={getStatusColor(request.status)}>{request.status.replace('_', ' ')}</Badge></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col justify-end gap-2 min-w-[140px]">
                      {request.status === 'pending' && (
                        <Button 
                          onClick={() => handleAcceptRequest(request.id)}
                          className="w-full"
                        >
                          Accept Request
                        </Button>
                      )}
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Droplets className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 lowercase">No requests found</h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              We couldn't find any blood requests matching your current filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
