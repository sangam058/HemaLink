import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Minus, AlertTriangle, Calendar } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import type { BloodGroup } from '../../types';

export function HospitalInventory() {
  const { user } = useAuthStore();
  const { inventory, updateInventory } = useDataStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup | null>(null);
  const [newUnits, setNewUnits] = useState('');

  const hospitalInventory = inventory.filter((i) => i.hospitalId === user?.id);
  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const getInventoryItem = (bg: BloodGroup) => {
    return hospitalInventory.find((i) => i.bloodGroup === bg);
  };

  const handleUpdate = () => {
    if (!user || !selectedBloodGroup || !newUnits) return;
    updateInventory(user.id, selectedBloodGroup, parseInt(newUnits));
    setIsModalOpen(false);
    setSelectedBloodGroup(null);
    setNewUnits('');
  };

  const totalUnits = hospitalInventory.reduce((sum, i) => sum + i.units, 0);
  const lowStockCount = hospitalInventory.filter((i) => i.units < 10).length;
  const expiringCount = hospitalInventory.filter(
    (i) => new Date(i.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Blood Inventory</h1>
        <p className="text-slate-600">Manage your blood stock levels</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <Package className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-800">{totalUnits}</div>
          <div className="text-sm text-slate-500">Total Units</div>
        </Card>
        <Card className="text-center">
          <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-800">{lowStockCount}</div>
          <div className="text-sm text-slate-500">Low Stock</div>
        </Card>
        <Card className="text-center">
          <Calendar className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-800">{expiringCount}</div>
          <div className="text-sm text-slate-500">Expiring Soon</div>
        </Card>
      </div>

      {/* Inventory Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {bloodGroups.map((bg, index) => {
          const item = getInventoryItem(bg);
          const units = item?.units || 0;
          const isLow = units < 10;
          const isExpiring = item && new Date(item.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

          return (
            <motion.div
              key={bg}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`relative ${
                  isLow ? 'border-2 border-red-200 bg-red-50' : ''
                }`}
              >
                {isLow && (
                  <Badge variant="danger" className="absolute top-3 right-3">
                    Low
                  </Badge>
                )}
                {isExpiring && !isLow && (
                  <Badge variant="warning" className="absolute top-3 right-3">
                    Expiring
                  </Badge>
                )}

                <div className="text-center mb-4">
                  <div className={`text-4xl font-bold ${isLow ? 'text-red-600' : 'text-rose-600'}`}>
                    {bg}
                  </div>
                  <div className="text-3xl font-bold text-slate-800 mt-2">{units}</div>
                  <div className="text-sm text-slate-500">units available</div>
                </div>

                {item && (
                  <div className="text-xs text-slate-500 text-center mb-4">
                    Expires: {new Date(item.expiryDate).toLocaleDateString()}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      if (units > 0) {
                        updateInventory(user!.id, bg, units - 1);
                      }
                    }}
                    disabled={units === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      updateInventory(user!.id, bg, units + 1);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => {
                    setSelectedBloodGroup(bg);
                    setNewUnits(String(units));
                    setIsModalOpen(true);
                  }}
                >
                  Set Amount
                </Button>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Update Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Update ${selectedBloodGroup} Inventory`}
      >
        <div className="space-y-4">
          <Input
            label="Number of Units"
            type="number"
            min="0"
            value={newUnits}
            onChange={(e) => setNewUnits(e.target.value)}
          />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleUpdate}>
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
