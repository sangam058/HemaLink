import type { BloodGroup, RequestStatus, DonationStatus, HospitalStatus } from './index';

export interface DatabaseProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'donor' | 'requester' | 'hospital' | 'admin';
  is_verified: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface DatabaseBloodRequest {
  id: string;
  requester_id: string;
  requester_name: string;
  patient_name?: string;
  blood_group: BloodGroup;
  units: number;
  hospital_id?: string;
  hospital_name?: string;
  location: any; // Coordinate/Address JSON
  date_needed: string;
  reason?: string;
  prescription?: string;
  priority: 'emergency' | 'urgent' | 'normal';
  status: RequestStatus;
  assigned_donor_id?: string;
  assigned_donor_name?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseDonation {
  id: string;
  donor_id: string;
  donor_name: string;
  hospital_id: string;
  hospital_name: string;
  request_id?: string;
  blood_group: BloodGroup;
  units: number;
  status: DonationStatus;
  scheduled_date: string;
  completed_date?: string;
  points_earned: number;
  notes?: string;
  created_at: string;
}

export interface DatabaseHospital {
  id: string;
  hospital_name: string;
  license_number: string;
  status: HospitalStatus;
  verified_at?: string;
}

export interface DatabaseDonor {
  id: string;
  blood_group: BloodGroup;
  points: number;
  is_available: boolean;
}

export interface DatabaseInventory {
  id: string;
  hospital_id: string;
  blood_group: BloodGroup;
  units: number;
  expiry_date: string;
  last_updated: string;
}

export interface DatabaseCampaign {
  id: string;
  hospital_id: string;
  hospital_name: string;
  name: string;
  description: string;
  location: any;
  start_date: string;
  end_date: string;
  target_blood_groups: BloodGroup[];
  target_units: number;
  collected_units: number;
  attendees: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
}

export interface DatabaseNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'request' | 'donation' | 'campaign' | 'reward' | 'system';
  is_read: boolean;
  link?: string;
  created_at: string;
}
