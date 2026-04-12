import React from 'react';
import Image from 'next/image';

export function LoadingScreen() {
  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Ambient Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-tertiary-container/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-secondary-container/10 rounded-full blur-3xl"></div>
      </div>
      {/* Main Content Canvas */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-lg px-8 text-center">
        {/* Illustration Section */}
        <div className="relative mb-12">
          {/* Pulsing Halo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-container/30 rounded-full animate-ring"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 rounded-full animate-ring" style={{ animationDelay: '0.5s' }}></div>
          {/* Character Illustration Container */}
          <div className="relative z-20 animate-float">
            <div className="w-64 h-64 bg-surface-container-lowest rounded-xl flex items-center justify-center shadow-[0_20px_40px_rgba(46,42,80,0.08)] overflow-hidden">
              <Image alt="Playful explorer" width={256} height={256} className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQ-vARvkisSjFD-8QKqziSHvw_hYNjjD5ZbOgNO6dcpe0eKozEXx9yIJoRIkda_kS38wxwIskYYBlphqV9HtFqOPbGhFS41FvlM98nw_XQbY_4xdskkmLVXFMb06sb9yR0A7E7kqIi6qx7tsaV1b2BzCKuftt1UpqUDf3Vjh4DyqEX_nIU4nrXudpF1F7ey_SZzzcLQCvehMDfXwLDEyYY22xJTQV-jnaGNCvrLiJ8P6coXBOirynfNFwnAAvVD0u_C-On18VjM_4" />
            </div>
            {/* Floating Decorative Chips */}
            <div className="absolute -top-4 -right-6 bg-tertiary-container text-on-tertiary-container px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 transform rotate-12">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_fix_high</span>
              <span className="text-xs uppercase tracking-wider">Magic</span>
            </div>
            <div className="absolute -bottom-2 -left-8 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 transform -rotate-12">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
              <span className="text-xs uppercase tracking-wider">Ignition</span>
            </div>
          </div>
        </div>
        {/* Typography & Messaging */}
        <div className="space-y-6">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight leading-tight">
            Summoning the <span className="text-primary">code spirits...</span>
          </h1>
          <p className="text-on-surface-variant text-lg font-medium max-w-xs mx-auto">
            Preparing your next quest through the digital peaks of Lhotse Leap.
          </p>
        </div>
        {/* Progress Indicator */}
        <div className="mt-12 w-full max-w-sm mx-auto">
          {/* Quest Tracker Inspired Progress Bar */}
          <div className="h-4 w-full bg-surface-container-high rounded-full overflow-hidden relative p-1">
            <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full animate-progress-fill relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-secondary rounded-full border-4 border-surface-container-lowest shadow-md flex items-center justify-center">
                <span className="material-symbols-outlined text-[10px] text-on-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>grade</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center text-xs font-bold text-outline uppercase tracking-widest px-1">
            <span>Initializing</span>
            <span className="text-primary animate-pulse">Loading Quests...</span>
          </div>
        </div>
        {/* Feature Hint / Tip Card */}
        <div className="mt-16 bg-surface-container-low rounded-lg p-6 flex items-start gap-4 text-left shadow-sm border border-outline-variant/10 max-w-sm mx-auto">
          <div className="bg-primary/10 p-3 rounded-lg text-primary">
            <span className="material-symbols-outlined">lightbulb</span>
          </div>
          <div>
            <h4 className="font-bold text-on-surface text-sm mb-1">Explorer Tip:</h4>
            <p className="text-on-surface-variant text-xs leading-relaxed">
              Did you know? Completing Daily Challenges earns you Himalayan Rubies to customize your avatar!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
