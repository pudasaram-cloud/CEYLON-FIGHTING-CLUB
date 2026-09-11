export type Gender = 'Male' | 'Female';

export type Discipline = 
  | 'MMA'
  | 'Muay Thai'
  | 'Boxing'
  | 'Brazilian Jiu-Jitsu'
  | 'Kickboxing'
  | 'Combat Fitness';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';

export type PaymentStatus = 'Paid' | 'Pending';

export type MembershipStatus = 'Active' | 'Inactive' | 'Suspended' | 'Injured';

export type VectorAvatarType = 'male-vector' | 'female-vector' | 'lion-crest' | 'gloves-badge';

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface SparringRecord {
  wins: number;
  losses: number;
  draws: number;
}

export interface Member {
  id: string; // e.g. "CFC-1001"
  idNumber: string; // Citizen ID (e.g. "200018402941", "981245678V", "CIT-0012A" - letters and numbers)
  fullName: string; // nama
  age: number; // age
  dateOfBirth?: string;
  gender: Gender;
  phoneNumber: string; // phone number
  email?: string;
  address?: string;
  weight: number; // in kg
  height: number; // in cm
  weightClass: string; // e.g. "Flyweight", "Welterweight"
  discipline: Discipline;
  skillLevel: SkillLevel;
  beltRank: string; // e.g. "White Belt", "Blue Belt", "Black Belt", "Gold Gloves"
  registrationDate: string; // YYYY-MM-DD
  registrationFee: number; // 1500 (Fixed LKR 1,500)
  paymentStatus: PaymentStatus; // Paid or Not (Pending)
  membershipStatus: MembershipStatus;
  photoUrl?: string; // Custom uploaded photo
  defaultAvatarType: VectorAvatarType; // Default vector icon (men/women)
  emergencyContact: EmergencyContact;
  notes?: string;
  attendanceCount: number;
  sparringRecord: SparringRecord;
}

export interface ActivityLog {
  id: string;
  type: 'registration' | 'update' | 'deletion' | 'payment' | 'event' | 'belt_promotion' | 'system';
  title: string;
  description: string;
  timestamp: string;
  memberId?: string;
  memberName?: string;
}

export interface ClubEvent {
  id: string;
  title: string;
  category: 'Fight Night' | 'Sparring Session' | 'Belt Grading' | 'Masterclass Workshop';
  date: string;
  time: string;
  location: string;
  participantsCount: number;
  status: 'Upcoming' | 'Completed' | 'In Progress';
  description?: string;
}

export interface DashboardStats {
  totalMembers: number;
  maleMembers: number;
  femaleMembers: number;
  totalRevenue: number; // totalMembers * 1500
  paidMembers: number;
  pendingPaymentMembers: number;
  activeMembers: number;
  newThisMonth: number;
  upcomingEventsCount: number;
}
