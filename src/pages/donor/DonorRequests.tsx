import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, MapPin, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import type { Donor, BloodRequest } from '../../types';

export function DonorRequests() {
  const { user } = useAuthStore();
  const { requests, assignDonor, createDonation, addNotification } = useDataStore();
  const donor = user as Donor;

  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [acceptedRequestId, setAcceptedRequestId] = useState<string | null>(null);

  // Get all pending requests (not assigned to any donor yet)
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  
  const filteredRequests = pendingRequests.filter((r) => {
    if (filter === 'matching' && r.bloodGroup !== donor?.bloodGroup) return false;
    if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false;
    return true;
  });

  const handleAcceptRequest = () => {
    if (!selectedRequest || !user) return;

    // Update request with donor assignment
    assignDonor(selectedRequest.id, user.id, user.name);
    
    // Create donation record
    createDonation({
      donorId: user.id,
      donorName: user.name,
      hospitalId: selectedRequest.hospitalId || '',
      hospitalName: selectedRequest.hospitalName || '',
      requestId: selectedRequest.id,
      bloodGroup: selectedRequest.bloodGroup,
      units: selectedRequest.units,
      status: 'scheduled',
      scheduledDate: selectedRequest.dateNeeded,
    });
    
    // Notify requester
    addNotification({
      userId: selectedRequest.requesterId,
      title: 'Donor Assigned! 🎉',
      message: `${user.name} has accepted your blood request for ${selectedRequest.bloodGroup}`,
      type: 'request',
      link: '/requester/my-requests',
    });

    // Notify donor
    addNotification({
      userId: user.id,
      title: 'Request Accepted',
      message: `You accepted a request for ${selectedRequest.bloodGroup} at ${selectedRequest.hospitalName}`,
      type: 'donation',
      link: '/donor/donations',
    });

    setAcceptedRequestId(selectedRequest.id);
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'danger';
      case 'urgent': return 'warning';
      default: return 'default';
    }
  };

  // Check if donor already accepted a request
  const hasAcceptedRequest = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    return request?.assignedDonorId === user?.id || acceptedRequestId === requestId;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Blood Requests</h1>
          <p className="text-slate-600">Help save lives by responding to blood requests</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Blood Types' },
              { value: 'matching', label: `My Type (${donor?.bloodGroup})` },
            ]}
          />
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'emergency', label: 'Emergency' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'normal', label: 'Normal' },
            ]}
          />
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">How it works:</p>
            <p>When you accept a request, a donation session will be scheduled at the specified hospital. The requester will be notified and you'll earn reward points after verification.</p>
          </div>
        </div>
      </Card>

      {filteredRequests.length === 0 ? (
        <Card className="text-center py-12">
          <Droplets className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No Requests Found</h3>
          <p className="text-slate-600">There are no pending blood requests matching your filters.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((request, index) => {
            const isAccepted = hasAcceptedRequest(request.id);
            const isAssignedToOther = request.assignedDonorId && request.assignedDonorId !== user?.id;
            
            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover className={`h-full flex flex-col ${isAccepted ? 'border-2 border-emerald-500 bg-emerald-50' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center">
                        <span className="text-xl font-bold text-rose-600">{request.bloodGroup}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{request.units} units</div>
                        <Badge variant={getPriorityColor(request.priority) as any}>
                          {request.priority}
                        </Badge>
                      </div>
                    </div>
                    {request.bloodGroup === donor?.bloodGroup && !isAccepted && (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-xs font-medium rounded-full">
                        Match
                      </span>
                    )}
                    {isAccepted && (
                      <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Accepted
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {request.hospitalName || request.location.city}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Needed by {new Date(request.dateNeeded).toLocaleDateString('en-IN')}
                    </div>
                    {request.reason && (
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5" />
                        {request.reason}
                      </div>
                    )}
                    <div className="text-xs text-slate-400 mt-2">
                      Requested by: {request.requesterName}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    {isAccepted ? (
                      <Button variant="secondary" disabled className="w-full">
                        <CheckCircle className="w-4 h-4 mr-2" /> You Accepted This
                      </Button>
                    ) : isAssignedToOther ? (
                      <Button variant="secondary" disabled className="w-full">
                        Already Assigned
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsModalOpen(true);
                        }}
                      >
                        Accept Request
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Donation"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-rose-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-rose-600">{selectedRequest.bloodGroup}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{selectedRequest.units} units needed</h4>
                  <p className="text-sm text-slate-600">{selectedRequest.hospitalName}</p>
                  <Badge variant={getPriorityColor(selectedRequest.priority) as any}>
                    {selectedRequest.priority}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Location</p>
                  <p className="font-medium text-slate-800">{selectedRequest.location.city}, {selectedRequest.location.state}</p>
                </div>
                <div>
                  <p className="text-slate-500">Date Needed</p>
                  <p className="font-medium text-slate-800">{new Date(selectedRequest.dateNeeded).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-slate-500">Requester</p>
                  <p className="font-medium text-slate-800">{selectedRequest.requesterName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Reason</p>
                  <p className="font-medium text-slate-800">{selectedRequest.reason || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div className="text-sm text-slate-600">
              <p className="mb-2">By accepting this request, you agree to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Donate blood at the specified hospital</li>
                <li>Arrive on or before {new Date(selectedRequest.dateNeeded).toLocaleDateString('en-IN')}</li>
                <li>Follow all health and safety guidelines</li>
              </ul>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg text-sm text-amber-800">
              <strong>Reward:</strong> You'll earn 100 points per unit donated after hospital verification.
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleAcceptRequest}>
                Confirm Donation
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
