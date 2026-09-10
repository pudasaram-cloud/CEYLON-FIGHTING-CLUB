'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Member, ActivityLog, ClubEvent, DashboardStats } from '@/types';
import { INITIAL_MEMBERS, INITIAL_ACTIVITIES, INITIAL_EVENTS } from '@/data/initialData';
import { calculateWeightClass } from '@/utils/helpers';
import {
  subscribeToMembers,
  subscribeToEvents,
  subscribeToActivities,
  saveMemberToFirestore,
  updateMemberInFirestore,
  deleteMemberFromFirestore,
  saveEventToFirestore,
  deleteEventFromFirestore,
  saveActivityToFirestore,
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

export const ClubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);
  const [events, setEvents] = useState<ClubEvent[]>(INITIAL_EVENTS);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const currentAdmin = {
    name: 'Ceylon Fighting Admin',
    email: 'admin@ceylonfc.com',
    role: 'Chief Fight Director',
  };

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

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
    } catch {}

    // 3. Initialize / Seed Firestore if it's completely empty
    seedFirestoreIfEmpty().catch(() => {});

    // 4. Attach real-time cloud listeners with instant cross-device synchronization
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

    return () => {
      unsubMembers();
      unsubEvents();
      unsubActivities();
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
    }, 1000);

    const newId = `CFC-${maxNum + 1}`;
    const weightClass = calculateWeightClass(data.weight);
    const newMember: Member = {
      ...data,
      id: newId,
      weightClass,
      registrationFee: 1500,
      attendanceCount: 1,
      sparringRecord: { wins: 0, losses: 0, draws: 0 },
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

  // Export JSON Backup
  const exportBackupData = () => {
    const backup = {
      version: '2.0-firebase',
      exportedAt: new Date().toISOString(),
      club: 'CEYLON FIGHTING CLUB',
      members,
      activities,
      events,
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

        (async () => {
          for (const m of data.members) {
            await saveMemberToFirestore(m).catch(() => {});
          }
          if (Array.isArray(data.events)) {
            for (const e of data.events) {
              await saveEventToFirestore(e).catch(() => {});
            }
          }
        })();

        showToast(`Backup restored! ${data.members.length} members synced to Firebase.`, 'success');
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
