'use client';

import React from 'react';
import { useClub } from '@/context/ClubContext';
import { ClubEmblem } from '@/components/ui/ClubLogo';
import {
  Swords,
  LayoutDashboard,
  Users,
  Flame,
  FileBarChart2,
  Settings,
  Trophy,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  UserPlus,
  Tv,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenRegister: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string | null;
  badgeColor?: string;
  isHot?: boolean;
}

interface NavCategory {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  onOpenRegister,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { stats, bets, currentAdmin, logout } = useClub();

  const totalPot = bets.reduce((s, b) => s + b.amount, 0);

  const navCategories: NavCategory[] = [
    {
      title: 'ARENA & CIRCUIT',
      items: [
        {
          id: 'arena',
          label: 'Live Fight Arena',
          icon: Swords,
          badge: totalPot > 0 ? `$${totalPot.toLocaleString()}` : 'LIVE',
          badgeColor: 'bg-red-600/30 text-red-400 border border-red-500/40 animate-pulse',
          isHot: true,
        },
        {
          id: 'leaderboard',
          label: 'Leaderboard',
          icon: Trophy,
          badge: 'TOP',
          badgeColor: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        },
      ],
    },
    {
      title: 'CLUB MANAGEMENT',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard Overview',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          id: 'members',
          label: 'Member Directory',
          icon: Users,
          badge: `${stats.totalMembers}`,
          badgeColor: 'bg-slate-800 text-slate-300',
        },
        {
          id: 'activities',
          label: 'Events & Logs',
          icon: Flame,
          badge: stats.upcomingEventsCount > 0 ? `${stats.upcomingEventsCount}` : null,
          badgeColor: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
        },
      ],
    },
    {
      title: 'FINANCE & SYSTEM',
      items: [
        {
          id: 'reports',
          label: 'Reports & Audit',
          icon: FileBarChart2,
          badge: null,
        },
        {
          id: 'settings',
          label: 'Club Settings',
          icon: Settings,
          badge: null,
        },
      ],
    },
  ];

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800/90 select-none">
      {/* 1. Brand Logo Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
        <button
          onClick={() => handleNavClick('arena')}
          className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none overflow-hidden"
        >
          <ClubEmblem className="w-8 h-8 shrink-0 transition-transform group-hover:scale-105" />
          {!isCollapsed && (
            <div className="min-w-0 transition-all duration-300">
              <h1 className="font-black text-xs tracking-wider uppercase text-white leading-tight truncate">
                CEYLON <span className="text-blue-500">FIGHTING</span>
              </h1>
              <p className="text-[9px] text-slate-400 tracking-widest uppercase font-semibold truncate">
                Combat Sports HQ
              </p>
            </div>
          )}
        </button>

        {/* Collapse Toggle Button (Desktop Only) */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. Primary Register Fighter Quick Action (Expanded state) */}
      <div className="p-3 border-b border-slate-900 shrink-0">
        {!isCollapsed ? (
          <button
            onClick={onOpenRegister}
            className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Fighter</span>
          </button>
        ) : (
          <button
            onClick={onOpenRegister}
            title="Register Fighter"
            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3. Categorized Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5 custom-scrollbar">
        {navCategories.map((cat, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">
                {cat.title}
              </h3>
            )}
            <div className="space-y-0.5">
              {cat.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                      isActive
                        ? item.isHot
                          ? 'bg-red-600/20 text-red-400 border border-red-500/40 shadow-sm shadow-red-500/20'
                          : 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive
                            ? item.isHot
                              ? 'text-red-400'
                              : 'text-white'
                            : 'text-slate-400 group-hover:text-blue-400'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                          item.badgeColor ||
                          (isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300')
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Big Screen TV Quick Link in Sidebar */}
        <div className="pt-2 border-t border-slate-900">
          <a
            href="/display"
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/50 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Open Stadium Arena Display on TV / Secondary Monitor"
          >
            <Tv className="w-4 h-4 text-blue-400 shrink-0" />
            {!isCollapsed && <span>Big Screen TV</span>}
          </a>
        </div>
      </div>

      {/* 4. Bottom User Profile & Sign Out Footer */}
      <div className="p-3 border-t border-slate-900 bg-black/40 shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
                {currentAdmin.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase() || 'CA'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {currentAdmin.name}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-blue-400 font-semibold leading-tight">
                  <Shield className="w-3 h-3" />
                  <span className="truncate">{currentAdmin.role}</span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            title={`Sign Out (${currentAdmin.name})`}
            className="w-full py-2 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-40 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10 animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
