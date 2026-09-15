'use client';

import React, { useState, useEffect } from 'react';
import { Member, Discipline, SkillLevel, PaymentStatus, Gender } from '@/types';
import { useClub } from '@/context/ClubContext';
import { calculateWeightClass } from '@/utils/helpers';
import { X, Check, Edit3 } from 'lucide-react';

interface MemberEditModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MemberEditModal: React.FC<MemberEditModalProps> = ({
  member,
  isOpen,
  onClose,
}) => {
  const { updateMember } = useClub();

  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [age, setAge] = useState<number | ''>(24);
  const [gender, setGender] = useState<Gender>('Male');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [weight, setWeight] = useState<number | ''>(70);
  const [discipline, setDiscipline] = useState<Discipline>('MMA');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('Intermediate');
  const [beltRank, setBeltRank] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [membershipStatus, setMembershipStatus] = useState<'Active' | 'Inactive' | 'Suspended' | 'Injured'>('Active');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (member) {
      setFullName(member.fullName || '');
      setIdNumber(member.idNumber || '');
      setAge(member.age || 24);
      setGender(member.gender || 'Male');
      setPhoneNumber(member.phoneNumber || '');
      setEmail(member.email || '');
      setWeight(member.weight || 70);
      setDiscipline(member.discipline || 'MMA');
      setSkillLevel(member.skillLevel || 'Intermediate');
      setBeltRank(member.beltRank || '');
      setPaymentStatus(member.paymentStatus || 'Paid');
      setMembershipStatus(member.membershipStatus || 'Active');
      setNotes(member.notes || '');
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    updateMember(member.id, {
      fullName,
      idNumber,
      age: Number(age) || member.age,
      gender,
      phoneNumber,
      email,
      weight: Number(weight) || member.weight,
      discipline,
      skillLevel,
      beltRank,
      paymentStatus,
      membershipStatus,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#080c16] border border-blue-500/40 rounded-3xl max-w-2xl w-full my-auto shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-blue-500/20 bg-slate-950/80 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                Update Fighter Dossier
              </h2>
              <p className="text-xs text-slate-400">
                {member.id} · {member.fullName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Full Name (Nama)
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Citizen ID <span className="text-slate-500 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="e.g. 200018402910, 982145678V, or CIT-8942A"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Age
              </label>
              <input
                type="number"
                required
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Gender
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('Male')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    gender === 'Male'
                      ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  👨 Male
                </button>
                <button
                  type="button"
                  onClick={() => setGender('Female')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    gender === 'Female'
                      ? 'bg-pink-600 border-pink-400 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  👩 Female
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Discipline
              </label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value as Discipline)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="MMA">MMA</option>
                <option value="Muay Thai">Muay Thai</option>
                <option value="Boxing">Boxing</option>
                <option value="Brazilian Jiu-Jitsu">Brazilian Jiu-Jitsu</option>
                <option value="Kickboxing">Kickboxing</option>
                <option value="Combat Fitness">Combat Fitness</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Belt / Rank
              </label>
              <input
                type="text"
                value={beltRank}
                onChange={(e) => setBeltRank(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Payment Status (LKR 1,500)
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="Paid">✓ Paid</option>
                <option value="Pending">⏳ Pending</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Membership Status
              </label>
              <select
                value={membershipStatus}
                onChange={(e) => setMembershipStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Injured">Injured</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
              Notes & Fighter Record
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
