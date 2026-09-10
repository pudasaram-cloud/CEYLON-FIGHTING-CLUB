'use client';

import React from 'react';

interface ClubLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
}

export const ClubEmblem: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
      {/* Outer Hexagon Shield: Solid Blue */}
      <polygon
        points="50,5 90,25 90,75 50,95 10,75 10,25"
        fill="#000000"
        stroke="#2563eb"
        strokeWidth="3.5"
      />
      {/* Inner Inset Hexagon: Light Blue Accent */}
      <polygon
        points="50,14 82,30 82,70 50,86 18,70 18,30"
        fill="#050505"
        stroke="#60a5fa"
        strokeWidth="1.5"
        strokeDasharray="4 2"
      />
      
      {/* Crossed Swords: Blue and White */}
      <path d="M30 30L70 70" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M70 30L30 70" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Lion Emblem Silhouette in Blue */}
      <path
        d="M50 26C45 26 40 31 40 37C40 43 44 47 48 48L46 54H54L52 48C56 47 60 43 60 37C60 31 55 26 50 26Z"
        fill="#2563eb"
      />
      
      {/* Fighter Fist / Guard */}
      <circle cx="50" cy="62" r="7" fill="#2563eb" />
      <path d="M46 62H54" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

      {/* CFC Initials */}
      <text
        x="50"
        y="78"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="10"
        fontWeight="900"
        letterSpacing="2"
        fontFamily="sans-serif"
      >
        CFC
      </text>
    </svg>
  </div>
);

export const ClubLogo: React.FC<ClubLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { emblem: 'w-8 h-8', title: 'text-base', tagline: 'text-[10px]' },
    md: { emblem: 'w-10 h-10', title: 'text-xl', tagline: 'text-xs' },
    lg: { emblem: 'w-14 h-14', title: 'text-2xl', tagline: 'text-sm' },
    xl: { emblem: 'w-20 h-20', title: 'text-3xl', tagline: 'text-base' },
  };

  const config = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <ClubEmblem className={config.emblem} />
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-wider text-white uppercase ${config.title}`}>
              CEYLON <span className="text-blue-500">FIGHTING</span> <span className="text-white">CLUB</span>
            </span>
          </div>
          {showTagline && (
            <span className={`text-slate-400 font-medium tracking-wide ${config.tagline}`}>
              Manage Fighters. Build Champions.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
