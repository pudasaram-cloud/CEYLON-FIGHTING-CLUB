'use client';

import React, { useState } from 'react';
import { useClub } from '@/context/ClubContext';
import { Gender, Discipline, SkillLevel, PaymentStatus, VectorAvatarType } from '@/types';
import { calculateWeightClass, formatLKR, compressImage } from '@/utils/helpers';
import {
  CombatAvatar,
  MaleFighterVector,
  FemaleFighterVector,
  LionCrestVector,
  GlovesBadgeVector,
} from '@/components/ui/CombatAvatars';
import {
  X,
  UserPlus,
  DollarSign,
  Upload,
  CheckCircle2,
  ShieldAlert,
  Flame,
  User,
  Phone,
  Calendar,
  CreditCard,
  Sparkles,
} from 'lucide-react';

interface MemberRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessNavigate?: () => void;
}

export const MemberRegistrationModal: React.FC<MemberRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccessNavigate,
}) => {
  const { registerMember } = useClub();

  // Core Form Fields:
  // Full Name, Citizen ID (alphanumeric letters & numbers), age, phone number, weight, height, payment status, avatar
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [age, setAge] = useState<number | ''>(24);
  const [dateOfBirth, setDateOfBirth] = useState('2002-05-15');
  const [gender, setGender] = useState<Gender>('Male');
  const [phoneNumber, setPhoneNumber] = useState('+94 ');
  const [address, setAddress] = useState('Colombo, Sri Lanka');

  const [weight, setWeight] = useState<number | ''>(70);
  const [height, setHeight] = useState<number | ''>(175);
  const [discipline, setDiscipline] = useState<Discipline>('MMA');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('Intermediate');
  const [beltRank, setBeltRank] = useState('Blue Belt');

  // Payment Status: Paid or Not (Pending)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');

  // Avatar handling: Photo upload OR Default Vector icon for men/women
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [defaultAvatarType, setDefaultAvatarType] = useState<VectorAvatarType>('male-vector');
  const [avatarMode, setAvatarMode] = useState<'vector' | 'upload'>('vector');

  // Emergency contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Parent');
  const [notes, setNotes] = useState('');

  // When gender switches, auto-update the default vector icon if not overridden
  const handleGenderChange = (newGender: Gender) => {
    setGender(newGender);
    if (avatarMode === 'vector') {
      setDefaultAvatarType(newGender === 'Female' ? 'female-vector' : 'male-vector');
    }
  };

  // Handle custom image file upload (auto-compressed to ~15KB)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 250, 250, 0.75);
        setPhotoUrl(compressed);
        setAvatarMode('upload');
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoUrl(reader.result as string);
          setAvatarMode('upload');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const computedWeightClass = typeof weight === 'number' ? calculateWeightClass(weight) : 'Catchweight';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) return;

    registerMember({
      fullName,
      idNumber: idNumber.trim() || `CIT-${Date.now().toString().slice(-8)}`,
      age: Number(age) || 22,
      dateOfBirth,
      gender,
      phoneNumber,
      address,
      weight: Number(weight) || 70,
      height: Number(height) || 175,
      discipline,
      skillLevel,
      beltRank,
      registrationDate: new Date().toISOString().split('T')[0],
      paymentStatus,
      membershipStatus: 'Active',
      photoUrl: avatarMode === 'upload' ? photoUrl : undefined,
      defaultAvatarType,
      emergencyContact: {
        name: emergencyName || 'Family Contact',
        phone: emergencyPhone || phoneNumber,
        relationship: emergencyRelation || 'Guardian',
      },
      notes,
    });

    onClose();
    if (onSuccessNavigate) {
      onSuccessNavigate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-black border border-slate-800 rounded-3xl max-w-3xl w-full my-auto shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                Register New Fighter
              </h2>
              <p className="text-xs text-slate-400">
                Ceylon Fighting Club · Fixed Registration Fee: <strong className="text-white">LKR 1,500</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Top Banner: Fixed Registration Fee Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold">
                  Standard Club Admission Fee
                </div>
                <div className="text-xl font-black text-white flex items-center gap-2">
                  <span>LKR 1,500</span>
                  <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/30">
                    Official Fixed Rate
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Paid or Not selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Payment Status:</span>
              <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPaymentStatus('Paid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    paymentStatus === 'Paid'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ✓ Paid
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStatus('Pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    paymentStatus === 'Pending'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⏳ Pending
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: Profile Photo / Default Vector Icon (Requested by User) */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Fighter Avatar & Photo Selection
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAvatarMode('vector')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    avatarMode === 'vector'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Default Vector Icon
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarMode('upload')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    avatarMode === 'upload'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Custom Photo Upload
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
              {/* Avatar Live Preview */}
              <div className="flex flex-col items-center gap-2">
                <CombatAvatar
                  photoUrl={avatarMode === 'upload' ? photoUrl : undefined}
                  defaultType={defaultAvatarType}
                  gender={gender}
                  size="xl"
                  className="shadow-xl"
                />
                <span className="text-[11px] font-medium text-slate-400">
                  {avatarMode === 'upload' && photoUrl ? 'Uploaded Photo' : `Default ${gender} Vector`}
                </span>
              </div>

              {/* Vector Icon Options OR Upload Input */}
              <div className="flex-1 w-full">
                {avatarMode === 'vector' ? (
                  <div>
                    <span className="text-xs text-slate-400 block mb-2">
                      Choose Default Vector Fighter Graphic (Auto-aligned with {gender}):
                    </span>
                    <div className="grid grid-cols-4 gap-2.5">
                      {/* Male Vector */}
                      <button
                        type="button"
                        onClick={() => setDefaultAvatarType('male-vector')}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          defaultAvatarType === 'male-vector'
                            ? 'bg-blue-950/60 border-blue-400 shadow-md shadow-blue-500/20'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-9 h-9">
                          <MaleFighterVector />
                        </div>
                        <span className="text-[10px] text-slate-300 font-semibold">Men Fighter</span>
                      </button>

                      {/* Female Vector */}
                      <button
                        type="button"
                        onClick={() => setDefaultAvatarType('female-vector')}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          defaultAvatarType === 'female-vector'
                            ? 'bg-blue-950/60 border-blue-400 shadow-md shadow-blue-500/20'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-9 h-9">
                          <FemaleFighterVector />
                        </div>
                        <span className="text-[10px] text-slate-300 font-semibold">Women Fighter</span>
                      </button>

                      {/* Lion Crest */}
                      <button
                        type="button"
                        onClick={() => setDefaultAvatarType('lion-crest')}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          defaultAvatarType === 'lion-crest'
                            ? 'bg-blue-950/60 border-blue-400 shadow-md shadow-blue-500/20'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-9 h-9">
                          <LionCrestVector />
                        </div>
                        <span className="text-[10px] text-slate-300 font-semibold">Ceylon Lion</span>
                      </button>

                      {/* Gloves Badge */}
                      <button
                        type="button"
                        onClick={() => setDefaultAvatarType('gloves-badge')}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          defaultAvatarType === 'gloves-badge'
                            ? 'bg-blue-950/60 border-blue-400 shadow-md shadow-blue-500/20'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-9 h-9">
                          <GlovesBadgeVector />
                        </div>
                        <span className="text-[10px] text-slate-300 font-semibold">Combat Gloves</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs text-slate-400 block mb-2">
                      Upload Custom Fighter Headshot (PNG/JPG):
                    </label>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-xl p-4 cursor-pointer bg-slate-950/60 transition-colors">
                      <Upload className="w-5 h-5 text-blue-400 mb-1" />
                      <span className="text-xs text-slate-300 font-medium">Click to select image</span>
                      <span className="text-[10px] text-slate-500">Supports JPG, PNG up to 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Personal Details (Nama, Citizen ID, Age, Phone Number, Gender) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              1. Fighter Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name (Nama) */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Full Name (Nama) *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Kasun Chamara Perera"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Citizen ID (Alphanumeric: letters & numbers) */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Citizen ID *
                </label>
                <input
                  type="text"
                  required
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="e.g. 200018402910, 982145678V, or CIT-8942A"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Gender (Male / Female) */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Gender *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleGenderChange('Male')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      gender === 'Male'
                        ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    👨 Male Fighter
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenderChange('Female')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      gender === 'Female'
                        ? 'bg-pink-600 border-pink-400 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    👩 Female Fighter
                  </button>
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Age (Years) *
                </label>
                <input
                  type="number"
                  required
                  min={12}
                  max={65}
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="24"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Phone Number */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Physical & Combat Attributes (Weight, Height, Weight Class) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-1.5">
              <Flame className="w-4 h-4" />
              2. Weight, Height & Combat Classification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Weight (kg) */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Weight (kg) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    required
                    min={40}
                    max={150}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="70"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none pr-10"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-semibold">
                    kg
                  </span>
                </div>
              </div>

              {/* Height (cm) */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Height (cm) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={130}
                    max={220}
                    value={height}
                    onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="175"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none pr-10"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-semibold">
                    cm
                  </span>
                </div>
              </div>

              {/* Auto Computed Weight Class */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Official Division
                </label>
                <div className="px-3.5 py-2.5 bg-blue-950/40 border border-blue-500/30 rounded-xl text-cyan-300 font-bold text-xs flex items-center h-[42px] truncate">
                  {computedWeightClass}
                </div>
              </div>
            </div>

            {/* Discipline & Rank */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Primary Discipline
                </label>
                <select
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value as Discipline)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="MMA">MMA (Mixed Martial Arts)</option>
                  <option value="Muay Thai">Muay Thai</option>
                  <option value="Boxing">Boxing</option>
                  <option value="Brazilian Jiu-Jitsu">Brazilian Jiu-Jitsu (BJJ)</option>
                  <option value="Kickboxing">Kickboxing</option>
                  <option value="Combat Fitness">Combat Fitness & Conditioning</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Skill Level
                </label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="Beginner">Beginner / White</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced / Competitor</option>
                  <option value="Professional">Professional Athlete</option>
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
                  placeholder="e.g. Blue Belt, Prajioud"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Emergency Contact & Notes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              3. Emergency Contact & Club Notes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="e.g. Sunil Perera"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Emergency Phone
                </label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+94 71 234 5678"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  placeholder="Father / Spouse"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Additional Notes / Medical Details
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any allergies, previous combat record, tournament experience, or training goals..."
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Footer / Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Registration Fee:{' '}
              <strong className="text-white font-mono">LKR 1,500</strong> ({paymentStatus})
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {/* Submit button (Solid Red Button) */}
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Registration</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
