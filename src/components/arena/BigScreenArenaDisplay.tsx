'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useClub } from '@/context/ClubContext';
import { CombatAvatar } from '@/components/ui/CombatAvatars';
import { ClubEmblem } from '@/components/ui/ClubLogo';
import {
  Swords,
  Clock,
  Flame,
  Trophy,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Zap,
  RotateCcw,
  Lock,
  Plus,
} from 'lucide-react';
import { getRelativeTime } from '@/utils/helpers';

export const BigScreenArenaDisplay: React.FC = () => {
  const { matches, bets, members, activeMatchId, updateMatch, setActiveMatchId } = useClub();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [latestBetAlert, setLatestBetAlert] = useState<any>(null);
  const prevBetsCountRef = useRef(bets.length);

  // Web Audio chime for new bets
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  // Sound effect and alert banner when bet is placed
  useEffect(() => {
    if (bets.length > prevBetsCountRef.current && bets.length > 0) {
      playChime();
      const newestBet = bets[0];
      setLatestBetAlert(newestBet);
      const timer = setTimeout(() => {
        setLatestBetAlert(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
    prevBetsCountRef.current = bets.length;
  }, [bets.length, bets]);

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Identify Active Live Match & Queued Matches
  const activeMatch = useMemo(() => {
    if (activeMatchId) {
      const found = matches.find((m) => m.id === activeMatchId);
      if (found) return found;
    }
    return (
      matches.find((m) => m.status === 'Live') ||
      matches.find((m) => m.status === 'Upcoming') ||
      matches[0] ||
      null
    );
  }, [matches, activeMatchId]);

  // Upcoming Queued Matches (excluding the current active match)
  const queuedMatches = useMemo(() => {
    return matches.filter(
      (m) => m.id !== activeMatch?.id && (m.status === 'Upcoming' || m.status === 'Live')
    );
  }, [matches, activeMatch]);

  // Fighters for Active Match
  const fighter1 = useMemo(() => {
    if (!activeMatch) return null;
    return members.find((m) => m.id === activeMatch.fighter1Id) || null;
  }, [activeMatch, members]);

  const fighter2 = useMemo(() => {
    if (!activeMatch) return null;
    return members.find((m) => m.id === activeMatch.fighter2Id) || null;
  }, [activeMatch, members]);

  // Active Match Bets & Financial Calculation
  const matchBets = useMemo(() => {
    if (!activeMatch) return [];
    return bets.filter(
      (b) =>
        b.matchId === activeMatch.id ||
        (fighter1 && b.fighterName && b.fighterName.toLowerCase() === fighter1.fullName.toLowerCase()) ||
        (fighter2 && b.fighterName && b.fighterName.toLowerCase() === fighter2.fullName.toLowerCase())
    );
  }, [bets, activeMatch, fighter1, fighter2]);

  const fighter1Bets = useMemo(() => {
    if (!activeMatch || !fighter1) return [];
    return matchBets.filter(
      (b) =>
        b.fighterId === fighter1.id ||
        b.fighterId === 'fighter1' ||
        (b.fighterName && b.fighterName.toLowerCase() === fighter1.fullName.toLowerCase())
    );
  }, [matchBets, activeMatch, fighter1]);

  const fighter2Bets = useMemo(() => {
    if (!activeMatch || !fighter2) return [];
    return matchBets.filter(
      (b) =>
        b.fighterId === fighter2.id ||
        b.fighterId === 'fighter2' ||
        (b.fighterName && b.fighterName.toLowerCase() === fighter2.fullName.toLowerCase())
    );
  }, [matchBets, activeMatch, fighter2]);

  const fighter1Total = fighter1Bets.reduce((acc, b) => acc + b.amount, 0);
  const fighter2Total = fighter2Bets.reduce((acc, b) => acc + b.amount, 0);
  const totalPot = fighter1Total + fighter2Total;
  const clubRake = totalPot * (activeMatch?.houseCommissionRate || 0.1);
  const netWinnerPot = totalPot - clubRake;

  // Dynamic Odds Multipliers
  const f1Multiplier =
    fighter1Total > 0 ? (netWinnerPot / fighter1Total).toFixed(2) : '2.00';
  const f2Multiplier =
    fighter2Total > 0 ? (netWinnerPot / fighter2Total).toFixed(2) : '2.00';

  // 7-Minute Wagering Timer Calculation & State
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (!activeMatch) return 420;
    if (activeMatch.bettingEndsAt) {
      const end = new Date(activeMatch.bettingEndsAt).getTime();
      return !isNaN(end) ? Math.max(0, Math.floor((end - Date.now()) / 1000)) : 420;
    }
    return (activeMatch.bettingDurationMinutes || 7) * 60;
  });
  const [isBettingClosed, setIsBettingClosed] = useState<boolean>(false);

  useEffect(() => {
    if (!activeMatch) {
      setSecondsRemaining(0);
      setIsBettingClosed(true);
      return;
    }

    if (activeMatch.status === 'Finished') {
      setSecondsRemaining(0);
      setIsBettingClosed(true);
      return;
    }

    // If match is marked Live but doesn't have bettingEndsAt initialized yet, auto-initialize
    if (activeMatch.status === 'Live' && !activeMatch.bettingEndsAt) {
      const duration = activeMatch.bettingDurationMinutes || 7;
      const endsAt = new Date(Date.now() + duration * 60 * 1000).toISOString();
      updateMatch(activeMatch.id, { bettingEndsAt: endsAt, isBettingLocked: false });
    }

    const calcTime = () => {
      if (activeMatch.status === 'Finished') {
        setSecondsRemaining(0);
        setIsBettingClosed(true);
        return;
      }

      if (activeMatch.isBettingLocked) {
        setSecondsRemaining(0);
        setIsBettingClosed(true);
        return;
      }

      if (!activeMatch.bettingEndsAt) {
        const durationSecs = (activeMatch.bettingDurationMinutes || 7) * 60;
        setSecondsRemaining(durationSecs);
        setIsBettingClosed(activeMatch.status !== 'Live');
        return;
      }

      const end = new Date(activeMatch.bettingEndsAt).getTime();
      if (isNaN(end)) {
        setSecondsRemaining(0);
        setIsBettingClosed(true);
        return;
      }

      const now = Date.now();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setSecondsRemaining(diff);

      const closed = diff <= 0 || Boolean(activeMatch.isBettingLocked);
      setIsBettingClosed(closed);

      // Sound chime when time runs out
      if (diff === 0 && activeMatch.status === 'Live' && !activeMatch.isBettingLocked) {
        updateMatch(activeMatch.id, { isBettingLocked: true });
        playChime();
      }
    };

    calcTime();
    const interval = setInterval(calcTime, 1000);
    return () => clearInterval(interval);
  }, [
    activeMatch?.id,
    activeMatch?.status,
    activeMatch?.bettingEndsAt,
    activeMatch?.isBettingLocked,
    activeMatch?.bettingDurationMinutes,
    updateMatch
  ]);

  // Live Screen Operator Controls
  const handleResetTimer = (minutes = 7) => {
    if (!activeMatch) return;
    const newEndTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    updateMatch(activeMatch.id, {
      bettingEndsAt: newEndTime,
      isBettingLocked: false,
      status: 'Live',
    });
    playChime();
  };

  const handleExtendTimer = (additionalMinutes = 3) => {
    if (!activeMatch) return;
    const currentEnd = activeMatch.bettingEndsAt
      ? new Date(activeMatch.bettingEndsAt).getTime()
      : Date.now();
    const base = Math.max(Date.now(), isNaN(currentEnd) ? Date.now() : currentEnd);
    const newEndTime = new Date(base + additionalMinutes * 60 * 1000).toISOString();
    updateMatch(activeMatch.id, {
      bettingEndsAt: newEndTime,
      isBettingLocked: false,
      status: 'Live',
    });
    playChime();
  };

  const handleToggleBettingLock = () => {
    if (!activeMatch) return;
    const newLocked = !isBettingClosed;
    updateMatch(activeMatch.id, {
      isBettingLocked: newLocked,
      bettingEndsAt: newLocked ? new Date().toISOString() : new Date(Date.now() + 7 * 60 * 1000).toISOString(),
      status: 'Live',
    });
    playChime();
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between select-none overflow-x-hidden font-sans relative">
      {/* 1. REAL-TIME WAGER POPUP BANNER */}
      {latestBetAlert && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2.5 border border-slate-700">
            <Zap className="w-4 h-4 fill-current text-amber-400 animate-bounce shrink-0" />
            <span>
              WAGER: <strong>{latestBetAlert.betterName}</strong> placed{' '}
              <span className="text-emerald-400">
                ${Number(latestBetAlert.amount || 0).toLocaleString()}
              </span>{' '}
              on <strong>{latestBetAlert.fighterName}</strong>!
            </span>
          </div>
        </div>
      )}

      {/* 2. TOP HEADER BROADCAST BAR */}
      <header className="px-6 py-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <ClubEmblem className="w-9 h-9" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-widest uppercase text-white leading-tight">
                CEYLON FIGHTING CLUB
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                STADIUM DISPLAY
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Live Arena Wagering · Official Fight Card
            </p>
          </div>
        </div>

        {/* Center: Live Match Title */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-white">
            {activeMatch ? activeMatch.title : 'Match Arena'}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-bold text-slate-400 uppercase">
            {activeMatch?.category || 'Championship'}
          </span>
        </div>

        {/* Right: Sound & Screen Controls */}
        <div className="flex items-center gap-2">
          {matches.length > 1 && (
            <select
              value={activeMatch?.id || ''}
              onChange={(e) => setActiveMatchId(e.target.value)}
              className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-slate-600 cursor-pointer max-w-[180px] truncate"
              title="Select Active Match"
            >
              {matches.map((m, idx) => (
                <option key={m.id} value={m.id}>
                  Fight #{idx + 1}: {m.title}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Toggle Fullscreen (F11)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-yellow-400" /> : <Maximize2 className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </header>

      {/* 3. MAIN ARENA STADIUM BODY (Streamlined & Clean - No Bulky Nested Boxes!) */}
      <main className="flex-1 p-4 lg:p-6 max-w-[1800px] w-full mx-auto flex flex-col justify-center gap-5 z-10">
        {!activeMatch || !fighter1 || !fighter2 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3 shadow-xl">
              <Swords className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-1">
              Arena Ready · Awaiting Match Call
            </h2>
            <p className="text-xs text-slate-400">
              The fight coordinator is setting up the next matchup. It will appear here live.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* HERO VS SHOWROOM GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* FIGHTER 1 (Left - Cols 1-5) */}
              <div className="lg:col-span-5 rounded-2xl bg-slate-950 border border-slate-800 p-5 flex flex-col items-center text-center relative shadow-lg">
                <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-black">
                    FIGHTER 1
                  </span>
                  <span>{fighter1.discipline} · {fighter1.weight} KG</span>
                </div>

                {/* Avatar */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-900 flex items-center justify-center shadow-lg my-1">
                  <CombatAvatar
                    photoUrl={fighter1.photoUrl}
                    defaultType={fighter1.defaultAvatarType}
                    gender={fighter1.gender}
                    size="xl"
                  />
                </div>

                {/* Fighter Name */}
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight truncate max-w-full mt-2">
                  {fighter1.fullName}
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase mt-0.5">
                  {fighter1.beltRank}
                </p>

                {/* Streamlined Single Pot & Multiplier Bar */}
                <div className="w-full mt-4 pt-3 border-t border-slate-800 flex items-center justify-around bg-black py-2.5 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Pool Pot</span>
                    <span className="text-xl font-black text-white">${fighter1Total.toLocaleString()}</span>
                  </div>
                  <div className="border-l border-slate-800 pl-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Odds</span>
                    <span className="text-xl font-black text-emerald-400">{f1Multiplier}x</span>
                  </div>
                </div>
              </div>

              {/* CENTER ARENA VS & TIMER CORE (Middle - Cols 6-7) */}
              <div className="lg:col-span-2 rounded-2xl bg-slate-950 border border-slate-800 p-4 flex flex-col items-center justify-center text-center shadow-lg space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white font-black text-xl shadow-md">
                  VS
                </div>

                {/* Real-time Countdown Timer */}
                <div className="w-full space-y-1">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-black uppercase text-slate-400 mb-0.5">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{isBettingClosed ? 'Wagering Window' : '7-Min Window'}</span>
                    </div>

                    <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                      {activeMatch.status === 'Finished'
                        ? 'CLOSED'
                        : isBettingClosed && secondsRemaining <= 0
                        ? 'CLOSED'
                        : timerStr}
                    </div>

                    <span className="text-[9px] font-bold uppercase tracking-wider block text-slate-400 mt-0.5">
                      {activeMatch.status === 'Finished'
                        ? 'MATCH FINISHED'
                        : isBettingClosed
                        ? 'BETS LOCKED · FIGHT LIVE'
                        : 'OPEN FOR BETS'}
                    </span>
                  </div>

                  {/* Minimal Operator Controls */}
                  <div className="flex items-center justify-center gap-1 pt-1">
                    {isBettingClosed ? (
                      <button
                        onClick={() => handleResetTimer(7)}
                        className="px-2 py-0.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1 shadow-sm"
                        title="Reset 7m timer"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Reset 7m</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleExtendTimer(3)}
                          className="px-1.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-[10px] font-bold cursor-pointer"
                          title="Add +3 minutes"
                        >
                          +3m
                        </button>
                        <button
                          onClick={handleToggleBettingLock}
                          className="px-2 py-0.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1 shadow-sm"
                          title="Lock betting"
                        >
                          <Lock className="w-2.5 h-2.5" />
                          <span>Lock</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Total Pool */}
                <div className="w-full pt-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Pool</span>
                  <span className="text-xl font-black text-emerald-400">${totalPot.toLocaleString()}</span>
                </div>
              </div>

              {/* FIGHTER 2 (Right - Cols 8-12) */}
              <div className="lg:col-span-5 rounded-2xl bg-slate-950 border border-slate-800 p-5 flex flex-col items-center text-center relative shadow-lg">
                <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase mb-3">
                  <span>{fighter2.discipline} · {fighter2.weight} KG</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-black">
                    FIGHTER 2
                  </span>
                </div>

                {/* Avatar */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-900 flex items-center justify-center shadow-lg my-1">
                  <CombatAvatar
                    photoUrl={fighter2.photoUrl}
                    defaultType={fighter2.defaultAvatarType}
                    gender={fighter2.gender}
                    size="xl"
                  />
                </div>

                {/* Fighter Name */}
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight truncate max-w-full mt-2">
                  {fighter2.fullName}
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase mt-0.5">
                  {fighter2.beltRank}
                </p>

                {/* Streamlined Single Pot & Multiplier Bar */}
                <div className="w-full mt-4 pt-3 border-t border-slate-800 flex items-center justify-around bg-black py-2.5 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Odds</span>
                    <span className="text-xl font-black text-emerald-400">{f2Multiplier}x</span>
                  </div>
                  <div className="border-l border-slate-800 pl-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Pool Pot</span>
                    <span className="text-xl font-black text-white">${fighter2Total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WINNER BANNER IF DECIDED */}
            {activeMatch.status === 'Finished' && (
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-center shadow-xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-center gap-2 text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                  <Trophy className="w-6 h-6 text-yellow-400 animate-bounce" />
                  <span>
                    WINNER:{' '}
                    {activeMatch.winnerId === fighter1.id
                      ? fighter1.fullName
                      : activeMatch.winnerId === fighter2.id
                      ? fighter2.fullName
                      : 'DRAW MATCH'}
                  </span>
                  <Trophy className="w-6 h-6 text-yellow-400 animate-bounce" />
                </div>
              </div>
            )}

            {/* 4. STREAMLINED BOTTOM BAR: RECENT WAGERS TICKER & UP NEXT */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Recent Wagers Strip (Cols 1-8) */}
              <div className="md:col-span-8 rounded-xl bg-slate-950 border border-slate-800 p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs">
                  <span className="font-black uppercase text-slate-300 flex items-center gap-1.5 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Recent Live Wagers ({matchBets.length})
                  </span>
                  <span className="text-[10px] text-slate-400">Total: ${totalPot.toLocaleString()}</span>
                </div>

                {matchBets.length === 0 ? (
                  <p className="text-[11px] text-slate-500 py-3 text-center italic">
                    Waiting for first wager on active match...
                  </p>
                ) : (
                  <div className="space-y-1 mt-2 max-h-32 overflow-y-auto pr-1">
                    {matchBets.slice(0, 5).map((bet) => {
                      const isF1 = bet.fighterId === fighter1.id;
                      return (
                        <div
                          key={bet.id}
                          className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-300">
                              {isF1 ? '#1' : '#2'}
                            </span>
                            <span className="font-bold text-white truncate">{bet.betterName}</span>
                            <span className="text-[11px] text-slate-400 hidden sm:inline">
                              on {bet.fighterName?.split(' ')[0]}
                            </span>
                          </div>
                          <span className="font-black text-emerald-400 shrink-0">
                            +${Number(bet.amount || 0).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Up Next in Queue (Cols 9-12) */}
              <div className="md:col-span-4 rounded-xl bg-slate-950 border border-slate-800 p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs">
                  <span className="font-black uppercase text-slate-300 flex items-center gap-1.5 text-[11px]">
                    <Swords className="w-3.5 h-3.5 text-slate-400" />
                    Up Next In Card
                  </span>
                  <span className="text-[10px] text-slate-400">{queuedMatches.length} Queued</span>
                </div>

                {queuedMatches.length === 0 ? (
                  <p className="text-[11px] text-slate-500 py-3 text-center italic">
                    No further matches scheduled.
                  </p>
                ) : (
                  <div className="space-y-1 mt-2 max-h-32 overflow-y-auto pr-1">
                    {queuedMatches.slice(0, 3).map((qm, idx) => {
                      const qf1 = members.find((m) => m.id === qm.fighter1Id);
                      const qf2 = members.find((m) => m.id === qm.fighter2Id);
                      return (
                        <div
                          key={qm.id}
                          className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs"
                        >
                          <span className="text-white font-bold truncate">
                            #{idx + 1}: {qf1?.fullName.split(' ')[0] || 'F1'} vs {qf2?.fullName.split(' ')[0] || 'F2'}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            {qm.category}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. SUBTLE FOOTER */}
      <footer className="px-6 py-2 bg-slate-950 border-t border-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
        <span>Ceylon Fighting Club Live Arena Broadcast</span>
        <span>Spectator View · Realtime Synced</span>
      </footer>
    </div>
  );
};
