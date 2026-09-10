'use client';

import React, { useRef } from 'react';
import { useClub } from '@/context/ClubContext';
import { formatLKR } from '@/utils/helpers';
import {
  DollarSign,
  Shield,
  RotateCcw,
  CheckCircle2,
  Building,
  Trash2,
  Download,
  Upload,
  Database,
  Cloud,
} from 'lucide-react';

export const SettingsSection: React.FC = () => {
  const { currentAdmin, resetToDefaultData, clearAllMembers, stats, exportBackupData, importBackupData } = useClub();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importBackupData(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Club System Settings
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Configure membership fee standards, data backups, club parameters, and roster controls
        </p>
      </div>

      {/* 1. Database Backup & Restore */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-blue-950/40 border border-blue-500/30 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              Data Backup & Roster Recovery
            </h3>
            <p className="text-xs text-slate-400">
              Download or restore your complete fighters roster, events, and accounting records
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-start gap-2.5 text-xs text-slate-300">
            <Cloud className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Data Safety:</strong> Your fighters ({stats.totalMembers} members) and scheduled events are stored in your secure browser repository. You can download an offline <strong>JSON Backup file</strong> anytime to keep a permanent master copy on your phone or computer.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={exportBackupData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup File (.json)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Restore from Backup File</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* 2. Club Financial Fee Rule Settings */}
      <div className="p-6 rounded-2xl bg-slate-950/80 border border-blue-500/20 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              Membership Admission Fee Standard
            </h3>
            <p className="text-xs text-slate-400">
              Fixed rate dynamically multiplied across all registered club fighters
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-300 uppercase block">
              Default Registration Fee
            </span>
            <div className="text-2xl font-black text-white mt-0.5">
              LKR 1,500 <span className="text-xs text-slate-400 font-normal">/ member</span>
            </div>
            <p className="text-[11px] text-blue-300 mt-1">
              Active formula: Total Revenue = {stats.totalMembers} Members × LKR 1,500 = {formatLKR(stats.totalRevenue)}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-bold self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4" />
            <span>Active Policy Verified</span>
          </div>
        </div>
      </div>

      {/* 3. Club Branding & Headquarters Information */}
      <div className="p-6 rounded-2xl bg-slate-950/80 border border-blue-500/20 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              Club Identity & Dojo Headquarters
            </h3>
            <p className="text-xs text-slate-400">
              Official branding registered with Sri Lanka Combat Sports League
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-400 block mb-1">Club Organization</label>
            <input
              type="text"
              readOnly
              value="CEYLON FIGHTING CLUB"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-400 block mb-1">Official Tagline</label>
            <input
              type="text"
              readOnly
              value="Manage Fighters. Build Champions."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 italic"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-400 block mb-1">Headquarters Address</label>
            <input
              type="text"
              readOnly
              value="CFC Combat Arena, Galle Road, Colombo 03, Sri Lanka"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-400 block mb-1">Affiliation</label>
            <input
              type="text"
              readOnly
              value="Sri Lanka Mixed Martial Arts & Combat Association"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300"
            />
          </div>
        </div>
      </div>

      {/* 4. Administrator Profile */}
      <div className="p-6 rounded-2xl bg-slate-950/80 border border-blue-500/20 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              Administrator Access
            </h3>
            <p className="text-xs text-slate-400">
              Authenticated Chief Fight Director session credentials
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-400 block mb-1">Admin Name</label>
            <input
              type="text"
              readOnly
              value={currentAdmin.name}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-semibold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-400 block mb-1">Email</label>
            <input
              type="text"
              readOnly
              value={currentAdmin.email}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* 5. Clear Roster */}
      <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-rose-400">
            Clear Member Roster
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Wipe all member records from the database to start fresh ({stats.totalMembers} fighters currently registered)
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to remove all members? This will reset the roster to 0 members.')) {
              clearAllMembers();
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/50 border border-rose-800/80 hover:border-rose-600 hover:bg-rose-900/60 text-rose-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span>Wipe All Members</span>
        </button>
      </div>

      {/* 6. Reset Demo Data */}
      <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-white">
            System Reset
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Reset embedded database and system activities to clean initial state
          </p>
        </div>

        <button
          onClick={resetToDefaultData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4 text-blue-400" />
          <span>Reset System Data</span>
        </button>
      </div>
    </div>
  );
};
