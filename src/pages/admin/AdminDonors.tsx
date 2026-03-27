import { motion } from 'framer-motion';
import { Users, Search, Award, Heart, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';

export function AdminDonors() {
  const { donors } = useDataStore();
  const [search, setSearch] = useState('');

  const filteredDonors = donors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase()) ||
      (d.bloodGroup && d.bloodGroup.toLowerCase().includes(search.toLowerCase()))
  );

  const getLevelName = (level: number = 1) => {
    const levels = ['Newcomer', 'Helper', 'Supporter', 'Champion', 'Hero', 'Legend'];
    return levels[level - 1] || 'Newcomer';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Donor Management</h1>
          <p className="text-slate-600">View and manage registered donors</p>
        </div>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search donors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <Users className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-800">{donors.length}</div>
          <div className="text-sm text-slate-500">Total Donors</div>
        </Card>
        <Card className="text-center">
          <Heart className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-800">
            {donors.reduce((sum, d) => sum + (d.totalDonations || 0), 0)}
          </div>
          <div className="text-sm text-slate-500">Total Donations</div>
        </Card>
        <Card className="text-center">
          <Award className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-800">
            {donors.reduce((sum, d) => sum + (d.points || 0), 0)}
          </div>
          <div className="text-sm text-slate-500">Points Distributed</div>
        </Card>
        <Card className="text-center">
          <Users className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-800">
            {donors.filter((d) => d.isAvailable).length}
          </div>
          <div className="text-sm text-slate-500">Available Now</div>
        </Card>
      </div>

      {/* Donors List */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Donor</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Blood Type</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Location</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Donations</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Points</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Level</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonors.map((donor, index) => (
                <motion.tr
                  key={donor.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-slate-50 hover:bg-slate-50"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <Avatar name={donor.name} size="sm" />
                      <div>
                        <div className="font-medium text-slate-800">{donor.name}</div>
                        <div className="text-sm text-slate-500">{donor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-rose-600">{donor.bloodGroup}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <MapPin className="w-4 h-4" />
                      {donor.location.city}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600">{donor.totalDonations}</td>
                  <td className="py-4 px-6 font-medium text-amber-600">{donor.points}</td>
                  <td className="py-4 px-6">
                    <Badge variant="info">{getLevelName(donor.level)}</Badge>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={donor.isAvailable ? 'success' : 'default'}>
                      {donor.isAvailable ? 'Available' : 'Unavailable'}
                    </Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
