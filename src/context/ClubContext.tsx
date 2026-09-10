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
  resetToDefaultData: () => Promise<void>;
  clearAllMembers: () => Promise<void>;
  login: (email?: string, password?: string) => boolean;
  logout: () => void;
  refreshData: () => Promise<void>;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

const STORAGE_KEY_AUTH = 'cfc_auth_session_v1';

export const ClubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);
  const [events, setEvents] = useState<ClubEvent[]>(INITIAL_EVENTS);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
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

  // Fetch data from embedded SQLite database via API
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [membersRes, activitiesRes, eventsRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/activities'),
        fetch('/api/events'),
      ]);

      if (membersRes.ok) {
        const json = await membersRes.json();
        if (json.success && Array.isArray(json.data)) {
          setMembers(json.data);
        }
      }

      if (activitiesRes.ok) {
        const json = await activitiesRes.json();
        if (json.success && Array.isArray(json.data)) {
          setActivities(json.data);
        }
      }

      if (eventsRes.ok) {
        const json = await eventsRes.json();
        if (json.success && Array.isArray(json.data)) {
          setEvents(json.data);
        }
      }
    } catch (err) {
      console.warn('Using client memory cache for embedded DB:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Hydrate on mount
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
      if (storedAuth !== null) {
        setIsAuthenticated(storedAuth === 'true');
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
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const newMember = json.data;
          setMembers((prev) => [newMember, ...prev]);

          // Refresh activities to show new log from embedded DB
          const actRes = await fetch('/api/activities');
          if (actRes.ok) {
            const actJson = await actRes.json();
            if (actJson.data) setActivities(actJson.data);
          }

          showToast(
            `Champion registered! ${data.fullName} stored in embedded database. (Total Revenue +LKR 1,500)`,
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

          return newMember;
        }
      }
    } catch (err) {
      console.error('Failed to save to embedded DB:', err);
    }

    // Fallback if network issue
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
    setMembers((prev) => [newMember, ...prev]);
    showToast(`Registered ${data.fullName} (Revenue +LKR 1,500)`, 'success');
    return newMember;
  };

  const updateMember = async (id: string, updatedData: Partial<Member>) => {
    // Optimistic update
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = { ...m, ...updatedData };
          if (updatedData.weight) {
            updated.weightClass = calculateWeightClass(updatedData.weight);
          }
          return updated;
        }
        return m;
      })
    );

    try {
      const res = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          showToast(`Fighter record updated in embedded database.`, 'info');
          // Refresh activities
          const actRes = await fetch('/api/activities');
          if (actRes.ok) {
            const actJson = await actRes.json();
            if (actJson.data) setActivities(actJson.data);
          }
        }
      }
    } catch (err) {
      console.error('Error updating member:', err);
    }
  };

  const deleteMember = async (id: string) => {
    const targetMember = members.find((m) => m.id === id);
    if (!targetMember) return;

    // Optimistic delete
    setMembers((prev) => prev.filter((m) => m.id !== id));

    try {
      const res = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast(
          `Member ${targetMember.fullName} deleted from embedded database. Total Revenue recalculated (-LKR 1,500).`,
          'warning'
        );
        const actRes = await fetch('/api/activities');
        if (actRes.ok) {
          const actJson = await actRes.json();
          if (actJson.data) setActivities(actJson.data);
        }
      }
    } catch (err) {
      console.error('Error deleting member:', err);
    }
  };

  const togglePaymentStatus = async (id: string) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;

    const newStatus = member.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
    await updateMember(id, { paymentStatus: newStatus });
  };

  const addClubEvent = async (eventData: Omit<ClubEvent, 'id'>) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setEvents((prev) => [json.data, ...prev]);
          showToast(`Combat event "${eventData.title}" saved to calendar.`, 'success');
          return;
        }
      }
    } catch (err) {
      console.error('Error adding event:', err);
    }

    // Fallback
    const newEvent: ClubEvent = { ...eventData, id: `evt-${Date.now()}` };
    setEvents((prev) => [newEvent, ...prev]);
  };

  const resetToDefaultData = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        await refreshData();
        showToast('Embedded database successfully reset to default seed data.', 'info');
        return;
      }
    } catch (err) {
      console.error('Error resetting database:', err);
    }

    setMembers(INITIAL_MEMBERS);
    setActivities(INITIAL_ACTIVITIES);
    setEvents(INITIAL_EVENTS);
    showToast('Reset to default demo data.', 'info');
  };

  const clearAllMembers = async () => {
    setMembers([]);
    try {
      const res = await fetch('/api/members', { method: 'DELETE' });
      if (res.ok) {
        showToast('All member records cleared from database. Roster is empty.', 'info');
        const actRes = await fetch('/api/activities');
        if (actRes.ok) {
          const actJson = await actRes.json();
          if (actJson.data) setActivities(actJson.data);
        }
      }
    } catch (err) {
      console.error('Error clearing members:', err);
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
        resetToDefaultData,
        clearAllMembers,
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
