'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useClub } from '@/context/ClubContext';
import { ClubEmblem } from '@/components/ui/ClubLogo';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Zap, ArrowRight, Trophy } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useClub();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(email, password);
      setIsLoading(false);
    }, 600);
  };

  const fillDemoCredentials = () => {
    setEmail('admin@ceylonfc.lk');
    setPassword('Champion2026');
    setTimeout(() => {
      login('admin@ceylonfc.lk', 'Champion2026');
    }, 300);
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-black text-white relative overflow-y-auto lg:overflow-hidden">

      {/* Left Column: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-8 lg:px-12 lg:py-8 z-10 lg:h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClubEmblem className="w-9 h-9" />
            <div className="flex flex-col">
              <span className="font-black text-base tracking-wider uppercase text-white leading-tight">
                CEYLON <span className="text-blue-500">FIGHTING</span> <span className="text-white">CLUB</span>
              </span>
              <span className="text-[9px] text-slate-400 font-semibold tracking-widest uppercase">
                Combat Sports Management System
              </span>
            </div>
          </div>
        </div>

        {/* Center Form Container */}
        <div className="max-w-[390px] w-full mx-auto my-auto py-2 sm:py-4">
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
              Ceylon <span className="text-blue-500">Fighting</span> <span className="text-white">Club</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium italic">
              &ldquo;Manage Fighters. Build Champions.&rdquo;
            </p>
          </div>

          {/* Quick Demo Fill Pill */}
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="w-full mb-4 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 text-left transition-all duration-200 flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-white uppercase tracking-wide">
                  Quick Access Demo
                </div>
                <div className="text-[10px] text-slate-400">
                  Click to auto-fill & login as Fight Director
                </div>
              </div>
            </div>
            <span className="text-[11px] text-blue-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Enter <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email / Username Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold tracking-wide text-slate-300 uppercase">
                Email / Admin Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ceylonfc.lk"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold tracking-wide text-slate-300 uppercase">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer"
                />
                <span className="text-[11px] font-medium text-slate-400 hover:text-slate-300">
                  Remember Me
                </span>
              </label>

              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button (Solid Red Button) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wider text-white uppercase bg-red-600 hover:bg-red-700 active:scale-[0.99] transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Access Fighting Club HQ</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Security badge */}
          <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Encrypted 256-Bit Martial Arts Admin Session</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-slate-600 flex flex-col sm:flex-row justify-between gap-1.5 pt-2">
          <span>© 2026 Ceylon Fighting Club. All Rights Reserved.</span>
          <span>Sri Lanka Combat Sports Federation Member</span>
        </div>
      </div>

      {/* Right Column: Hero Martial Arts Visual */}
      <div className="w-full lg:w-1/2 relative min-h-[360px] lg:h-screen bg-black overflow-hidden flex items-end">
        {/* Real Generated Martial Arts Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/ceylon-fighter-hero.jpg"
            alt="Ceylon Fighting Club Champion Athlete"
            fill
            priority
            className="object-cover object-top scale-105 transition-transform duration-1000 hover:scale-100"
          />
          {/* Subtle dark overlay to keep image clean in black theme */}
          <div className="absolute inset-0 bg-black/60 z-10" />
        </div>

        {/* Overlay Content & Floating Badges */}
        <div className="relative z-20 p-6 sm:p-10 lg:p-12 max-w-lg w-full">
          {/* Floating Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/90 border border-slate-800 text-slate-300 text-xs font-semibold mb-3 shadow-xl">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>Sri Lanka&apos;s Elite Combat & MMA Training Complex</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-2 uppercase leading-tight drop-shadow-lg">
            Discipline. Power. <span className="text-blue-500">Dominance.</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed drop-shadow">
            The complete management hub for fighter admissions, biometric tracking, fixed registration fee accounting (LKR 1,500/member), and championship event promotions.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-black border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-white mb-2">Reset Headquarters Access</h3>
            <p className="text-xs text-slate-400 mb-6">
              Enter your registered administrator email to receive a secure recovery code.
            </p>

            {forgotSent ? (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm mb-6">
                Password reset link has been dispatched to <strong>{forgotEmail}</strong>. (For demo purposes, use demo login).
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@ceylonfc.lk"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (forgotEmail.trim()) setForgotSent(true);
                  }}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Send Recovery Link
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setForgotModalOpen(false);
                setForgotSent(false);
              }}
              className="w-full py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
