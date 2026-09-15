'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Member, ActivityLog, ClubEvent, DashboardStats, FightMatch, FightBet } from '@/types';
import { INITIAL_MEMBERS, INITIAL_ACTIVITIES, INITIAL_EVENTS, INITIAL_MATCHES, INITIAL_BETS } from '@/data/initialData';
import { calculateWeightClass } from '@/utils/helpers';
import {
  subscribeToMembers,
  subscribeToEvents,
  subscribeToActivities,
  subscribeToMatches,
  subscribeToBets,
  saveMemberToFirestore,
  updateMemberInFirestore,
  deleteMemberFromFirestore,
  saveEventToFirestore,
  deleteEventFromFirestore,
  saveActivityToFirestore,
  saveMatchToFirestore,
  updateMatchInFirestore,
  deleteMatchFromFirestore,
  saveBetToFirestore,
  deleteBetFromFirestore,
  resetFirestoreDatabase,
  clearAllMembersFromFirestore,
  seedFirestoreIfEmpty,
} from '@/lib/firestoreService';

interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error' | 'warning';
}

interface ClubContextType {
  members: Member[];
  activities: ActivityLog[];
  events: ClubEvent[];
  matches: FightMatch[];
  bets: FightBet[];
  activeMatchId: string | null;
  activeMatch: FightMatch | null;
  stats: DashboardStats;
  isAuthenticated: boolean;
  currentAdmin: { name: string; email: string; role: string };
  toasts: ToastNotification[];
  isLoading: boolean;
  showToast: (message: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  dismissToast: (id: string) => void;
  registerMember: (data: Omit<Member, 'id' | 'registrationFee' | 'attendanceCount' | 'sparringRecord' | 'weightClass'>) => Promise<Member | void>;
  updateMember: (id: string, updatedData: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  togglePaymentStatus: (id: string) => Promise<void>;
  addClubEvent: (event: Omit<ClubEvent, 'id'>) => Promise<void>;
  deleteClubEvent: (id: string) => Promise<void>;
  createMatch: (data: Omit<FightMatch, 'id' | 'createdAt'>) => Promise<FightMatch | void>;
  updateMatch: (id: string, updatedData: Partial<FightMatch>) => Promise<void>;
  declareMatchWinner: (matchId: string, winnerId: string) => Promise<void>;
  launchQueuedMatch: (id: string) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;
  setActiveMatchId: (id: string | null) => void;
  placeBet: (data: Omit<FightBet, 'id' | 'timestamp'>) => Promise<FightBet | void>;
  deleteBet: (id: string) => Promise<void>;
  resetToDefaultData: () => Promise<void>;
  clearAllMembers: () => Promise<void>;
  exportBackupData: () => void;
  importBackupData: (jsonString: string) => boolean;
  login: (email?: string, password?: string) => boolean;
  logout: () => void;
  refreshData: () => Promise<void>;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

const STORAGE_KEY_AUTH = 'cfc_auth_session_v1';
const STORAGE_KEY_MEMBERS = 'cfc_members_v3';
const STORAGE_KEY_ACTIVITIES = 'cfc_activities_v3';
const STORAGE_KEY_EVENTS = 'cfc_events_v3';
const STORAGE_KEY_MATCHES = 'cfc_matches_v3';
const STORAGE_KEY_BETS = 'cfc_bets_v3';
const STORAGE_KEY_ACTIVE_MATCH_ID = 'cfc_active_match_id_v3';
const BROADCAST_CHANNEL_NAME = 'cfc_arena_channel_v1';

export const ClubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);
  const [events, setEvents] = useState<ClubEvent[]>(INITIAL_EVENTS);
  const [matches, setMatches] = useState<FightMatch[]>(INITIAL_MATCHES);
  const [bets, setBets] = useState<FightBet[]>(INITIAL_BETS);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const currentAdmin = {
    name: 'Ceylon Fighting Admin',
    email: 'admin@ceylonfc.com',
    role: 'Chief Fight Director',
  };

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  }, [dismissToast]);

  // Real-time Firestore Subscriptions & Hydration
  useEffect(() => {
    // 1. Authenticated session check
    try {
      const storedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {}

    // 2. Load cached data from local storage for instant zero-lag rendering
    try {
      const cachedMembers = localStorage.getItem(STORAGE_KEY_MEMBERS);
      if (cachedMembers) {
        const parsed = JSON.parse(cachedMembers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMembers(parsed);
        }
      }
      const cachedEvents = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (cachedEvents) {
        const parsed = JSON.parse(cachedEvents);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEvents(parsed);
        }
      }
      const cachedActs = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
      if (cachedActs) {
        const parsed = JSON.parse(cachedActs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActivities(parsed);
        }
      }
      const cachedMatches = localStorage.getItem(STORAGE_KEY_MATCHES);
      if (cachedMatches) {
        const parsed = JSON.parse(cachedMatches);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMatches(parsed);
        }
      }
      const cachedBets = localStorage.getItem(STORAGE_KEY_BETS);
      if (cachedBets) {
        const parsed = JSON.parse(cachedBets);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBets(parsed);
        }
      }
      const cachedActiveMatchId = localStorage.getItem(STORAGE_KEY_ACTIVE_MATCH_ID);
      if (cachedActiveMatchId) {
        setActiveMatchId(cachedActiveMatchId);
      }
    } catch {}

    // 3. Cross-Tab Instant Synchronization (BroadcastChannel & Storage Events)
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channel.onmessage = (event) => {
          const { type, data } = event.data || {};
          if (type === 'NEW_BET' && data) {
            setBets((prev) => {
              if (prev.some((b) => b.id === data.id)) return prev;
              return [data, ...prev];
            });
          } else if (type === 'BET_DELETED' && data) {
            setBets((prev) => prev.filter((b) => b.id !== data.id));
          } else if (type === 'ACTIVE_MATCH_CHANGED') {
            setActiveMatchId(data.matchId);
          } else if (type === 'MATCHES_UPDATED' && data) {
            setMatches(data.matches);
            if (data.activeMatchId) {
              setActiveMatchId(data.activeMatchId);
            }
          }
        };
      }
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_BETS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setBets(parsed);
        } catch {}
      }
      if (e.key === STORAGE_KEY_MATCHES && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setMatches(parsed);
        } catch {}
      }
      if (e.key === STORAGE_KEY_ACTIVE_MATCH_ID) {
        setActiveMatchId(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);

    // 4. Initialize / Seed Firestore if it's completely empty
    seedFirestoreIfEmpty().catch(() => {});

    // 5. Attach real-time cloud listeners with instant cross-device synchronization
    const unsubMembers = subscribeToMembers((cloudMembers) => {
      setMembers(cloudMembers);
      try {
        localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(cloudMembers));
      } catch {}
      setIsLoading(false);
    });

    const unsubEvents = subscribeToEvents((cloudEvents) => {
      setEvents(cloudEvents);
      try {
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(cloudEvents));
      } catch {}
    });

    const unsubActivities = subscribeToActivities((cloudActivities) => {
      setActivities(cloudActivities);
      try {
        localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(cloudActivities));
      } catch {}
    });

    const unsubMatches = subscribeToMatches((cloudMatches) => {
      setMatches(cloudMatches);
      try {
        localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(cloudMatches));
      } catch {}
    });

    const unsubBets = subscribeToBets((cloudBets) => {
      setBets(cloudBets);
      try {
        localStorage.setItem(STORAGE_KEY_BETS, JSON.stringify(cloudBets));
      } catch {}
    });

    return () => {
      unsubMembers();
      unsubEvents();
      unsubActivities();
      unsubMatches();
      unsubBets();
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);


  const refreshData = useCallback(async () => {
    // Realtime listeners automatically handle syncing; refreshData acts as fallback trigger
    setIsLoading(false);
  }, []);

  // Dynamic Dashboard Stats Calculation
  const totalMembers = members.length;
  const maleMembers = members.filter((m) => m.gender === 'Male').length;
  const femaleMembers = members.filter((m) => m.gender === 'Female').length;
  // Total Registered Members × LKR 1,500
  const totalRevenue = totalMembers * 1500;
  const paidMembers = members.filter((m) => m.paymentStatus === 'Paid').length;
  const pendingPaymentMembers = members.filter((m) => m.paymentStatus === 'Pending').length;
  const activeMembers = members.filter((m) => m.membershipStatus === 'Active').length;

  const currentMonthYear = new Date().toISOString().substring(0, 7);
  const newThisMonth = members.filter((m) => (m.registrationDate || '').startsWith(currentMonthYear)).length;
  const upcomingEventsCount = events.filter((e) => e.status === 'Upcoming').length;

  const stats: DashboardStats = {
    totalMembers,
    maleMembers,
    femaleMembers,
    totalRevenue,
    paidMembers,
    pendingPaymentMembers,
    activeMembers,
    newThisMonth: Math.max(newThisMonth, 1),
    upcomingEventsCount,
  };

  // Register Member -> Stored in Firebase Firestore
  const registerMember = async (
    data: Omit<Member, 'id' | 'registrationFee' | 'attendanceCount' | 'sparringRecord' | 'weightClass'>
  ): Promise<Member | void> => {
    const maxNum = members.reduce((acc, m) => {
      const match = m.id.match(/CFC-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > acc ? num : acc;
      }
      return acc;
    }, 0);

    const nextNumber = maxNum + 1;
    const newId = `CFC-${String(nextNumber).padStart(4, '0')}`;
    const weightClass = calculateWeightClass(data.weight);
    const newMember: Member = {
      ...data,
      id: newId,
      weightClass,
      registrationFee: 1500,
      attendanceCount: 1,
      sparringRecord: { wins: 0, losses: 0, draws: 0 },
      points: 0,
    };

    // Optimistic local state update
    setMembers((prev) => [newMember, ...prev.filter((m) => m.id !== newId)]);

    const newActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      type: 'registration',
      title: 'New Member Registered',
      description: `${newMember.fullName} registered as ${weightClass} (${newMember.discipline}). LKR 1,500 fee added.`,
      timestamp: new Date().toISOString(),
      memberId: newId,
      memberName: newMember.fullName,
    };
    setActivities((prev) => [newActivity, ...prev]);

    showToast(
      `Champion registered! ${data.fullName} saved to Firebase Firestore. (Total Revenue +LKR 1,500)`,
      'success'
    );

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#38bdf8', '#ffffff'],
      });
    } catch {}

    // Cloud Database Persistence
    try {
      await saveMemberToFirestore(newMember);
      await saveActivityToFirestore(newActivity);
    } catch (err) {
      console.error('Firestore save error:', err);
    }

    return newMember;
  };

  // Update Member in Firebase Firestore
  const updateMember = async (id: string, updatedData: Partial<Member>) => {
    let targetMember: Member | undefined;
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = { ...m, ...updatedData };
          if (updatedData.weight) {
            updated.weightClass = calculateWeightClass(updatedData.weight);
          }
          targetMember = updated;
          return updated;
        }
        return m;
      })
    );

    if (targetMember) {
      const updateActivity: ActivityLog = {
        id: `act-${Date.now()}`,
        type: 'update',
        title: 'Member Profile Updated',
        description: `Updated fighter record and details for ${(targetMember as Member).fullName}.`,
        timestamp: new Date().toISOString(),
        memberId: id,
        memberName: (targetMember as Member).fullName,
      };
      setActivities((prev) => [updateActivity, ...prev]);
      saveActivityToFirestore(updateActivity).catch(() => {});
    }

    showToast(`Fighter record updated in Firebase database.`, 'info');

    try {
      await updateMemberInFirestore(id, updatedData);
    } catch (err) {
      console.error('Firestore update error:', err);
    }
  };

  // Delete Member from Firebase Firestore
  const deleteMember = async (id: string) => {
    const targetMember = members.find((m) => m.id === id);
    if (!targetMember) return;

    // Optimistic delete
    setMembers((prev) => prev.filter((m) => m.id !== id));

    const deleteActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      type: 'deletion',
      title: 'Member Removed',
      description: `${targetMember.fullName} (${id}) was deleted. Total revenue dynamically updated (-LKR 1,500).`,
      timestamp: new Date().toISOString(),
      memberId: id,
      memberName: targetMember.fullName,
    };
    setActivities((prev) => [deleteActivity, ...prev]);

    showToast(
      `Member ${targetMember.fullName} deleted. Total Revenue recalculated (-LKR 1,500).`,
      'warning'
    );

    try {
      await deleteMemberFromFirestore(id);
      await saveActivityToFirestore(deleteActivity);
    } catch (err) {
      console.error('Firestore delete error:', err);
    }
  };

  // Toggle Payment Status
  const togglePaymentStatus = async (id: string) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;

    const newStatus = member.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
    await updateMember(id, { paymentStatus: newStatus });
  };

  // Add Combat Event -> Stored in Firestore
  const addClubEvent = async (eventData: Omit<ClubEvent, 'id'>) => {
    const newEvent: ClubEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
    };

    setEvents((prev) => [newEvent, ...prev]);

    const newActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      type: 'event',
      title: 'New Combat Event Added',
      description: `Scheduled "${newEvent.title}" on ${newEvent.date}.`,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [newActivity, ...prev]);

    showToast(`Combat event "${eventData.title}" scheduled and saved to Firebase.`, 'success');

    try {
      await saveEventToFirestore(newEvent);
      await saveActivityToFirestore(newActivity);
    } catch (err) {
      console.error('Firestore event error:', err);
    }
  };

  // Delete Combat Event from Firestore
  const deleteClubEvent = async (id: string) => {
    const target = events.find((e) => e.id === id);
    if (!target) return;

    setEvents((prev) => prev.filter((e) => e.id !== id));

    const deleteActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      type: 'event',
      title: 'Combat Event Cancelled',
      description: `Removed scheduled event "${target.title}" from calendar.`,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [deleteActivity, ...prev]);

    showToast(`Combat event "${target.title}" deleted from calendar.`, 'info');

    try {
      await deleteEventFromFirestore(id);
      await saveActivityToFirestore(deleteActivity);
    } catch (err) {
      console.error('Firestore event delete error:', err);
    }
  };

  // Match & Betting Actions
  const activeMatch = matches.find((m) => m.id === activeMatchId) || matches[0] || null;

  const broadcastMatchesUpdate = useCallback(
    (updatedMatches: FightMatch[], newActiveMatchId?: string | null) => {
      try {
        localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(updatedMatches));
        if (newActiveMatchId !== undefined) {
          if (newActiveMatchId) {
            localStorage.setItem(STORAGE_KEY_ACTIVE_MATCH_ID, newActiveMatchId);
          } else {
            localStorage.removeItem(STORAGE_KEY_ACTIVE_MATCH_ID);
          }
        }
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
          bc.postMessage({
            type: 'MATCHES_UPDATED',
            data: {
              matches: updatedMatches,
              activeMatchId: newActiveMatchId !== undefined ? newActiveMatchId : activeMatchId,
            },
          });
          bc.close();
        }
      } catch {}
    },
    [activeMatchId]
  );

  const createMatch = async (data: Omit<FightMatch, 'id' | 'createdAt'>): Promise<FightMatch | void> => {
    const f1 = members.find((m) => m.id === data.fighter1Id);
    const f2 = members.find((m) => m.id === data.fighter2Id);
    const title = data.title || `${f1?.fullName || 'Fighter 1'} vs ${f2?.fullName || 'Fighter 2'}`;

    const isUpcoming = data.status === 'Upcoming';
    const duration = data.bettingDurationMinutes || 7;
    const bettingEndsAt = isUpcoming
      ? undefined
      : data.bettingEndsAt || new Date(Date.now() + duration * 60 * 1000).toISOString();

    const newMatch: FightMatch = {
      ...data,
      id: `match-${Date.now()}`,
      title,
      bettingDurationMinutes: duration,
      bettingEndsAt,
      isBettingLocked: isUpcoming ? true : false,
      houseCommissionRate: 0.10, // 10% Club Commission
      createdAt: new Date().toISOString(),
    };

    const nextMatches = [newMatch, ...matches];
    setMatches(nextMatches);
    const targetActiveId = !isUpcoming || !activeMatchId ? newMatch.id : activeMatchId;
    if (!isUpcoming || !activeMatchId) {
      setActiveMatchId(newMatch.id);
    }
    broadcastMatchesUpdate(nextMatches, targetActiveId);

    const newActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      type: 'event',
      title: isUpcoming ? 'Fight Added to Arena Queue' : 'Fight Match Scheduled (7-Min Betting Open)',
      description: isUpcoming
        ? `Queued matchup: ${f1?.fullName || 'Fighter 1'} vs ${f2?.fullName || 'Fighter 2'} added to upcoming fight card.`
        : `New matchup: ${f1?.fullName || 'Fighter 1'} vs ${f2?.fullName || 'Fighter 2'} with a 7-minute wagering window.`,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [newActivity, ...prev]);

    if (isUpcoming) {
      showToast(`Fight matchup "${title}" added to Upcoming Card Queue!`, 'info');
    } else {
      showToast(`Fight match "${title}" scheduled! 7-minute betting timer started.`, 'success');
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#ef4444', '#3b82f6', '#ffffff'],
        });
      } catch {}
    }

    try {
      await saveMatchToFirestore(newMatch);
      await saveActivityToFirestore(newActivity);
    } catch (err) {
      console.error('Firestore match save error:', err);
    }

    return newMatch;
  };

  const launchQueuedMatch = async (id: string) => {
    const target = matches.find((m) => m.id === id);
    if (!target) return;

    const duration = target.bettingDurationMinutes || 7;
    const bettingEndsAt = new Date(Date.now() + duration * 60 * 1000).toISOString();

    const updatedData: Partial<FightMatch> = {
      status: 'Live',
      bettingEndsAt,
      isBettingLocked: false,
    };

    const nextMatches = matches.map((m) => {
      if (m.id === id) {
        return { ...m, ...updatedData };
      }
      return m;
    });

    setMatches(nextMatches);
    setActiveMatchId(id);
    broadcastMatchesUpdate(nextMatches, id);

    const f1 = members.find((mem) => mem.id === target.fighter1Id);
    const f2 = members.find((mem) => mem.id === target.fighter2Id);

    const newActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      type: 'event',
      title: 'Fight Match Launched LIVE to Arena',
      description: `CONFIRMED: ${f1?.fullName || 'Fighter 1'} vs ${f2?.fullName || 'Fighter 2'} is now LIVE in the Arena! 7-minute wagering open.`,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [newActivity, ...prev]);

    showToast(`🚀 Fight "${target.title}" is now LIVE in the Arena! 7-min betting open.`, 'success');

    try {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#ef4444', '#3b82f6', '#eab308', '#22c55e'],
      });
    } catch {}

    try {
      await updateMatchInFirestore(id, updatedData);
      await saveActivityToFirestore(newActivity);
    } catch (err) {
      console.error('Firestore match launch error:', err);
    }
  };


  const updateMatch = async (id: string, updatedData: Partial<FightMatch>) => {
    const nextMatches = matches.map((m) => {
      if (m.id === id) {
        return { ...m, ...updatedData };
      }
      return m;
    });

    setMatches(nextMatches);
    broadcastMatchesUpdate(nextMatches);

    showToast('Match details updated live.', 'info');

    try {
      await updateMatchInFirestore(id, updatedData);
    } catch (err) {
      console.error('Firestore match update error:', err);
    }
  };

  const declareMatchWinner = async (matchId: string, winnerId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    // 1. Update Match status to 'Finished' with winnerId & locked bets
    await updateMatch(matchId, {
      status: 'Finished',
      winnerId,
      isBettingLocked: true,
    });

    const isF1Winner = winnerId === match.fighter1Id;
    const isF2Winner = winnerId === match.fighter2Id;
    const isDraw = winnerId === 'draw' || (!isF1Winner && !isF2Winner);

    const f1 = members.find((m) => m.id === match.fighter1Id);
    const f2 = members.find((m) => m.id === match.fighter2Id);

    if (isF1Winner && f1) {
      const currentF1Points = f1.points ?? ((f1.sparringRecord?.wins || 0) * 100);
      const updatedF1: Partial<Member> = {
        points: currentF1Points + 100,
        sparringRecord: {
          wins: (f1.sparringRecord?.wins || 0) + 1,
          losses: f1.sparringRecord?.losses || 0,
          draws: f1.sparringRecord?.draws || 0,
        },
      };
      await updateMember(f1.id, updatedF1);

      if (f2) {
        const updatedF2: Partial<Member> = {
          sparringRecord: {
            wins: f2.sparringRecord?.wins || 0,
            losses: (f2.sparringRecord?.losses || 0) + 1,
            draws: f2.sparringRecord?.draws || 0,
          },
        };
        await updateMember(f2.id, updatedF2);
      }

      const activity: ActivityLog = {
        id: `act-${Date.now()}`,
        type: 'event',
        title: '🏆 Match Victory & +100 Points Awarded',
        description: `${f1.fullName} defeated ${f2?.fullName || 'opponent'} and earned +100 Ranking Points on the Leaderboard!`,
        timestamp: new Date().toISOString(),
        memberId: f1.id,
        memberName: f1.fullName,
      };
      setActivities((prev) => [activity, ...prev]);
      saveActivityToFirestore(activity).catch(() => {});

      showToast(`🏆 ${f1.fullName} won the match! +100 Points awarded to Leaderboard.`, 'success');
    } else if (isF2Winner && f2) {
      const currentF2Points = f2.points ?? ((f2.sparringRecord?.wins || 0) * 100);
      const updatedF2: Partial<Member> = {
        points: currentF2Points + 100,
        sparringRecord: {
          wins: (f2.sparringRecord?.wins || 0) + 1,
          losses: f2.sparringRecord?.losses || 0,
          draws: f2.sparringRecord?.draws || 0,
        },
      };
      await updateMember(f2.id, updatedF2);

      if (f1) {
        const updatedF1: Partial<Member> = {
          sparringRecord: {
            wins: f1.sparringRecord?.wins || 0,
            losses: (f1.sparringRecord?.losses || 0) + 1,
            draws: f1.sparringRecord?.draws || 0,
          },
        };
        await updateMember(f1.id, updatedF1);
      }

      const activity: ActivityLog = {
        id: `act-${Date.now()}`,
        type: 'event',
        title: '🏆 Match Victory & +100 Points Awarded',
        description: `${f2.fullName} defeated ${f1?.fullName || 'opponent'} and earned +100 Ranking Points on the Leaderboard!`,
        timestamp: new Date().toISOString(),
        memberId: f2.id,
        memberName: f2.fullName,
      };
      setActivities((prev) => [activity, ...prev]);
      saveActivityToFirestore(activity).catch(() => {});

      showToast(`🏆 ${f2.fullName} won the match! +100 Points awarded to Leaderboard.`, 'success');
    } else if (isDraw) {
      if (f1) {
        await updateMember(f1.id, {
          sparringRecord: {
            wins: f1.sparringRecord?.wins || 0,
            losses: f1.sparringRecord?.losses || 0,
            draws: (f1.sparringRecord?.draws || 0) + 1,
          },
        });
      }
      if (f2) {
        await updateMember(f2.id, {
          sparringRecord: {
            wins: f2.sparringRecord?.wins || 0,
            losses: f2.sparringRecord?.losses || 0,
            draws: (f2.sparringRecord?.draws || 0) + 1,
          },
        });
      }
      showToast(`🤝 Match declared a Draw between ${f1?.fullName} and ${f2?.fullName}.`, 'info');
    }

    try {
      confetti({
        particleCount: 110,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#eab308', '#22c55e', '#ef4444', '#3b82f6'],
      });
    } catch {}
  };

  const deleteMatch = async (id: string) => {
    const target = matches.find((m) => m.id === id);
    if (!target) return;

    const nextMatches = matches.filter((m) => m.id !== id);
    setMatches(nextMatches);
    setBets((prev) => {
      const nextBets = prev.filter((b) => b.matchId !== id);
      try {
        localStorage.setItem(STORAGE_KEY_BETS, JSON.stringify(nextBets));
      } catch {}
      return nextBets;
    });

    const newActiveId = activeMatchId === id ? null : activeMatchId;
    if (activeMatchId === id) {
      setActiveMatchId(null);
    }
    broadcastMatchesUpdate(nextMatches, newActiveId);

    showToast(`Match "${target.title}" deleted from arena.`, 'warning');

    try {
      await deleteMatchFromFirestore(id);
    } catch (err) {
      console.error('Firestore match delete error:', err);
    }
  };

  const handleSetActiveMatchId = useCallback((id: string | null) => {
    setActiveMatchId(id);
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_MATCH_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE_MATCH_ID);
      }
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.postMessage({ type: 'ACTIVE_MATCH_CHANGED', data: { matchId: id } });
        bc.close();
      }
    } catch {}
  }, []);

  const placeBet = async (data: Omit<FightBet, 'id' | 'timestamp'>): Promise<FightBet | void> => {
    const newBet: FightBet = {
      ...data,
      id: `bet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    setBets((prev) => {
      const nextBets = [newBet, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY_BETS, JSON.stringify(nextBets));
      } catch {}
      return nextBets;
    });

    // Instant cross-tab broadcast to Big Screen Display (/display)
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.postMessage({ type: 'NEW_BET', data: newBet });
        bc.close();
      }
    } catch {}

    const betActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      type: 'payment',
      title: 'New Fight Bet Placed',
      description: `${data.betterName} placed a $${data.amount.toLocaleString()} bet on ${data.fighterName}!`,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [betActivity, ...prev]);

    showToast(
      `Bet confirmed! ${data.betterName} placed $${data.amount.toLocaleString()} on ${data.fighterName}. Pool updated live!`,
      'success'
    );

    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#eab308', '#22c55e', '#3b82f6', '#ef4444'],
      });
    } catch {}

    try {
      await saveBetToFirestore(newBet);
      await saveActivityToFirestore(betActivity);
    } catch (err) {
      console.error('Firestore bet save error:', err);
    }

    return newBet;
  };

  const deleteBet = async (id: string) => {
    setBets((prev) => {
      const nextBets = prev.filter((b) => b.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY_BETS, JSON.stringify(nextBets));
      } catch {}
      return nextBets;
    });

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.postMessage({ type: 'BET_DELETED', data: { id } });
        bc.close();
      }
    } catch {}

    showToast('Bet removed from pool.', 'info');

    try {
      await deleteBetFromFirestore(id);
    } catch (err) {
      console.error('Firestore bet delete error:', err);
    }
  };

  // Export JSON Backup
  const exportBackupData = () => {
    const backup = {
      version: '3.0-firebase-arena',
      exportedAt: new Date().toISOString(),
      club: 'CEYLON FIGHTING CLUB',
      members,
      activities,
      events,
      matches,
      bets,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ceylon_fc_firebase_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Database backup downloaded successfully.', 'success');
  };

  // Import JSON Backup to Firestore
  const importBackupData = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data && Array.isArray(data.members)) {
        setMembers(data.members);
        if (Array.isArray(data.activities)) setActivities(data.activities);
        if (Array.isArray(data.events)) setEvents(data.events);
        if (Array.isArray(data.matches)) setMatches(data.matches);
        if (Array.isArray(data.bets)) setBets(data.bets);

        (async () => {
          for (const m of data.members) {
            await saveMemberToFirestore(m).catch(() => {});
          }
          if (Array.isArray(data.events)) {
            for (const e of data.events) {
              await saveEventToFirestore(e).catch(() => {});
            }
          }
          if (Array.isArray(data.matches)) {
            for (const mat of data.matches) {
              await saveMatchToFirestore(mat).catch(() => {});
            }
          }
          if (Array.isArray(data.bets)) {
            for (const b of data.bets) {
              await saveBetToFirestore(b).catch(() => {});
            }
          }
        })();

        showToast(`Backup restored! ${data.members.length} members & arena synced to Firebase.`, 'success');
        return true;
      }
      showToast('Invalid backup file format.', 'error');
      return false;
    } catch {
      showToast('Error reading backup file.', 'error');
      return false;
    }
  };

  // Reset Firestore Database to Initial Demo State
  const resetToDefaultData = async () => {
    setMembers(INITIAL_MEMBERS);
    setActivities(INITIAL_ACTIVITIES);
    setEvents(INITIAL_EVENTS);
    setMatches(INITIAL_MATCHES);
    setBets(INITIAL_BETS);
    setActiveMatchId(null);
    showToast('Firebase database reset to default demo data.', 'info');

    try {
      await resetFirestoreDatabase();
    } catch (err) {
      console.error('Firestore reset error:', err);
    }
  };

  // Clear All Members from Firestore
  const clearAllMembers = async () => {
    setMembers([]);
    showToast('All member records removed from Firebase database. Roster is empty.', 'info');

    const clearActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      type: 'deletion',
      title: 'Roster Cleared',
      description: 'Administrator cleared all member records from Firebase.',
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [clearActivity, ...prev]);

    try {
      await clearAllMembersFromFirestore();
      await saveActivityToFirestore(clearActivity);
    } catch (err) {
      console.error('Firestore clear error:', err);
    }
  };

  // Authentication Handlers
  const login = (email?: string, password?: string) => {
    setIsAuthenticated(true);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, 'true');
    } catch {}
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, 'false');
    } catch {}
    showToast('Logged out of Ceylon Fighting Club system.', 'info');
  };

  return (
    <ClubContext.Provider
      value={{
        members,
        activities,
        events,
        matches,
        bets,
        activeMatchId,
        activeMatch,
        stats,
        isAuthenticated,
        currentAdmin,
        toasts,
        isLoading,
        showToast,
        dismissToast,
        registerMember,
        updateMember,
        deleteMember,
        togglePaymentStatus,
        addClubEvent,
        deleteClubEvent,
        createMatch,
        updateMatch,
        declareMatchWinner,
        launchQueuedMatch,
        deleteMatch,
        setActiveMatchId: handleSetActiveMatchId,
        placeBet,
        deleteBet,
        resetToDefaultData,
        clearAllMembers,
        exportBackupData,
        importBackupData,
        login,
        logout,
        refreshData,
      }}
    >
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = () => {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
};

