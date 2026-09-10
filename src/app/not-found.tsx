'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Flame } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center space-y-6 bg-slate-950/80 border border-slate-800/80 p-8 sm:p-10 rounded-2xl backdrop-blur-xl shadow-2xl shadow-blue-950/20">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 tracking-wider uppercase">
            <Flame className="w-3.5 h-3.5" /> 404 Out of Bounds
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase font-heading">
            Dojo Sector Not Found
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The page or training zone you are looking for has been moved or does not exist in Ceylon Fighting Club records.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-blue-600/25 active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Headquarters
          </Link>
        </div>
      </div>
    </div>
  );
}
