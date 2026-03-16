import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Droplets, Clock } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function CampaignsPage() {
  const { campaigns } = useDataStore();
  
  // Filter out cancelled campaigns - they should not be shown to public
  const activeCampaigns = campaigns.filter(c => c.status !== 'cancelled');
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="info">Upcoming</Badge>;
      case 'ongoing':
        return <Badge variant="success">Ongoing</Badge>;
      case 'completed':
        return <Badge>Completed</Badge>;
      default:
        return <Badge variant="danger">Cancelled</Badge>;
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-rose-600 to-red-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Blood Donation Campaigns
            </h1>
            <p className="text-xl text-rose-100 max-w-3xl mx-auto">
              Join our upcoming blood donation drives and help save lives in your community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Campaigns List */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <Droplets className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No Campaigns Yet</h3>
              <p className="text-slate-600">Check back soon for upcoming blood donation campaigns.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCampaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover className="h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                        <Calendar className="w-6 h-6" />
                      </div>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">{campaign.name}</h3>
                    <p className="text-slate-600 text-sm mb-4 flex-1">{campaign.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="w-4 h-4" />
                        <span>{campaign.location.city}, {campaign.location.state}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(campaign.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Users className="w-4 h-4" />
                        <span>{campaign.attendees.length} registered</span>
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

                    {campaign.status === 'upcoming' || campaign.status === 'ongoing' ? (
                      <Button
                        onClick={() => {
                          if (!isAuthenticated) {
                            navigate('/login');
                          } else if (user?.role === 'donor') {
                            navigate('/donor/campaigns');
                          } else {
                            navigate('/signup');
                          }
                        }}
                        className="w-full"
                      >
                        Register Now
                      </Button>
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
      </section>
    </div>
  );
}
