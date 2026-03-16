import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BloodRequest, Donation, Campaign, Notification, BloodInventory, Hospital, Donor, BloodGroup, RequestStatus, DonationStatus } from '../types';
import { supabase } from '../lib/supabase';

interface DataState {
  requests: BloodRequest[];
  donations: Donation[];
  campaigns: Campaign[];
  notifications: Notification[];
  inventory: BloodInventory[];
  hospitals: Hospital[];
  donors: Donor[];

  // Realtime
  subscribeToRealtime: () => void;
  fetchInitialData: () => Promise<void>;

  // Request actions
  createRequest: (request: Omit<BloodRequest, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'status'>) => Promise<BloodRequest>;
  updateRequestStatus: (id: string, status: RequestStatus, message?: string) => Promise<void>;
  assignDonor: (requestId: string, donorId: string, donorName: string) => Promise<void>;

  // Donation actions
  createDonation: (donation: Omit<Donation, 'id' | 'createdAt' | 'pointsEarned'>) => Promise<Donation>;
  updateDonationStatus: (id: string, status: DonationStatus, points?: number) => Promise<void>;

  // Campaign actions
  createCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'collectedUnits' | 'attendees' | 'status'>) => Promise<Campaign>;
  updateCampaign: (id: string, data: Partial<Campaign>) => Promise<void>;
  rsvpCampaign: (campaignId: string, donorId: string) => Promise<void>;

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: (userId: string) => Promise<void>;

  // Inventory actions
  updateInventory: (hospitalId: string, bloodGroup: BloodGroup, units: number) => Promise<void>;

  // Hospital & Donor actions
  approveHospital: (id: string) => Promise<void>;
  rejectHospital: (id: string) => Promise<void>;
  addHospital: (hospital: Hospital) => Promise<void>;
  addDonor: (donor: Donor) => Promise<void>;
}

const mapBloodRequest = (dbReq: any): BloodRequest => ({
  id: dbReq.id,
  requesterId: dbReq.requester_id,
  requesterName: dbReq.requester_name,
  patientName: dbReq.patient_name,
  bloodGroup: dbReq.blood_group,
  units: dbReq.units,
  hospitalId: dbReq.hospital_id,
  hospitalName: dbReq.hospital_name,
  location: dbReq.location,
  dateNeeded: new Date(dbReq.date_needed),
  reason: dbReq.reason,
  prescription: dbReq.prescription,
  priority: dbReq.priority,
  status: dbReq.status,
  assignedDonorId: dbReq.assigned_donor_id,
  assignedDonorName: dbReq.assigned_donor_name,
  createdAt: new Date(dbReq.created_at),
  updatedAt: new Date(dbReq.updated_at),
  timeline: [], // Keeping simple for now, can be a separate table or jsonb
});

const mapDonation = (dbDon: any): Donation => ({
  id: dbDon.id,
  donorId: dbDon.donor_id,
  donorName: dbDon.donor_name,
  hospitalId: dbDon.hospital_id,
  hospitalName: dbDon.hospital_name,
  requestId: dbDon.request_id,
  bloodGroup: dbDon.blood_group,
  units: dbDon.units,
  status: dbDon.status,
  scheduledDate: new Date(dbDon.scheduled_date),
  completedDate: dbDon.completed_date ? new Date(dbDon.completed_date) : undefined,
  pointsEarned: dbDon.points_earned,
  notes: dbDon.notes,
  createdAt: new Date(dbDon.created_at),
});

const mapInventory = (dbInv: any): BloodInventory => ({
  id: dbInv.id,
  hospitalId: dbInv.hospital_id,
  bloodGroup: dbInv.blood_group,
  units: dbInv.units,
  expiryDate: new Date(dbInv.expiry_date),
  lastUpdated: new Date(dbInv.last_updated),
});

const mapCampaign = (dbCamp: any): Campaign => ({
  id: dbCamp.id,
  hospitalId: dbCamp.hospital_id,
  hospitalName: dbCamp.hospital_name,
  name: dbCamp.name,
  description: dbCamp.description,
  location: dbCamp.location,
  startDate: new Date(dbCamp.start_date),
  endDate: new Date(dbCamp.end_date),
  targetBloodGroups: dbCamp.target_blood_groups,
  targetUnits: dbCamp.target_units,
  collectedUnits: dbCamp.collected_units,
  attendees: dbCamp.attendees || [],
  status: dbCamp.status,
  createdAt: new Date(dbCamp.created_at),
});

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      requests: [],
      donations: [],
      campaigns: [],
      notifications: [],
      inventory: [],
      hospitals: [],
      donors: [],

      subscribeToRealtime: () => {
        supabase
          .channel('public:blood_requests')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_requests' }, () => {
            get().fetchInitialData();
          })
          .subscribe();

        supabase
          .channel('public:donations')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, () => {
            get().fetchInitialData();
          })
          .subscribe();

        supabase
          .channel('public:blood_inventory')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_inventory' }, () => {
            get().fetchInitialData();
          })
          .subscribe();

        supabase
          .channel('public:campaigns')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, () => {
            get().fetchInitialData();
          })
          .subscribe();
      },

      fetchInitialData: async () => {
        try {
          const [reqRes, donRes, invRes, campRes] = await Promise.all([
            supabase.from('blood_requests').select('*').order('created_at', { ascending: false }),
            supabase.from('donations').select('*').order('created_at', { ascending: false }),
            supabase.from('blood_inventory').select('*'),
            supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
          ]);

          if (reqRes.data) set({ requests: reqRes.data.map(mapBloodRequest) });
          if (donRes.data) set({ donations: donRes.data.map(mapDonation) });
          if (invRes.data) set({ inventory: invRes.data.map(mapInventory) });
          if (campRes.data) set({ campaigns: campRes.data.map(mapCampaign) });
        } catch (error) {
          console.error('Error fetching data from Supabase:', error);
        }
      },

      createRequest: async (requestData) => {
        const dbPayload = {
          requester_id: requestData.requesterId,
          requester_name: requestData.requesterName,
          patient_name: requestData.patientName,
          blood_group: requestData.bloodGroup,
          units: requestData.units,
          hospital_id: requestData.hospitalId,
          hospital_name: requestData.hospitalName,
          location: requestData.location,
          date_needed: requestData.dateNeeded.toISOString(),
          reason: requestData.reason,
          prescription: requestData.prescription,
          priority: requestData.priority,
          status: 'pending'
        };

        const { data, error } = await supabase.from('blood_requests').insert(dbPayload).select().single();

        let newRequest: BloodRequest;
        if (data) {
          newRequest = mapBloodRequest(data);
        } else {
          // Fallback to local
          console.error('Supabase error:', error);
          newRequest = {
            ...requestData,
            id: `req-${Date.now()}`,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            timeline: [
              { id: '1', status: 'pending', message: 'Request created', timestamp: new Date() },
            ],
          };
        }

        set((state) => ({ requests: [newRequest, ...state.requests] }));
        return newRequest;
      },

      updateRequestStatus: async (id, status, message) => {
        await supabase.from('blood_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id);

        set((state) => ({
          requests: state.requests.map((req) =>
            req.id === id
              ? {
                ...req,
                status,
                updatedAt: new Date(),
                timeline: [
                  ...req.timeline,
                  { id: String(req.timeline.length + 1), status, message: message || status, timestamp: new Date() },
                ],
              }
              : req
          ),
        }));
      },

      assignDonor: async (requestId, donorId, donorName) => {
        await supabase.from('blood_requests').update({
          status: 'donor_assigned',
          assigned_donor_id: donorId,
          assigned_donor_name: donorName,
          updated_at: new Date().toISOString()
        }).eq('id', requestId);

        set((state) => ({
          requests: state.requests.map((req) =>
            req.id === requestId
              ? {
                ...req,
                status: 'donor_assigned' as RequestStatus,
                assignedDonorId: donorId,
                assignedDonorName: donorName,
                updatedAt: new Date(),
                timeline: [
                  ...req.timeline,
                  { id: String(req.timeline.length + 1), status: 'donor_assigned', message: `Donor ${donorName} assigned`, timestamp: new Date() },
                ],
              }
              : req
          ),
        }));
      },

      createDonation: async (donationData) => {
        const dbPayload = {
          donor_id: donationData.donorId,
          donor_name: donationData.donorName,
          hospital_id: donationData.hospitalId,
          hospital_name: donationData.hospitalName,
          request_id: donationData.requestId,
          blood_group: donationData.bloodGroup,
          units: donationData.units,
          status: donationData.status,
          scheduled_date: donationData.scheduledDate.toISOString(),
          notes: donationData.notes
        };

        const { data, error } = await supabase.from('donations').insert(dbPayload).select().single();

        let newDonation: Donation;
        if (data) {
          newDonation = mapDonation(data);
        } else {
          console.error('Supabase error:', error);
          newDonation = {
            ...donationData,
            id: `don-${Date.now()}`,
            pointsEarned: 0,
            createdAt: new Date(),
          };
        }
        set((state) => ({ donations: [newDonation, ...state.donations] }));
        return newDonation;
      },

      updateDonationStatus: async (id, status, points = 0) => {
        const updatePayload: any = { status, points_earned: points };
        if (status === 'completed') {
          updatePayload.completed_date = new Date().toISOString();
        }
        await supabase.from('donations').update(updatePayload).eq('id', id);

        set((state) => ({
          donations: state.donations.map((don) =>
            don.id === id
              ? {
                ...don,
                status,
                pointsEarned: points,
                completedDate: status === 'completed' ? new Date() : don.completedDate,
              }
              : don
          ),
        }));
      },

      createCampaign: async (campaignData) => {
        const dbPayload = {
          hospital_id: campaignData.hospitalId,
          hospital_name: campaignData.hospitalName,
          name: campaignData.name,
          description: campaignData.description,
          location: campaignData.location,
          start_date: campaignData.startDate.toISOString(),
          end_date: campaignData.endDate.toISOString(),
          target_blood_groups: campaignData.targetBloodGroups,
          target_units: campaignData.targetUnits,
          status: 'upcoming'
        };

        const { data, error } = await supabase.from('campaigns').insert(dbPayload).select().single();

        let newCampaign: Campaign;
        if (data) {
          newCampaign = mapCampaign(data);
        } else {
          console.error('Supabase error:', error);
          newCampaign = {
            ...campaignData,
            id: `camp-${Date.now()}`,
            collectedUnits: 0,
            attendees: [],
            status: 'upcoming',
            createdAt: new Date(),
          };
        }
        set((state) => ({ campaigns: [newCampaign, ...state.campaigns] }));
        return newCampaign;
      },

      updateCampaign: async (id, data) => {
        // Simple mapping, might need more specific column mapping in real app
        await supabase.from('campaigns').update(data).eq('id', id);

        set((state) => ({
          campaigns: state.campaigns.map((camp) =>
            camp.id === id ? { ...camp, ...data } : camp
          ),
        }));
      },

      rsvpCampaign: async (campaignId, donorId) => {
        const { data: camp } = await supabase.from('campaigns').select('attendees').eq('id', campaignId).single();
        if (camp && !camp.attendees?.includes(donorId)) {
          const newAttendees = [...(camp.attendees || []), donorId];
          await supabase.from('campaigns').update({ attendees: newAttendees }).eq('id', campaignId);
        }

        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === campaignId && !c.attendees.includes(donorId)
              ? { ...c, attendees: [...c.attendees, donorId] }
              : c
          ),
        }));
      },

      addNotification: async (notificationData) => {
        const newNotification: Notification = {
          ...notificationData,
          id: `notif-${Date.now()}`,
          isRead: false,
          createdAt: new Date(),
        };
        set((state) => ({ notifications: [newNotification, ...state.notifications] }));
      },

      markNotificationRead: async (id) => {
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === id ? { ...notif, isRead: true } : notif
          ),
        }));
      },

      markAllNotificationsRead: async (userId) => {
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.userId === userId ? { ...notif, isRead: true } : notif
          ),
        }));
      },

      updateInventory: async (hospitalId, bloodGroup, units) => {
        const { data: existing } = await supabase.from('blood_inventory').select('id').eq('hospital_id', hospitalId).eq('blood_group', bloodGroup).single();

        if (existing) {
          await supabase.from('blood_inventory').update({ units, last_updated: new Date().toISOString() }).eq('id', existing.id);
        } else {
          await supabase.from('blood_inventory').insert({
            hospital_id: hospitalId,
            blood_group: bloodGroup,
            units,
            expiry_date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString()
          });
        }

        set((state) => {
          const existingIndex = state.inventory.findIndex(
            (inv) => inv.hospitalId === hospitalId && inv.bloodGroup === bloodGroup
          );
          if (existingIndex >= 0) {
            const newInventory = [...state.inventory];
            newInventory[existingIndex] = {
              ...newInventory[existingIndex],
              units,
              lastUpdated: new Date(),
            };
            return { inventory: newInventory };
          } else {
            return {
              inventory: [
                ...state.inventory,
                {
                  id: `inv-${Date.now()}`,
                  hospitalId,
                  bloodGroup,
                  units,
                  expiryDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
                  lastUpdated: new Date(),
                },
              ],
            };
          }
        });
      },

      approveHospital: async (id) => {
        await supabase.from('profiles').update({ hospital_status: 'active', is_verified: true }).eq('id', id);

        set((state) => ({
          hospitals: state.hospitals.map((h) =>
            h.id === id ? { ...h, status: 'active', verifiedAt: new Date(), isVerified: true } : h
          ),
        }));
      },

      rejectHospital: async (id) => {
        await supabase.from('profiles').update({ hospital_status: 'rejected' }).eq('id', id);

        set((state) => ({
          hospitals: state.hospitals.map((h) =>
            h.id === id ? { ...h, status: 'rejected' } : h
          ),
        }));
      },

      addHospital: async (hospital) => {
        set((state) => ({ hospitals: [...state.hospitals, hospital] }));
      },

      addDonor: async (donor) => {
        set((state) => ({ donors: [...state.donors, donor] }));
      },
    }),
    {
      name: 'hemalink-data',
    }
  )
);
