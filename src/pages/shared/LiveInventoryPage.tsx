import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, MapPin, Phone, Droplets, Info } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { BloodGroup } from '../../types';

export function LiveInventoryPage() {
  const { inventory, hospitals } = useDataStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup | 'All'>('All');

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearch = 
      hospital.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.location.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedBloodGroup === 'All') return matchesSearch;

    const hasStock = inventory.some(
      (item) => item.hospitalId === hospital.id && item.bloodGroup === selectedBloodGroup && item.units > 0
    );
    
    return matchesSearch && hasStock;
  });

  const getHospitalInventory = (hospitalId: string) => {
    return inventory.filter((item) => item.hospitalId === hospitalId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Live Blood Inventory</h1>
          <p className="text-slate-600">Find real-time blood availability across hospitals</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search hospitals or cities..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            value={selectedBloodGroup}
            onChange={(e) => setSelectedBloodGroup(e.target.value as BloodGroup | 'All')}
          >
            <option value="All">All Blood Groups</option>
            {bloodGroups.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredHospitals.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800">No hospitals found</h3>
            <p className="text-slate-500">Try adjusting your search or blood group filter.</p>
          </div>
        ) : (
          filteredHospitals.map((hospital, index) => {
            const hospitalInv = getHospitalInventory(hospital.id);
            return (
              <motion.div
                key={hospital.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full border-slate-100 hover:border-rose-200 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{hospital.hospitalName}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          {hospital.location.city}, {hospital.location.state}
                        </div>
                      </div>
                    </div>
                    {hospital.status === 'active' && (
                      <Badge variant="success">Verified</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-6">
                    {bloodGroups.map((bg) => {
                      const item = hospitalInv.find((i) => i.bloodGroup === bg);
                      const units = item?.units || 0;
                      const isSelected = selectedBloodGroup === bg;
                      return (
                        <div
                          key={bg}
                          className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-rose-50 border-rose-200 ring-2 ring-rose-500/20'
                              : units > 0
                              ? 'bg-emerald-50 border-emerald-100'
                              : 'bg-slate-50 border-slate-100 opacity-60'
                          }`}
                        >
                          <span className={`text-xs font-bold ${
                            isSelected ? 'text-rose-600' : units > 0 ? 'text-emerald-700' : 'text-slate-400'
                          }`}>
                            {bg}
                          </span>
                          <span className={`text-sm font-black ${
                            isSelected ? 'text-rose-700' : units > 0 ? 'text-emerald-800' : 'text-slate-500'
                          }`}>
                            {units}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Phone className="w-3.5 h-3.5" />
                        {hospital.phone}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {user?.role === 'donor' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => {
                            // In a real app, this would pre-fill the donation form
                            navigate('/donor/donate');
                          }}
                        >
                          <Droplets className="w-4 h-4 text-rose-500" />
                          Donate Now
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            navigate('/requester/new-request');
                          }}
                        >
                          <Info className="w-4 h-4" />
                          Request Blood
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
