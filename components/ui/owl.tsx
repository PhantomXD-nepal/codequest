import React from 'react';

export function Owl({ state = 'idle', className = '' }: { state?: 'idle' | 'talking' | 'happy' | 'sad', className?: string }) {
  const isHappy = state === 'happy';
  const isTalking = state === 'talking';
  const isSad = state === 'sad';

  return (
    <svg viewBox="0 0 200 200" className={`w-full h-full drop-shadow-2xl ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background Glow */}
      <circle cx="100" cy="100" r="90" fill="#39ff14" fillOpacity="0.1" />
      
      {/* Feet */}
      <path d="M75 170 Q65 190 55 185 Q70 180 75 170" fill="#f59e0b" stroke="#000" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M85 170 Q80 195 70 195 Q85 185 85 170" fill="#f59e0b" stroke="#000" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M125 170 Q135 190 145 185 Q130 180 125 170" fill="#f59e0b" stroke="#000" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M115 170 Q120 195 130 195 Q115 185 115 170" fill="#f59e0b" stroke="#000" strokeWidth="3" strokeLinejoin="round"/>

      {/* Body */}
      <path d="M40 90 C40 30, 160 30, 160 90 C160 160, 140 175, 100 175 C60 175, 40 160, 40 90 Z" fill="#1e3a8a" stroke="#000" strokeWidth="4"/>
      
      {/* Ears */}
      <path d="M45 55 Q30 20 65 35 Z" fill="#1e3a8a" stroke="#000" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M155 55 Q170 20 135 35 Z" fill="#1e3a8a" stroke="#000" strokeWidth="4" strokeLinejoin="round"/>
      
      {/* Inner Ears */}
      <path d="M48 50 Q38 28 60 38 Z" fill="#f59e0b" />
      <path d="M152 50 Q162 28 140 38 Z" fill="#f59e0b" />

      {/* Belly */}
      <path d="M55 100 C55 70, 145 70, 145 100 C145 150, 125 170, 100 170 C75 170, 55 150, 55 100 Z" fill="#f97316" stroke="#000" strokeWidth="3"/>
      
      {/* Belly spots */}
      <circle cx="80" cy="120" r="3" fill="#fff" fillOpacity="0.5"/>
      <circle cx="100" cy="115" r="4" fill="#fff" fillOpacity="0.5"/>
      <circle cx="120" cy="120" r="3" fill="#fff" fillOpacity="0.5"/>
      <circle cx="90" cy="135" r="3" fill="#fff" fillOpacity="0.5"/>
      <circle cx="110" cy="135" r="3" fill="#fff" fillOpacity="0.5"/>
      <circle cx="100" cy="150" r="2" fill="#fff" fillOpacity="0.5"/>

      {/* Wings */}
      {isHappy ? (
        <>
          <path d="M40 95 C10 80, 10 130, 35 140 C20 120, 30 100, 40 95 Z" fill="#1e40af" stroke="#000" strokeWidth="3"/>
          <path d="M160 95 C190 80, 190 130, 165 140 C180 120, 170 100, 160 95 Z" fill="#1e40af" stroke="#000" strokeWidth="3"/>
        </>
      ) : (
        <>
          <path d="M40 95 C20 110, 20 150, 45 140 C30 125, 35 105, 40 95 Z" fill="#1e40af" stroke="#000" strokeWidth="3"/>
          <path d="M160 95 C180 110, 180 150, 155 140 C170 125, 165 105, 160 95 Z" fill="#1e40af" stroke="#000" strokeWidth="3"/>
        </>
      )}

      {/* Eye Area (White mask) */}
      <path d="M50 75 C50 45, 95 50, 100 70 C105 50, 150 45, 150 75 C150 105, 110 105, 100 90 C90 105, 50 105, 50 75 Z" fill="#f8fafc" stroke="#000" strokeWidth="3"/>

      {/* Eyes */}
      {isHappy ? (
        <>
          <path d="M65 75 Q75 60 85 75" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" fill="none"/>
          <path d="M115 75 Q125 60 135 75" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" fill="none"/>
        </>
      ) : isSad ? (
        <>
          <path d="M60 65 Q75 60 90 70" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" fill="none"/>
          <path d="M110 70 Q125 60 140 65" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" fill="none"/>
          <circle cx="75" cy="80" r="12" fill="#0f172a" />
          <circle cx="125" cy="80" r="12" fill="#0f172a" />
          <circle cx="78" cy="77" r="4" fill="#fff" />
          <circle cx="128" cy="77" r="4" fill="#fff" />
        </>
      ) : (
        <>
          <circle cx="75" cy="75" r="16" fill="#0f172a" />
          <circle cx="125" cy="75" r="16" fill="#0f172a" />
          <circle cx="79" cy="71" r="5" fill="#fff" />
          <circle cx="129" cy="71" r="5" fill="#fff" />
          <circle cx="72" cy="79" r="2" fill="#fff" />
          <circle cx="122" cy="79" r="2" fill="#fff" />
          
          {/* Glasses */}
          <circle cx="75" cy="75" r="22" stroke="#0f172a" strokeWidth="4" fill="none" />
          <circle cx="125" cy="75" r="22" stroke="#0f172a" strokeWidth="4" fill="none" />
          <path d="M97 75 L103 75" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
          <path d="M53 75 L45 75" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
          <path d="M147 75 L155 75" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
        </>
      )}

      {/* Beak */}
      {isTalking || isHappy ? (
        <path d="M92 85 L108 85 L100 105 Z" fill="#ef4444" stroke="#000" strokeWidth="2" strokeLinejoin="round"/>
      ) : (
        <path d="M95 85 L105 85 L100 100 Z" fill="#f59e0b" stroke="#000" strokeWidth="2" strokeLinejoin="round"/>
      )}
      <path d="M92 85 Q100 80 108 85 L100 100 Z" fill="#f59e0b" stroke="#000" strokeWidth="2" strokeLinejoin="round"/>

    </svg>
  );
}
