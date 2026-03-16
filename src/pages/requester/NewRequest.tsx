import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Droplets, MapPin, FileText, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import type { Hospital } from '../../types';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import type { BloodGroup, Priority } from '../../types';

export function NewRequest() {
  const { user, registeredUsers } = useAuthStore();
  const { createRequest, hospitals, addNotification, donors } = useDataStore();
  const navigate = useNavigate();

  // Get hospitals from both data store and registered users
  const registeredHospitals = Object.values(registeredUsers)
    .filter((u: any) => u.role === 'hospital' && u.status === 'active') as Hospital[];
  const allHospitals = [...hospitals, ...registeredHospitals];
  const uniqueHospitals = allHospitals.filter((h, index, self) => 
    index === self.findIndex((t) => t.id === h.id)
  );

  // Get donors from registered users
  const registeredDonors = Object.values(registeredUsers)
    .filter((u: any) => u.role === 'donor') as any[];

  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'O+' as BloodGroup,
    units: '1',
    hospitalId: '',
    dateNeeded: '',
    reason: '',
    priority: 'normal' as Priority,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    { value: 'emergency', label: 'Emergency' },
  ];

  const activeHospitals = uniqueHospitals.filter((h) => h.status === 'active');
  const selectedHospital = activeHospitals.find((h) => h.id === formData.hospitalId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    createRequest({
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

    // Notify matching donors from both stores
    const allDonors = [...donors, ...registeredDonors];
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

    setIsSubmitting(false);
    navigate('/requester/my-requests');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-slate-800">Create Blood Request</h1>
        <p className="text-slate-600">Fill in the details to request blood</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Blood Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-rose-600" /> Blood Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Select
                  label="Blood Group Required"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })}
                  options={bloodGroups}
                />
                <Input
                  label="Units Required"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                />
              </div>
              <Select
                label="Priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                options={priorities}
              />
            </div>

            {/* Patient Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-600" /> Patient Details (Optional)
              </h3>
              <Input
                label="Patient Name"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                placeholder="Enter patient name"
              />
              <Input
                label="Reason for Request"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g., Surgery, Accident, etc."
              />
            </div>

            {/* Location & Time */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-600" /> Location & Time
              </h3>
              <Select
                label="Hospital / Blood Bank"
                value={formData.hospitalId}
                onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                options={[
                  { value: '', label: 'Select a hospital' },
                  ...activeHospitals.map((h) => ({ value: h.id, label: h.hospitalName })),
                ]}
              />
              <Input
                label="Date Needed"
                type="date"
                value={formData.dateNeeded}
                onChange={(e) => setFormData({ ...formData, dateNeeded: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">What happens next?</p>
                <p>Your request will be visible to matching donors in your area. You'll be notified when a donor accepts your request.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" isLoading={isSubmitting}>
                Submit Request
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
