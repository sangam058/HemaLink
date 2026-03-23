import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole, BloodGroup } from '../types';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  registeredUsers: Record<string, any>; // Keeping for backward compatibility if any component uses it directly
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  initialize: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<User | null>;
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      registeredUsers: {},

      initialize: async () => {
        if (!supabase) return;

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const mappedUser = await get().fetchProfile(session.user.id);
          if (mappedUser) {
            set({ user: mappedUser, isAuthenticated: true });
          }
        }

        supabase.auth.onAuthStateChange(async (event: any, session: any) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const mappedUser = await get().fetchProfile(session.user.id);
            if (mappedUser) {
              set({ user: mappedUser, isAuthenticated: true });
            }
          } else if (event === 'SIGNED_OUT') {
            set({ user: null, isAuthenticated: false });
          }
        });
      },

      fetchProfile: async (userId: string): Promise<User | null> => {
        const roleQueryMap: Record<UserRole, string> = {
          donor: 'donors(*)',
          requester: 'requesters(*)',
          hospital: 'hospitals(*)',
          admin: 'admins(*)'
        };

        const { data: profile, error } = await supabase
          .from('profiles')
          .select(`*, ${Object.values(roleQueryMap).join(', ')}`)
          .eq('id', userId)
          .single();

        if (error || !profile) return null;

        const roleData = profile.donors?.[0] || profile.requesters?.[0] || profile.hospitals?.[0] || profile.admins?.[0] || {};
        
        return {
          ...profile,
          ...roleData,
          bloodGroup: roleData.blood_group,
          hospitalName: roleData.hospital_name,
          licenseNumber: roleData.license_number,
          isVerified: profile.is_verified,
          createdAt: new Date(profile.created_at),
          totalDonations: roleData.total_donations,
          lastDonationDate: roleData.last_donation_date ? new Date(roleData.last_donation_date) : undefined,
          isAvailable: roleData.is_available,
          emergencyContact: roleData.emergency_contact
        } as User;
      },

      login: async (email: string, password: string, role: UserRole) => {
        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!error && data.user) {
            const mappedUser = await get().fetchProfile(data.user.id);
            if (mappedUser && mappedUser.role === role) {
              set({ user: mappedUser, isAuthenticated: true });
              return true;
            } else {
              await supabase.auth.signOut();
              return false;
            }
          }
        }
        return false;
      },

      signup: async (data: SignupData) => {
        if (supabase) {
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

          if (!error && authData.user) {
            // Re-fetch profile and role data (trigger should have handled inserts)
            const mappedUser = await get().fetchProfile(authData.user.id);
            if (mappedUser) {
              set({ user: mappedUser, isAuthenticated: true });
            }
            return true;
          }
          console.error('Supabase signup error:', error);
        }
        return false;
      },

      logout: async () => {
        if (supabase) {
          await supabase.auth.signOut();
        }
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('hemalink-auth');
        window.location.href = '/login';
      },

      updateProfile: async (data: any) => {
        const { user } = get();
        if (user) {
          const updateData: any = { ...data };
          if (data.bloodGroup) updateData.blood_group = data.bloodGroup;
          if (data.hospitalName) updateData.hospital_name = data.hospitalName;
          if (data.licenseNumber) updateData.license_number = data.licenseNumber;

          delete updateData.bloodGroup;
          delete updateData.hospitalName;
          delete updateData.licenseNumber;
          delete updateData.isVerified;
          delete updateData.createdAt;

          await supabase.from('profiles').update(updateData).eq('id', user.id);
          const updatedUser = { ...user, ...data };
          set({ user: updatedUser });
        }
      },
    }),
    {
      name: 'hemalink-auth',
    }
  )
);
