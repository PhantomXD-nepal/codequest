"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { Owl } from '@/components/ui/owl';

export function OnboardingModal({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [referral, setReferral] = useState('');
  const [skill, setSkill] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('https://api.dicebear.com/7.x/pixel-art/svg?seed=Adventurer');

  const handleNext = () => {
    if (step === 0) {
      if (!referral) return;
      setStep(1);
    } else if (step === 1) {
      if (!skill) return;
      setStep(2);
    } else if (step === 2) {
      if (!name) return;
      localStorage.setItem('onboarding_data', JSON.stringify({ referral, skill, name, avatar }));
      onComplete();
    }
  };

  const avatars = [
    'Adventurer', 'Explorer', 'Warrior', 'Mage', 'Rogue', 'Paladin'
  ].map(seed => `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
      <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-12">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, x: -50 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          className="w-64 h-64 md:w-96 md:h-96 shrink-0"
        >
          <Owl state={step === 0 ? 'talking' : step === 1 ? 'happy' : 'idle'} />
        </motion.div>
        
        <motion.div 
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-[#1a1a1a] border-4 border-[#39ff14] rounded-2xl p-8 shadow-[0_0_50px_rgba(57,255,20,0.2)]"
        >
          {step === 0 ? (
            <>
              <h2 className="font-pixel text-2xl text-white mb-2">WELCOME TO <span className="text-[#39ff14]">THE QUEST</span></h2>
              <p className="font-pixel text-xs text-[#aaa] mb-8 leading-relaxed">I&apos;m your guide! Before we start coding, how did you hear about us?</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {['Friend', 'Social Media', 'Search Engine', 'Other'].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => setReferral(opt)}
                    className={`p-4 font-pixel text-[10px] uppercase rounded-lg border-2 transition-all ${referral === opt ? 'bg-[#39ff14] text-black border-[#39ff14]' : 'bg-[#0d0d0d] text-[#888] border-[#333] hover:border-[#39ff14]/50'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          ) : step === 1 ? (
            <>
              <h2 className="font-pixel text-2xl text-white mb-2">WHAT&apos;S YOUR <span className="text-[#39ff14]">LEVEL?</span></h2>
              <p className="font-pixel text-xs text-[#aaa] mb-8 leading-relaxed">This helps me tailor the experience for you.</p>
              
              <div className="flex flex-col gap-4 mb-8">
                {['Beginner', 'Intermediate', 'Professional'].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => setSkill(opt)}
                    className={`p-4 font-pixel text-[10px] uppercase rounded-lg border-2 transition-all text-left ${skill === opt ? 'bg-[#39ff14] text-black border-[#39ff14]' : 'bg-[#0d0d0d] text-[#888] border-[#333] hover:border-[#39ff14]/50'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="font-pixel text-2xl text-white mb-2">CHOOSE YOUR <span className="text-[#39ff14]">IDENTITY</span></h2>
              <p className="font-pixel text-xs text-[#aaa] mb-8 leading-relaxed">How should the legends remember you?</p>
              
              <div className="space-y-6 mb-8">
                <div>
                  <label className="font-pixel text-[10px] text-[#39ff14] uppercase block mb-2">Display Name</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ENTER NAME..."
                    className="w-full bg-[#0d0d0d] border-2 border-[#333] rounded-lg p-4 font-pixel text-xs text-white focus:border-[#39ff14] outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label className="font-pixel text-[10px] text-[#39ff14] uppercase block mb-2">Choose Avatar</label>
                  <div className="grid grid-cols-3 gap-4">
                    {avatars.map(av => (
                      <button 
                        key={av}
                        onClick={() => setAvatar(av)}
                        className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${avatar === av ? 'border-[#39ff14] scale-105' : 'border-[#333] hover:border-[#39ff14]/50'}`}
                      >
                        <Image src={av} alt="Avatar" width={64} height={64} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end">
            <button 
              onClick={handleNext}
              disabled={(step === 0 && !referral) || (step === 1 && !skill) || (step === 2 && !name)}
              className="bg-[#39ff14] text-black font-pixel text-xs px-8 py-3 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step < 2 ? 'NEXT' : 'START TOUR'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
