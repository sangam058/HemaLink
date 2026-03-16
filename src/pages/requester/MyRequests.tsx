import { motion } from 'framer-motion';
import { Droplets, MapPin, Calendar, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function MyRequests() {
  const { user } = useAuthStore();
  const { requests, updateRequestStatus } = useDataStore();
  const navigate = useNavigate();

  const myRequests = requests.filter((r) => r.requesterId === user?.id);

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

  const handleCancel = (requestId: string) => {
    updateRequestStatus(requestId, 'cancelled', 'Request cancelled by requester');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Requests</h1>
          <p className="text-slate-600">Track all your blood requests</p>
        </div>
        <Button onClick={() => navigate('/requester/new-request')}>
          New Request
        </Button>
      </div>

      {myRequests.length === 0 ? (
        <Card className="text-center py-12">
          <Droplets className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No Requests Yet</h3>
          <p className="text-slate-600 mb-4">Create your first blood request</p>
          <Button onClick={() => navigate('/requester/new-request')}>
            Create Request
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {myRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Blood Type */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-rose-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-rose-600">{request.bloodGroup}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{request.units} units</span>
                        {getPriorityBadge(request.priority)}
                      </div>
                      <p className="text-sm text-slate-500">Request #{request.id.slice(-6)}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {request.hospitalName || request.location.city}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(request.dateNeeded).toLocaleDateString()}
                    </div>
                    {request.assignedDonorName && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="w-4 h-4 text-slate-400" />
                        {request.assignedDonorName}
                      </div>
                    )}
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3">
                    {getStatusBadge(request.status)}
                    {request.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(request.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                {request.timeline.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4 overflow-x-auto pb-2">
                      {request.timeline.map((event, i) => (
                        <div key={event.id} className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-2 h-2 bg-rose-500 rounded-full" />
                          <div className="text-xs">
                            <span className="text-slate-800 font-medium">{event.message}</span>
                            <span className="text-slate-400 ml-2">
                              {new Date(event.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          {i < request.timeline.length - 1 && (
                            <div className="w-8 h-px bg-slate-200" />
                          )}
                        </div>
                      ))}
                    </div>
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
