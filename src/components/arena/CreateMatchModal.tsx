'use client';

import React, { useState } from 'react';
import { Member, MatchStatus } from '@/types';
import { useClub } from '@/context/ClubContext';
import { CombatAvatar } from '@/components/ui/CombatAvatars';
import { X, Swords, Trophy, Calendar, Clock, AlertCircle } from 'lucide-react';

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister?: () => void;
}

export const CreateMatchModal: React.FC<CreateMatchModalProps> = ({
  isOpen,
  onClose,
  onOpenRegister,
}) => {
  const { members, createMatch } = useClub();

  const [fighter1Id, setFighter1Id] = useState<string>('');
  const [fighter2Id, setFighter2Id] = useState<string>('');
  const [title, setTitle] = useState<string>('Ceylon Championship 2026: Main Event');
  const [category, setCategory] = useState<string>('MMA Championship');
  const [status, setStatus] = useState<MatchStatus>('Upcoming');
  const [scheduledDate, setScheduledDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState<string>('20:00');
  const [bettingDurationMinutes, setBettingDurationMinutes] = useState<number>(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const fighter1 = members.find((m) => m.id === fighter1Id);
  const fighter2 = members.find((m) => m.id === fighter2Id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fighter1Id || !fighter2Id || fighter1Id === fighter2Id) return;

    setIsSubmitting(true);
    try {
      await createMatch({
        fighter1Id,
        fighter2Id,
        title: title.trim() || `${fighter1?.fullName} vs ${fighter2?.fullName}`,
        category,
        status,
        scheduledDate,
        scheduledTime,
        bettingDurationMinutes,
        houseCommissionRate: 0.10,
      });
      onClose();
    } catch (err) {
      console.error('Error creating match:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 text-white my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white font-black shadow-md">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              Matchmaker & Fight Card
            </h2>
            <p className="text-xs text-slate-400">
              Select 2 registered fighters to launch active match on Home Arena
            </p>
          </div>
        </div>

        {members.length < 2 ? (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto" />
            <h3 className="text-sm font-bold text-white uppercase">At least 2 Fighters Needed</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Please use the <span className="text-red-400 font-bold">+ Register Fighter</span> button in the navigation bar to add fighters.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Fighter Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Fighter 1 */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Fighter 1 *
                  </label>
                </div>

                <select
                  required
                  value={fighter1Id}
                  onChange={(e) => setFighter1Id(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-slate-500 transition-all cursor-pointer"
                >
                  <option value="">-- Choose Fighter 1 --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id} disabled={m.id === fighter2Id}>
                      {m.fullName} ({m.weightClass} · {m.discipline})
                    </option>
                  ))}
                </select>

                {fighter1 && (
                  <div className="flex items-center gap-2.5 pt-1">
                    <CombatAvatar
                      photoUrl={fighter1.photoUrl}
                      defaultType={fighter1.defaultAvatarType}
                      gender={fighter1.gender}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{fighter1.fullName}</p>
                      <p className="text-[10px] text-slate-400">
                        {fighter1.weight}kg · {fighter1.beltRank}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Fighter 2 */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Fighter 2 *
                  </label>
                </div>

                <select
                  required
                  value={fighter2Id}
                  onChange={(e) => setFighter2Id(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-slate-500 transition-all cursor-pointer"
                >
                  <option value="">-- Choose Fighter 2 --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id} disabled={m.id === fighter1Id}>
                      {m.fullName} ({m.weightClass} · {m.discipline})
                    </option>
                  ))}
                </select>

                {fighter2 && (
                  <div className="flex items-center gap-2.5 pt-1">
                    <CombatAvatar
                      photoUrl={fighter2.photoUrl}
                      defaultType={fighter2.defaultAvatarType}
                      gender={fighter2.gender}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{fighter2.fullName}</p>
                      <p className="text-[10px] text-slate-400">
                        {fighter2.weight}kg · {fighter2.beltRank}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Match Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Match Title / Banner Headline
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Ceylon Championship 2026: Main Event"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            {/* Discipline Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Combat Discipline / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="MMA Championship">MMA Championship</option>
                  <option value="Muay Thai World Title">Muay Thai World Title</option>
                  <option value="Boxing Main Event">Boxing Main Event</option>
                  <option value="Brazilian Jiu-Jitsu Super Fight">BJJ Super Fight</option>
                  <option value="Kickboxing Showcase">Kickboxing Showcase</option>
                  <option value="Underground Fight Night">Underground Fight Night</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Arena Destination
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MatchStatus)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="Upcoming">⏳ Add to Match Queue (Upcoming Fight Card)</option>
                  <option value="Live">🔴 Start LIVE in Arena Immediately</option>
                  <option value="Finished">🏁 Finished (Archived Record)</option>
                </select>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-400" />
                  <span>Date</span>
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span>Fight Time</span>
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* 7-Minute Wagering Window & 10% Commission Rule */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Betting Window Duration</span>
                </label>
                <span className="text-[11px] font-black text-white px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40">
                  {bettingDurationMinutes} Minutes Window
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                {[5, 7, 10, 15].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setBettingDurationMinutes(mins)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      bettingDurationMinutes === mins
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {mins === 7 ? '⭐ 7 min' : `${mins} min`}
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800/80">
                <p className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <span>⏱️ 7-min countdown starts immediately when match is scheduled.</span>
                </p>
                <p className="leading-tight text-slate-400">
                  🔒 After 7 minutes expire, betting automatically locks and the fight begins.
                </p>
                <p className="leading-tight text-yellow-400/90 font-medium">
                  💰 10% Club Commission is retained by Ceylon FC; remaining 90% pot is paid out proportionally to winning bettors.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !fighter1Id || !fighter2Id || fighter1Id === fighter2Id}
                className="w-2/3 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Scheduling Fight...</span>
                  </>
                ) : (
                  <>
                    <Swords className="w-4 h-4" />
                    <span>Launch Match on Arena</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
