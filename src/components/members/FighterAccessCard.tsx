'use client';

import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Member } from '@/types';
import { CombatAvatar } from '@/components/ui/CombatAvatars';
import { ClubEmblem } from '@/components/ui/ClubLogo';
import {
  Download,
  CreditCard,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  QrCode,
  Layers,
} from 'lucide-react';

interface FighterAccessCardProps {
  member: Member;
}

export const FighterAccessCard: React.FC<FighterAccessCardProps> = ({ member }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cardOrientation, setCardOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

  const handleDownloadPNG = async () => {
    if (!cardRef.current) return;

    try {
      setIsDownloading(true);

      // Wait a tick for fonts/styles
      await new Promise((resolve) => setTimeout(resolve, 150));

      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2.5, // Ultra-crisp high-DPI PNG
        cacheBust: true,
        backgroundColor: '#000000',
      });

      const fileName = `${member.fullName.trim().replace(/\s+/g, '_')}_${member.id}_Access_Card.png`;
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to generate PNG image:', err);
      // Fallback: trigger alert
      alert('Could not generate PNG image directly. Please try again or use the print option.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Control Bar: Orientation switch & Download button */}
      <div className="flex flex-wrap items-center justify-between gap-3 w-full max-w-2xl px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-blue-400" />
            <span>Card Layout:</span>
          </span>
          <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setCardOrientation('horizontal')}
              className={`px-3 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                cardOrientation === 'horizontal'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              VIP Horizontal Pass
            </button>
            <button
              type="button"
              onClick={() => setCardOrientation('vertical')}
              className={`px-3 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                cardOrientation === 'vertical'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Lanyard Badge
            </button>
          </div>
        </div>

        {/* Download as PNG button */}
        <button
          type="button"
          disabled={isDownloading}
          onClick={handleDownloadPNG}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-60"
        >
          {isDownloading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating PNG...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Save Card as PNG</span>
            </>
          )}
        </button>
      </div>

      {/* The Printable / Capturable Card Container */}
      <div className="w-full flex justify-center overflow-x-auto py-2 px-1">
        {cardOrientation === 'horizontal' ? (
          /* ========================================================
             1. HORIZONTAL VIP COMBAT ACCESS PASS (CR80 Standard)
             ======================================================== */
          <div
            ref={cardRef}
            id="fighter-access-card"
            className="w-[620px] h-[360px] rounded-3xl p-6 relative overflow-hidden bg-black border-2 border-blue-600 shrink-0 flex flex-col justify-between select-none"
          >
            {/* Background Watermark Crest */}
            <div className="absolute right-[-30px] bottom-[-30px] opacity-10 pointer-events-none w-72 h-72">
              <ClubEmblem className="w-full h-full" />
            </div>

            {/* Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />

            {/* Top Bar */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <ClubEmblem className="w-10 h-10" />
                <div>
                  <div className="text-base font-black tracking-widest text-white uppercase leading-tight flex items-center gap-1.5">
                    <span>CEYLON</span>
                    <span className="text-blue-500">FIGHTING</span>
                    <span className="text-white">CLUB</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                    Official Combat Sports All-Access Pass
                  </div>
                </div>
              </div>

              {/* Holographic Security Chip */}
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-8 rounded-md bg-amber-400 border border-amber-300 shadow-sm flex flex-col justify-between p-1">
                  <div className="w-full h-1 bg-yellow-800/30 rounded" />
                  <div className="flex justify-between">
                    <div className="w-2.5 h-2 bg-yellow-800/30 rounded" />
                    <div className="w-2.5 h-2 bg-yellow-800/30 rounded" />
                  </div>
                  <div className="w-full h-1 bg-yellow-800/30 rounded" />
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-black font-mono text-white tracking-wider">
                    {member.id}
                  </span>
                  <span className="text-[8px] text-slate-400 font-bold uppercase">
                    COLOMBO HQ
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Fighter Biometrics & Profile */}
            <div className="flex items-center gap-5 my-auto relative z-10">
              {/* Photo & Ring */}
              <div className="relative shrink-0">
                <div className="p-1 rounded-2xl bg-blue-600 shadow-md">
                  <CombatAvatar
                    photoUrl={member.photoUrl}
                    defaultType={member.defaultAvatarType}
                    gender={member.gender}
                    size="xl"
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-blue-600 text-[9px] font-bold text-white uppercase tracking-wider shadow">
                  FIGHTER
                </div>
              </div>

              {/* Details Column */}
              <div className="flex-1 min-w-0">
                <div className="text-xl font-black text-white uppercase tracking-tight truncate leading-tight">
                  {member.fullName}
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-bold uppercase tracking-wide mt-0.5 mb-2.5">
                  <span>{member.discipline}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-blue-300">{member.beltRank}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-950 border border-slate-800 rounded-xl p-2">
                  <div>
                    <span className="text-slate-500 uppercase block font-bold text-[8px]">CITIZEN ID</span>
                    <span className="font-mono text-white font-bold truncate block">{member.idNumber || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block font-bold text-[8px]">DIVISION</span>
                    <span className="text-white font-bold truncate block">{member.weightClass.split(' ')[0]}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block font-bold text-[8px]">WEIGHT / HEIGHT</span>
                    <span className="text-white font-bold block">{member.weight}kg · {member.height}cm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar: Access Badge & Barcode */}
            <div className="flex items-end justify-between pt-3 border-t border-slate-800/90 relative z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    member.paymentStatus === 'Paid'
                      ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-300'
                      : 'bg-amber-950/90 border border-amber-500/50 text-amber-300'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{member.paymentStatus === 'Paid' ? 'PAID VERIFIED (LKR 1,500)' : 'PAYMENT PENDING'}</span>
                </div>

                <div className="text-[9px] text-slate-400 font-semibold">
                  DOJO & CAGE ACCESS ACTIVE
                </div>
              </div>

              {/* Barcode representation */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-0.5 h-6">
                  {/* Simulated barcode stripes */}
                  <div className="w-1 h-full bg-white" />
                  <div className="w-0.5 h-full bg-transparent" />
                  <div className="w-2 h-full bg-white" />
                  <div className="w-0.5 h-full bg-transparent" />
                  <div className="w-0.5 h-full bg-white" />
                  <div className="w-1 h-full bg-white" />
                  <div className="w-1.5 h-full bg-white" />
                  <div className="w-0.5 h-full bg-white" />
                  <div className="w-2 h-full bg-white" />
                  <div className="w-1 h-full bg-white" />
                  <div className="w-0.5 h-full bg-white" />
                  <div className="w-1.5 h-full bg-white" />
                  <div className="w-2 h-full bg-white" />
                </div>
                <span className="font-mono text-[8px] text-slate-400 mt-0.5 tracking-widest">
                  *{member.id}*
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             2. VERTICAL LANYARD BADGE (Event & Gym Hanging Badge)
             ======================================================== */
          <div
            ref={cardRef}
            id="fighter-lanyard-badge"
            className="w-[380px] h-[580px] rounded-3xl p-6 relative overflow-hidden bg-black border-2 border-blue-600 shrink-0 flex flex-col justify-between select-none text-center"
          >
            {/* Lanyard Hole Punch Slot */}
            <div className="mx-auto w-12 h-2.5 rounded-full bg-slate-900 border border-slate-700 mb-2" />

            {/* Top Logo */}
            <div className="flex flex-col items-center justify-center">
              <ClubEmblem className="w-12 h-12 mb-1.5" />
              <div className="text-base font-black tracking-widest text-white uppercase leading-tight">
                CEYLON <span className="text-blue-500">FIGHTING</span> <span className="text-white">CLUB</span>
              </div>
              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                OFFICIAL FIGHTER ACCESS BADGE
              </div>
            </div>

            {/* Big Avatar */}
            <div className="my-2 relative flex justify-center">
              <div className="p-1 rounded-2xl bg-blue-600 shadow-md inline-block">
                <CombatAvatar
                  photoUrl={member.photoUrl}
                  defaultType={member.defaultAvatarType}
                  gender={member.gender}
                  size="2xl"
                  className="w-28 h-28 rounded-xl object-cover"
                />
              </div>
            </div>

            {/* Fighter Info */}
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                {member.fullName}
              </h2>
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                {member.discipline} · {member.beltRank}
              </div>
              <div className="inline-block px-3 py-0.5 rounded-full bg-blue-950/60 border border-blue-600/40 text-xs font-bold font-mono text-blue-200">
                ID: {member.id}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 text-left text-xs bg-slate-950 border border-slate-800 rounded-2xl p-3 my-2">
              <div>
                <span className="text-[8px] uppercase font-bold text-slate-500 block">CITIZEN ID</span>
                <span className="font-mono text-white font-bold text-xs truncate block">{member.idNumber || '—'}</span>
              </div>
              <div>
                <span className="text-[8px] uppercase font-bold text-slate-500 block">DIVISION</span>
                <span className="text-white font-bold text-xs truncate block">{member.weightClass}</span>
              </div>
              <div>
                <span className="text-[8px] uppercase font-bold text-slate-500 block">WEIGHT & HEIGHT</span>
                <span className="text-white font-semibold text-xs block">{member.weight} kg · {member.height} cm</span>
              </div>
              <div>
                <span className="text-[8px] uppercase font-bold text-slate-500 block">FEE STATUS</span>
                <span className="text-emerald-400 font-bold text-xs block">LKR 1,500 ({member.paymentStatus})</span>
              </div>
            </div>

            {/* Bottom Barcode */}
            <div className="pt-2 border-t border-slate-900 flex flex-col items-center">
              <div className="flex items-center gap-0.5 h-6">
                <div className="w-1 h-full bg-white" />
                <div className="w-1.5 h-full bg-white" />
                <div className="w-0.5 h-full bg-transparent" />
                <div className="w-2 h-full bg-white" />
                <div className="w-0.5 h-full bg-white" />
                <div className="w-1 h-full bg-white" />
                <div className="w-2 h-full bg-white" />
                <div className="w-0.5 h-full bg-white" />
                <div className="w-1 h-full bg-white" />
              </div>
              <span className="font-mono text-[9px] text-slate-400 tracking-widest mt-1">
                AUTHENTICATED COMBAT ATHLETE PASS
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
