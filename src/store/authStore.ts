import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole, BloodGroup } from '../types';
import type { DatabaseProfile } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  initialize: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<User | null>;
  clearError: () => void;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
  bloodGroup?: BloodGroup;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  hospitalName?: string;
  licenseNumber?: string;
  emergencyContact?: string;
}

const mapDatabaseProfileToUser = (profile: DatabaseProfile, roleData: any): User => {
  const user: User = {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    phone: profile.phone,
    role: profile.role as UserRole,
    isVerified: profile.is_verified,
    avatar: profile.avatar_url,
    createdAt: new Date(profile.created_at),
    location: (profile as any).location,
    bloodGroup: roleData.blood_group,
    points: roleData.points,
    level: roleData.level || 1,
    badges: roleData.badges || [],
    totalDonations: roleData.total_donations || 0,
    lastDonationDate: roleData.last_donation_date ? new Date(roleData.last_donation_date) : undefined,
    isAvailable: roleData.is_available ?? true,
    hospitalName: roleData.hospital_name,
    licenseNumber: roleData.license_number,
    status: roleData.status,
    emergencyContact: roleData.emergency_contact,
  };
  return user;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      initialize: async () => {
        if (!isSupabaseConfigured) return;

        set({ isLoading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const user = await get().fetchProfile(session.user.id);
            if (user) {
              set({ user, isAuthenticated: true });
            }
          }

          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const user = await get().fetchProfile(session.user.id);
              if (user) set({ user, isAuthenticated: true });
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, isAuthenticated: false, error: null });
            }
          });
        } catch (error: any) {
          console.error('Auth init error:', error);
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchProfile: async (userId: string): Promise<User | null> => {
        try {
          const { data: profile, error: pError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (pError) throw pError;
          if (!profile) return null;

          const roleTableMap: Record<string, string> = {
            donor: 'donors',
            requester: 'requesters',
            hospital: 'hospitals',
            admin: 'admins'
          };

          const tableName = roleTableMap[profile.role];
          let roleData = {};

          if (tableName) {
            const { data: rData, error: rError } = await supabase
              .from(tableName as any)
              .select('*')
              .eq('id', userId)
              .single();
            
            if (!rError && rData) {
              roleData = rData;
            }
          }

          return mapDatabaseProfileToUser(profile as DatabaseProfile, roleData);
        } catch (error) {
          console.error('Fetch profile error:', error);
          return null;
        }
      },

      login: async (email, password, role) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;

          if (data.user) {
            const user = await get().fetchProfile(data.user.id);
            if (user && user.role === role) {
              set({ user, isAuthenticated: true });
              return true;
            } else if (user) {
              set({ error: `Incorrect role. Please log in as ${user.role}.` });
              await supabase.auth.signOut();
            } else {
              set({ error: 'Profile not found.' });
              await supabase.auth.signOut();
            }
          }
          return false;
        } catch (error: any) {
          set({ error: error.message });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                name: data.name,
                phone: data.phone,
                role: data.role,
                location: data.location,
                bloodGroup: data.bloodGroup,
                hospitalName: data.hospitalName,
                licenseNumber: data.licenseNumber,
                emergencyContact: data.emergencyContact
              }
            }
          });

          if (error) throw error;

          if (authData.user) {
            // Give the trigger a moment, then fetch
            for (let i = 0; i < 5; i++) {
              await new Promise(r => setTimeout(r, 1000 * (i + 1)));
              const user = await get().fetchProfile(authData.user!.id);
              if (user) {
                set({ user, isAuthenticated: true });
                return true;
              }
            }
            return true; // Auth success, profile might take longer
          }
          return false;
        } catch (error: any) {
          set({ error: error.message });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('hemalink-auth');
        window.location.href = '/';
      },

      updateProfile: async (data) => {
        const { user } = get();
        if (!user) return;

        try {
          const { error } = await supabase.from('profiles').update(data).eq('id', user.id);
          if (error) throw error;
          set({ user: { ...user, ...data } });
        } catch (error: any) {
          set({ error: error.message });
        }
      },
    }),
    {
      name: 'hemalink-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
