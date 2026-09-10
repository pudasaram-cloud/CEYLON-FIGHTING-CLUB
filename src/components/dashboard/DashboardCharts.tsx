'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useClub } from '@/context/ClubContext';
import { formatLKR } from '@/utils/helpers';
import { TrendingUp, PieChart as PieIcon, DollarSign, Shield, Activity } from 'lucide-react';

export const DashboardCharts: React.FC = () => {
  const { members, stats } = useClub();
  const [activeTab, setActiveTab] = useState<'trends' | 'revenue'>('trends');
  const [isMounted, setIsMounted] = useState(false);
  const [isTabSwitching, setIsTabSwitching] = useState(false);

  // Trigger animations on initial component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // Animate bars down-to-up on tab toggle
  const handleTabChange = (newTab: 'trends' | 'revenue') => {
    if (newTab === activeTab) return;
    setIsTabSwitching(true);
    setActiveTab(newTab);
    setTimeout(() => {
      setIsTabSwitching(false);
    }, 40);
  };

  // Timeline starts at September (Official Club Launch Month)
  const trendData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startMonthIndex = 8; // September (0-indexed = 8)
    const currentYear = new Date().getFullYear();

    // 5 months starting from September: Sep, Oct, Nov, Dec, Jan
    const result = [];
    for (let i = 0; i < 5; i++) {
      const targetMonthIndex = (startMonthIndex + i) % 12;
      const targetMonthName = monthNames[targetMonthIndex];
      const targetYear = startMonthIndex + i >= 12 ? currentYear + 1 : currentYear;
      const targetMonthStr = String(targetMonthIndex + 1).padStart(2, '0');
      const targetMonthKey = `${targetYear}-${targetMonthStr}`;

      const count = members.filter((m) => (m.registrationDate || '').startsWith(targetMonthKey)).length;
      const isCurrent = i === 0;

      result.push({
        month: isCurrent ? `${targetMonthName} (Current)` : targetMonthName,
        count: isCurrent ? Math.max(count, stats.totalMembers) : count,
        revenue: isCurrent ? Math.max(count * 1500, stats.totalRevenue) : count * 1500,
        isCurrent,
      });
    }

    return result;
  }, [members, stats.totalMembers, stats.totalRevenue]);

  const maxCount = Math.max(...trendData.map((d) => d.count), 4);
  const maxRevenue = Math.max(...trendData.map((d) => d.revenue), 6000);

  // Discipline breakdown
  const disciplineCounts: Record<string, number> = {};
  members.forEach((m) => {
    disciplineCounts[m.discipline] = (disciplineCounts[m.discipline] || 0) + 1;
  });

  const disciplines = Object.entries(disciplineCounts).sort((a, b) => b[1] - a[1]);

  const malePercent = stats.totalMembers > 0 ? (stats.maleMembers / stats.totalMembers) * 100 : 0;
  const femalePercent = stats.totalMembers > 0 ? (stats.femaleMembers / stats.totalMembers) * 100 : 0;

  // Circumference for donut chart (r = 40 => 2 * pi * 40 = 251.32)
  const circumference = 251.32;
  const maleStrokeDash = (malePercent / 100) * circumference;
  const femaleStrokeDash = (femalePercent / 100) * circumference;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left: Registration Trends & Monthly Revenue Bar/Area Chart (2 Cols) */}
      <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-black border border-slate-800 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                  {activeTab === 'trends' ? 'Fighter Registration Growth' : 'Monthly Revenue Overview (LKR)'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic intake analytics synced with membership records
              </p>
            </div>

            {/* Toggle tabs */}
            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => handleTabChange('trends')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'trends'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Fighters
              </button>
              <button
                onClick={() => handleTabChange('revenue')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'revenue'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Revenue
              </button>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-56 w-full flex items-end justify-between gap-2 sm:gap-6 pt-8 pb-3 px-2 border-b border-slate-800 relative">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-2">
              <div className="border-b border-slate-700 w-full" />
              <div className="border-b border-slate-700 w-full" />
              <div className="border-b border-slate-700 w-full" />
              <div className="border-b border-slate-700 w-full" />
            </div>

            {trendData.map((item, idx) => {
              const heightPercent =
                activeTab === 'trends'
                  ? (item.count / maxCount) * 100
                  : (item.revenue / maxRevenue) * 100;

              // Animate height from 0 to full height with staggered easing
              const targetHeight = isMounted && !isTabSwitching
                ? item.count === 0 && item.revenue === 0
                  ? 6
                  : Math.max(heightPercent, 14)
                : 0;

              return (
                <div
                  key={item.month}
                  className="flex-1 flex flex-col items-center justify-end group relative z-10 h-full"
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-9 bg-slate-900 border border-blue-500/40 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white shadow-2xl pointer-events-none whitespace-nowrap z-20">
                    {activeTab === 'trends'
                      ? `${item.count} Registered Fighters`
                      : formatLKR(item.revenue)}
                  </div>

                  {/* Value indicator above bar */}
                  <span
                    className={`text-[11px] font-mono font-bold mb-1.5 transition-all duration-500 ${
                      isMounted && !isTabSwitching ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    } ${
                      item.isCurrent
                        ? 'text-blue-400 font-extrabold'
                        : item.count > 0
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                    style={{ transitionDelay: `${idx * 80 + 200}ms` }}
                  >
                    {activeTab === 'trends'
                      ? item.count
                      : item.revenue > 0
                      ? `LKR ${(item.revenue / 1000).toFixed(1)}k`
                      : '0'}
                  </span>

                  {/* Bar Track Container (Fixed height container) */}
                  <div className="w-full max-w-[36px] sm:max-w-[44px] h-32 bg-slate-900/60 border border-slate-800/80 rounded-t-xl overflow-hidden flex items-end p-0.5 relative group-hover:border-blue-500/40 transition-colors">
                    {/* Animated Bar rising from down to up */}
                    <div
                      style={{
                        height: `${targetHeight}%`,
                        transitionDuration: '900ms',
                        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                        transitionDelay: `${idx * 90}ms`,
                      }}
                      className={`w-full rounded-t-lg transition-all relative ${
                        item.isCurrent
                          ? 'bg-gradient-to-t from-blue-700 via-blue-600 to-blue-400 shadow-[0_0_16px_rgba(37,99,235,0.7)]'
                          : item.count > 0 || item.revenue > 0
                          ? 'bg-slate-700 group-hover:bg-blue-500'
                          : 'bg-slate-800/40'
                      }`}
                    >
                      {/* Top glowing cap */}
                      {(item.count > 0 || item.revenue > 0) && (
                        <div className="w-full h-1 bg-white/50 rounded-t-lg" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* X Axis Labels */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2.5 px-2">
            {trendData.map((d) => (
              <span
                key={d.month}
                className={`text-center flex-1 text-[11px] ${
                  d.isCurrent ? 'text-blue-400 font-bold' : 'text-slate-500'
                }`}
              >
                {d.month}
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic Highlight Footer */}
        <div className="mt-6 pt-4 border-t border-slate-900 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="text-slate-300">
              Current Enrollment: <strong className="text-white">{stats.totalMembers} Fighters</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-400" />
            <span className="text-slate-300">
              Live Revenue: <strong className="text-white">{formatLKR(stats.totalRevenue)}</strong>
            </span>
          </div>
          <div className="text-slate-500 text-[11px]">
            Fixed rate: LKR 1,500 / fighter
          </div>
        </div>
      </div>

      {/* Right: Gender Distribution Donut & Disciplines (1 Col) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-black border border-slate-800 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                Gender Distribution
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {stats.totalMembers} Total
            </span>
          </div>

          {/* Donut Chart with animated spinning entrance & stroke sweep */}
          <div className="relative w-44 h-44 mx-auto my-3 flex items-center justify-center">
            <svg
              className={`w-full h-full transform transition-all duration-1000 ease-out ${
                isMounted ? '-rotate-90 scale-100 opacity-100' : '-rotate-180 scale-85 opacity-30'
              }`}
              viewBox="0 0 100 100"
            >
              {/* Background circle track */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#1e293b"
                strokeWidth="12"
              />
              {/* Male arc (Blue) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#2563eb"
                strokeWidth="12"
                strokeDasharray={
                  isMounted && stats.totalMembers > 0
                    ? `${maleStrokeDash} ${circumference}`
                    : `0 ${circumference}`
                }
                strokeDashoffset="0"
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1), stroke-dashoffset 1.2s ease',
                }}
              />
              {/* Female arc (Sky Blue) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#60a5fa"
                strokeWidth="12"
                strokeDasharray={
                  isMounted && stats.totalMembers > 0
                    ? `${femaleStrokeDash} ${circumference}`
                    : `0 ${circumference}`
                }
                strokeDashoffset={isMounted ? `-${maleStrokeDash}` : '0'}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, stroke-dashoffset 1.2s ease',
                }}
              />
            </svg>

            {/* Inner text with smooth zoom-in */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-700 delay-300 ${
                isMounted ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
              }`}
            >
              <span className="text-2xl font-black text-white">{stats.totalMembers}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Fighters
              </span>
            </div>
          </div>

          {/* Gender Legend Badges */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div
              className={`p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex flex-col items-center text-center transition-all duration-700 delay-200 ${
                isMounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs text-blue-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>👨 Male</span>
              </div>
              <div className="text-lg font-black text-white mt-0.5">
                {stats.maleMembers}
              </div>
              <span className="text-[10px] text-blue-300 font-semibold">
                {malePercent.toFixed(0)}% of total
              </span>
            </div>

            <div
              className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center transition-all duration-700 delay-300 ${
                isMounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>👩 Female</span>
              </div>
              <div className="text-lg font-black text-white mt-0.5">
                {stats.femaleMembers}
              </div>
              <span className="text-[10px] text-slate-400">
                {femalePercent.toFixed(0)}% of total
              </span>
            </div>
          </div>
        </div>

        {/* Combat Disciplines Breakdown List */}
        <div className="mt-5 pt-4 border-t border-slate-900">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>Combat Disciplines</span>
            <span className="text-blue-400">{disciplines.length} Styles</span>
          </div>

          <div className="space-y-2">
            {disciplines.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-2">
                No discipline data available yet.
              </div>
            ) : (
              disciplines.slice(0, 4).map(([disc, count], idx) => {
                const percent = Math.round((count / stats.totalMembers) * 100) || 0;
                const barColor = idx % 2 === 0 ? 'bg-blue-600' : 'bg-blue-400';
                return (
                  <div key={disc} className="text-xs">
                    <div className="flex justify-between items-center mb-1 text-slate-300">
                      <span className="font-medium">{disc}</span>
                      <span className="font-bold text-white">
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: isMounted ? `${percent}%` : '0%',
                          transitionDuration: '1000ms',
                          transitionDelay: `${idx * 120 + 300}ms`,
                        }}
                        className={`${barColor} h-full rounded-full transition-all ease-out`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
