'use client';

import React from 'react';
import { useClub } from '@/context/ClubContext';
import { ClubEmblem } from '@/components/ui/ClubLogo';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Flame,
  FileBarChart2,
  Settings,
  LogOut,
  Trophy,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { formatLKR } from '@/utils/helpers';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onOpenRegister: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  mobileMenuOpen,
  setMobileMenuOpen,
  onOpenRegister,
}) => {
  const { stats, currentAdmin, logout } = useClub();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'members',
      label: 'Members',
      icon: Users,
      badge: `${stats.totalMembers}`,
    },
    {
      id: 'registration',
      label: 'Registration',
      icon: UserPlus,
      action: onOpenRegister,
      badge: '+ New',
      badgeColor: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
    },
    {
      id: 'activities',
      label: 'Activities & Events',
      icon: Flame,
      badge: `${stats.upcomingEventsCount} events`,
    },
    {
      id: 'reports',
      label: 'Reports & Revenue',
      icon: FileBarChart2,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.id === 'registration') {
      onOpenRegister();
    } else {
      onTabChange(item.id);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-black border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div>
          <div className="h-16 px-6 border-b border-slate-800 flex items-center gap-3">
            <ClubEmblem className="w-8 h-8 shrink-0" />
            <div>
              <h2 className="font-black text-xs tracking-wider uppercase text-white leading-tight">
                CEYLON <span className="text-blue-500">FIGHTING</span> <span className="text-white">CLUB</span>
              </h2>
              <p className="text-[9px] text-slate-400 tracking-wider uppercase font-semibold">
                HQ Management System
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Core Navigation
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.badgeColor
                          ? item.badgeColor
                          : isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Admin User Card */}
        <div className="p-4 border-t border-slate-900">
          {/* Admin User Card */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
                {currentAdmin.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase() || 'CA'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {currentAdmin.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentAdmin.role}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
