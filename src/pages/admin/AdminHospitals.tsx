import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, CheckCircle, XCircle, Clock, MapPin, Phone, Mail, Trash2, AlertTriangle } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import type { Hospital } from '../../types';

export function AdminHospitals() {
  const { hospitals, approveHospital, rejectHospital, suspendHospital, addNotification } = useDataStore();

  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [removeReason, setRemoveReason] = useState('');
  const [actionType, setActionType] = useState<'remove' | 'suspend'>('remove');

  const pending = hospitals.filter((h) => h.status === 'pending_approval');
  const active = hospitals.filter((h) => h.status === 'active');
  const suspended = hospitals.filter((h) => h.status === 'suspended');
  const rejected = hospitals.filter((h) => h.status === 'rejected');

  const handleApprove = (hospitalId: string) => {
    approveHospital(hospitalId);
    
    addNotification({
      userId: hospitalId,
      title: 'Account Approved! 🎉',
      message: 'Your hospital account has been verified. You can now start managing blood donations.',
      type: 'system',
    });
  };

  const handleReject = (hospitalId: string) => {
    rejectHospital(hospitalId);
    
    addNotification({
      userId: hospitalId,
      title: 'Account Rejected',
      message: 'Your hospital registration was not approved. Please contact support for more information.',
      type: 'system',
    });
  };

  const handleRemoveOrSuspend = async () => {
    if (!selectedHospital || !removeReason.trim()) return;

    try {
      if (actionType === 'remove') {
        await rejectHospital(selectedHospital.id);
      } else {
        await suspendHospital(selectedHospital.id);
      }

      // Notify hospital
      addNotification({
        userId: selectedHospital.id,
        title: actionType === 'remove' ? 'Account Removed' : 'Account Suspended',
        message: `Your hospital account has been ${actionType === 'remove' ? 'removed' : 'suspended'}. Reason: ${removeReason}`,
        type: 'system',
      });
    } catch (error) {
      console.error(`Failed to ${actionType} hospital:`, error);
    }

    setIsRemoveModalOpen(false);
    setSelectedHospital(null);
    setRemoveReason('');
  };

  const handleReactivate = (hospital: Hospital) => {
    approveHospital(hospital.id);

    addNotification({
      userId: hospital.id,
      title: 'Account Reactivated! 🎉',
      message: 'Your hospital account has been reactivated. You can now continue managing blood donations.',
      type: 'system',
    });
  };

  const HospitalCard = ({ hospital, showActions = false, showRemove = false, showReactivate = false }: { 
    hospital: Hospital; 
    showActions?: boolean;
    showRemove?: boolean;
    showReactivate?: boolean;
  }) => (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Building2 className="w-7 h-7 text-emerald-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-semibold text-slate-800">{hospital.hospitalName}</h4>
            <Badge
              variant={
                hospital.status === 'active' ? 'success' :
                hospital.status === 'pending_approval' ? 'warning' :
                hospital.status === 'suspended' ? 'info' : 'danger'
              }
            >
              {hospital.status?.replace('_', ' ')}
            </Badge>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {hospital.location.city}, {hospital.location.state}
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {hospital.phone}
            </div>
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {hospital.email}
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            License: {hospital.licenseNumber} • Registered: {new Date(hospital.createdAt).toLocaleDateString('en-IN')}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {showActions && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleReject(hospital.id)}
            >
              <XCircle className="w-4 h-4 mr-1" /> Reject
            </Button>
            <Button
              size="sm"
              onClick={() => handleApprove(hospital.id)}
            >
              <CheckCircle className="w-4 h-4 mr-1" /> Approve
            </Button>
          </>
        )}
        
        {showRemove && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedHospital(hospital);
                setActionType('suspend');
                setIsRemoveModalOpen(true);
              }}
            >
              <AlertTriangle className="w-4 h-4 mr-1 text-amber-500" /> Suspend
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setSelectedHospital(hospital);
                setActionType('remove');
                setIsRemoveModalOpen(true);
              }}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Remove
            </Button>
          </>
        )}

        {showReactivate && (
          <Button
            size="sm"
            onClick={() => handleReactivate(hospital)}
          >
            <CheckCircle className="w-4 h-4 mr-1" /> Reactivate
          </Button>
        )}
      </div>
    </Card>
  );

  const tabs = [
    {
      id: 'pending',
      label: `Pending (${pending.length})`,
      icon: <Clock className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <Card className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <p className="text-slate-600">No pending approvals</p>
            </Card>
          ) : (
            pending.map((hospital) => (
              <motion.div
                key={hospital.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <HospitalCard hospital={hospital} showActions />
              </motion.div>
            ))
          )}
        </div>
      ),
    },
    {
      id: 'active',
      label: `Active (${active.length})`,
      icon: <CheckCircle className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          {active.length === 0 ? (
            <Card className="text-center py-8">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600">No active hospitals</p>
            </Card>
          ) : (
            active.map((hospital) => (
              <HospitalCard key={hospital.id} hospital={hospital} showRemove />
            ))
          )}
        </div>
      ),
    },
    {
      id: 'suspended',
      label: `Suspended (${suspended.length})`,
      icon: <AlertTriangle className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          {suspended.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-slate-600">No suspended hospitals</p>
            </Card>
          ) : (
            suspended.map((hospital) => (
              <HospitalCard key={hospital.id} hospital={hospital} showReactivate />
            ))
          )}
        </div>
      ),
    },
    {
      id: 'rejected',
      label: `Rejected (${rejected.length})`,
      icon: <XCircle className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          {rejected.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-slate-600">No rejected hospitals</p>
            </Card>
          ) : (
            rejected.map((hospital) => (
              <HospitalCard key={hospital.id} hospital={hospital} showReactivate />
            ))
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Hospital Management</h1>
        <p className="text-slate-600">Review, approve, and manage hospital registrations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-slate-800">{hospitals.length}</div>
          <div className="text-sm text-slate-500">Total Hospitals</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-amber-600">{pending.length}</div>
          <div className="text-sm text-slate-500">Pending Approval</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-emerald-600">{active.length}</div>
          <div className="text-sm text-slate-500">Active</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-red-600">{suspended.length + rejected.length}</div>
          <div className="text-sm text-slate-500">Suspended/Rejected</div>
        </Card>
      </div>

      <Tabs tabs={tabs} defaultTab="pending" />

      {/* Remove/Suspend Modal */}
      <Modal
        isOpen={isRemoveModalOpen}
        onClose={() => {
          setIsRemoveModalOpen(false);
          setRemoveReason('');
        }}
        title={actionType === 'remove' ? 'Remove Hospital' : 'Suspend Hospital'}
        size="lg"
      >
        {selectedHospital && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  {actionType === 'remove' ? (
                    <Trash2 className="w-6 h-6 text-red-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{selectedHospital.hospitalName}</h4>
                  <p className="text-sm text-slate-500">{selectedHospital.location.city}, {selectedHospital.location.state}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl text-sm text-amber-800">
              <p className="font-medium mb-1">
                {actionType === 'remove' ? 'Warning: This action will:' : 'Suspending will:'}
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Prevent the hospital from receiving new blood requests</li>
                <li>Hide the hospital from donor searches</li>
                <li>Notify the hospital about this action</li>
                {actionType === 'remove' && (
                  <li className="text-red-600 font-medium">Permanently remove the hospital from the platform</li>
                )}
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Reason for {actionType === 'remove' ? 'Removal' : 'Suspension'} <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                rows={4}
                value={removeReason}
                onChange={(e) => setRemoveReason(e.target.value)}
                placeholder={`Enter the reason for ${actionType === 'remove' ? 'removing' : 'suspending'} this hospital...`}
              />
              <p className="text-xs text-slate-500 mt-1">
                This reason will be shared with the hospital.
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => {
                  setIsRemoveModalOpen(false);
                  setRemoveReason('');
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                className="flex-1" 
                onClick={handleRemoveOrSuspend}
                disabled={!removeReason.trim()}
              >
                {actionType === 'remove' ? (
                  <><Trash2 className="w-4 h-4 mr-2" /> Remove Hospital</>
                ) : (
                  <><AlertTriangle className="w-4 h-4 mr-2" /> Suspend Hospital</>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
