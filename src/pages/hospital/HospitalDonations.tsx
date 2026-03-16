import { motion } from 'framer-motion';
import { Heart, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { Card } from '../../components/ui/Card';

import { Button } from '../../components/ui/Button';

export function HospitalDonations() {
  const { user } = useAuthStore();
  const { donations, updateDonationStatus, updateInventory, inventory, addNotification } = useDataStore();

  const hospitalDonations = donations.filter((d) => d.hospitalId === user?.id);
  const pending = hospitalDonations.filter((d) => d.status === 'scheduled' || d.status === 'awaiting_confirmation');
  const completed = hospitalDonations.filter((d) => d.status === 'completed');

  const handleVerify = (donationId: string, bloodGroup: string, units: number, donorId: string) => {
    // Update donation status
    updateDonationStatus(donationId, 'completed', 100 * units);
    
    // Update inventory
    const currentInventory = inventory.find((i) => i.hospitalId === user?.id && i.bloodGroup === bloodGroup);
    const currentUnits = currentInventory?.units || 0;
    updateInventory(user!.id, bloodGroup as any, currentUnits + units);

    // Notify donor
    addNotification({
      userId: donorId,
      title: 'Donation Verified! 🎉',
      message: `Your donation has been verified. You earned ${100 * units} points!`,
      type: 'reward',
    });
  };

  const handleReject = (donationId: string, donorId: string) => {
    updateDonationStatus(donationId, 'rejected', 0);
    addNotification({
      userId: donorId,
      title: 'Donation Not Verified',
      message: 'Your donation could not be verified. Please contact the hospital.',
      type: 'donation',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Manage Donations</h1>
        <p className="text-slate-600">Verify and track blood donations</p>
      </div>

      {/* Pending Donations */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Pending Verification ({pending.length})</h2>
        {pending.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No pending donations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((donation, index) => (
              <motion.div
                key={donation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-slate-50 rounded-xl"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-rose-600">{donation.bloodGroup}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{donation.donorName}</h4>
                      <p className="text-sm text-slate-500">{donation.units} unit(s) • Scheduled: {new Date(donation.scheduledDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(donation.id, donation.donorId)}
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleVerify(donation.id, donation.bloodGroup, donation.units, donation.donorId)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Verify
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Completed Donations */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Completed Donations ({completed.length})</h2>
        {completed.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No completed donations yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Donor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Blood Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Units</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Points</th>
                </tr>
              </thead>
              <tbody>
                {completed.map((donation) => (
                  <tr key={donation.id} className="border-b border-slate-50">
                    <td className="py-3 px-4 text-slate-800">{donation.donorName}</td>
                    <td className="py-3 px-4 font-semibold text-rose-600">{donation.bloodGroup}</td>
                    <td className="py-3 px-4 text-slate-600">{donation.units}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {donation.completedDate ? new Date(donation.completedDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4 font-medium text-amber-600">+{donation.pointsEarned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
