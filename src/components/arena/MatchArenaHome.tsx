'use client';

import React, { useState, useEffect } from 'react';
import { useClub } from '@/context/ClubContext';
import { Member, FightMatch, FightBet } from '@/types';
import { CombatAvatar } from '@/components/ui/CombatAvatars';
import { PlaceBetModal } from './PlaceBetModal';
import { CreateMatchModal } from './CreateMatchModal';
import {
  Swords,
  DollarSign,
  UserPlus,
  Trophy,
  Shield,
  Clock,
  Plus,
  Award,
  Zap,
  Trash2,
  Lock,
  RotateCcw,
  Tv,
  ExternalLink,
  Play,
} from 'lucide-react';
import { getRelativeTime } from '@/utils/helpers';

interface MatchArenaHomeProps {
  onOpenRegister: () => void;
  onViewProfile?: (member: Member) => void;
}

export const MatchArenaHome: React.FC<MatchArenaHomeProps> = ({
  onOpenRegister,
  onViewProfile,
}) => {
  const {
    members,
    matches,
    bets,
    activeMatch,
    setActiveMatchId,
    updateMatch,
    declareMatchWinner,
    launchQueuedMatch,
    deleteMatch,
    showToast,
  } = useClub();

  // Queued upcoming matches (excluding the currently active match)
  const queuedMatches = matches.filter(
    (m) => m.id !== activeMatch?.id && m.status === 'Upcoming'
  );

  const [betModalOpen, setBetModalOpen] = useState(false);
  const [createMatchModalOpen, setCreateMatchModalOpen] = useState(false);
  const [selectedBetFighterId, setSelectedBetFighterId] = useState<string | undefined>(undefined);

  // Resolve Fighter 1 & Fighter 2 for the active match
  const fighter1: Member | undefined = activeMatch
    ? members.find((m) => m.id === activeMatch.fighter1Id)
    : undefined;

  const fighter2: Member | undefined = activeMatch
    ? members.find((m) => m.id === activeMatch.fighter2Id)
    : undefined;

  // Filter bets for active match
  const matchBets = activeMatch ? bets.filter((b) => b.matchId === activeMatch.id) : [];
  const fighter1Bets = matchBets.filter((b) => b.fighterId === activeMatch?.fighter1Id);
  const fighter2Bets = matchBets.filter((b) => b.fighterId === activeMatch?.fighter2Id);

  const fighter1Total = fighter1Bets.reduce((sum, b) => sum + b.amount, 0);
  const fighter2Total = fighter2Bets.reduce((sum, b) => sum + b.amount, 0);
  const totalPot = fighter1Total + fighter2Total;

  // 10% Club Commission (House Fee) & 90% Distributable Winner Pool
  const houseRate = activeMatch?.houseCommissionRate ?? 0.10;
  const clubCommission = Math.round(totalPot * houseRate);
  const netWinnerPot = totalPot - clubCommission;

  const fighter1Percent = totalPot > 0 ? Math.round((fighter1Total / totalPot) * 100) : 50;
  const fighter2Percent = totalPot > 0 ? 100 - fighter1Percent : 50;

  const f1Multiplier = fighter1Total > 0 ? (netWinnerPot / fighter1Total).toFixed(2) : '1.00';
  const f2Multiplier = fighter2Total > 0 ? (netWinnerPot / fighter2Total).toFixed(2) : '1.00';

  // 7-Minute Countdown Timer State
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (!activeMatch) return 420;
    if (activeMatch.bettingEndsAt) {
      const end = new Date(activeMatch.bettingEndsAt).getTime();
      return !isNaN(end) ? Math.max(0, Math.floor((end - Date.now()) / 1000)) : 420;
    }
    return (activeMatch.bettingDurationMinutes || 7) * 60;
  });

  useEffect(() => {
    if (!activeMatch) {
      setSecondsRemaining(0);
      return;
    }

    if (activeMatch.status === 'Finished') {
      setSecondsRemaining(0);
      return;
    }

    // Auto-initialize bettingEndsAt only when match is Live and has none set
    if (activeMatch.status === 'Live' && !activeMatch.bettingEndsAt) {
      const duration = activeMatch.bettingDurationMinutes || 7;
      const endsAt = new Date(Date.now() + duration * 60 * 1000).toISOString();
      updateMatch(activeMatch.id, { bettingEndsAt: endsAt, isBettingLocked: false });
    }

    const calculateDiff = () => {
      if (activeMatch.status === 'Finished' || activeMatch.isBettingLocked) {
        return 0;
      }
      if (!activeMatch.bettingEndsAt) {
        return (activeMatch.bettingDurationMinutes || 7) * 60;
      }
      const end = new Date(activeMatch.bettingEndsAt).getTime();
      if (isNaN(end)) return 0;
      return Math.max(0, Math.floor((end - Date.now()) / 1000));
    };

    setSecondsRemaining(calculateDiff());

    const timer = setInterval(() => {
      const diff = calculateDiff();
      setSecondsRemaining(diff);

      if (diff === 0 && !activeMatch.isBettingLocked && activeMatch.status === 'Live') {
        updateMatch(activeMatch.id, { isBettingLocked: true });
        showToast('⏰ Wagering window has closed! The match is underway. Betting is locked.', 'warning');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    activeMatch?.id,
    activeMatch?.bettingEndsAt,
    activeMatch?.isBettingLocked,
    activeMatch?.status,
    activeMatch?.bettingDurationMinutes,
    updateMatch,
    showToast
  ]);

  const isBettingClosed =
    !activeMatch ||
    activeMatch.status === 'Finished' ||
    Boolean(activeMatch.isBettingLocked) ||
    secondsRemaining <= 0;

  const timerMinutes = Math.floor(secondsRemaining / 60);
  const timerSeconds = secondsRemaining % 60;
  const formattedCountdown = `${String(timerMinutes).padStart(2, '0')}:${String(timerSeconds).padStart(2, '0')}`;

  const handleOpenBetForFighter = (fighterId: string) => {
    if (isBettingClosed) {
      showToast('🔒 Betting is closed for this match.', 'warning');
      return;
    }
    setSelectedBetFighterId(fighterId);
    setBetModalOpen(true);
  };

  const handleSetWinner = async (winnerId: string) => {
    if (!activeMatch) return;
    await declareMatchWinner(activeMatch.id, winnerId);
  };

  const handleResetTimer = (minutes = 7) => {
    if (!activeMatch) return;
    const newEndTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    updateMatch(activeMatch.id, {
      bettingEndsAt: newEndTime,
      isBettingLocked: false,
      status: 'Live',
    });
    showToast(`⏰ Betting window reset to ${minutes} minutes!`, 'info');
  };

  const handleLockBettingNow = () => {
    if (!activeMatch) return;
    updateMatch(activeMatch.id, {
      isBettingLocked: true,
      bettingEndsAt: new Date().toISOString(),
    });
    showToast('🔒 Betting locked immediately.', 'warning');
  };

  const handleExtendTimer = (additionalMinutes = 3) => {
    if (!activeMatch) return;
    const currentEnd = activeMatch.bettingEndsAt
      ? new Date(activeMatch.bettingEndsAt).getTime()
      : Date.now();
    const base = Math.max(Date.now(), currentEnd);
    const newEndTime = new Date(base + additionalMinutes * 60 * 1000).toISOString();
    updateMatch(activeMatch.id, {
      bettingEndsAt: newEndTime,
      isBettingLocked: false,
      status: 'Live',
    });
    showToast(`⏰ Extended by +${additionalMinutes} minutes!`, 'info');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 2. HEADLINE ACTIVE MATCH CARD */}
      {!activeMatch || !fighter1 || !fighter2 ? (
        /* Empty State */
        <div className="p-8 sm:p-12 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <Swords className="w-8 h-8 text-slate-400" />
          </div>
          <div className="max-w-sm mx-auto space-y-1">
            <h2 className="text-xl font-black uppercase tracking-tight text-white">
              No Active Match in Ring
            </h2>
            <p className="text-xs text-slate-400">
              Select 2 fighters from the roster to launch a live match and open wagering.
            </p>
          </div>
          <div className="pt-2">
            {members.length < 2 ? (
              <p className="text-xs font-semibold text-slate-400">
                Please use the <span className="text-red-400 font-bold">+ Register Fighter</span> button in the navigation bar to register fighters first.
              </p>
            ) : (
              <button
                onClick={() => setCreateMatchModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <Swords className="w-4 h-4" />
                <span>Launch Match Now</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Streamlined Single Match Card (No Duplicate Boxes!) */
        <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden">
          {/* Top Sub-Bar: Title, Category, Timer & Winner Controls */}
          <div className="px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950">
            {/* Match info & category */}
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                {activeMatch.category}
              </span>
              <span className="text-xs font-extrabold text-white uppercase tracking-wide">
                {activeMatch.title}
              </span>
            </div>

            {/* Center: Live 7-min countdown with minimal controls */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                {activeMatch.status === 'Finished'
                  ? 'FINISHED'
                  : isBettingClosed
                  ? 'BETS LOCKED'
                  : 'CLOSES IN:'}
              </span>
              <span className="font-mono text-sm font-black text-white">
                {activeMatch.status === 'Finished'
                  ? '00:00'
                  : isBettingClosed
                  ? 'LOCKED'
                  : formattedCountdown}
              </span>

              {/* Action buttons right in the bar */}
              {activeMatch.status !== 'Finished' && (
                <div className="flex items-center gap-1 ml-1.5 pl-2 border-l border-slate-800">
                  {!isBettingClosed ? (
                    <button
                      onClick={handleLockBettingNow}
                      className="px-2 py-0.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase cursor-pointer"
                      title="Lock betting now"
                    >
                      Lock
                    </button>
                  ) : (
                    <button
                      onClick={() => handleResetTimer(7)}
                      className="px-2 py-0.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1"
                      title="Reset 7m countdown"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Reset 7m</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleExtendTimer(3)}
                    className="px-1.5 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold cursor-pointer"
                    title="Add +3 minutes"
                  >
                    +3m
                  </button>
                </div>
              )}
            </div>

            {/* Right: Winner controls & Match Switcher */}
            <div className="flex items-center gap-2">
              {activeMatch.status !== 'Finished' ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase hidden sm:inline">
                    Winner:
                  </span>
                  <button
                    onClick={() => handleSetWinner(fighter1.id)}
                    className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    🏆 {fighter1.fullName.split(' ')[0]}
                  </button>
                  <button
                    onClick={() => handleSetWinner(fighter2.id)}
                    className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    🏆 {fighter2.fullName.split(' ')[0]}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold shadow-md">
                  <Award className="w-3.5 h-3.5 text-yellow-400" />
                  <span>
                    Winner:{' '}
                    {activeMatch.winnerId === fighter1.id
                      ? `${fighter1.fullName} (+100 PTS)`
                      : activeMatch.winnerId === fighter2.id
                      ? `${fighter2.fullName} (+100 PTS)`
                      : 'Draw'}
                  </span>
                </div>
              )}

              {matches.length > 1 && (
                <select
                  value={activeMatch?.id || ''}
                  onChange={(e) => setActiveMatchId(e.target.value)}
                  className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-slate-500 cursor-pointer max-w-[150px] truncate"
                >
                  {matches.map((m, idx) => (
                    <option key={m.id} value={m.id}>
                      #{idx + 1}: {m.title}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={() => deleteMatch(activeMatch.id)}
                title="Delete Match"
                className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Clean Unified Matchup Stage (Fighter 1 VS Fighter 2) */}
          <div className="p-5 sm:p-7">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              {/* FIGHTER 1 (Left Column) */}
              <div className="lg:col-span-5 flex flex-col items-center text-center p-4 rounded-2xl bg-black border border-slate-800">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-wider mb-3">
                  FIGHTER 1
                </span>

                {/* Avatar */}
                <div className="relative mb-2">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-2 ring-slate-700 overflow-hidden flex items-center justify-center bg-slate-900">
                    <CombatAvatar
                      photoUrl={fighter1.photoUrl}
                      defaultType={fighter1.defaultAvatarType}
                      gender={fighter1.gender}
                      size="xl"
                      className="w-full h-full"
                    />
                  </div>
                  {activeMatch.winnerId === fighter1.id && (
                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-slate-950 p-1.5 rounded-full shadow-lg font-black text-xs">
                      <Trophy className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Name & Basic Info */}
                <h3
                  onClick={() => onViewProfile && onViewProfile(fighter1)}
                  className="text-lg sm:text-xl font-black text-white uppercase tracking-tight hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {fighter1.fullName}
                </h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase mt-0.5">
                  {fighter1.discipline} · {fighter1.weight}kg · {fighter1.beltRank}
                </p>

                {/* Single Consolidated Pool Readout */}
                <div className="mt-3 w-full pt-3 border-t border-slate-800 flex items-center justify-between text-xs px-2">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Pool Share</span>
                    <span className="text-sm font-black text-white">${fighter1Total.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 ml-1 font-semibold">({fighter1Percent}%)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Payout</span>
                    <span className="text-sm font-black text-emerald-400">{f1Multiplier}x</span>
                  </div>
                </div>

                {/* Red Bet Button */}
                <button
                  onClick={() => handleOpenBetForFighter(fighter1.id)}
                  disabled={isBettingClosed}
                  className={`w-full mt-3 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 transition-all ${
                    isBettingClosed
                      ? 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                      : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                  }`}
                >
                  {isBettingClosed ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      <span>+ Bet on {fighter1.fullName.split(' ')[0]}</span>
                    </>
                  )}
                </button>
              </div>

              {/* CENTER NEXUS (Middle Column) */}
              <div className="lg:col-span-2 flex flex-col items-center justify-center text-center py-2 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-lg text-white shadow-md">
                  VS
                </div>

                {/* Total Combined Pot in Center (Only place it appears!) */}
                <div className="text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Total Pool
                  </span>
                  <span className="text-2xl font-black text-emerald-400 tracking-tight block">
                    ${totalPot.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    90% Winner Pot: ${netWinnerPot.toLocaleString()}
                  </span>
                </div>

                {/* Tug-of-war bar */}
                <div className="w-full max-w-[150px] space-y-1">
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                    <div
                      style={{ width: `${fighter1Percent}%` }}
                      className="bg-slate-600 transition-all duration-300"
                    />
                    <div
                      style={{ width: `${fighter2Percent}%` }}
                      className="bg-slate-400 transition-all duration-300"
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 px-0.5">
                    <span>{fighter1Percent}%</span>
                    <span>{fighter2Percent}%</span>
                  </div>
                </div>
              </div>

              {/* FIGHTER 2 (Right Column) */}
              <div className="lg:col-span-5 flex flex-col items-center text-center p-4 rounded-2xl bg-black border border-slate-800">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-wider mb-3">
                  FIGHTER 2
                </span>

                {/* Avatar */}
                <div className="relative mb-2">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-2 ring-slate-700 overflow-hidden flex items-center justify-center bg-slate-900">
                    <CombatAvatar
                      photoUrl={fighter2.photoUrl}
                      defaultType={fighter2.defaultAvatarType}
                      gender={fighter2.gender}
                      size="xl"
                      className="w-full h-full"
                    />
                  </div>
                  {activeMatch.winnerId === fighter2.id && (
                    <div className="absolute -bottom-1 -left-1 bg-yellow-400 text-slate-950 p-1.5 rounded-full shadow-lg font-black text-xs">
                      <Trophy className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Name & Basic Info */}
                <h3
                  onClick={() => onViewProfile && onViewProfile(fighter2)}
                  className="text-lg sm:text-xl font-black text-white uppercase tracking-tight hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {fighter2.fullName}
                </h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase mt-0.5">
                  {fighter2.discipline} · {fighter2.weight}kg · {fighter2.beltRank}
                </p>

                {/* Single Consolidated Pool Readout */}
                <div className="mt-3 w-full pt-3 border-t border-slate-800 flex items-center justify-between text-xs px-2">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Payout</span>
                    <span className="text-sm font-black text-emerald-400">{f2Multiplier}x</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Pool Share</span>
                    <span className="text-sm font-black text-white">${fighter2Total.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 ml-1 font-semibold">({fighter2Percent}%)</span>
                  </div>
                </div>

                {/* Red Bet Button */}
                <button
                  onClick={() => handleOpenBetForFighter(fighter2.id)}
                  disabled={isBettingClosed}
                  className={`w-full mt-3 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 transition-all ${
                    isBettingClosed
                      ? 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                      : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                  }`}
                >
                  {isBettingClosed ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      <span>+ Bet on {fighter2.fullName.split(' ')[0]}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. RECENT MATCH WAGERS (Streamlined Single Table instead of 2 massive bulky boxes!) */}
      {activeMatch && matchBets.length > 0 && (
        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Recent Wagers ({matchBets.length})
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              Total Wagered: ${totalPot.toLocaleString()}
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {matchBets.slice(0, 15).map((bet) => {
              const isF1 = bet.fighterId === fighter1?.id;
              const fighterName = isF1 ? fighter1?.fullName : fighter2?.fullName;
              const isWinner = activeMatch.status === 'Finished' && activeMatch.winnerId === bet.fighterId;

              return (
                <div
                  key={bet.id}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs border ${
                    isWinner
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold uppercase">
                      {isF1 ? '#1' : '#2'}
                    </span>
                    <span className="font-bold text-white truncate">{bet.betterName}</span>
                    <span className="text-slate-400 text-[11px] hidden sm:inline">
                      on <strong className="text-slate-200">{fighterName?.split(' ')[0]}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-black text-emerald-400">+${bet.amount.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400">{getRelativeTime(bet.timestamp)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. UPCOMING FIGHT QUEUE (Clean & Compact) */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Upcoming Fight Queue ({queuedMatches.length})
            </h3>
          </div>

          <button
            onClick={() => setCreateMatchModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Fight</span>
          </button>
        </div>

        {queuedMatches.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">No fights currently queued.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {queuedMatches.map((qm, idx) => {
              const qf1 = members.find((m) => m.id === qm.fighter1Id);
              const qf2 = members.find((m) => m.id === qm.fighter2Id);

              return (
                <div
                  key={qm.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      #{idx + 1} · {qm.category}
                    </span>
                    <p className="font-extrabold text-white truncate">
                      {qf1?.fullName.split(' ')[0] || 'F1'} vs {qf2?.fullName.split(' ')[0] || 'F2'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => launchQueuedMatch(qm.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] uppercase tracking-wider shadow-sm flex items-center gap-1 cursor-pointer"
                      title="Launch to live ring"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start</span>
                    </button>
                    <button
                      onClick={() => deleteMatch(qm.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <PlaceBetModal
        isOpen={betModalOpen}
        onClose={() => {
          setBetModalOpen(false);
          setSelectedBetFighterId(undefined);
        }}
        match={activeMatch}
        fighter1={fighter1 || null}
        fighter2={fighter2 || null}
        defaultFighterId={selectedBetFighterId}
        fighter1TotalBets={fighter1Total}
        fighter2TotalBets={fighter2Total}
      />

      <CreateMatchModal
        isOpen={createMatchModalOpen}
        onClose={() => setCreateMatchModalOpen(false)}
        onOpenRegister={onOpenRegister}
      />
    </div>
  );
};
