'use client';

import React, { useState } from 'react';
import { useClub } from '@/context/ClubContext';
import { ClubEvent } from '@/types';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import {
  Flame,
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Trophy,
  CheckCircle,
  X,
} from 'lucide-react';

export const ActivitiesSection: React.FC = () => {
  const { events, addClubEvent } = useClub();
  const [modalOpen, setModalOpen] = useState(false);

  // New Event Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ClubEvent['category']>('Fight Night');
  const [date, setDate] = useState('2026-10-10');
  const [time, setTime] = useState('18:00 - 21:00');
  const [location, setLocation] = useState('Sugathadasa Indoor Stadium, Colombo');
  const [participantsCount, setParticipantsCount] = useState<number>(20);
  const [description, setDescription] = useState('');

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addClubEvent({
      title,
      category,
      date,
      time,
      location,
      participantsCount: Number(participantsCount) || 12,
      status: 'Upcoming',
      description,
    });

    setModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Activities, Fights & Events
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tournaments, open mat sparring sessions, belt promotions, and masterclasses
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Schedule Combat Event</span>
        </button>
      </div>

      {/* Events Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((evt) => {
          return (
            <div
              key={evt.id}
              className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-xl flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-400 font-bold text-[10px] uppercase tracking-wider">
                    {evt.category}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      evt.status === 'Upcoming'
                        ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    ● {evt.status}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white group-hover:text-blue-300 transition-colors mb-2">
                  {evt.title}
                </h3>

                {evt.description && (
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {evt.description}
                  </p>
                )}

                <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-900">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{evt.date}</span>
                    <span className="text-slate-600">|</span>
                    <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{evt.time}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{evt.location}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{evt.participantsCount} Registered Combatants</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-900 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  CFC Official Sanctioned
                </span>
                <span className="text-xs font-semibold text-blue-400">
                  Confirmed on Calendar
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Audit Activity Feed */}
      <div className="pt-4">
        <RecentActivityFeed limit={15} />
      </div>

      {/* Schedule Event Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-black border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  Schedule Combat Event
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ceylon Cage Warriors: Season Finale"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Event Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Fight Night">Fight Night</option>
                    <option value="Sparring Session">Sparring Session</option>
                    <option value="Belt Grading">Belt Grading</option>
                    <option value="Masterclass Workshop">Masterclass Workshop</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Participants
                  </label>
                  <input
                    type="number"
                    value={participantsCount}
                    onChange={(e) => setParticipantsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="18:00 - 21:30"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Location / Arena
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Sugathadasa Stadium or CFC Main Dojo"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Event itinerary, weight-in schedule, ticket info..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
