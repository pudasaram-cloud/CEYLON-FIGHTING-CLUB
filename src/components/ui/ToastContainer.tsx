'use client';

import React from 'react';
import { useClub } from '@/context/ClubContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useClub();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      {toasts.map((toast) => {
        let borderClass = 'border-blue-500/50 text-blue-100';
        let bgClass = 'bg-slate-900/90';
        let Icon = Info;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/60 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.2)]';
          bgClass = 'bg-[#061510]/95';
          Icon = CheckCircle2;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/60 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.2)]';
          bgClass = 'bg-[#181106]/95';
          Icon = AlertTriangle;
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-500/60 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.2)]';
          bgClass = 'bg-[#18080a]/95';
          Icon = AlertCircle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${bgClass} ${borderClass}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-snug flex-1">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
