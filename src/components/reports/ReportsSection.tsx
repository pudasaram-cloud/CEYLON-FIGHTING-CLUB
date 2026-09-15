'use client';

import React from 'react';
import { useClub } from '@/context/ClubContext';
import { formatLKR } from '@/utils/helpers';
import { ClubLogo } from '@/components/ui/ClubLogo';
import {
  FileText,
  DollarSign,
  Printer,
  Users,
  PieChart,
  Shield,
  CheckCircle2,
  Clock,
  TrendingUp,
  Download,
} from 'lucide-react';

export const ReportsSection: React.FC = () => {
  const { members, stats, currentAdmin, bets, matches } = useClub();

  const handlePrint = () => {
    window.print();
  };

  const collectedRevenue = stats.paidMembers * 1500;
  const pendingRevenue = stats.pendingPaymentMembers * 1500;

  // Arena Betting Economics (10% House Commission)
  const totalBetVolume = bets.reduce((s, b) => s + b.amount, 0);
  const clubBettingCommission = Math.round(totalBetVolume * 0.10);
  const winnerPrizePool = totalBetVolume - clubBettingCommission;

  // Discipline breakdown
  const disciplineStats = members.reduce((acc, m) => {
    acc[m.discipline] = (acc[m.discipline] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Reports & Financial Revenue
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Official Ceylon Fighting Club audit report, admissions intake, and fee accounting
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export Audit Report</span>
        </button>
      </div>

      {/* Printable Report Container */}
      <div className="p-6 sm:p-10 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-8 print:border-none print:bg-white print:p-4 print:text-black">
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 print:border-black">
          <div className="flex items-center gap-3">
            <ClubLogo size="md" showTagline={true} />
          </div>

          <div className="text-left sm:text-right text-xs">
            <div className="font-mono font-bold text-blue-400 print:text-black">
              REPORT REF: CFC-AUDIT-{new Date().getFullYear()}
            </div>
            <div suppressHydrationWarning className="text-slate-400 print:text-gray-600">
              Generated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="text-slate-500 text-[11px]">
              Authorized by: {currentAdmin.name} ({currentAdmin.role})
            </div>
          </div>
        </div>

        {/* 1. Executive Summary Cards */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 print:text-black mb-3">
            1. Financial Accounting Overview (LKR 1,500 Registration Rate)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Revenue */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 print:border-black print:bg-gray-100">
              <div className="text-[10px] uppercase font-bold text-slate-400 print:text-black">
                Total Accrued Revenue
              </div>
              <div className="text-2xl font-black text-white print:text-black mt-1">
                {formatLKR(stats.totalRevenue)}
              </div>
              <div className="text-[11px] text-blue-400 font-mono mt-1">
                {stats.totalMembers} Fighters × LKR 1,500
              </div>
            </div>

            {/* Collected Revenue */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 print:border-black print:bg-gray-100">
              <div className="text-[10px] uppercase font-bold text-slate-400 print:text-black">
                Collected Payments
              </div>
              <div className="text-2xl font-black text-emerald-400 print:text-black mt-1">
                {formatLKR(collectedRevenue)}
              </div>
              <div className="text-[11px] text-emerald-400 print:text-gray-700 mt-1">
                ✓ {stats.paidMembers} Paid Registrations
              </div>
            </div>

            {/* Pending Receivables */}
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 print:border-black print:bg-gray-100">
              <div className="text-[10px] uppercase font-bold text-slate-400 print:text-black">
                Pending Receivables
              </div>
              <div className="text-2xl font-black text-amber-400 print:text-black mt-1">
                {formatLKR(pendingRevenue)}
              </div>
              <div className="text-[11px] text-amber-400 print:text-gray-700 mt-1">
                ⏳ {stats.pendingPaymentMembers} Pending Verification
              </div>
            </div>
          </div>
        </div>

        {/* 2. Arena Match Wagering & 10% Club Commission Audit */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 print:text-black mb-3 flex items-center justify-between">
            <span>2. Live Arena Wagering & 10% Club Rake Economics</span>
            <span className="text-[10px] text-slate-400 font-normal">
              7-Min Window · 10% Ceylon FC House Fee · 90% Winner Payout
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Total Wagering Volume */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 print:border-black print:bg-gray-100">
              <div className="text-[10px] uppercase font-bold text-slate-400 print:text-black">
                Total Match Wagering Pool
              </div>
              <div className="text-2xl font-black text-white print:text-black mt-1">
                ${totalBetVolume.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {bets.length} Wagers across {matches.length} Scheduled Matches
              </div>
            </div>

            {/* 10% Club Commission Earned */}
            <div className="p-4 rounded-2xl bg-yellow-950/30 border border-yellow-500/40 print:border-black print:bg-gray-100">
              <div className="text-[10px] uppercase font-bold text-yellow-400 print:text-black">
                10% Club House Commission
              </div>
              <div className="text-2xl font-black text-yellow-400 print:text-black mt-1">
                ${clubBettingCommission.toLocaleString()}
              </div>
              <div className="text-[11px] text-yellow-400/90 mt-1">
                ⚡ Retained Revenue by Ceylon FC
              </div>
            </div>

            {/* 90% Distributable Winner Pool */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 print:border-black print:bg-gray-100">
              <div className="text-[10px] uppercase font-bold text-emerald-400 print:text-black">
                90% Winner Prize Pot
              </div>
              <div className="text-2xl font-black text-emerald-400 print:text-black mt-1">
                ${winnerPrizePool.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-400 mt-1">
                ✓ Proportional Payout to Winning Bettors
              </div>
            </div>

            {/* Active Match Status */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 print:border-black print:bg-gray-100">
              <div className="text-[10px] uppercase font-bold text-slate-400 print:text-black">
                Bout Status
              </div>
              <div className="text-xl font-black text-blue-400 print:text-black mt-1">
                {matches.filter((m) => m.status === 'Live').length} Live
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {matches.filter((m) => m.status === 'Finished').length} Completed Matches
              </div>
            </div>
          </div>
        </div>

        {/* 3. Demographic & Membership Metrics */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 print:text-black mb-3">
            3. Member Demographics & Roster Distribution
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 print:border-black print:bg-gray-50">
              <div className="text-[10px] text-slate-400 print:text-black uppercase">Total Fighters</div>
              <div className="text-xl font-black text-white print:text-black mt-1">{stats.totalMembers}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 print:border-black print:bg-gray-50">
              <div className="text-[10px] text-slate-400 print:text-black uppercase">Male Athletes</div>
              <div className="text-xl font-black text-blue-400 print:text-black mt-1">
                {stats.maleMembers} ({Math.round((stats.maleMembers / stats.totalMembers) * 100 || 0)}%)
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 print:border-black print:bg-gray-50">
              <div className="text-[10px] text-slate-400 print:text-black uppercase">Female Athletes</div>
              <div className="text-xl font-black text-pink-400 print:text-black mt-1">
                {stats.femaleMembers} ({Math.round((stats.femaleMembers / stats.totalMembers) * 100 || 0)}%)
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 print:border-black print:bg-gray-50">
              <div className="text-[10px] text-slate-400 print:text-black uppercase">Active Members</div>
              <div className="text-xl font-black text-emerald-400 print:text-black mt-1">
                {stats.activeMembers} Active
              </div>
            </div>
          </div>
        </div>

        {/* 3. Style Breakdown */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 print:text-black mb-3">
            3. Disciplines Breakdown
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(disciplineStats).map(([disc, count]) => (
              <div
                key={disc}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 print:border-black flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-slate-300 print:text-black">{disc}</span>
                <span className="font-mono font-bold text-blue-400 print:text-black">
                  {count} ({formatLKR(count * 1500)})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Official Certification Signature Block */}
        <div className="pt-8 border-t border-slate-800 print:border-black grid grid-cols-2 gap-8 text-xs">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-8">
              Prepared by Chief Registrar:
            </p>
            <div className="w-48 border-b border-slate-600 print:border-black mb-1" />
            <p className="font-bold text-white print:text-black">{currentAdmin.name}</p>
            <p className="text-[10px] text-slate-400 print:text-gray-600">Chief Fight Director</p>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-8">
              Official Seal & Approval:
            </p>
            <div className="inline-block p-3 rounded-xl border border-dashed border-blue-500/40 print:border-black text-blue-400 print:text-black text-[10px] font-bold uppercase">
              CEYLON FIGHTING CLUB · VERIFIED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
