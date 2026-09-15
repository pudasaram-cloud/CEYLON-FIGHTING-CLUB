'use client';

import React, { useState } from 'react';
import { useClub } from '@/context/ClubContext';
import { ClubLogo } from '@/components/ui/ClubLogo';
import { 
  Bell, 
  Search, 
  UserPlus, 
  LogOut, 
  Menu, 
  X, 
  Shield, 
  DollarSign,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { formatLKR } from '@/utils/helpers';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenRegister: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenRegister,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { currentAdmin, logout, stats, activities } = useClub();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadActivities = activities.slice(0, 5);

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-black border-b border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center transition-all">
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Left: Mobile hamburger & Mobile Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo shown ONLY on mobile when sidebar is hidden */}
          <div className="lg:hidden">
            <ClubLogo size="sm" showTagline={false} />
          </div>

          {/* Desktop active breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-slate-200 uppercase font-bold tracking-wider">
              {currentTab === 'arena' && 'Live Fight Match & Betting Arena'}
              {currentTab === 'dashboard' && 'Dashboard Overview'}
              {currentTab === 'members' && 'Fighter Directory'}
              {currentTab === 'activities' && 'Events & Activity Log'}
              {currentTab === 'reports' && 'Revenue & Audit Reports'}
              {currentTab === 'settings' && 'System Configuration'}
            </span>
          </div>

        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 text-slate-300 hover:text-white transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadActivities.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
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
                  className="w-full mt-2 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-blue-400 font-semibold text-xs text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>View All Activity Logs</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
                {currentAdmin.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase() || 'CA'}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">
                  {currentAdmin.name}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight">
                  {currentAdmin.role}
                </span>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-slate-950 border border-blue-500/30 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="p-3 border-b border-slate-800 mb-1">
                  <p className="text-xs font-bold text-white">{currentAdmin.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentAdmin.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-semibold">
                    <Shield className="w-3 h-3" />
                    <span>Administrator</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onTabChange('settings');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2"
                >
                  Club Settings & Fees
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 flex items-center gap-2 transition-colors mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
