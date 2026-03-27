// User Types
export type UserRole = 'requester' | 'donor' | 'hospital' | 'admin';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type RequestStatus = 'pending' | 'donor_assigned' | 'in_progress' | 'fulfilled' | 'rejected' | 'cancelled';
export type DonationStatus = 'scheduled' | 'awaiting_confirmation' | 'completed' | 'cancelled' | 'rejected';
export type HospitalStatus = 'pending_approval' | 'active' | 'suspended' | 'rejected';
export type Priority = 'emergency' | 'urgent' | 'normal';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  bloodGroup?: BloodGroup;
  location: Location;
  avatar?: string;
  createdAt: Date;
  isVerified: boolean;
  // Role-specific fields (optional in base User)
  points?: number;
  level?: number;
  badges?: Badge[];
  totalDonations?: number;
  lastDonationDate?: Date;
  isAvailable?: boolean;
  hospitalName?: string;
  licenseNumber?: string;
  status?: string;
  emergencyContact?: string;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  lat?: number;
  lng?: number;
}

export interface Requester extends User {
  role: 'requester';
  emergencyContact?: string;
  requests: BloodRequest[];
}

export interface Donor extends User {
  role: 'donor';
  bloodGroup: BloodGroup;
  points: number;
  level: number;
  badges: Badge[];
  totalDonations: number;
  lastDonationDate?: Date;
  isAvailable: boolean;
  donations: Donation[];
}

export interface Hospital extends User {
  role: 'hospital';
  hospitalName: string;
  licenseNumber: string;
  status: HospitalStatus;
  inventory: BloodInventory[];
  verifiedAt?: Date;
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

export interface BloodRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  patientName?: string;
  bloodGroup: BloodGroup;
  units: number;
  hospitalId?: string;
  hospitalName?: string;
  location: Location;
  dateNeeded: Date;
  reason?: string;
  prescription?: string;
  priority: Priority;
  status: RequestStatus;
  assignedDonorId?: string;
  assignedDonorName?: string;
  createdAt: Date;
  updatedAt: Date;
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  status: string;
  message: string;
  timestamp: Date;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  hospitalId: string;
  hospitalName: string;
  requestId?: string;
  bloodGroup: BloodGroup;
  units: number;
  status: DonationStatus;
  scheduledDate: Date;
  completedDate?: Date;
  pointsEarned: number;
  notes?: string;
  createdAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface BloodInventory {
  id: string;
  hospitalId: string;
  bloodGroup: BloodGroup;
  units: number;
  expiryDate: Date;
  lastUpdated: Date;
}

export interface Campaign {
  id: string;
  hospitalId: string;
  hospitalName: string;
  name: string;
  description: string;
  location: Location;
  startDate: Date;
  endDate: Date;
  targetBloodGroups: BloodGroup[];
  targetUnits: number;
  collectedUnits: number;
  attendees: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'request' | 'donation' | 'campaign' | 'reward' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Report {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  period: string;
  totalRequests: number;
  fulfilledRequests: number;
  totalDonations: number;
  totalUnitsCollected: number;
  newDonors: number;
  newHospitals: number;
  pointsDistributed: number;
  topDonors: { id: string; name: string; donations: number }[];
  topHospitals: { id: string; name: string; donations: number }[];
  generatedAt: Date;
}
