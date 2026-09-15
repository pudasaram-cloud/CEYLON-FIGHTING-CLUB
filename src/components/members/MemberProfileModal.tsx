'use client';

import React, { useState } from 'react';
import { Member } from '@/types';
import { CombatAvatar } from '@/components/ui/CombatAvatars';
import { ClubEmblem } from '@/components/ui/ClubLogo';
import { FighterAccessCard } from '@/components/members/FighterAccessCard';
import { formatLKR } from '@/utils/helpers';
import {
  X,
  Printer,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Trophy,
  Activity,
  CreditCard,
  UserCheck,
  Zap,
  FileText,
  Sparkles,
} from 'lucide-react';

interface MemberProfileModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  member,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [activeView, setActiveView] = useState<'dossier' | 'card'>('dossier');

  if (!isOpen || !member) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-black border border-slate-800 rounded-3xl max-w-3xl w-full my-auto shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Action Bar */}
        <div className="no-print p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <ClubEmblem className="w-8 h-8" />
            
            {/* View Tabs */}
            <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setActiveView('dossier')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeView === 'dossier'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Fighter Dossier</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('card')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeView === 'card'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>💳 Access Card (PNG)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeView === 'dossier' && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Print Pass</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onEdit(member);
              }}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Edit Member"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onClose();
                onDelete(member);
              }}
              className="p-1.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-400 hover:text-rose-200 transition-colors cursor-pointer"
              title="Delete Member"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        {activeView === 'card' ? (
          <div className="p-6 sm:p-8 overflow-y-auto">
            <FighterAccessCard member={member} />
          </div>
        ) : (
          /* Modal Printable Dossier Content */
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 print:p-4 print:text-black">
            {/* Quick Access Card Banner */}
            <div className="no-print p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Official Combat Access Pass Ready</span>
                  <span className="text-[10px] text-slate-400">Generate high-resolution PNG pass with security chip & barcoding</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('card')}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-md"
              >
                View & Save PNG
              </button>
            </div>

            {/* Header Fighter Hero Card */}
            <div className="relative p-6 rounded-2xl bg-black border border-slate-800 overflow-hidden print:border-black print:bg-none">
            {/* Ambient Watermark */}
            <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none w-48 h-48">
              <ClubEmblem className="w-full h-full" />
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
              <CombatAvatar
                photoUrl={member.photoUrl}
                defaultType={member.defaultAvatarType}
                gender={member.gender}
                size="xl"
                className="ring-4 ring-blue-600/50 shadow-2xl shrink-0"
              />

              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-mono text-xs font-bold tracking-wider">
                    {member.id}
                  </span>
                  {member.idNumber && (
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
                      Citizen ID: {member.idNumber}
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                      member.paymentStatus === 'Paid'
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400'
                        : 'bg-amber-950/60 border border-amber-500/40 text-amber-400'
                    }`}
                  >
                    Fee: {member.paymentStatus === 'Paid' ? 'Paid (LKR 1,500)' : 'Pending LKR 1,500'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  {member.fullName}
                </h1>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-slate-400">
                  <span className="font-semibold text-blue-400">
                    {member.discipline} · {member.beltRank}
                  </span>
                  <span>•</span>
                  <span>{member.gender}</span>
                  <span>•</span>
                  <span>{member.age} yrs old</span>
                  <span>•</span>
                  <span className="font-bold text-white">{member.weightClass}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Weight</div>
              <div className="text-lg font-black text-white mt-0.5">{member.weight} kg</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Attendance</div>
              <div className="text-lg font-black text-cyan-400 mt-0.5">
                {member.attendanceCount || 1} Sessions
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Sparring Record</div>
              <div className="text-lg font-black text-emerald-400 mt-0.5">
                {member.sparringRecord?.wins || 0}W - {member.sparringRecord?.losses || 0}L
              </div>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contact Information */}
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>Contact Details</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{member.phoneNumber}</span>
                </div>
                {member.email && (
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.address && (
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{member.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Registered on {member.registrationDate}</span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Emergency Contact</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Name</span>
                  <span className="font-semibold text-white">
                    {member.emergencyContact.name} ({member.emergencyContact.relationship})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Emergency Phone</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {member.emergencyContact.phone}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Admission Fee</span>
                  <span className="font-semibold text-emerald-400">
                    LKR 1,500 · {member.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {member.notes && (
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Coach Notes & Medical Profile
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                &ldquo;{member.notes}&rdquo;
              </p>
            </div>
          )}

          {/* Printable Official Footer (Only visible when printing) */}
          <div className="hidden print:block pt-6 border-t border-black text-center text-xs">
            <p className="font-bold uppercase">Ceylon Fighting Club · Colombo Headquarters</p>
            <p className="text-[10px] mt-1">Official Member ID Pass & Combat Certification Dossier</p>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
