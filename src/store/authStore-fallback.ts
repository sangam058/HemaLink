// FALLBACK AUTH STORE - Frontend Profile Creation
// Use this if trigger continues to fail

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole, BloodGroup } from '../types';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  initialize: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<User | null>;
  createProfileManually: (userId: string, metadata: any) => Promise<boolean>;
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

export const useAuthStoreFallback = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      error: null,

      clearError: () => set({ error: null }),

      initialize: async () => {
        try {
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
        } catch (error) {
          console.error('Auth initialization error:', error);
        }
      },

      fetchProfile: async (userId: string): Promise<User | null> => {
        try {
          // 1. Get the base profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (profileError) {
            console.error('❌ Profile fetch error:', profileError);
            return null;
          }

          if (!profile) {
            console.warn('⚠️ No profile found for user:', userId);
            return null;
          }

          // 2. Get role-specific data
          const roleTableMap: Record<UserRole, string> = {
            donor: 'donors',
            requester: 'requesters',
            hospital: 'hospitals',
            admin: 'admins'
          };

          const tableName = roleTableMap[profile.role as UserRole];
          let roleData = {};

          if (tableName) {
            const { data: roleSpecific, error: roleError } = await supabase
              .from(tableName as any)
              .select('*')
              .eq('id', userId)
              .single();
            
            if (roleError) {
              console.warn(`⚠️ Role data fetch error for ${tableName}:`, roleError);
            } else if (roleSpecific) {
              roleData = roleSpecific;
            }
          }

          // 3. Merge and return as User
          const userData = profile as any;
          const mappedUser = {
            ...userData,
            ...roleData,
            bloodGroup: (roleData as any).blood_group,
            hospitalName: (roleData as any).hospital_name,
            licenseNumber: (roleData as any).license_number,
            isVerified: userData.is_verified,
            createdAt: new Date(userData.created_at),
            totalDonations: (roleData as any).total_donations,
            lastDonationDate: (roleData as any).last_donation_date ? new Date((roleData as any).last_donation_date) : undefined,
            isAvailable: (roleData as any).is_available,
            emergencyContact: (roleData as any).emergency_contact
          } as User;

          return mappedUser;
        } catch (error) {
          console.error('❌ Unexpected error in fetchProfile:', error);
          return null;
        }
      },

      // Manual profile creation as fallback
      createProfileManually: async (userId: string, metadata: any): Promise<boolean> => {
        try {
          console.log('🔧 Creating profile manually for user:', userId);
          
          // Create base profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: metadata.email || '',
              name: metadata.name || 'New User',
              phone: metadata.phone || '',
              role: metadata.role || 'donor',
              location: metadata.location || { city: 'Mumbai', address: 'Not provided' },
              is_verified: false
            });

          if (profileError) {
            console.error('❌ Manual profile creation failed:', profileError);
            return false;
          }

          // Create role-specific data
          if (metadata.role === 'donor') {
            const { error: donorError } = await supabase
              .from('donors')
              .insert({
                id: userId,
                blood_group: metadata.bloodGroup || 'O+',
                points: 0,
                level: 1,
                badges: [],
                total_donations: 0,
                is_available: true
              });

            if (donorError) {
              console.error('❌ Manual donor data creation failed:', donorError);
            }
          }

          console.log('✅ Manual profile creation successful');
          return true;
        } catch (error) {
          console.error('❌ Manual profile creation error:', error);
          return false;
        }
      },

      login: async (email: string, password: string, role: UserRole) => {
        set({ error: null });
        
        // Hardcoded admin login
        if (email === 'sangam@gmail.com' && password === 'sangam362004' && role === 'admin') {
          const adminUser: User = {
            id: 'admin-hardcoded-id',
            email: 'sangam@gmail.com',
            name: 'System Admin',
            role: 'admin',
            phone: '',
            location: {
              address: 'HQ',
              city: '',
              state: '',
              country: '',
            },
            isVerified: true,
            createdAt: new Date(),
          };
          set({ user: adminUser, isAuthenticated: true });
          return true;
        }

        // Normal login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          set({ error: error.message });
          return false;
        }

        if (data.user) {
          const mappedUser = await get().fetchProfile(data.user.id);
          if (mappedUser && mappedUser.role === role) {
            set({ user: mappedUser, isAuthenticated: true });
            return true;
          } else if (mappedUser) {
            set({ error: `Please log in using the ${mappedUser.role} tab.` });
            await supabase.auth.signOut();
            return false;
          } else {
            // No profile found - try to create it
            const { data: { user } } = await supabase.auth.getUser(data.user.id);
            if (user?.user_metadata) {
              const success = await get().createProfileManually(data.user.id, user.user_metadata);
              if (success) {
                const retryUser = await get().fetchProfile(data.user.id);
                if (retryUser) {
                  set({ user: retryUser, isAuthenticated: true });
                  return true;
                }
              }
            }
            
            set({ error: 'Profile not found. Please contact support.' });
            await supabase.auth.signOut();
            return false;
          }
        }
        return false;
      },

      signup: async (data: SignupData) => {
        set({ error: null });
        
        try {
          console.log('🚀 Starting signup for:', data.email, 'as', data.role);

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

          if (error) {
            console.error('❌ Signup error:', error);
            set({ error: error.message });
            return false;
          }

          if (authData.user) {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
              set({ error: 'Registration successful! Please check your email to verify your account before logging in.' });
              return true;
            }

            // Try to get profile - if trigger fails, create manually
            let mappedUser = null;
            for (let i = 0; i < 5; i++) {
              mappedUser = await get().fetchProfile(authData.user.id);
              if (mappedUser) break;
              await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); 
            }

            if (mappedUser) {
              set({ user: mappedUser, isAuthenticated: true });
              console.log('🎉 Registration and profile setup complete!');
              return true;
            } else {
              // Fallback: create profile manually
              console.log('🔧 Trigger failed, creating profile manually...');
              const success = await get().createProfileManually(authData.user.id, {
                email: data.email,
                name: data.name,
                phone: data.phone,
                role: data.role,
                location: data.location,
                bloodGroup: data.bloodGroup,
                hospitalName: data.hospitalName,
                licenseNumber: data.licenseNumber,
                emergencyContact: data.emergencyContact
              });

              if (success) {
                const retryUser = await get().fetchProfile(authData.user.id);
                if (retryUser) {
                  set({ user: retryUser, isAuthenticated: true });
                  console.log('🎉 Manual profile creation successful!');
                  return true;
                }
              }

              set({ error: 'Account created, but profile setup failed. Please try logging in manually.' });
              return true; // Still return true as account was created
            }
          }
          return false;
        } catch (error) {
          console.error('❌ Unexpected signup error:', error);
          set({ error: 'Registration failed due to an unexpected error. Please try again.' });
          return false;
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('hemalink-auth');
        window.location.href = '/';
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
      name: 'hemalink-auth-fallback',
    }
  )
);
