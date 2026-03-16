import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Building2, Search, Trash2 } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';

export function AdminCampaigns() {
  const { campaigns, updateCampaign } = useDataStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState<typeof campaigns[0] | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.hospitalName.toLowerCase().includes(search.toLowerCase()) ||
      c.location.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming': return <Badge variant="info">Upcoming</Badge>;
      case 'ongoing': return <Badge variant="success">Ongoing</Badge>;
      case 'completed': return <Badge>Completed</Badge>;
      case 'cancelled': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge>Unknown</Badge>;
    }
  };

  const handleCancelCampaign = () => {
    if (selectedCampaign) {
      updateCampaign(selectedCampaign.id, { status: 'cancelled' });
      setIsDeleteModalOpen(false);
      setSelectedCampaign(null);
    }
  };

  const stats = {
    total: campaigns.length,
    upcoming: campaigns.filter(c => c.status === 'upcoming').length,
    ongoing: campaigns.filter(c => c.status === 'ongoing').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    totalUnits: campaigns.reduce((sum, c) => sum + c.collectedUnits, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Campaign Management</h1>
        <p className="text-slate-600">Monitor and manage blood donation campaigns</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
          <div className="text-sm text-slate-500">Total Campaigns</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
          <div className="text-sm text-slate-500">Upcoming</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-emerald-600">{stats.ongoing}</div>
          <div className="text-sm text-slate-500">Ongoing</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-slate-600">{stats.completed}</div>
          <div className="text-sm text-slate-500">Completed</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-rose-600">{stats.totalUnits}</div>
          <div className="text-sm text-slate-500">Units Collected</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by campaign name, hospital, city..."
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
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'ongoing', label: 'Ongoing' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>
      </Card>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No Campaigns Found</h3>
          <p className="text-slate-600">No campaigns match your filters or no campaigns created yet.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredCampaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(campaign.status)}
                    {(campaign.status === 'upcoming' || campaign.status === 'ongoing') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-slate-800 mb-2">{campaign.name}</h3>
                <p className="text-slate-600 text-sm mb-4">{campaign.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Building2 className="w-4 h-4" />
                    {campaign.hospitalName}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="w-4 h-4" />
                    {campaign.location.city}, {campaign.location.state}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(campaign.startDate).toLocaleDateString('en-IN')} - {new Date(campaign.endDate).toLocaleDateString('en-IN')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Users className="w-4 h-4" />
                    {campaign.attendees.length} registered donors
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Progress</span>
                    <span className="text-rose-600 font-medium">
                      {campaign.collectedUnits}/{campaign.targetUnits} units
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-red-500 rounded-full"
                      style={{ width: `${Math.min((campaign.collectedUnits / campaign.targetUnits) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {campaign.targetBloodGroups.slice(0, 4).map((bg) => (
                    <span key={bg} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                      {bg}
                    </span>
                  ))}
                  {campaign.targetBloodGroups.length > 4 && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                      +{campaign.targetBloodGroups.length - 4}
                    </span>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Cancel Campaign Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Cancel Campaign"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to cancel the campaign <strong>"{selectedCampaign?.name}"</strong>?
            This action will notify all registered donors.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>
              Keep Campaign
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleCancelCampaign}>
              Cancel Campaign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
