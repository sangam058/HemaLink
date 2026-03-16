import { motion } from 'framer-motion';
import { Heart, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';

export function DonorDonations() {
  const { user } = useAuthStore();
  const { donations } = useDataStore();

  const myDonations = donations.filter((d) => d.donorId === user?.id);
  const scheduled = myDonations.filter((d) => d.status === 'scheduled');
  const completed = myDonations.filter((d) => d.status === 'completed');
  // Cancelled donations available for future use
  // const cancelled = myDonations.filter((d) => d.status === 'cancelled' || d.status === 'rejected');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'scheduled': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-amber-500" />;
    }
  };

  const DonationCard = ({ donation }: { donation: typeof myDonations[0] }) => (
    <Card className="flex items-center gap-4">
      <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center">
        <span className="text-lg font-bold text-rose-600">{donation.bloodGroup}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-slate-800">{donation.hospitalName}</h4>
          {getStatusIcon(donation.status)}
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(donation.scheduledDate).toLocaleDateString()}
          </span>
          <span>{donation.units} unit(s)</span>
        </div>
      </div>
      <div className="text-right">
        <Badge
          variant={
            donation.status === 'completed' ? 'success' :
            donation.status === 'scheduled' ? 'info' : 'danger'
          }
        >
          {donation.status}
        </Badge>
        {donation.pointsEarned > 0 && (
          <div className="text-sm font-medium text-amber-600 mt-1">+{donation.pointsEarned} pts</div>
        )}
      </div>
    </Card>
  );

  const tabs = [
    {
      id: 'all',
      label: `All (${myDonations.length})`,
      icon: <Heart className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          {myDonations.length === 0 ? (
            <Card className="text-center py-12">
              <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No Donations Yet</h3>
              <p className="text-slate-600">Start your donation journey by responding to blood requests.</p>
            </Card>
          ) : (
            myDonations.map((donation) => (
              <motion.div
                key={donation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <DonationCard donation={donation} />
              </motion.div>
            ))
          )}
        </div>
      ),
    },
    {
      id: 'scheduled',
      label: `Scheduled (${scheduled.length})`,
      icon: <Clock className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          {scheduled.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-slate-600">No scheduled donations</p>
            </Card>
          ) : (
            scheduled.map((donation) => (
              <DonationCard key={donation.id} donation={donation} />
            ))
          )}
        </div>
      ),
    },
    {
      id: 'completed',
      label: `Completed (${completed.length})`,
      icon: <CheckCircle className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          {completed.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-slate-600">No completed donations yet</p>
            </Card>
          ) : (
            completed.map((donation) => (
              <DonationCard key={donation.id} donation={donation} />
            ))
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Donations</h1>
        <p className="text-slate-600">Track all your blood donations</p>
      </div>

      <Tabs tabs={tabs} />
    </div>
  );
}
