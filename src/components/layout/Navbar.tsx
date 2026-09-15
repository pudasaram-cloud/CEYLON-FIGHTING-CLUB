'use client';

import React, { useState } from 'react';
import { useClub } from '@/context/ClubContext';
import {
  Bell,
  LogOut,
  Menu,
  Shield,
  ExternalLink,
  Tv,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  Settings,
  FileBarChart2,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenRegister: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenRegister,
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenMobileMenu,
}) => {
  const { currentAdmin, logout, activities, bets } = useClub();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const totalPot = bets.reduce((s, b) => s + b.amount, 0);
  const unreadActivities = activities.slice(0, 5);

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    arena: {
      title: 'LIVE FIGHT ARENA',
      subtitle: 'Real-time wagering & match administration',
    },
    dashboard: {
      title: 'DASHBOARD OVERVIEW',
      subtitle: 'Official admissions, analytics & revenue KPIs',
    },
    members: {
      title: 'MEMBER DIRECTORY',
      subtitle: 'Fighter profiles, records & biometric data',
    },
    activities: {
      title: 'EVENTS & HQ LOGS',
      subtitle: 'Audit trails & upcoming fight schedules',
    },
    leaderboard: {
      title: 'CHAMPIONSHIP LEADERBOARD',
      subtitle: 'Circuit points ranking & fight records',
    },
    reports: {
      title: 'FINANCIAL REPORTS & AUDIT',
      subtitle: 'Fixed fee breakdown & revenue audit',
    },
    settings: {
      title: 'CLUB SETTINGS & FEES',
      subtitle: 'Pricing parameters & system backup',
    },
  };

  const currentInfo = tabTitles[currentTab] || {
    title: 'CEYLON FIGHTING CLUB',
    subtitle: 'Combat Sports HQ',
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-black/95 backdrop-blur-md border-b border-slate-800/90 transition-all shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle / Desktop Sidebar Toggle + Tab Title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Hamburger Toggle */}
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Sidebar Toggle Button */}
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title={isSidebarCollapsed ? 'Expand Sidebar Navigation' : 'Collapse Sidebar Navigation'}
          >
            {isSidebarCollapsed ? (
              <PanelLeft className="w-4 h-4 text-blue-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Active View Title & Subtitle */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm sm:text-base tracking-wider uppercase text-white leading-none truncate">
                {currentInfo.title}
              </h1>

              {currentTab === 'arena' && totalPot > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600/30 text-red-400 border border-red-500/40 animate-pulse">
                  POT: ${totalPot.toLocaleString()}
                </span>
              )}
            </div>
            <p className="hidden sm:block text-[11px] text-slate-400 font-medium truncate mt-0.5">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Tools: Big Screen Link, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Big Screen Arena Display Link */}
          <a
            href="/display"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/60 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            title="Open Stadium Arena Display on TV / Secondary Monitor"
          >
            <Tv className="w-3.5 h-3.5 text-blue-400" />
            <span>Big Screen TV</span>
          </a>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadActivities.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-slate-950 border border-slate-800 p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      HQ Activity Feed
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Live Log</span>
                </div>

                <div className="divide-y divide-slate-900 max-h-72 overflow-y-auto my-2">
                  {unreadActivities.map((act) => (
                    <div key={act.id} className="py-2.5 text-left text-xs">
                      <div className="font-semibold text-white">{act.title}</div>
                      <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-2">
                        {act.description}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onTabChange('activities');
                  }}
                  className="w-full mt-2 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-blue-400 font-semibold text-xs text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>View All Activity Logs</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
                {currentAdmin.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase() || 'CA'}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-white">
                {currentAdmin.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
            </button>

            {/* Profile Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-slate-950 border border-slate-800 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="p-3 border-b border-slate-800 mb-1">
                  <p className="text-xs font-bold text-white">{currentAdmin.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentAdmin.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-semibold">
                    <Shield className="w-3 h-3" />
                    <span>{currentAdmin.role}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onTabChange('settings');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <Settings className="w-4 h-4 text-blue-400" />
                  <span>Club Settings & Fees</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onTabChange('reports');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2.5 cursor-pointer transition-colors mt-0.5"
                >
                  <FileBarChart2 className="w-4 h-4 text-emerald-400" />
                  <span>Reports & Revenue Audit</span>
                </button>

                <div className="my-1 border-t border-slate-900" />

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
