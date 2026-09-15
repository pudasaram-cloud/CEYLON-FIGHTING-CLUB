'use client';

import React, { useState, useMemo } from 'react';
import { useClub } from '@/context/ClubContext';
import { Member, Discipline } from '@/types';
import { CombatAvatar } from '@/components/ui/CombatAvatars';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Search,
  Filter,
  Flame,
  Swords,
  TrendingUp,
  UserPlus,
  ArrowUpRight,
  Shield,
  Star,
  Zap,
} from 'lucide-react';

interface LeaderboardSectionProps {
  onViewProfile?: (member: Member) => void;
  onOpenRegister?: () => void;
  onNavigateArena?: () => void;
}

const DISCIPLINES: (Discipline | 'All')[] = [
  'All',
  'MMA',
  'Muay Thai',
  'Boxing',
  'Brazilian Jiu-Jitsu',
  'Kickboxing',
  'Combat Fitness',
];

export const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({
  onViewProfile,
  onOpenRegister,
  onNavigateArena,
}) => {
  const { members } = useClub();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'points' | 'wins' | 'winRate'>('points');

  // Compute points and metrics for each fighter
  const rankedMembers = useMemo(() => {
    return members.map((m) => {
      const wins = m.sparringRecord?.wins || 0;
      const losses = m.sparringRecord?.losses || 0;
      const draws = m.sparringRecord?.draws || 0;
      const totalFights = wins + losses + draws;
      const winRate = totalFights > 0 ? Math.round((wins / totalFights) * 100) : 0;
      // Points: explicit points or 100 points per win
      const points = m.points !== undefined ? m.points : wins * 100;

      return {
        ...m,
        calculatedPoints: points,
        calculatedWins: wins,
        calculatedLosses: losses,
        calculatedDraws: draws,
        totalFights,
        winRate,
      };
    });
  }, [members]);

  // Filter and sort members
  const filteredRankings = useMemo(() => {
    return rankedMembers
      .filter((m) => {
        const matchesSearch =
          m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.idNumber && m.idNumber.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesDiscipline =
          selectedDiscipline === 'All' || m.discipline === selectedDiscipline;

        return matchesSearch && matchesDiscipline;
      })
      .sort((a, b) => {
        if (sortBy === 'points') {
          if (b.calculatedPoints !== a.calculatedPoints) {
            return b.calculatedPoints - a.calculatedPoints;
          }
          return b.calculatedWins - a.calculatedWins;
        }
        if (sortBy === 'wins') {
          if (b.calculatedWins !== a.calculatedWins) {
            return b.calculatedWins - a.calculatedWins;
          }
          return b.calculatedPoints - a.calculatedPoints;
        }
        if (sortBy === 'winRate') {
          if (b.winRate !== a.winRate) {
            return b.winRate - a.winRate;
          }
          return b.calculatedPoints - a.calculatedPoints;
        }
        return 0;
      });
  }, [rankedMembers, searchQuery, selectedDiscipline, sortBy]);

  // Top 3 for podium
  const top1 = filteredRankings[0];
  const top2 = filteredRankings[1];
  const top3 = filteredRankings[2];

  const totalCircuitPoints = rankedMembers.reduce((sum, m) => sum + m.calculatedPoints, 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* TOP 3 PODIUM (CHAMPIONS SHOWCASE) */}
      {filteredRankings.length >= 2 && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl">
          <div className="text-center mb-6">
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-yellow-400 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              CHAMPIONSHIP PODIUM
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1.5">
              Top Ranked Fighters
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-4xl mx-auto pt-4">
            {/* SILVER (#2) */}
            {top2 && (
              <div
                onClick={() => onViewProfile && onViewProfile(top2)}
                className="order-2 md:order-1 p-5 rounded-2xl bg-black border border-slate-800 hover:border-slate-600 transition-all cursor-pointer flex flex-col items-center text-center relative shadow-lg group"
              >
                <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-slate-800 border border-slate-600 text-slate-200 text-[11px] font-black uppercase flex items-center gap-1">
                  <Medal className="w-3 h-3 text-slate-300" />
                  RANK #2
                </div>

                <div className="w-20 h-20 rounded-full ring-2 ring-slate-600 overflow-hidden bg-slate-900 mt-2 mb-2 flex items-center justify-center">
                  <CombatAvatar
                    photoUrl={top2.photoUrl}
                    defaultType={top2.defaultAvatarType}
                    gender={top2.gender}
                    size="lg"
                  />
                </div>

                <h4 className="font-black text-white uppercase text-base truncate max-w-full group-hover:text-slate-300">
                  {top2.fullName}
                </h4>
                <p className="text-[11px] text-slate-400 font-bold uppercase">
                  {top2.discipline} · {top2.beltRank}
                </p>

                <div className="mt-3 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-black text-slate-200 w-full">
                  <span className="text-emerald-400 font-black text-sm">{top2.calculatedPoints} PTS</span>
                  <span className="text-slate-400 text-[10px] ml-2">({top2.calculatedWins}W - {top2.calculatedLosses}L)</span>
                </div>
              </div>
            )}

            {/* GOLD (#1) - Center Elevated */}
            {top1 && (
              <div
                onClick={() => onViewProfile && onViewProfile(top1)}
                className="order-1 md:order-2 p-6 rounded-2xl bg-black border-2 border-yellow-500/60 hover:border-yellow-400 transition-all cursor-pointer flex flex-col items-center text-center relative shadow-2xl md:-translate-y-3 group"
              >
                <div className="absolute -top-3.5 px-3.5 py-1 rounded-full bg-yellow-500 text-slate-950 text-xs font-black uppercase flex items-center gap-1 shadow-md">
                  <Crown className="w-3.5 h-3.5" />
                  CHAMPION #1
                </div>

                <div className="w-24 h-24 rounded-full ring-4 ring-yellow-400/80 overflow-hidden bg-slate-900 mt-2 mb-2 flex items-center justify-center shadow-xl">
                  <CombatAvatar
                    photoUrl={top1.photoUrl}
                    defaultType={top1.defaultAvatarType}
                    gender={top1.gender}
                    size="xl"
                  />
                </div>

                <h4 className="font-black text-white uppercase text-lg sm:text-xl truncate max-w-full group-hover:text-yellow-400">
                  {top1.fullName}
                </h4>
                <p className="text-xs text-yellow-400/90 font-bold uppercase">
                  {top1.discipline} · {top1.beltRank}
                </p>

                <div className="mt-3 px-4 py-2 rounded-xl bg-slate-900 border border-yellow-500/30 text-xs font-black text-white w-full">
                  <span className="text-yellow-400 font-black text-base">{top1.calculatedPoints} PTS</span>
                  <span className="text-slate-400 text-xs ml-2">({top1.calculatedWins}W - {top1.calculatedLosses}L)</span>
                </div>
              </div>
            )}

            {/* BRONZE (#3) */}
            {top3 && (
              <div
                onClick={() => onViewProfile && onViewProfile(top3)}
                className="order-3 p-5 rounded-2xl bg-black border border-slate-800 hover:border-slate-600 transition-all cursor-pointer flex flex-col items-center text-center relative shadow-lg group"
              >
                <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-amber-900/80 border border-amber-600/60 text-amber-300 text-[11px] font-black uppercase flex items-center gap-1">
                  <Medal className="w-3 h-3 text-amber-500" />
                  RANK #3
                </div>

                <div className="w-20 h-20 rounded-full ring-2 ring-amber-600/60 overflow-hidden bg-slate-900 mt-2 mb-2 flex items-center justify-center">
                  <CombatAvatar
                    photoUrl={top3.photoUrl}
                    defaultType={top3.defaultAvatarType}
                    gender={top3.gender}
                    size="lg"
                  />
                </div>

                <h4 className="font-black text-white uppercase text-base truncate max-w-full group-hover:text-slate-300">
                  {top3.fullName}
                </h4>
                <p className="text-[11px] text-slate-400 font-bold uppercase">
                  {top3.discipline} · {top3.beltRank}
                </p>

                <div className="mt-3 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-black text-slate-200 w-full">
                  <span className="text-amber-400 font-black text-sm">{top3.calculatedPoints} PTS</span>
                  <span className="text-slate-400 text-[10px] ml-2">({top3.calculatedWins}W - {top3.calculatedLosses}L)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SEARCH & FILTER CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950 border border-slate-800 p-4 rounded-2xl">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search fighters by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-slate-600"
          />
        </div>

        {/* Discipline & Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs font-bold uppercase focus:outline-none focus:border-slate-600 cursor-pointer"
          >
            {DISCIPLINES.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Disciplines' : d}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs font-bold uppercase focus:outline-none focus:border-slate-600 cursor-pointer"
          >
            <option value="points">Sort: Most Points</option>
            <option value="wins">Sort: Most Wins</option>
            <option value="winRate">Sort: Win Rate %</option>
          </select>
        </div>
      </div>

      {/* 5. FULL RANKINGS TABLE */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <span>Fighter Standings ({filteredRankings.length})</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Wins × 100 PTS
          </span>
        </div>

        {filteredRankings.length === 0 ? (
          <div className="p-10 text-center text-slate-500 space-y-2">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs font-bold uppercase tracking-wider">No fighters match current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4 text-center w-16">Rank</th>
                  <th className="py-3 px-4">Fighter</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Discipline & Class</th>
                  <th className="py-3 px-4 text-center">Points</th>
                  <th className="py-3 px-4 text-center">Record</th>
                  <th className="py-3 px-4 text-center hidden md:table-cell">Win Rate</th>
                  <th className="py-3 px-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredRankings.map((m, index) => {
                  const rank = index + 1;
                  const isTop1 = rank === 1;
                  const isTop2 = rank === 2;
                  const isTop3 = rank === 3;

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-900/40 transition-colors group cursor-pointer"
                      onClick={() => onViewProfile && onViewProfile(m)}
                    >
                      {/* Rank Number */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black ${
                            isTop1
                              ? 'bg-yellow-500 text-slate-950 shadow-md'
                              : isTop2
                              ? 'bg-slate-700 text-white'
                              : isTop3
                              ? 'bg-amber-900/80 text-amber-200'
                              : 'text-slate-400'
                          }`}
                        >
                          {rank}
                        </span>
                      </td>

                      {/* Fighter Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                            <CombatAvatar
                              photoUrl={m.photoUrl}
                              defaultType={m.defaultAvatarType}
                              gender={m.gender}
                              size="sm"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-white group-hover:text-slate-200 truncate flex items-center gap-1.5">
                              <span>{m.fullName}</span>
                              {isTop1 && <Crown className="w-3 h-3 text-yellow-400 shrink-0" />}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {m.beltRank} · {m.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Discipline */}
                      <td className="py-3.5 px-4 hidden sm:table-cell">
                        <span className="text-slate-300 font-bold block">{m.discipline}</span>
                        <span className="text-[10px] text-slate-400">{m.weightClass} ({m.weight}kg)</span>
                      </td>

                      {/* Points */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black border border-slate-800 text-emerald-400 font-black text-sm shadow-inner">
                          <Zap className="w-3 h-3 text-emerald-400" />
                          {m.calculatedPoints}
                        </span>
                      </td>

                      {/* Record */}
                      <td className="py-3.5 px-4 text-center font-bold">
                        <span className="text-emerald-400">{m.calculatedWins}W</span>
                        <span className="text-slate-600 mx-1">-</span>
                        <span className="text-rose-400">{m.calculatedLosses}L</span>
                        {m.calculatedDraws > 0 && (
                          <>
                            <span className="text-slate-600 mx-1">-</span>
                            <span className="text-slate-400">{m.calculatedDraws}D</span>
                          </>
                        )}
                      </td>

                      {/* Win Rate */}
                      <td className="py-3.5 px-4 text-center hidden md:table-cell">
                        <span className="font-extrabold text-slate-300">{m.winRate}%</span>
                      </td>

                      {/* View Profile Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onViewProfile) onViewProfile(m);
                          }}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                          title="View Fighter Profile"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
