import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, MapPin, Users, Target } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import type { Hospital, BloodGroup } from '../../types';

export function HospitalCampaigns() {
  const { user } = useAuthStore();
  const { campaigns, createCampaign, addNotification, donors } = useDataStore();
  const hospital = user as Hospital;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    targetUnits: '50',
  });

  // Filter out cancelled campaigns - hospital should not see them in main list
  const hospitalCampaigns = campaigns.filter((c) => c.hospitalId === user?.id && c.status !== 'cancelled');

  const handleCreate = () => {
    if (!user || !hospital) return;

    createCampaign({
      hospitalId: user.id,
      hospitalName: hospital.hospitalName,
      name: formData.name,
      description: formData.description,
      location: hospital.location,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      targetBloodGroups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[],
      targetUnits: parseInt(formData.targetUnits),
    });

    // Notify all donors
    donors.forEach((donor) => {
      addNotification({
        userId: donor.id,
        title: 'New Blood Drive! 🩸',
        message: `${formData.name} at ${hospital.hospitalName}. Join us!`,
        type: 'campaign',
        link: '/donor/campaigns',
      });
    });

    setIsModalOpen(false);
    setFormData({ name: '', description: '', startDate: '', endDate: '', targetUnits: '50' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Blood Donation Campaigns</h1>
          <p className="text-slate-600">Organize and manage blood drives</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" /> Create Campaign
        </Button>
      </div>

      {hospitalCampaigns.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No Campaigns Yet</h3>
          <p className="text-slate-600 mb-4">Create your first blood donation campaign</p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-5 h-5 mr-2" /> Create Campaign
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {hospitalCampaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-emerald-600" />
                  </div>
                  <Badge
                    variant={
                      campaign.status === 'upcoming' ? 'info' :
                      campaign.status === 'ongoing' ? 'success' : 'default'
                    }
                  >
                    {campaign.status}
                  </Badge>
                </div>

                <h3 className="text-xl font-semibold text-slate-800 mb-2">{campaign.name}</h3>
                <p className="text-slate-600 text-sm mb-4">{campaign.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="w-4 h-4" />
                    {campaign.location.city}, {campaign.location.state}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Users className="w-4 h-4" />
                    {campaign.attendees.length} registered
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Target className="w-4 h-4" />
                    {campaign.collectedUnits}/{campaign.targetUnits} units collected
                  </div>
                </div>

                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    style={{ width: `${(campaign.collectedUnits / campaign.targetUnits) * 100}%` }}
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Blood Drive Campaign"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Campaign Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Winter Blood Drive 2025"
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your campaign..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
          <Input
            label="Target Units"
            type="number"
            value={formData.targetUnits}
            onChange={(e) => setFormData({ ...formData, targetUnits: e.target.value })}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleCreate}>
              Create Campaign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
