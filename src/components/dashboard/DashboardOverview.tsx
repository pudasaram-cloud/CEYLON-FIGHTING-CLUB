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
      <div className="pb-2 animate-in fade-in slide-in-from-top-3 duration-500">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            WELCOME TO <span className="text-blue-500">CEYLON FIGHTING</span> CLUB
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official athlete admissions, biometric profiles & fixed fee accounting
          </p>
        </div>
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
