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
  idNumber?: string; // Citizen ID (optional alphanumeric: letters & numbers)
  fullName: string; // nama
  age: number; // age
  dateOfBirth?: string;
  gender: Gender;
  phoneNumber: string; // phone number
  email?: string;
  address?: string;
  weight: number; // in kg
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
  points?: number; // Accumulated championship points (100 pts per win)
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

export interface FightBet {
  id: string; // e.g. "bet-1718293"
  matchId: string; // e.g. "match-01"
  fighterId: string; // Member ID e.g. "CFC-1001" or slot 'fighter1' | 'fighter2'
  fighterName: string; // Name of the fighter bet on
  betterName: string; // Name of the person placing the bet
  amount: number; // Bet amount ($ USD or LKR)
  currency: string; // '$' | 'LKR'
  timestamp: string; // ISO string
  note?: string;
}

export type MatchStatus = 'Live' | 'Upcoming' | 'Finished';

export interface FightMatch {
  id: string; // e.g. "match-01"
  title: string; // e.g. "Main Event: Heavyweight World Title"
  fighter1Id: string; // Member ID of Fighter 1
  fighter2Id: string; // Member ID of Fighter 2
  category: string; // e.g. "MMA Championship", "Muay Thai Heavyweight"
  scheduledDate?: string;
  scheduledTime?: string;
  status: MatchStatus;
  winnerId?: string | null; // Member ID of winner or 'draw' or null
  bettingEndsAt?: string; // ISO string when 7-min betting window closes
  bettingDurationMinutes?: number; // e.g. 7
  isBettingLocked?: boolean; // true when time is up or manually locked
  houseCommissionRate?: number; // 0.10 (10% house commission)
  createdAt: string;
  queueOrder?: number;
}


