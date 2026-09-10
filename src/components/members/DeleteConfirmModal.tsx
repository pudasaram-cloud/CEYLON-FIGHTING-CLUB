'use client';

import React from 'react';
import { Member } from '@/types';
import { useClub } from '@/context/ClubContext';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { formatLKR } from '@/utils/helpers';

interface DeleteConfirmModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  member,
  isOpen,
  onClose,
}) => {
  const { deleteMember } = useClub();

  if (!isOpen || !member) return null;

  const handleConfirmDelete = () => {
    deleteMember(member.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0e090a] border border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
          Delete Fighter Record?
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Are you sure you want to permanently remove{' '}
          <strong className="text-white font-bold">{member.fullName}</strong> ({member.id}) from Ceylon Fighting Club?
        </p>

        {/* Financial Impact Warning */}
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 mb-6 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <span>⚠️ Automatic Revenue Impact:</span>
          </div>
          <p className="text-[11px] text-rose-200">
            Total Revenue will dynamically decrease by{' '}
            <strong className="font-mono text-white">LKR 1,500</strong>.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold uppercase tracking-wider"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmDelete}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Confirm Deletion</span>
          </button>
        </div>
      </div>
    </div>
  );
};
