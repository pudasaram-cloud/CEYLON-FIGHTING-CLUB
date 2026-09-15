'use client';

import React from 'react';
import { Swords, Trophy, Users, FileText, ArrowUpRight } from 'lucide-react';

interface QuickActionsProps {
  onOpenRegister?: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenReportModal: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onNavigateTab,
  onOpenReportModal,
}) => {
  const actions = [
    {
      title: 'Live Fight Arena',
      description: 'Enter the live fight match showroom and real-time betting pool',
      icon: Swords,
      iconBg: 'bg-gradient-to-br from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30',
      onClick: () => onNavigateTab('arena'),
    },
    {
      title: 'Leaderboard Circuit',
      description: 'Official fighter rankings, points standing & champion podium',
      icon: Trophy,
      iconBg: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      onClick: () => onNavigateTab('leaderboard'),
    },
    {
      title: 'View Members',
      description: 'Full fighter directory, profile cards, and CRUD actions',
      icon: Users,
      iconBg: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
      onClick: () => onNavigateTab('members'),
    },
    {
      title: 'Reports & Revenue',
      description: 'Financial statement & official membership breakdown',
      icon: FileText,
      iconBg: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
      onClick: onOpenReportModal,
    },
  ];


  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Quick Actions
        </h3>
        <span className="text-xs text-slate-500">Fast Operations</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              onClick={act.onClick}
              className="p-4 rounded-2xl bg-black border border-slate-800 hover:border-blue-500 transition-all duration-200 text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden shadow-lg"
            >
              <div className="flex items-start justify-between mb-3 w-full">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${act.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div>
                <div className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  {act.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                  {act.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
