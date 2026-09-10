'use client';

import React from 'react';
import { VectorAvatarType, Gender } from '@/types';

interface AvatarProps {
  photoUrl?: string;
  defaultType?: VectorAvatarType;
  gender?: Gender;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const MaleFighterVector: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="100" height="100" rx="50" fill="#090d16" />
    <circle cx="50" cy="50" r="48" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.4" />
    {/* Head & Athletic Jawline */}
    <path d="M50 24C43 24 38 29.5 38 37C38 42.5 41.5 46.5 45 48.5L46 53H54L55 48.5C58.5 46.5 62 42.5 62 37C62 29.5 57 24 50 24Z" fill="#3b82f6" />
    {/* Haircut / Fade */}
    <path d="M40 33C40 27 44 24 50 24C56 24 60 27 60 33C57 31 53 30 50 30C47 30 43 31 40 33Z" fill="#1d4ed8" />
    {/* Athletic Broad Shoulders & Fighting Guard */}
    <path d="M26 80C26 67 36 60 44 57L47 54H53L56 57C64 60 74 67 74 80C74 87 68 89 50 89C32 89 26 87 26 80Z" fill="#1e3a8a" />
    {/* Chest & Collar accent */}
    <path d="M44 57L50 67L56 57" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
    {/* Fighting Hand Wraps / Raised Guard Silhouette */}
    <circle cx="34" cy="56" r="6" fill="#3b82f6" />
    <path d="M31 56H37" stroke="#93c5fd" strokeWidth="1.5" />
    <circle cx="66" cy="56" r="6" fill="#3b82f6" />
    <path d="M63 56H69" stroke="#93c5fd" strokeWidth="1.5" />
    {/* Neon Rim Aura */}
    <path d="M24 78C25 67 35 61 43 58" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
  </svg>
);

export const FemaleFighterVector: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="100" height="100" rx="50" fill="#090d16" />
    <circle cx="50" cy="50" r="48" stroke="#06b6d4" strokeWidth="2" strokeOpacity="0.4" />
    {/* Braided Hair Bun */}
    <circle cx="50" cy="21" r="5" fill="#0284c7" />
    {/* Head */}
    <path d="M50 25C44 25 39 30 39 37C39 42 42.5 45.5 45.5 47.5L46.5 52H53.5L54.5 47.5C57.5 45.5 61 42 61 37C61 30 56 25 50 25Z" fill="#0ea5e9" />
    {/* Athletic Hair Braids */}
    <path d="M39 34C39 27 44 24 50 24C56 24 61 27 61 34C57 32 54 31 50 31C46 31 43 32 39 34Z" fill="#0369a1" />
    {/* Combat Top & Shoulders */}
    <path d="M28 80C28 68 37 61 44 57L47 53H53L56 57C63 61 72 68 72 80C72 87 67 89 50 89C33 89 28 87 28 80Z" fill="#075985" />
    {/* Sports Bra / Rashguard Lines */}
    <path d="M43 58L50 69L57 58" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
    <path d="M37 66L63 66" stroke="#0ea5e9" strokeWidth="1.5" />
    {/* Guarded Wrapped Hands */}
    <circle cx="34" cy="55" r="5.5" fill="#0284c7" />
    <path d="M32 55H36" stroke="#bae6fd" strokeWidth="1.5" />
    <circle cx="66" cy="55" r="5.5" fill="#0284c7" />
    <path d="M64 55H68" stroke="#bae6fd" strokeWidth="1.5" />
    {/* Cyan Rim Highlight */}
    <path d="M27 77C28 67 36 62 43 58" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.9" />
  </svg>
);

export const LionCrestVector: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="100" height="100" rx="50" fill="#060913" />
    <circle cx="50" cy="50" r="46" stroke="#3b82f6" strokeWidth="2" />
    {/* Shield Base */}
    <path d="M50 18L76 28V54C76 68 65 79 50 84C35 79 24 68 24 54V28L50 18Z" fill="#1e3a8a" fillOpacity="0.4" stroke="#60a5fa" strokeWidth="2" />
    {/* Sri Lanka Fighting Lion Silhouette */}
    <path d="M50 30C46 30 42 34 42 38C42 41 44 43 45 44L44 49C40 48 37 47 35 48C34 50 35 52 38 53L44 55V61C40 62 37 64 36 67C38 68 42 67 45 64V71H55V64C58 67 62 68 64 67C63 64 60 62 56 61V55L62 53C65 52 66 50 65 48C63 47 60 48 56 49L55 44C56 43 58 41 58 38C58 34 54 30 50 30Z" fill="#38bdf8" />
    {/* Crossed Fighting Blades / Lightning */}
    <line x1="33" y1="33" x2="67" y2="67" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
    <line x1="67" y1="33" x2="33" y2="67" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const GlovesBadgeVector: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="100" height="100" rx="50" fill="#090d16" />
    <circle cx="50" cy="50" r="46" stroke="#2563eb" strokeWidth="2" />
    {/* Left Boxing Glove */}
    <path d="M38 36C45 36 49 41 49 48C49 53 47 57 44 60L42 70H32L30 60C27 57 25 52 25 46C25 40 30 36 38 36Z" fill="#2563eb" />
    <path d="M42 46C42 48 45 49 48 49" stroke="#93c5fd" strokeWidth="2" />
    {/* Right Boxing Glove */}
    <path d="M62 36C55 36 51 41 51 48C51 53 53 57 56 60L58 70H68L70 60C73 57 75 52 75 46C75 40 70 36 62 36Z" fill="#1d4ed8" />
    <path d="M58 46C58 48 55 49 52 49" stroke="#93c5fd" strokeWidth="2" />
    <rect x="29" y="66" width="14" height="6" rx="2" fill="#38bdf8" />
    <rect x="57" y="66" width="14" height="6" rx="2" fill="#38bdf8" />
  </svg>
);

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
  '2xl': 'w-28 h-28',
};

export const CombatAvatar: React.FC<AvatarProps> = ({
  photoUrl,
  defaultType,
  gender = 'Male',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = sizeMap[size] || sizeMap.md;

  if (photoUrl && photoUrl.trim().length > 5) {
    return (
      <div className={`relative rounded-full overflow-hidden border border-blue-500/40 shrink-0 ${sizeClasses} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt="Member Avatar"
          className="w-full h-full object-cover"
          onError={(e) => {
            // fallback if broken image
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Choose appropriate vector
  const selectedType = defaultType || (gender === 'Female' ? 'female-vector' : 'male-vector');

  return (
    <div className={`relative rounded-full overflow-hidden shrink-0 border border-blue-500/30 ${sizeClasses} ${className}`}>
      {selectedType === 'female-vector' ? (
        <FemaleFighterVector />
      ) : selectedType === 'lion-crest' ? (
        <LionCrestVector />
      ) : selectedType === 'gloves-badge' ? (
        <GlovesBadgeVector />
      ) : (
        <MaleFighterVector />
      )}
    </div>
  );
};
