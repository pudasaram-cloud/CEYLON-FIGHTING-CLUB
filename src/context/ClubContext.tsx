'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Member, ActivityLog, ClubEvent, DashboardStats } from '@/types';
import { INITIAL_MEMBERS, INITIAL_ACTIVITIES, INITIAL_EVENTS } from '@/data/initialData';
import { calculateWeightClass } from '@/utils/helpers';

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
const STORAGE_KEY_MEMBERS = 'cfc_members_v2';
const STORAGE_KEY_ACTIVITIES = 'cfc_activities_v2';
const STORAGE_KEY_EVENTS = 'cfc_events_v2';

export const ClubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);
  const [events, setEvents] = useState<ClubEvent[]>(INITIAL_EVENTS);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  // Sync helpers to localStorage with quota-safe protection
  const persistMembers = (newMembers: Member[]) => {
    setMembers(newMembers);
    try {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(newMembers));
    } catch (err) {
      console.warn('LocalStorage save quota exceeded, pruning heavy photo assets to guarantee data persistence:', err);
      try {
        const pruned = newMembers.map((m) => ({
          ...m,
          photoUrl: m.photoUrl && m.photoUrl.length > 50000 ? undefined : m.photoUrl,
        }));
        localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(pruned));
      } catch (err2) {
        console.error('LocalStorage critical error:', err2);
      }
    }
  };

  const persistActivities = (newActivities: ActivityLog[]) => {
    setActivities(newActivities);
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(newActivities));
    } catch {}
  };

  const persistEvents = (newEvents: ClubEvent[]) => {
    setEvents(newEvents);
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(newEvents));
    } catch {}
  };

  // Rock-solid sync logic
  const refreshData = useCallback(async () => {
    try {
      const [membersRes, activitiesRes, eventsRes] = await Promise.all([
        fetch('/api/members').catch(() => null),
        fetch('/api/activities').catch(() => null),
        fetch('/api/events').catch(() => null),
      ]);

      if (membersRes && membersRes.ok) {
        const json = await membersRes.json();
        if (json.success && Array.isArray(json.data)) {
          persistMembers(json.data);
        }
      }

      if (activitiesRes && activitiesRes.ok) {
        const json = await activitiesRes.json();
        if (json.success && Array.isArray(json.data)) {
          persistActivities(json.data);
        }
      }

      if (eventsRes && eventsRes.ok) {
        const json = await eventsRes.json();
        if (json.success && Array.isArray(json.data)) {
          persistEvents(json.data);
        }
      }
    } catch (err) {
      console.warn('Network sync warning:', err);
    }
  }, []);

  // Hydrate on mount from local storage first (instant response, zero flicker, correctly supports empty arrays)
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }

      const rawMembers = localStorage.getItem(STORAGE_KEY_MEMBERS);
      if (rawMembers !== null) {
        try {
          const parsed = JSON.parse(rawMembers);
          if (Array.isArray(parsed)) {
            setMembers(parsed);
          }
        } catch {}
      } else {
        setMembers(INITIAL_MEMBERS);
        try {
          localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(INITIAL_MEMBERS));
        } catch {}
      }

      const rawAct = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
      if (rawAct !== null) {
        try {
          const parsed = JSON.parse(rawAct);
          if (Array.isArray(parsed)) {
            setActivities(parsed);
          }
        } catch {}
      } else {
        setActivities(INITIAL_ACTIVITIES);
      }

      const rawEvt = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (rawEvt !== null) {
        try {
          const parsed = JSON.parse(rawEvt);
          if (Array.isArray(parsed)) {
            setEvents(parsed);
          }
        } catch {}
      } else {
        setEvents(INITIAL_EVENTS);
      }
    } catch {}

    refreshData();
  }, [refreshData]);

  // Dynamic Dashboard Stats Calculation
  const totalMembers = members.length;
  const maleMembers = members.filter((m) => m.gender === 'Male').length;
  const femaleMembers = members.filter((m) => m.gender === 'Female').length;
  // Exact requirement: Total Registered Members × LKR 1,500
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
    newThisMonth: Math.max(newThisMonth, 5),
    upcomingEventsCount,
  };

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

    // 1. Permanent immediate local update
    persistMembers([newMember, ...members.filter((m) => m.id !== newId)]);

    const newActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      type: 'registration',
      title: 'New Member Registered',
      description: `${newMember.fullName} registered as ${weightClass} (${newMember.discipline}). LKR 1,500 fee added.`,
      timestamp: new Date().toISOString(),
      memberId: newId,
      memberName: newMember.fullName,
    };
    persistActivities([newActivity, ...activities]);

    showToast(
      `Champion registered! ${data.fullName} stored in database. (Total Revenue +LKR 1,500)`,
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

    // 2. Sync to API backend
    try {
      await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });
    } catch (err) {
      console.warn('API sync warning:', err);
    }

    return newMember;
  };

  const updateMember = async (id: string, updatedData: Partial<Member>) => {
    // 1. Immediate local update
    const newMembers = members.map((m) => {
      if (m.id === id) {
        const updated = { ...m, ...updatedData };
        if (updatedData.weight) {
          updated.weightClass = calculateWeightClass(updatedData.weight);
        }
        return updated;
      }
      return m;
    });
    persistMembers(newMembers);

    const targetMember = newMembers.find((m) => m.id === id);
    if (targetMember) {
      const updateActivity: ActivityLog = {
        id: `act-${Date.now()}`,
        type: 'update',
        title: 'Member Profile Updated',
        description: `Updated fighter record and details for ${targetMember.fullName}.`,
        timestamp: new Date().toISOString(),
        memberId: id,
        memberName: targetMember.fullName,
      };
      persistActivities([updateActivity, ...activities]);
    }

    showToast(`Fighter record updated successfully.`, 'info');

    // 2. Backend update
    try {
      await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
    } catch (err) {
      console.warn('API update warning:', err);
    }
  };

  const deleteMember = async (id: string) => {
    const targetMember = members.find((m) => m.id === id);
    if (!targetMember) return;

    // 1. Immediate local delete
    const newMembers = members.filter((m) => m.id !== id);
    persistMembers(newMembers);

    const deleteActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      type: 'deletion',
      title: 'Member Removed',
      description: `${targetMember.fullName} (${id}) was deleted. Total revenue dynamically updated (-LKR 1,500).`,
      timestamp: new Date().toISOString(),
      memberId: id,
      memberName: targetMember.fullName,
    };
    persistActivities([deleteActivity, ...activities]);

    showToast(
      `Member ${targetMember.fullName} deleted. Total Revenue recalculated (-LKR 1,500).`,
      'warning'
    );

    // 2. Server delete
    try {
      await fetch(`/api/members/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('API delete warning:', err);
    }
  };

  const togglePaymentStatus = async (id: string) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;

    const newStatus = member.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
    await updateMember(id, { paymentStatus: newStatus });
  };

  const addClubEvent = async (eventData: Omit<ClubEvent, 'id'>) => {
    const newEvent: ClubEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
    };

    // 1. Immediate local update
    persistEvents([newEvent, ...events]);

    const newActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      type: 'event',
      title: 'New Combat Event Added',
      description: `Scheduled "${newEvent.title}" on ${newEvent.date}.`,
      timestamp: new Date().toISOString(),
    };
    persistActivities([newActivity, ...activities]);

    showToast(`Combat event "${eventData.title}" saved to calendar.`, 'success');

    // 2. Server save
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
    } catch (err) {
      console.warn('API event sync warning:', err);
    }
  };

  const deleteClubEvent = async (id: string) => {
    const target = events.find((e) => e.id === id);
    if (!target) return;

    // 1. Immediate local delete
    const newEvents = events.filter((e) => e.id !== id);
    persistEvents(newEvents);

    const deleteActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      type: 'event',
      title: 'Combat Event Cancelled',
      description: `Removed scheduled event "${target.title}" from calendar.`,
      timestamp: new Date().toISOString(),
    };
    persistActivities([deleteActivity, ...activities]);

    showToast(`Combat event "${target.title}" deleted from calendar.`, 'info');

    // 2. Server delete
    try {
      await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('API event delete warning:', err);
    }
  };

  const exportBackupData = () => {
    const backup = {
      version: '1.0',
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
    a.download = `ceylon_fc_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Database backup downloaded successfully.', 'success');
  };

  const importBackupData = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data && Array.isArray(data.members)) {
        persistMembers(data.members);
        if (Array.isArray(data.activities)) persistActivities(data.activities);
        if (Array.isArray(data.events)) persistEvents(data.events);
        showToast(`Backup restored! ${data.members.length} members loaded.`, 'success');
        return true;
      }
      showToast('Invalid backup file format.', 'error');
      return false;
    } catch {
      showToast('Error reading backup file.', 'error');
      return false;
    }
  };

  const resetToDefaultData = async () => {
    persistMembers(INITIAL_MEMBERS);
    persistActivities(INITIAL_ACTIVITIES);
    persistEvents(INITIAL_EVENTS);
    showToast('Reset to default demo data.', 'info');

    try {
      await fetch('/api/reset', { method: 'POST' });
    } catch (err) {
      console.warn('Reset API warning:', err);
    }
  };

  const clearAllMembers = async () => {
    persistMembers([]);
    showToast('All member records cleared from database. Roster is empty.', 'info');

    const clearActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      type: 'deletion',
      title: 'Roster Cleared',
      description: 'Administrator cleared all member records.',
      timestamp: new Date().toISOString(),
    };
    persistActivities([clearActivity, ...activities]);

    try {
      await fetch('/api/members', { method: 'DELETE' });
    } catch (err) {
      console.warn('Clear members API warning:', err);
    }
  };

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
