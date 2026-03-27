import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BloodRequest, Donation, Campaign, Notification, BloodInventory, Hospital, Donor, BloodGroup, RequestStatus, DonationStatus } from '../types';
import type { DatabaseBloodRequest, DatabaseDonation, DatabaseInventory, DatabaseCampaign } from '../types/database';
import { supabase } from '../lib/supabase';

export type RealtimeStatus = 'connected' | 'connecting' | 'error' | 'disconnected';

interface DataState {
  requests: BloodRequest[];
  donations: Donation[];
  campaigns: Campaign[];
  notifications: Notification[];
  inventory: BloodInventory[];
  hospitals: Hospital[];
  donors: Donor[];
  
  // Status tracking
  isLoading: boolean;
  error: string | null;
  connectionStatus: RealtimeStatus;

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

const mapBloodRequest = (dbReq: DatabaseBloodRequest): BloodRequest => ({
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
  priority: dbReq.priority as any,
  status: dbReq.status,
  assignedDonorId: dbReq.assigned_donor_id,
  assignedDonorName: dbReq.assigned_donor_name,
  createdAt: new Date(dbReq.created_at),
  updatedAt: new Date(dbReq.updated_at),
  timeline: [], 
});

const mapDonation = (dbDon: DatabaseDonation): Donation => ({
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

const mapInventory = (dbInv: DatabaseInventory): BloodInventory => ({
  id: dbInv.id,
  hospitalId: dbInv.hospital_id,
  bloodGroup: dbInv.blood_group,
  units: dbInv.units,
  expiryDate: new Date(dbInv.expiry_date),
  lastUpdated: new Date(dbInv.last_updated),
});

const mapCampaign = (dbCamp: DatabaseCampaign): Campaign => ({
  id: dbCamp.id,
  hospitalId: dbCamp.hospital_id,
  hospitalName: dbCamp.hospital_name,
  name: dbCamp.name,
  description: dbCamp.description,
  location: dbCamp.location,
  startDate: new Date(dbCamp.start_date),
  endDate: new Date(dbCamp.end_date),
  targetBloodGroups: dbCamp.target_blood_groups || [],
  targetUnits: dbCamp.target_units,
  collectedUnits: dbCamp.collected_units || 0,
  attendees: dbCamp.attendees || [],
  status: dbCamp.status as any,
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
      isLoading: false,
      error: null,
      connectionStatus: 'disconnected',

      subscribeToRealtime: () => {
        if (!supabase) return;
        
        set({ connectionStatus: 'connecting' });

        const channel = supabase
          .channel('db-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_requests' }, () => get().fetchInitialData())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, () => get().fetchInitialData())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_inventory' }, () => get().fetchInitialData())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, () => get().fetchInitialData())
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              set({ connectionStatus: 'connected' });
            } else if (status === 'CHANNEL_ERROR') {
              set({ connectionStatus: 'error' });
              // Fallback to polling or manual refresh if needed
              setTimeout(() => get().fetchInitialData(), 5000);
            }
          });

        return () => {
          supabase.removeChannel(channel);
        };
      },

      fetchInitialData: async () => {
        if (!supabase) return;
        set({ isLoading: true, error: null });
        
        try {
          const [reqRes, donRes, invRes, campRes] = await Promise.all([
            supabase.from('blood_requests').select('*').order('created_at', { ascending: false }),
            supabase.from('donations').select('*').order('created_at', { ascending: false }),
            supabase.from('blood_inventory').select('*'),
            supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
          ]);

          if (reqRes.error) throw reqRes.error;
          if (donRes.error) throw donRes.error;
          if (invRes.error) throw invRes.error;
          if (campRes.error) throw campRes.error;

          set({ 
            requests: (reqRes.data as DatabaseBloodRequest[]).map(mapBloodRequest),
            donations: (donRes.data as DatabaseDonation[]).map(mapDonation),
            inventory: (invRes.data as DatabaseInventory[]).map(mapInventory),
            campaigns: (campRes.data as DatabaseCampaign[]).map(mapCampaign),
          });
          
          const { data: profiles, error: profileError } = await supabase.from('profiles').select('*');
          if (profileError) throw profileError;
          
          if (profiles) {
            const hospitalProfiles = profiles.filter(p => p.role === 'hospital');
            const donorProfiles = profiles.filter(p => p.role === 'donor');

            if (hospitalProfiles.length > 0) {
              const { data: hospDetails } = await supabase.from('hospitals').select('*').in('id', hospitalProfiles.map(p => p.id));
              set({
                hospitals: hospitalProfiles.map(p => {
                  const details = hospDetails?.find(h => h.id === p.id);
                  return { ...p, ...details, hospitalName: details?.hospital_name, licenseNumber: details?.license_number, status: details?.status };
                }) as Hospital[]
              });
            }

            if (donorProfiles.length > 0) {
              const { data: donorDetails } = await supabase.from('donors').select('*').in('id', donorProfiles.map(p => p.id));
              set({
                donors: donorProfiles.map(p => {
                  const details = donorDetails?.find(d => d.id === p.id);
                  return { ...p, ...details, bloodGroup: details?.blood_group, points: details?.points, isAvailable: details?.is_available };
                }) as Donor[]
              });
            }
          }
        } catch (error: any) {
          console.error('Error fetching data:', error);
          set({ error: error.message || 'Failed to fetch data' });
        } finally {
          set({ isLoading: false });
        }
      },

      createRequest: async (requestData) => {
        if (!supabase) throw new Error('Supabase client not initialized');
        
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
        if (error) throw error;
        
        const newRequest = mapBloodRequest(data as DatabaseBloodRequest);
        set((state) => ({ requests: [newRequest, ...state.requests] }));
        return newRequest;
      },

      updateRequestStatus: async (id, status, message) => {
        if (!supabase) return;
        const { error } = await supabase.from('blood_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
        if (error) throw error;

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
        if (!supabase) return;
        const { error } = await supabase.from('blood_requests').update({
          status: 'donor_assigned',
          assigned_donor_id: donorId,
          assigned_donor_name: donorName,
          updated_at: new Date().toISOString()
        }).eq('id', requestId);
        
        if (error) throw error;

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
        if (!supabase) throw new Error('Supabase client not initialized');
        
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
        if (error) throw error;

        const newDonation = mapDonation(data as DatabaseDonation);
        set((state) => ({ donations: [newDonation, ...state.donations] }));
        return newDonation;
      },

      updateDonationStatus: async (id, status, points = 0) => {
        if (!supabase) return;
        const updatePayload: any = { status, points_earned: points };
        if (status === 'completed') {
          updatePayload.completed_date = new Date().toISOString();
        }
        const { error } = await supabase.from('donations').update(updatePayload).eq('id', id);
        if (error) throw error;

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
        if (!supabase) throw new Error('Supabase client not initialized');
        
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
        if (error) throw error;

        const newCampaign = mapCampaign(data as DatabaseCampaign);
        set((state) => ({ campaigns: [newCampaign, ...state.campaigns] }));
        return newCampaign;
      },

      updateCampaign: async (id, data) => {
        if (!supabase) return;
        const { error } = await supabase.from('campaigns').update(data).eq('id', id);
        if (error) throw error;

        set((state) => ({
          campaigns: state.campaigns.map((camp) =>
            camp.id === id ? { ...camp, ...data } : camp
          ),
        }));
      },

      rsvpCampaign: async (campaignId, donorId) => {
        if (!supabase) return;
        const { data: camp, error: fetchError } = await supabase.from('campaigns').select('attendees').eq('id', campaignId).single();
        if (fetchError) throw fetchError;
        
        if (camp && !camp.attendees?.includes(donorId)) {
          const newAttendees = [...(camp.attendees || []), donorId];
          const { error: updateError } = await supabase.from('campaigns').update({ attendees: newAttendees }).eq('id', campaignId);
          if (updateError) throw updateError;
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
        if (!supabase) return;
        const { data: existing, error: fetchError } = await supabase.from('blood_inventory').select('id').eq('hospital_id', hospitalId).eq('blood_group', bloodGroup).maybeSingle();
        if (fetchError) throw fetchError;

        if (existing) {
          const { error } = await supabase.from('blood_inventory').update({ units, last_updated: new Date().toISOString() }).eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('blood_inventory').insert({
            hospital_id: hospitalId,
            blood_group: bloodGroup,
            units,
            expiry_date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString()
          });
          if (error) throw error;
        }
      },

      approveHospital: async (id) => {
        if (!supabase) return;
        const { error: hError } = await supabase.from('hospitals').update({ status: 'active', verified_at: new Date().toISOString() }).eq('id', id);
        const { error: pError } = await supabase.from('profiles').update({ is_verified: true }).eq('id', id);
        
        if (hError) throw hError;
        if (pError) throw pError;

        set((state) => ({
          hospitals: state.hospitals.map((h) =>
            h.id === id ? { ...h, status: 'active', verifiedAt: new Date(), isVerified: true } : h
          ),
        }));
      },

      rejectHospital: async (id) => {
        if (!supabase) return;
        const { error } = await supabase.from('hospitals').update({ status: 'rejected' }).eq('id', id);
        if (error) throw error;

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
      partialize: (state) => ({
        notifications: state.notifications,
      }),
    }
  )
);
