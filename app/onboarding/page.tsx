"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/ui/header-2";
import { Terminal, Code2, Cpu, Sparkles, ChevronRight, ChevronLeft, Rocket, Shield, Trophy, Star } from "lucide-react";
import gsap from "gsap";
import Link from "next/link";

const steps = [
  {
    id: 1,
    title: "WELCOME TO THE SOURCE",
    description: "YOU'VE JUST ENTERED THE ULTIMATE GAMIFIED CODING ODYSSEY. PREPARE TO MASTER THE BLOCKS AND BUILD THE FUTURE.",
    icon: <Rocket className="w-20 h-20 text-yellow-400" />,
    color: "text-yellow-400",
  },
  {
    id: 2,
    title: "CHOOSE YOUR PATH",
    description: "WHETHER YOU'RE A BEGINNER OR A SEASONED PRO, WE HAVE QUESTS TAILORED FOR YOUR SKILL LEVEL. MASTER TYPESCRIPT, REACT, AND MORE.",
    icon: <Code2 className="w-20 h-20 text-blue-400" />,
    color: "text-blue-400",
  },
  {
    id: 3,
    title: "EARN LEGENDARY REWARDS",
    description: "COMPLETE CHALLENGES TO EARN XP, LEVEL UP, AND UNLOCK EXCLUSIVE BADGES. CLIMB THE HALL OF LEGENDS AND SHOW YOUR MIGHT.",
    icon: <Trophy className="w-20 h-20 text-purple-400" />,
    color: "text-purple-400",
  },
  {
    id: 4,
    title: "JOIN THE COMMUNITY",
    description: "YOU'RE NOT ALONE IN THIS QUEST. CONNECT WITH OTHER WARRIORS, SHARE YOUR PROGRESS, AND BUILD THE FUTURE TOGETHER.",
    icon: <Sparkles className="w-20 h-20 text-green-400" />,
    color: "text-green-400",
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.7)" }
      );
    }
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="min-h-screen mc-container text-white flex flex-col selection:bg-yellow-400 selection:text-black overflow-hidden">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-6 relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-10 animate-pulse">
            <Terminal size={120} className="text-yellow-400" />
          </div>
          <div className="absolute bottom-1/4 right-10 animate-bounce">
            <Code2 size={160} className="text-blue-400" />
          </div>
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 rotate-12">
            <Cpu size={200} className="text-purple-400" />
          </div>
        </div>

        <div ref={cardRef} className="relative z-10 w-full max-w-2xl">
          <div className="mc-card p-12 bg-zinc-900/90 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-yellow-400" />
            
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="inline-block mc-card px-4 py-1 mb-2 rotate-[-1deg]">
                <span className="font-pixel text-[10px] text-black">STEP {step.id} OF {steps.length}</span>
              </div>

              <div className="animate-bounce">
                {step.icon}
              </div>

              <h1 className={`text-3xl md:text-5xl font-pixel mc-text-shadow uppercase ${step.color}`}>
                {step.title}
              </h1>

              <p className="font-pixel text-[12px] md:text-[14px] text-zinc-400 leading-relaxed max-w-lg">
                {step.description}
              </p>

              <div className="flex items-center gap-4 pt-8 w-full">
                {currentStep > 0 && (
                  <button 
                    onClick={prevStep}
                    className="mc-button px-6 py-4 font-pixel text-sm text-white mc-text-shadow flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={16} />
                    BACK
                  </button>
                )}
                
                {currentStep < steps.length - 1 ? (
                  <button 
                    onClick={nextStep}
                    className="flex-1 mc-button mc-button-green px-8 py-4 font-pixel text-sm text-white mc-text-shadow flex items-center justify-center gap-2"
                  >
                    CONTINUE
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <Link href="/dashboard" className="flex-1">
                    <button className="w-full mc-button mc-button-blue px-8 py-4 font-pixel text-sm text-white mc-text-shadow flex items-center justify-center gap-2">
                      START YOUR QUEST
                      <Rocket size={16} />
                    </button>
                  </Link>
                )}
              </div>

              <div className="flex gap-2 pt-8">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`size-3 mc-border border-2 transition-colors ${i === currentStep ? "bg-yellow-400" : "bg-zinc-800"}`} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 border-t-4 border-black bg-zinc-900 text-center">
        <p className="font-pixel text-[8px] text-zinc-600 uppercase tracking-widest">ONBOARDING SYSTEM V1.0.2 - PREPARING ENVIRONMENT</p>
      </footer>
    </div>
  );
}
