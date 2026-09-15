'use client';

import React, { useState, useEffect } from 'react';
import { Member, FightMatch } from '@/types';
import { useClub } from '@/context/ClubContext';
import { CombatAvatar } from '@/components/ui/CombatAvatars';
import { X, DollarSign, User, Zap, Sparkles, TrendingUp } from 'lucide-react';

interface PlaceBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: FightMatch | null;
  fighter1: Member | null;
  fighter2: Member | null;
  defaultFighterId?: string;
  fighter1TotalBets: number;
  fighter2TotalBets: number;
}

const PRESET_AMOUNTS = [25, 50, 100, 250, 500, 1000];

export const PlaceBetModal: React.FC<PlaceBetModalProps> = ({
  isOpen,
  onClose,
  match,
  fighter1,
  fighter2,
  defaultFighterId,
  fighter1TotalBets,
  fighter2TotalBets,
}) => {
  const { placeBet } = useClub();
  const [selectedFighterId, setSelectedFighterId] = useState<string>('');
  const [betterName, setBetterName] = useState<string>('');
  const [amount, setAmount] = useState<number | ''>(100);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultFighterId) {
      setSelectedFighterId(defaultFighterId);
    } else if (fighter1) {
      setSelectedFighterId(fighter1.id);
    }
  }, [defaultFighterId, fighter1, isOpen]);

  if (!isOpen || !match || !fighter1 || !fighter2) return null;

  const totalPool = fighter1TotalBets + fighter2TotalBets;
  const selectedFighter = selectedFighterId === fighter1.id ? fighter1 : fighter2;
  const isFighter1 = selectedFighterId === fighter1.id;

  // Check if betting is locked or time has expired
  const isTimeExpired = match.bettingEndsAt
    ? new Date(match.bettingEndsAt).getTime() <= Date.now()
    : false;
  const isBettingClosed = match.isBettingLocked || isTimeExpired || match.status === 'Finished';

  // Calculate estimated payout with 10% club commission (90% prize pool)
  const betVal = Number(amount || 0);
  const houseRate = match.houseCommissionRate ?? 0.10;
  
  const simFighterPool = (isFighter1 ? fighter1TotalBets : fighter2TotalBets) + betVal;
  const simTotalPool = totalPool + betVal;
  const simNetPrizePool = simTotalPool * (1 - houseRate);
  const simPayout = simFighterPool > 0 ? (betVal / simFighterPool) * simNetPrizePool : betVal;
  const simProfit = Math.max(0, simPayout - betVal);
  const simMultiplier = betVal > 0 ? (simPayout / betVal).toFixed(2) : '1.00';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBettingClosed) return;
    if (!betterName.trim() || !amount || Number(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      await placeBet({
        matchId: match.id,
        fighterId: selectedFighter.id,
        fighterName: selectedFighter.fullName,
        betterName: betterName.trim(),
        amount: Number(amount),
        currency: '$',
        note: note.trim() || undefined,
      });
      // Reset form
      setBetterName('');
      setAmount(100);
      setNote('');
      onClose();
    } catch (err) {
      console.error('Error placing bet:', err);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 text-white my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-yellow-400 font-black shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              Place Fight Bet <span className="text-emerald-400">($)</span>
            </h2>
            <p className="text-xs text-slate-400">
              {match.title} · Live Arena Wagering
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Fighter Selection Cards */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Select Your Fighter</span>
              <span className="text-[11px] text-slate-500">Pick winner</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* Fighter 1 */}
              <button
                type="button"
                onClick={() => setSelectedFighterId(fighter1.id)}
                className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col items-center gap-2 relative cursor-pointer ${
                  selectedFighterId === fighter1.id
                    ? 'bg-slate-900 border-slate-600 ring-2 ring-slate-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                <span className="absolute top-2 left-2.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  FIGHTER 1
                </span>
                <div className="mt-3">
                  <CombatAvatar
                    photoUrl={fighter1.photoUrl}
                    defaultType={fighter1.defaultAvatarType}
                    gender={fighter1.gender}
                    size="lg"
                  />
                </div>
                <div className="text-center w-full">
                  <p className="text-xs sm:text-sm font-black text-white truncate">
                    {fighter1.fullName}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    {fighter1.discipline}
                  </p>
                  <div className="mt-1.5 px-2 py-0.5 rounded-lg bg-black border border-slate-800 text-[11px] font-extrabold text-white">
                    ${fighter1TotalBets.toLocaleString()} Pool
                  </div>
                </div>
              </button>

              {/* Fighter 2 */}
              <button
                type="button"
                onClick={() => setSelectedFighterId(fighter2.id)}
                className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col items-center gap-2 relative cursor-pointer ${
                  selectedFighterId === fighter2.id
                    ? 'bg-slate-900 border-slate-600 ring-2 ring-slate-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                <span className="absolute top-2 right-2.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  FIGHTER 2
                </span>
                <div className="mt-3">
                  <CombatAvatar
                    photoUrl={fighter2.photoUrl}
                    defaultType={fighter2.defaultAvatarType}
                    gender={fighter2.gender}
                    size="lg"
                  />
                </div>
                <div className="text-center w-full">
                  <p className="text-xs sm:text-sm font-black text-white truncate">
                    {fighter2.fullName}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    {fighter2.discipline}
                  </p>
                  <div className="mt-1.5 px-2 py-0.5 rounded-lg bg-black border border-slate-800 text-[11px] font-extrabold text-white">
                    ${fighter2TotalBets.toLocaleString()} Pool
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Better's Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Your Name (Better / Spectator Name) *</span>
            </label>
            <input
              type="text"
              required
              value={betterName}
              onChange={(e) => setBetterName(e.target.value)}
              placeholder="e.g. Kasun Perera, Dave Smith, Marcus"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 text-sm font-medium transition-all"
            />
          </div>

          {/* Bet Amount Input + Quick Preset Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Wager Amount ($ USD) *</span>
              </label>
              <span className="text-xs text-yellow-400 font-bold">
                Selected: ${Number(amount || 0).toLocaleString()}
              </span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400 font-black text-base">
                $
              </div>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="100"
                className="w-full pl-8 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-black text-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
              />
            </div>

            {/* Preset Amount Chips */}
            <div className="grid grid-cols-6 gap-1.5 pt-1">
              {PRESET_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    amount === val
                      ? 'bg-yellow-500 text-slate-950 font-black shadow-md shadow-yellow-500/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Note / Prediction */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Note / Prediction (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. KO Round 2, By Submission, Main Event Win"
              className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-700 text-xs"
            />
          </div>

          {/* 10% Commission Pari-Mutuel Payout Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">
                  Backing <strong className="text-white">{selectedFighter.fullName}</strong>
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Total Pot: </span>
                <span className="font-extrabold text-white">
                  ${simTotalPool.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payout Calculation with 10% Club Commission */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Est. Payout If Won (90% Pool):</span>
                <span className="text-emerald-400 font-black text-sm">
                  ${Math.round(simPayout).toLocaleString()}{' '}
                  <span className="text-xs font-semibold text-emerald-500/80">({simMultiplier}x return)</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">Net Profit:</span>
                <span className="text-emerald-400 font-black text-sm">
                  +${Math.round(simProfit).toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 pt-1 leading-tight">
              ⚡ 10% Ceylon FC house fee is retained; remaining 90% pot is distributed proportionally to all bettors who picked the winning fighter.
            </p>
          </div>

          {/* Betting Closed Alert */}
          {isBettingClosed && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold text-center flex items-center justify-center gap-2">
              <span>🔒 Betting is closed for this match. The 7-minute wagering period has ended.</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isBettingClosed || !betterName.trim() || !amount}
              className="w-2/3 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Bet...</span>
                </>
              ) : isBettingClosed ? (
                <span>🔒 Betting Locked</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Confirm ${Number(amount || 0).toLocaleString()} Bet</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
