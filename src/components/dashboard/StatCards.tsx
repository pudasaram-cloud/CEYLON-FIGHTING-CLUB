'use client';

import React from 'react';
import { useClub } from '@/context/ClubContext';
import { formatLKR } from '@/utils/helpers';
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Flame,
  UserCheck,
  Percent,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export const StatCards: React.FC = () => {
  const { stats } = useClub();

  const malePercent = stats.totalMembers > 0 
    ? Math.round((stats.maleMembers / stats.totalMembers) * 100) 
    : 0;
  const femalePercent = stats.totalMembers > 0 
    ? Math.round((stats.femaleMembers / stats.totalMembers) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Total Registered Members Card */}
      <div className="p-5 rounded-2xl bg-black border border-slate-800 hover:border-blue-500/50 shadow-xl transition-all duration-300 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <span className="flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-500/20">
            <TrendingUp className="w-3 h-3" />
            Active Roster
          </span>
        </div>

        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Total Registered Members
        </div>
        
        <div className="flex items-baseline gap-2 mt-1 mb-3">
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {stats.totalMembers}
          </div>
          <span className="text-xs text-slate-400 font-medium">Fighters</span>
        </div>

        {/* Male & Female Breakdown Badges */}
        <div className="pt-3 border-t border-slate-900 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/50 border border-blue-500/30 text-blue-300 font-semibold">
            <span className="text-blue-400">👨 Male:</span>
            <span className="font-extrabold text-white">{stats.maleMembers}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-semibold">
            <span className="text-slate-400">👩 Female:</span>
            <span className="font-extrabold text-white">{stats.femaleMembers}</span>
          </div>
        </div>
      </div>

      {/* 2. Total Revenue Card (Dynamic: Members × LKR 1,500) */}
      <div className="p-5 rounded-2xl bg-black border border-slate-800 hover:border-blue-500/50 shadow-xl transition-all duration-300 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-blue-300 bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-500/30">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Auto-Calculated</span>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Total Revenue
        </div>

        <div className="flex items-baseline gap-2 mt-1 mb-2">
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {formatLKR(stats.totalRevenue)}
          </div>
        </div>

        {/* Dynamic Formula Display */}
        <div className="pt-2 border-t border-slate-900">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Rate Formula:</span>
            <span className="font-mono text-blue-400 font-bold">
              {stats.totalMembers} × LKR 1,500
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
            <span>Collected: {formatLKR(stats.paidMembers * 1500)}</span>
            <span className="text-amber-400 font-medium">{stats.pendingPaymentMembers} Pending</span>
          </div>
        </div>
      </div>

      {/* 3. Male / Female Ratio & Active Combatants */}
      <div className="p-5 rounded-2xl bg-black border border-slate-800 hover:border-blue-500/50 shadow-xl transition-all duration-300 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <Percent className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-500/30">
            {stats.activeMembers} Active
          </span>
        </div>

        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Gender Distribution
        </div>

        <div className="flex items-baseline justify-between mt-1 mb-2.5">
          <div className="text-2xl sm:text-3xl font-black text-white">
            <span>{malePercent}%</span> <span className="text-xs font-normal text-slate-400">/</span> <span className="text-blue-400">{femalePercent}%</span>
          </div>
          <span className="text-[11px] text-slate-400">
            <span className="text-blue-400 font-bold">👨 {malePercent}%</span> · <span className="text-slate-300 font-bold">👩 {femalePercent}%</span>
          </span>
        </div>

        {/* Visual Progress Bar: Blue for Male, Slate for Female */}
        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden flex border border-slate-800">
          <div
            style={{ width: `${malePercent}%` }}
            className="bg-blue-600 h-full transition-all duration-500"
            title={`Male: ${malePercent}% (Blue)`}
          />
          <div
            style={{ width: `${femalePercent}%` }}
            className="bg-slate-700 h-full transition-all duration-500"
            title={`Female: ${femalePercent}% (Slate)`}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
          <span>New this month: <strong className="text-white">+{stats.newThisMonth}</strong></span>
          <span className="text-blue-400 font-semibold">Championship Level</span>
        </div>
      </div>

      {/* 4. Upcoming Activities & Tournaments Card */}
      <div className="p-5 rounded-2xl bg-black border border-slate-800 hover:border-blue-500/50 shadow-xl transition-all duration-300 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <Flame className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-xs font-bold text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-500/20">
            Fight Calendar
          </span>
        </div>

        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Upcoming Events & Fights
        </div>

        <div className="flex items-baseline gap-2 mt-1 mb-3">
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {stats.upcomingEventsCount}
          </div>
          <span className="text-xs text-slate-400 font-medium">Major Events</span>
        </div>

        <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
          <span className="truncate text-white font-medium">Next: Ceylon Cage Warriors V</span>
          <span className="text-blue-400 font-bold shrink-0">Sept 26</span>
        </div>
      </div>
    </div>
  );
};
