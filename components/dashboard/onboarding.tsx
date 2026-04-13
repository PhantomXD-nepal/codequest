"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OnboardingData {
  avatar: string;
  avatarName: string;
  path: string;
  name: string;
}

export function OnboardingModal({ onComplete }: { onComplete: (data: OnboardingData) => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    avatar: '',
    avatarName: '',
    path: '',
    name: '',
  });

  const avatars = [
    { name: 'Circuit', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAx8_vxCjVhwTOhNUumAP8lNX-pdYKZUG27RRCFg-iqNRohA4hl9vrfL7qqzMggEfwnFCGqQZ1eAXweEsFRKf2esD530QnQQpqm4sxYmHOWjBI9pXqk6cSJdtCByghAOmvqPNHwPrr1S-gClBU78OQyErYM9RaLR79tBQ7LjXMb1bMSEeHHJZBsBVAt5seD5iUAMZ9bKuHd6lc1EkoOkcJi4i-KtJ4vTiXClmlvqe82D2BYoDtuqtUfyB26icUb6HbK2V9D2WSWjus', color: 'bg-surface-container-high' },
    { name: 'Pixel', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPvbXS2AWtgF-WUljXV6ppTnEN8bfvGcalj7ENeKiFVrng48bcVM2t39brR6MIgo9EXPQPoO-P5PDpAWqMtLeCZsizOoi6tddfJ6rB-e5t5uMEtsBkXY8RPYhSJbFUp9Vq9YMjB3Bw0qdRXMiGSxNha9TQXVkKAOjYGk9Tx8mmtQvf3xEgmDoW_fLWGFVLaeocCekAm_TB1Ua13YJVrQF9Kef5Eq5dc4JeB1BqoOQbKdl9jqm_o6m6aZK1TeQObprInNnJJ2QUWTA', color: 'bg-tertiary-container' },
    { name: 'Gloop', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALYca-EEu-Y4D4umtoHv_BtaQiAj3U5afadkVyFL-pCUvkGPLWBzqcJqBdr__T53Z9uFazxtPAuA9-xy_c3QzZy3mJNmtLAlqw5g-5JOchuQM2F1LaEgwDjis5v4-BRuQSJpn9QDzi0WaEDFk234Fm5ADH3fWJChCO5YNJJMOPxcpF1FQ1dQSbnp23FUG20sqB4CGZHN1gnK2eu4s-26m1xpCwPp8ZqSpkKdIdb2ZQ1enkVtarZpQAsHlPoxJDl0dY9SxyglVaFOw', color: 'bg-secondary-container' },
    { name: 'Nova', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeeBPa6Bl9P7f5ztnt_RF1RfjQbajuxdiiqqLrD5dxYfEAiB4IAqS9SSU4FVwFfoPAOuRB_MJ_XvItfs9aAzFnyxaoevfxq-7XxjswSprid0VkA9MXEgamwCuOVPkYU251HlXQoZL-GXBh5AFn8U4DQ_79IuSbCyyJYv1mOxNoDNrHBw_Au8_i2uQ9SamlLPDGEO4hNSXDyn2QLh_hxnAX7uC3OdpUPvDspU0DgcJAkhC22emA_BQgFWwwBBSZ-d1eWBM-NRC-LtQ', color: 'bg-outline-variant/30' },
  ];

  const paths = [
    { id: 'python', title: 'Python Master', description: 'The secret language of robots and AI explorers.', icon: 'terminal', color: 'bg-secondary-container' },
    { id: 'web', title: 'Web Wizard', description: 'Craft beautiful websites and interactive worlds.', icon: 'language', color: 'bg-primary-container' },
    { id: 'app', title: 'App Architect', description: 'Build the next big thing for mobile devices.', icon: 'smartphone', color: 'bg-tertiary-container' },
  ];

  const handleNext = () => {
    if (step === 3) {
      onComplete(data);
    } else {
      setStep(step + 1);
    }
  };

  const isStepValid = () => {
    if (step === 1) return !!data.avatar;
    if (step === 2) return !!data.path;
    if (step === 3) return !!data.name;
    return false;
  };

  return (
    <div className="fixed inset-0 z-[200] bg-background overflow-y-auto custom-scrollbar">
      <main className="min-h-screen flex flex-col items-center justify-start relative overflow-hidden pb-32">
        {/* Background Decor */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-surface-variant/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-48 w-[32rem] h-[32rem] bg-tertiary-container/20 rounded-full blur-[100px]"></div>

        {/* Step Indicator & Progress */}
        <div className="w-full max-w-3xl px-8 pt-12 relative z-10">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-on-surface-variant font-headline font-bold text-sm tracking-widest uppercase">Quest Step {step} of 3</span>
            <div className="flex gap-1">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="font-headline font-extrabold text-secondary">Level 1</span>
            </div>
          </div>
          <div className="relative h-6 w-full bg-surface-container-high rounded-full p-1 overflow-hidden">
            <motion.div 
              initial={{ width: '33.33%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
              className="h-full gemstone-gradient rounded-full shadow-lg relative"
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center border-4 border-surface shadow-xl">
                <span className="material-symbols-outlined text-on-secondary-container text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
              </div>
            </motion.div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.section 
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-5xl px-6 pt-12 flex flex-col items-center relative z-10"
          >
            {step === 1 && (
              <>
                <header className="text-center mb-12">
                  <h1 className="font-headline font-extrabold text-4xl md:text-6xl text-on-surface tracking-tight mb-4">
                    Welcome to <span className="bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent">the Tribe!</span>
                  </h1>
                  <p className="text-on-surface-variant text-lg md:text-xl font-medium max-w-xl mx-auto">
                    Every great explorer needs an identity. Pick your starting hero to begin the adventure.
                  </p>
                </header>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full mb-16">
                  {avatars.map((av) => (
                    <button 
                      key={av.name}
                      onClick={() => setData({ ...data, avatar: av.src, avatarName: av.name })}
                      className={cn(
                        "group relative aspect-square bg-surface-container-lowest p-4 rounded-xl border-4 transition-all duration-300 shadow-sm active:scale-95",
                        data.avatar === av.src ? "border-primary scale-105 z-20 shadow-[0_20px_40px_rgba(37,77,213,0.15)]" : "border-transparent hover:border-primary/50"
                      )}
                    >
                      <div className={cn("w-full h-full rounded-lg overflow-hidden mb-2 relative", av.color)}>
                        <Image src={av.src} alt={av.name} fill className="object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <span className="font-headline font-bold text-on-surface text-lg">{av.name}</span>
                      <div className={cn(
                        "absolute top-4 right-4 bg-primary text-white p-1 rounded-full transition-opacity",
                        data.avatar === av.src ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}>
                        <span className="material-symbols-outlined text-sm">check</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <header className="text-center mb-12">
                  <h1 className="font-headline font-extrabold text-4xl md:text-6xl text-on-surface tracking-tight mb-4">
                    Choose Your <span className="bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent">Path</span>
                  </h1>
                  <p className="text-on-surface-variant text-lg md:text-xl font-medium max-w-xl mx-auto">
                    Which coding magic would you like to master first?
                  </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-16">
                  {paths.map((p) => (
                    <button 
                      key={p.id}
                      onClick={() => setData({ ...data, path: p.id })}
                      className={cn(
                        "p-8 rounded-xl bg-surface-container-lowest border-4 transition-all duration-300 shadow-xl text-left active:scale-95",
                        data.path === p.id ? "border-primary scale-105 z-20" : "border-transparent hover:border-primary/50"
                      )}
                    >
                      <div className={cn("w-20 h-20 rounded-lg flex items-center justify-center mb-6", p.color)}>
                        <span className="material-symbols-outlined text-4xl text-on-secondary-container">{p.icon}</span>
                      </div>
                      <h3 className="font-headline font-bold text-2xl mb-2 text-on-surface">{p.title}</h3>
                      <p className="text-on-surface-variant font-medium">{p.description}</p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <header className="text-center mb-12">
                  <h1 className="font-headline font-extrabold text-4xl md:text-6xl text-on-surface tracking-tight mb-4">
                    Final <span className="bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent">Identity</span>
                  </h1>
                  <p className="text-on-surface-variant text-lg md:text-xl font-medium max-w-xl mx-auto">
                    How should the legends remember you?
                  </p>
                </header>

                <div className="w-full max-w-md bg-surface-container-lowest p-8 rounded-2xl shadow-xl border-4 border-surface-container-high mb-16">
                  <label className="block text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">Explorer Name</label>
                  <input 
                    type="text"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    placeholder="ENTER YOUR NAME..."
                    className="w-full bg-surface-container-low border-4 border-transparent focus:border-primary rounded-xl p-6 text-2xl font-headline font-black text-on-surface outline-none transition-all placeholder:text-on-surface-variant/30"
                  />
                </div>
              </>
            )}

            {/* Action Footer */}
            <div className="flex flex-col items-center gap-6 w-full max-w-md pb-24">
              <button 
                onClick={handleNext}
                disabled={!isStepValid()}
                className="w-full gemstone-gradient text-white py-6 rounded-full font-headline font-extrabold text-2xl shadow-[0_10px_30px_rgba(37,77,213,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
              >
                {step === 3 ? 'Start Adventure' : 'Continue Quest'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <p className="text-on-surface-variant font-medium text-sm">You can change your hero later in the Backpack!</p>
            </div>
          </motion.section>
        </AnimatePresence>

        {/* Floating Cards Background Element */}
        <div className="fixed bottom-0 left-0 right-0 h-48 pointer-events-none bg-gradient-to-t from-background to-transparent z-0"></div>
      </main>

      {/* Shared Component Simulation: Bottom Action Bar */}
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">
        <div className="glass-effect rounded-full px-6 py-4 flex items-center justify-between border-2 border-surface-container-lowest shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center relative overflow-hidden">
              {data.avatar ? (
                <Image src={data.avatar} alt="Avatar" fill className="object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="material-symbols-outlined text-on-primary-container text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              )}
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Explorer</p>
              <p className="font-headline font-extrabold text-on-surface leading-tight">{data.avatarName || '???'}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-outline-variant/30"></div>
          <div className="flex flex-col items-end">
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Goal</p>
            <p className="font-headline font-extrabold text-on-surface leading-tight">
              {data.path ? paths.find(p => p.id === data.path)?.title : 'Not Set'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
