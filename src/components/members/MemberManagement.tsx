'use client';

import React, { useState, useMemo } from 'react';
import { useClub } from '@/context/ClubContext';
import { Member, Gender, PaymentStatus, Discipline } from '@/types';
import { CombatAvatar } from '@/components/ui/CombatAvatars';
import { formatLKR } from '@/utils/helpers';
import {
  Search,
  Filter,
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Download,
  LayoutGrid,
  List,
  Phone,
  ArrowUpDown,
  Shield,
  RefreshCw,
} from 'lucide-react';

interface MemberManagementProps {
  onOpenRegister: () => void;
  onViewProfile: (member: Member) => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (member: Member) => void;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({
  onOpenRegister,
  onViewProfile,
  onEditMember,
  onDeleteMember,
}) => {
  const { members, togglePaymentStatus, stats } = useClub();

  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [disciplineFilter, setDisciplineFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'id'>('newest');

  // Filtered and sorted members
  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          m.fullName.toLowerCase().includes(query) ||
          m.id.toLowerCase().includes(query) ||
          (m.idNumber && m.idNumber.toLowerCase().includes(query)) ||
          m.phoneNumber.toLowerCase().includes(query) ||
          (m.email && m.email.toLowerCase().includes(query)) ||
          m.discipline.toLowerCase().includes(query);

        const matchesGender =
          genderFilter === 'all' || m.gender.toLowerCase() === genderFilter.toLowerCase();

        const matchesPayment =
          paymentFilter === 'all' || m.paymentStatus.toLowerCase() === paymentFilter.toLowerCase();

        const matchesDiscipline =
          disciplineFilter === 'all' || m.discipline === disciplineFilter;

        return matchesQuery && matchesGender && matchesPayment && matchesDiscipline;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.fullName.localeCompare(b.fullName);
        if (sortBy === 'id') return a.id.localeCompare(b.id);
        return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
      });
  }, [members, searchQuery, genderFilter, paymentFilter, disciplineFilter, sortBy]);

  // CSV export handler
  const handleExportCSV = () => {
    const headers = [
      'Member ID',
      'Full Name',
      'Citizen ID',
      'Age',
      'Gender',
      'Phone',
      'Email',
      'Weight (kg)',
      'Division',
      'Discipline',
      'Belt/Rank',
      'Registration Date',
      'Fee (LKR)',
      'Payment Status',
    ];

    const rows = filteredMembers.map((m) => [
      m.id,
      `"${m.fullName}"`,
      m.idNumber,
      m.age,
      m.gender,
      m.phoneNumber,
      m.email || '',
      m.weight,
      `"${m.weightClass}"`,
      m.discipline,
      `"${m.beltRank}"`,
      m.registrationDate,
      m.registrationFee,
      m.paymentStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ceylon_Fighting_Club_Members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Fighter Directory & Management
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse, search, edit, and review {stats.totalMembers} registered combat athletes
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-black border border-slate-800 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Name, Citizen ID, Member ID (e.g. CFC-1001), Phone, or Style..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid Cards"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Badges & Selectors */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-900 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Filters:</span>
          </div>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs focus:border-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="all">Gender: All</option>
            <option value="male">👨 Male Only ({stats.maleMembers})</option>
            <option value="female">👩 Female Only ({stats.femaleMembers})</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs focus:border-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="all">Fee: All Status</option>
            <option value="paid">✓ Paid ({stats.paidMembers})</option>
            <option value="pending">⏳ Pending ({stats.pendingPaymentMembers})</option>
          </select>

          {/* Discipline Filter */}
          <select
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs focus:border-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="all">Discipline: All Styles</option>
            <option value="MMA">MMA</option>
            <option value="Muay Thai">Muay Thai</option>
            <option value="Boxing">Boxing</option>
            <option value="Brazilian Jiu-Jitsu">Brazilian Jiu-Jitsu</option>
            <option value="Kickboxing">Kickboxing</option>
            <option value="Combat Fitness">Combat Fitness</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs focus:border-blue-500 focus:outline-none cursor-pointer ml-auto"
          >
            <option value="newest">Sort: Newest</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="id">Sort: Member ID</option>
          </select>
        </div>
      </div>

      {/* Members Output: Table View or Grid View */}
      {members.length === 0 ? (
        <div className="py-16 px-6 text-center rounded-3xl bg-black border border-slate-800/80 shadow-2xl flex flex-col items-center justify-center max-w-xl mx-auto my-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mb-2">
            No Fighters Registered Yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
            Your roster is clean and ready. Register your first combat athlete now. The system will automatically assign Member ID <strong className="text-blue-400 font-mono">CFC-1001</strong> and update revenue by LKR 1,500.
          </p>
          <button
            onClick={onOpenRegister}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Register First Fighter</span>
          </button>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-950/80 border border-slate-800">
          <p className="text-slate-400 text-sm font-medium mb-3">
            No fighters match your current search or filter criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setGenderFilter('all');
              setPaymentFilter('all');
              setDisciplineFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-blue-400 font-semibold hover:text-white"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="rounded-2xl bg-black border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Fighter</th>
                  <th className="py-3.5 px-4">Member ID / Citizen ID</th>
                  <th className="py-3.5 px-4">Gender & Age</th>
                  <th className="py-3.5 px-4">Division / Style</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Reg Date</th>
                  <th className="py-3.5 px-4">Fee (LKR 1,500)</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-900/50 transition-colors group"
                  >
                    {/* Fighter Avatar & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <CombatAvatar
                          photoUrl={member.photoUrl}
                          defaultType={member.defaultAvatarType}
                          gender={member.gender}
                          size="sm"
                        />
                        <div>
                          <div className="font-bold text-white group-hover:text-blue-400 transition-colors text-xs sm:text-sm flex items-center gap-1.5">
                            <span>{member.fullName}</span>
                            <span className="px-1.5 py-0.2 rounded bg-black border border-slate-800 text-yellow-400 font-black text-[10px]">
                              {member.points !== undefined ? member.points : (member.sparringRecord?.wins || 0) * 100} pts
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {member.weight} kg · {member.beltRank}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Member ID & Citizen ID */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-blue-400 text-xs">
                        {member.id}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {member.idNumber || '—'}
                      </div>
                    </td>

                    {/* Gender & Age */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          member.gender === 'Male'
                            ? 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                            : 'bg-slate-900 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {member.gender === 'Male' ? '👨 Male' : '👩 Female'}, {member.age}y
                      </span>
                    </td>

                    {/* Division / Discipline */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{member.discipline}</div>
                      <div className="text-[10px] text-slate-400">{member.weightClass}</div>
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {member.phoneNumber}
                    </td>

                    {/* Reg Date */}
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {member.registrationDate}
                    </td>

                    {/* Payment Status (Quick Toggle) */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => togglePaymentStatus(member.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-transform active:scale-95 cursor-pointer ${
                          member.paymentStatus === 'Paid'
                            ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 hover:border-emerald-300'
                            : 'bg-amber-950/60 border border-amber-500/40 text-amber-400 hover:border-amber-300'
                        }`}
                        title="Click to toggle Payment Status"
                      >
                        {member.paymentStatus === 'Paid' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Paid</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Pending</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewProfile(member)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-600 hover:text-white text-slate-400 transition-colors cursor-pointer"
                          title="View Profile Dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditMember(member)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Edit Fighter"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteMember(member)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
                          title="Delete Fighter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="p-5 rounded-2xl bg-black border border-slate-800 hover:border-blue-500/50 transition-all duration-200 shadow-xl flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <CombatAvatar
                      photoUrl={member.photoUrl}
                      defaultType={member.defaultAvatarType}
                      gender={member.gender}
                      size="md"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                        {member.fullName}
                      </h4>
                      <span className="font-mono text-xs text-blue-400">{member.id}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      member.paymentStatus === 'Paid'
                        ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-400'
                        : 'bg-amber-950/60 border border-amber-500/30 text-amber-400'
                    }`}
                  >
                    {member.paymentStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-slate-900 my-2">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Discipline</span>
                    <span className="font-semibold text-slate-200">{member.discipline}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Weight / Class</span>
                    <span className="font-semibold text-slate-200">{member.weight} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Gender & Age</span>
                    <span className="text-slate-300">
                      {member.gender}, {member.age} yrs
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Phone</span>
                    <span className="text-slate-300 truncate">{member.phoneNumber}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">
                  Fee: <strong className="text-white">LKR 1,500</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onViewProfile(member)}
                    className="px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-300 hover:text-white text-xs font-semibold"
                  >
                    Dossier
                  </button>
                  <button
                    onClick={() => onEditMember(member)}
                    className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteMember(member)}
                    className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
