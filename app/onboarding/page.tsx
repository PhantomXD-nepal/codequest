"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { Owl } from '@/components/ui/owl';

const steps = [
  {
    id: 1,
    title: "Welcome to CodeQuest",
    description: "Your journey to mastering code starts here. We've built a platform that makes learning interactive, engaging, and effective.",
    owlState: "talking" as const
  },
  {
    id: 2,
    title: "Interactive IDE",
    description: "Write, run, and debug code directly in your browser. No complex setup required. Just jump in and start coding.",
    owlState: "happy" as const
  },
  {
    id: 3,
    title: "Gamified Learning",
    description: "Earn XP, unlock achievements, and compete on the leaderboard. Learning to code has never been this fun.",
    owlState: "idle" as const
  },
  {
    id: 4,
    title: "Ready to Begin?",
    description: "Create your account today and join thousands of other developers on their quest to mastery.",
    owlState: "happy" as const
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

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <main className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-start relative overflow-hidden font-body selection:bg-primary-container/30">
      {/* Background Decor */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-surface-variant/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -right-48 w-[32rem] h-[32rem] bg-tertiary-container/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Step Indicator & Progress (The Quest Tracker) */}
      <div className="w-full max-w-3xl px-8 pt-12 relative z-10">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-on-surface-variant font-headline font-bold text-sm tracking-widest uppercase">
            Quest Step {currentStep + 1} of {steps.length}
          </span>
          <div className="flex gap-1">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="font-headline font-extrabold text-secondary">Level 1</span>
          </div>
        </div>
        <div className="relative h-6 w-full bg-surface-container-high rounded-full p-1 overflow-hidden">
          {/* Progress Track */}
          <motion.div 
            className="h-full bg-gradient-to-br from-primary to-primary-container rounded-full shadow-lg relative"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            {/* Hero Icon Thumb */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center border-4 border-surface shadow-xl">
              <span className="material-symbols-outlined text-on-secondary-container text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <section className="w-full max-w-5xl px-6 pt-12 flex flex-col items-center relative z-10 flex-1">
        <AnimatePresence mode="wait">
          <motion.header 
            key={`header-${currentStep}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-12"
          >
            <h1 className="font-headline font-extrabold text-4xl md:text-6xl text-on-surface tracking-tight mb-4">
              {steps[currentStep].title.split(' ').map((word, i, arr) => 
                i === arr.length - 1 ? (
                  <span key={i} className="bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent"> {word}</span>
                ) : (
                  <span key={i}> {word}</span>
                )
              )}
            </h1>
            <p className="text-on-surface-variant text-lg md:text-xl font-medium max-w-xl mx-auto">
              {steps[currentStep].description}
            </p>
          </motion.header>
        </AnimatePresence>

        <div className="relative aspect-square md:aspect-auto md:h-[400px] w-full max-w-2xl rounded-3xl overflow-hidden border-4 border-surface-container-highest bg-surface-container-lowest flex items-center justify-center mb-12 shadow-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-64 h-64 md:w-80 md:h-80 z-10 relative"
            >
              <Owl state={steps[currentStep].owlState} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col items-center gap-6 w-full max-w-md pb-24 mt-auto">
          <div className="flex w-full gap-4">
            <motion.button 
              onClick={prevStep}
              disabled={currentStep === 0}
              whileHover={{ scale: currentStep === 0 ? 1 : 1.05 }}
              whileTap={{ scale: currentStep === 0 ? 1 : 0.95 }}
              className="w-16 h-16 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </motion.button>
            
            {currentStep < steps.length - 1 ? (
              <motion.button 
                onClick={nextStep}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-full font-headline font-extrabold text-xl shadow-[0_10px_30px_rgba(37,77,213,0.4)] flex items-center justify-center gap-3"
              >
                Continue Quest
                <span className="material-symbols-outlined">arrow_forward</span>
              </motion.button>
            ) : (
              <Link href="/signup" className="flex-1">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-full font-headline font-extrabold text-xl shadow-[0_10px_30px_rgba(37,77,213,0.4)] flex items-center justify-center gap-3"
                >
                  Start Adventure
                  <span className="material-symbols-outlined">rocket_launch</span>
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Floating Cards Background Element */}
      <div className="fixed bottom-0 left-0 right-0 h-48 pointer-events-none bg-gradient-to-t from-background to-transparent z-0"></div>
    </main>
  );
}
