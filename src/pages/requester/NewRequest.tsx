import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Droplets, MapPin, FileText, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import type { BloodGroup, Priority } from '../../types';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

export function NewRequest() {
  const { user } = useAuthStore();
  const { createRequest, hospitals, addNotification, donors } = useDataStore();
  const navigate = useNavigate();

  // Get hospitals from data store
  const allHospitals = [...hospitals];
  const uniqueHospitals = allHospitals.filter((h, index, self) =>
    index === self.findIndex((t) => t.id === h.id)
  );

  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'O+' as BloodGroup,
    units: '1',
    hospitalId: '',
    dateNeeded: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    reason: '',
    priority: 'normal' as Priority,
  });
  const [isLoading, setIsLoading] = useState(false);

  const bloodGroups: { value: BloodGroup; label: string }[] = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
  ];

  const priorities: { value: Priority; label: string }[] = [
    { value: 'normal', label: 'Normal' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'emergency', label: 'Emergency (High Priority)' },
  ];

  const activeHospitals = uniqueHospitals.filter((h) => h.status === 'active');
  const selectedHospital = activeHospitals.find((h) => h.id === formData.hospitalId);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      await createRequest({
        requesterId: user.id,
        requesterName: user.name,
        patientName: formData.patientName || undefined,
        bloodGroup: formData.bloodGroup,
        units: parseInt(formData.units),
        hospitalId: formData.hospitalId || undefined,
        hospitalName: selectedHospital?.hospitalName,
        location: selectedHospital?.location || user.location,
        dateNeeded: new Date(formData.dateNeeded),
        reason: formData.reason || undefined,
        priority: formData.priority,
      });

      // Notify matching donors from data store
      const allDonors = [...donors];
      const matchingDonors = allDonors.filter((d) => d.bloodGroup === formData.bloodGroup && d.isAvailable);
      matchingDonors.forEach((donor) => {
        addNotification({
          userId: donor.id,
          title: `${formData.priority === 'emergency' ? '🚨 Emergency: ' : ''}Blood Request`,
          message: `${formData.bloodGroup} blood needed at ${selectedHospital?.hospitalName || 'nearby location'}`,
          type: 'request',
          link: '/donor/requests',
        });
      });
      navigate('/requester');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-100 text-red-600 rounded-xl">
          <Droplets className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">New Blood Request</h1>
          <p className="text-slate-600">Fill in the details to request blood for a patient</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-red-500" />
                Blood Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Blood Group"
                  options={bloodGroups}
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })}
                />
                <Input
                  label="Units Required"
                  type="number"
                  min="1"
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                />
                <Select
                  label="Priority Level"
                  options={priorities}
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                />
                <Input
                  label="Date Needed"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.dateNeeded}
                  onChange={(e) => setFormData({ ...formData, dateNeeded: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Patient & Medical Details
              </h3>
              <div className="space-y-4">
                <Input
                  label="Patient Name (Optional)"
                  placeholder="Enter patient name"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Reason for Request (Optional)</label>
                  <textarea
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 min-h-[100px]"
                    placeholder="Briefly describe the medical condition or reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-500" />
                Location & Hospital
              </h3>
              <div className="space-y-4">
                <Select
                  label="Available Hospitals (Verified Only)"
                  options={[
                    { value: '', label: 'Select a hospital' },
                    ...activeHospitals.map(h => ({ value: h.id, label: `${h.hospitalName} (${h.location.city})` }))
                  ]}
                  value={formData.hospitalId}
                  onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                />
                {selectedHospital && (
                  <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm flex gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Selected Hospital Address:</p>
                      <p>{selectedHospital.location.address}, {selectedHospital.location.city}, {selectedHospital.location.state}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" isLoading={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
