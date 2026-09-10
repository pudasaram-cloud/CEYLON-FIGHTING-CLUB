'use client';

import React from 'react';
import { useClub } from '@/context/ClubContext';
import { getRelativeTime } from '@/utils/helpers';
import {
  UserPlus,
  Edit3,
  Trash2,
  CreditCard,
  Calendar,
  Award,
  Activity,
  ArrowRight,
} from 'lucide-react';

interface RecentActivityFeedProps {
  onViewAll?: () => void;
  onSelectMember?: (memberName: string) => void;
  limit?: number;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  onViewAll,
  onSelectMember,
  limit = 6,
}) => {
  const { activities } = useClub();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const displayedActivities = activities.slice(0, limit);

  const getActivityConfig = (type: string) => {
    switch (type) {
      case 'registration':
        return {
          icon: UserPlus,
          badgeBg: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
          titleColor: 'text-white',
        };
      case 'update':
        return {
          icon: Edit3,
          badgeBg: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
          titleColor: 'text-blue-400',
        };
      case 'deletion':
        return {
          icon: Trash2,
          badgeBg: 'bg-rose-600/20 text-rose-400 border-rose-500/30',
          titleColor: 'text-rose-400',
        };
      case 'payment':
        return {
          icon: CreditCard,
          badgeBg: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30',
          titleColor: 'text-emerald-400',
        };
      case 'event':
        return {
          icon: Calendar,
          badgeBg: 'bg-amber-600/20 text-amber-400 border-amber-500/30',
          titleColor: 'text-amber-400',
        };
      case 'belt_promotion':
        return {
          icon: Award,
          badgeBg: 'bg-purple-600/20 text-purple-400 border-purple-500/30',
          titleColor: 'text-purple-400',
        };
      default:
        return {
          icon: Activity,
          badgeBg: 'bg-slate-600/20 text-slate-400 border-slate-500/30',
          titleColor: 'text-slate-300',
        };
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-black border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
              Recent System Activity
            </h3>
            <p className="text-xs text-slate-400">
              Live audit timeline of member operations & financial changes
            </p>
          </div>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Complete Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {displayedActivities.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-xs">
          No system activities recorded yet.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {displayedActivities.map((item) => {
            const config = getActivityConfig(item.type);
            const Icon = config.icon;

            return (
              <div key={item.id} className="relative group">
                {/* Timeline node */}
                <div
                  className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border ${config.badgeBg} bg-[#06080e] shadow-sm transition-transform group-hover:scale-125`}
                >
                  <Icon className="w-2.5 h-2.5" />
                </div>

                <div className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-blue-500/30 rounded-xl p-3.5 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${config.titleColor}`}>
                        {item.title}
                      </span>
                      {item.memberName && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                          {item.memberName}
                        </span>
                      )}
                    </div>
                    <span
                      suppressHydrationWarning
                      className="text-[10px] text-slate-500 font-medium shrink-0"
                    >
                      {isMounted ? getRelativeTime(item.timestamp) : 'Recently'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
