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
}

// Default admin user (always available)
const defaultAdmin = {
  id: 'admin-1',
  email: 'sangam@gmail.com',
  password: 'sangam362004',
  name: 'Sangam Admin',
  phone: '+91 9999999999',
  role: 'admin' as UserRole,
  location: { address: 'HQ', city: 'New Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
  permissions: ['all'],
  createdAt: new Date(),
  isVerified: true,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      registeredUsers: { [defaultAdmin.email]: defaultAdmin },

      initialize: async () => {
        if (!supabase) return;

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const mappedUser = {
              ...profile,
              bloodGroup: profile.blood_group,
              hospitalName: profile.hospital_name,
              licenseNumber: profile.license_number,
              isVerified: profile.is_verified,
              createdAt: profile.created_at,
              totalDonations: profile.total_donations,
              lastDonationDate: profile.last_donation_date,
              isAvailable: profile.is_available,
              emergencyContact: profile.emergency_contact
            };
            set({ user: mappedUser as User, isAuthenticated: true });
          }
        }

        supabase.auth.onAuthStateChange(async (event: any, session: any) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              const mappedUser = {
                ...profile,
                bloodGroup: profile.blood_group,
                hospitalName: profile.hospital_name,
                licenseNumber: profile.license_number,
                isVerified: profile.is_verified,
                createdAt: profile.created_at,
                totalDonations: profile.total_donations,
                lastDonationDate: profile.last_donation_date,
                isAvailable: profile.is_available,
                emergencyContact: profile.emergency_contact
              };
              set({ user: mappedUser as User, isAuthenticated: true });
            }
          } else if (event === 'SIGNED_OUT') {
            set({ user: null, isAuthenticated: false });
          }
        });
      },

      login: async (email: string, password: string, role: UserRole) => {
        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!error && data.user) {
            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (profile && profile.role === role) {
              const mappedUser = {
                ...profile,
                bloodGroup: profile.blood_group,
                hospitalName: profile.hospital_name,
                licenseNumber: profile.license_number,
                isVerified: profile.is_verified,
                createdAt: profile.created_at,
                totalDonations: profile.total_donations,
                lastDonationDate: profile.last_donation_date,
                isAvailable: profile.is_available,
                emergencyContact: profile.emergency_contact
              };
              set({ user: mappedUser as User, isAuthenticated: true });
              return true;
            } else {
              // Role mismatch
              await supabase.auth.signOut();
              return false;
            }
          }
          console.error('Supabase login error:', error);
        }

        // Fallback to local mock for demo if Supabase fails or not configured
        const { registeredUsers } = get();
        const normalizedEmail = email.toLowerCase().trim();
        const user = registeredUsers[normalizedEmail] || (normalizedEmail === defaultAdmin.email.toLowerCase() ? defaultAdmin : null);
        
        if (user && user.role === role && user.password === password) {
          const { password: _, ...userWithoutPassword } = user;
          set({ user: userWithoutPassword, isAuthenticated: true });
          return true;
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
              }
            }
          });

          if (!error && authData.user) {
            // If trigger is not active, insert profile manually
            const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', authData.user.id).single();
            if (!existingProfile) {
              await supabase.from('profiles').insert({
                id: authData.user.id,
                email: data.email,
                name: data.name,
                phone: data.phone,
                role: data.role,
                blood_group: data.bloodGroup || null,
                location: data.location,
                hospital_name: data.hospitalName || null,
                license_number: data.licenseNumber || null,
                is_verified: data.role !== 'hospital'
              });
            }

            // Re-fetch profile to set state
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authData.user.id)
              .single();

            if (profile) {
              const mappedUser = {
                ...profile,
                bloodGroup: profile.blood_group,
                hospitalName: profile.hospital_name,
                licenseNumber: profile.license_number,
                isVerified: profile.is_verified,
                createdAt: profile.created_at,
                totalDonations: profile.total_donations,
                lastDonationDate: profile.last_donation_date,
                isAvailable: profile.is_available,
                emergencyContact: profile.emergency_contact
              };
              set({ user: mappedUser as User, isAuthenticated: true });
            }
            return true;
          }
          console.error('Supabase signup error:', error);
        }

        // Fallback to local mock
        const { registeredUsers } = get();
        if (registeredUsers[data.email]) return false;

        const newUser: any = {
          id: `${data.role}-${Date.now()}`,
          email: data.email,
          password: data.password,
          name: data.name,
          phone: data.phone,
          role: data.role,
          location: data.location,
          createdAt: new Date(),
          isVerified: data.role !== 'hospital',
        };

        if (data.role === 'donor') {
          newUser.bloodGroup = data.bloodGroup;
          newUser.points = 0;
          newUser.level = 1;
          newUser.badges = [];
          newUser.totalDonations = 0;
          newUser.isAvailable = true;
          newUser.donations = [];
        } else if (data.role === 'requester') {
          newUser.bloodGroup = data.bloodGroup;
          newUser.requests = [];
        } else if (data.role === 'hospital') {
          newUser.hospitalName = data.hospitalName;
          newUser.licenseNumber = data.licenseNumber;
          newUser.status = 'pending_approval';
          newUser.inventory = [];
        }

        const normalizedEmail = data.email.toLowerCase().trim();
        const updatedUsers = { ...registeredUsers, [normalizedEmail]: newUser };
        const { password: _, ...userWithoutPassword } = newUser;

        set({
          registeredUsers: updatedUsers,
          user: userWithoutPassword,
          isAuthenticated: true
        });
        return true;
      },

      logout: async () => {
        if (supabase) {
          await supabase.auth.signOut();
        }
        set({ user: null, isAuthenticated: true }); // Temporarily set to true to trigger re-renders? No, that's wrong.
        // Actually, the issue might be the persist middleware or the navigate flow.
        // Let's ensure state is cleared and we might need to use window.location for a hard reset if navigate fails.
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('hemalink-auth'); // Force clear persistence
        window.location.href = '/login';
      },

      updateProfile: async (data: any) => {
        const { user } = get();
        if (user) {
          const updateData: any = { ...data };
          // Map JS keys to DB columns
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

          // Fallback update
          const { registeredUsers } = get();
          if (registeredUsers[user.email]) {
            const updatedRegisteredUser = { ...registeredUsers[user.email], ...data };
            set({ registeredUsers: { ...registeredUsers, [user.email]: updatedRegisteredUser } });
          }
        }
      },
    }),
    {
      name: 'hemalink-auth',
    }
  )
);
