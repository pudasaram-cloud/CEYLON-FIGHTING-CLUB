'use client';

import React from 'react';
import { StatCards } from '@/components/dashboard/StatCards';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { UserPlus } from 'lucide-react';

interface DashboardOverviewProps {
  onOpenRegister: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenReportModal?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onOpenRegister,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Sleek Page Header (Compact, no duplicate stats) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 animate-in fade-in slide-in-from-top-3 duration-500">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {/* <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" /> */}
            {/* <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
              Dojo Command Center
            </span> */}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            WELCOME TO <span className="text-blue-500">CEYLON FIGHTING</span> CLUB
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official athlete admissions, biometric profiles & fixed fee accounting
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onOpenRegister}
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Fighter</span>
        </button>
      </div>

      {/* 1. Core KPI Statistics (Total Members, Revenue, Paid, Active) */}
      <div className="animate-in fade-in slide-in-from-bottom-3 duration-600">
        <StatCards />
      </div>

      {/* 2. Visual Analytics & Demographics */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <DashboardCharts />
      </div>

      {/* 3. Real-time Live Activity Feed */}
      <div className="animate-in fade-in slide-in-from-bottom-5 duration-800">
        <RecentActivityFeed
          limit={5}
          onViewAll={() => onNavigateTab('activities')}
        />
      </div>
    </div>
  );
};
