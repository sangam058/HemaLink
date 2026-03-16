import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export function DonorCampaigns() {
  const { user } = useAuthStore();
  const { campaigns, rsvpCampaign, addNotification } = useDataStore();

  // Filter out cancelled campaigns - donors should not see them
  const activeCampaigns = campaigns.filter(c => c.status !== 'cancelled');

  const handleRSVP = (campaignId: string) => {
    if (!user) return;
    rsvpCampaign(campaignId, user.id);
    addNotification({
      userId: user.id,
      title: 'RSVP Confirmed',
      message: 'You have successfully registered for the campaign',
      type: 'campaign',
    });
  };

  const isRegistered = (campaign: typeof campaigns[0]) => {
    return campaign.attendees.includes(user?.id || '');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Blood Donation Campaigns</h1>
        <p className="text-slate-600">Join campaigns in your area</p>
      </div>

      {activeCampaigns.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No Campaigns</h3>
          <p className="text-slate-600">Check back later for upcoming campaigns.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {activeCampaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-7 h-7 text-rose-600" />
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
                <p className="text-slate-600 text-sm mb-4 flex-1">{campaign.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="w-4 h-4" />
                    {campaign.location.address}, {campaign.location.city}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Users className="w-4 h-4" />
                    {campaign.attendees.length} registered
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
                      style={{ width: `${(campaign.collectedUnits / campaign.targetUnits) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {campaign.targetBloodGroups.map((bg) => (
                    <span key={bg} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                      {bg}
                    </span>
                  ))}
                </div>

                {campaign.status === 'upcoming' || campaign.status === 'ongoing' ? (
                  isRegistered(campaign) ? (
                    <Button variant="secondary" disabled className="w-full">
                      <CheckCircle className="w-4 h-4 mr-2" /> Registered
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => handleRSVP(campaign.id)}>
                      Register for Campaign
                    </Button>
                  )
                ) : (
                  <Button variant="secondary" disabled className="w-full">
                    Campaign Ended
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
