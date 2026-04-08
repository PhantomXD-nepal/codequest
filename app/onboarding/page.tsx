"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, Terminal, Zap, Shield, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    id: 1,
    title: "Welcome to CodeQuest",
    description: "Your journey to mastering code starts here. We've built a platform that makes learning interactive, engaging, and effective.",
    icon: <Terminal size={48} className="text-[#5ed29c]" />,
    image: "https://picsum.photos/seed/codequest1/800/600?blur=4"
  },
  {
    id: 2,
    title: "Interactive IDE",
    description: "Write, run, and debug code directly in your browser. No complex setup required. Just jump in and start coding.",
    icon: <Zap size={48} className="text-[#5ed29c]" />,
    image: "https://picsum.photos/seed/codequest2/800/600?blur=4"
  },
  {
    id: 3,
    title: "Gamified Learning",
    description: "Earn XP, unlock achievements, and compete on the leaderboard. Learning to code has never been this fun.",
    icon: <Shield size={48} className="text-[#5ed29c]" />,
    image: "https://picsum.photos/seed/codequest3/800/600?blur=4"
  },
  {
    id: 4,
    title: "Ready to Begin?",
    description: "Create your account today and join thousands of other developers on their quest to mastery.",
    icon: <CheckCircle2 size={48} className="text-[#5ed29c]" />,
    image: "https://picsum.photos/seed/codequest4/800/600?blur=4"
  }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b0a] text-white flex flex-col selection:bg-[#5ed29c] selection:text-black font-inter relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#5ed29c]/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        {/* Header */}
        <div className="absolute top-8 left-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center group-hover:bg-[#5ed29c] transition-colors duration-300">
              <span className="text-black font-bold text-xl">C</span>
            </div>
            <span className="text-white font-bold tracking-tighter text-xl">CODEQUEST</span>
          </Link>
        </div>

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image/Visual */}
          <div className="relative aspect-square md:aspect-auto md:h-[600px] rounded-3xl overflow-hidden border border-white/10 bg-white/[0.02]">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentStep}
                src={steps[currentStep].image}
                alt={steps[currentStep].title}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b0a] via-transparent to-transparent" />
            
            {/* Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.8 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-32 h-32 rounded-3xl bg-[#070b0a]/80 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl"
                >
                  {steps[currentStep].icon}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="flex flex-col justify-center">
            {/* Progress Indicators */}
            <div className="flex gap-3 mb-12">
              {steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    index === currentStep 
                      ? 'w-12 bg-[#5ed29c]' 
                      : index < currentStep 
                        ? 'w-6 bg-white/40' 
                        : 'w-6 bg-white/10'
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <span className="text-[#5ed29c] font-plus-jakarta font-bold text-[11px] uppercase tracking-[0.2em] mb-4 block">
                  Step 0{currentStep + 1}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                  {steps[currentStep].title}
                </h1>
                <p className="text-white/60 text-lg leading-relaxed mb-12 max-w-md">
                  {steps[currentStep].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-4">
              <button 
                onClick={prevStep}
                disabled={currentStep === 0}
                className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/[0.05] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={20} />
              </button>
              
              {currentStep < steps.length - 1 ? (
                <button 
                  onClick={nextStep}
                  className="group flex-1 bg-[#5ed29c] text-[#070b0a] font-bold text-sm uppercase tracking-widest h-14 rounded-full flex items-center justify-center gap-3 hover:bg-white transition-all duration-300"
                >
                  Continue
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <Link href="/signup" className="flex-1">
                  <button className="w-full group bg-[#5ed29c] text-[#070b0a] font-bold text-sm uppercase tracking-widest h-14 rounded-full flex items-center justify-center gap-3 hover:bg-white transition-all duration-300">
                    Get Started
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
