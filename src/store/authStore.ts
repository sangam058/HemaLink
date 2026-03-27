import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole, BloodGroup } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  error: string | null;
  registeredUsers: Record<string, any>; // Keeping for backward compatibility if any component uses it directly
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      error: null,
      registeredUsers: {},

      clearError: () => set({ error: null }),

      initialize: async () => {
        if (!isSupabaseConfigured) {
          console.error('❌ Supabase not configured. Cannot initialize auth.');
          return;
        }

        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const mappedUser = await get().fetchProfile(session.user.id);
            if (mappedUser) {
              set({ user: mappedUser, isAuthenticated: true });
            } else {
              console.warn('⚠️ User session found but profile not found. User may need to complete registration.');
              set({ user: null, isAuthenticated: false });
            }
          }

          supabase.auth.onAuthStateChange(async (event: any, session: any) => {
            console.log('🔐 Auth state changed:', event, session?.user?.id);
            
            if (event === 'SIGNED_IN' && session?.user) {
              // Retry profile fetching with exponential backoff
              let mappedUser = null;
              let retries = 0;
              const maxRetries = 5;
              
              while (!mappedUser && retries < maxRetries) {
                mappedUser = await get().fetchProfile(session.user.id);
                if (!mappedUser) {
                  retries++;
                  const delay = Math.min(1000 * Math.pow(2, retries), 5000); // Max 5 seconds
                  await new Promise(resolve => setTimeout(resolve, delay));
                  console.log(`🔄 Retry ${retries}/${maxRetries} for profile fetch...`);
                }
              }

              if (mappedUser) {
                set({ user: mappedUser, isAuthenticated: true });
                console.log('✅ User profile loaded successfully');
              } else {
                console.error('❌ Failed to fetch user profile after retries');
                set({ error: 'Profile not found. Please contact support.', user: null, isAuthenticated: false });
              }
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, isAuthenticated: false, error: null });
            }
          });
        } catch (error) {
          console.error('❌ Auth initialization error:', error);
          set({ error: 'Failed to initialize authentication. Please refresh the page.' });
        }
      },

      fetchProfile: async (userId: string): Promise<User | null> => {
        try {
          console.log('🔍 Fetching profile for user:', userId);
          
          // 1. Get the base profile first to find the role
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (profileError) {
            console.error('❌ Profile fetch error:', profileError);
            
            // If profile doesn't exist, try to create it from auth metadata
            if (profileError.code === 'PGRST116') {
              console.log('🔧 Profile not found, attempting to create from auth metadata...');
              
              const { data: { user } } = await supabase.auth.getUser(userId);
              if (user?.user_metadata) {
                const metadata = user.user_metadata;
                
                // Create base profile
                const { error: createError } = await supabase
                  .from('profiles')
                  .insert({
                    id: userId,
                    email: user.email || '',
                    name: metadata.name || 'New User',
                    phone: metadata.phone || '',
                    role: metadata.role || 'donor',
                    location: metadata.location || { city: 'Mumbai', address: 'Not provided' },
                    is_verified: false
                  });

                if (createError) {
                  console.error('❌ Failed to create profile:', createError);
                  return null;
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
                    console.warn('⚠️ Failed to create donor data:', donorError);
                  }
                }

                console.log('✅ Profile created successfully from auth metadata');
                return get().fetchProfile(userId); // Retry fetching
              }
            }
            return null;
          }

          if (!profile) {
            console.warn('⚠️ No profile found for user:', userId);
            return null;
          }

          console.log('✅ Base profile found:', profile.role);

          // 2. Map role to specific table
          const roleTableMap: Record<UserRole, string> = {
            donor: 'donors',
            requester: 'requesters',
            hospital: 'hospitals',
            admin: 'admins'
          };

          const tableName = roleTableMap[profile.role as UserRole];
          let roleData = {};

          // 3. Only fetch role data if we have a valid table name
          if (tableName) {
            const { data: roleSpecific, error: roleError } = await supabase
              .from(tableName as any)
              .select('*')
              .eq('id', userId)
              .single();
            
            if (roleError) {
              console.warn(`⚠️ Role data fetch error for ${tableName}:`, roleError);
              
              // If role data doesn't exist, create it
              if (roleError.code === 'PGRST116' && profile.role === 'donor') {
                console.log('🔧 Creating missing donor data...');
                const { error: createDonorError } = await supabase
                  .from('donors')
                  .insert({
                    id: userId,
                    blood_group: 'O+',
                    points: 0,
                    level: 1,
                    badges: [],
                    total_donations: 0,
                    is_available: true
                  });
                
                if (createDonorError) {
                  console.warn('⚠️ Failed to create donor data:', createDonorError);
                }
              }
            } else if (roleSpecific) {
              roleData = roleSpecific;
              console.log(`✅ Role data found for ${tableName}`);
            }
          }

          // 4. Merge and return as User
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

          console.log('✅ User profile mapped successfully:', mappedUser.role);
          return mappedUser;
        } catch (error) {
          console.error('❌ Unexpected error in fetchProfile:', error);
          return null;
        }
      },

      login: async (email: string, password: string, role: UserRole) => {
        set({ error: null });
        
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

        if (supabase) {
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
              set({ error: 'Profile not found. Please contact support.' });
              await supabase.auth.signOut();
              return false;
            }
          }
        }
        return false;
      },

      signup: async (data: SignupData) => {
        set({ error: null });
        
        if (!isSupabaseConfigured) {
          set({ error: 'Database connection not configured. Please check your environment variables.' });
          return false;
        }

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
            console.log('✅ Auth user created:', authData.user.id);
            
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
              console.log('📧 Email verification required');
              set({ error: 'Registration successful! Please check your email to verify your account before logging in.' });
              return true;
            }

            // Retry fetching profile with better timing
            console.log('⏳ Waiting for profile creation...');
            let mappedUser = null;
            for (let i = 0; i < 8; i++) {
              await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
              mappedUser = await get().fetchProfile(authData.user.id);
              if (mappedUser) {
                console.log(`✅ Profile found after ${i + 1} attempts`);
                break;
              }
              console.log(`🔄 Profile attempt ${i + 1}/8...`);
            }

            if (mappedUser) {
              set({ user: mappedUser, isAuthenticated: true });
              console.log('🎉 Registration and profile setup complete!');
              return true;
            } else {
              console.error('❌ Profile creation failed after retries');
              set({ error: 'Account created, but profile setup failed. Please try logging in manually or contact support.' });
              return true; // Still return true as auth account was created
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
        if (supabase) {
          await supabase.auth.signOut();
        }
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
      name: 'hemalink-auth',
    }
  )
);
