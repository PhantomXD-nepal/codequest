"use client";

import { Header } from "@/components/ui/header-2";
import { Features } from "@/components/ui/features-8";
import { CreativePricing, type PricingTier } from "@/components/ui/creative-pricing";
import { Pencil, Star, Sparkles, Terminal, Code2, Cpu } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const sampleTiers: PricingTier[] = [
    {
        name: "Student",
        icon: <Pencil className="w-6 h-6" />,
        price: 0,
        description: "Perfect for coding beginners",
        color: "amber",
        features: [
            "Access to Basic Tracks",
            "Daily XP Rewards",
            "Community Support",
            "Public Profile",
        ],
    },
    {
        name: "Pro Developer",
        icon: <Star className="w-6 h-6" />,
        price: 19,
        description: "For serious career switchers",
        color: "blue",
        features: [
            "All Advanced Tracks",
            "Unlimited Energy",
            "Verified Certificates",
            "Priority Support",
        ],
        popular: true,
    },
    {
        name: "Master Studio",
        icon: <Sparkles className="w-6 h-6" />,
        price: 49,
        description: "For teams and power users",
        color: "purple",
        features: [
            "Team Leaderboards",
            "Custom Learning Paths",
            "API Access",
            "1-on-1 Mentoring",
        ],
    },
];

export default function Home() {
  const { data: session } = authClient.useSession();
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero Entrance
    const ctx = gsap.context(() => {
      gsap.from(".hero-title", {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
        delay: 0.2
      });
      
      gsap.from(".hero-text", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
        delay: 0.4
      });

      gsap.from(".hero-btns", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
        delay: 0.6
      });

      // Scroll Reveals
      gsap.from(".feature-header", {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });

      gsap.from(".pricing-header", {
        scrollTrigger: {
          trigger: pricingRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });

      gsap.from(".pricing-tier-card", {
        scrollTrigger: {
          trigger: pricingRef.current,
          start: "top 70%",
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out"
      });

      gsap.from(".cta-content", {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 80%",
        },
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.7)"
      });
    }, pageRef.current || undefined);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen mc-container text-white flex flex-col selection:bg-yellow-400 selection:text-black">
      <Header />
      
      <main className="flex-1">
        {/* Editorial Hero Section */}
        <section id="hero" ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col items-center text-center">
              <div className="inline-block mc-card px-4 py-1 mb-6 rotate-[-1deg] animate-bounce">
                <span className="font-pixel text-[10px] text-black">SERVER STATUS: ONLINE</span>
              </div>
              
              <h1 className="hero-title text-[12vw] md:text-[10vw] font-pixel leading-[0.85] tracking-tighter mc-text-shadow mb-8 uppercase">
                CODE<br />
                <span className="text-yellow-400">QUEST</span>
              </h1>
              
              <div className="max-w-xl mx-auto space-y-8">
                <p className="hero-text text-lg md:text-xl font-pixel text-zinc-400 leading-relaxed text-[12px] md:text-[14px]">
                  THE ULTIMATE GAMIFIED CODING ODYSSEY. MASTER THE BLOCKS, BUILD THE FUTURE, AND CLAIM YOUR PLACE IN THE SOURCE CODE.
                </p>
                
                <div className="hero-btns flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  {session ? (
                    <Link href="/dashboard" className="w-full sm:w-auto">
                      <button className="mc-button mc-button-green px-12 py-6 font-pixel text-lg text-white mc-text-shadow w-full">
                        ENTER WORLD
                      </button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/signup" className="w-full sm:w-auto">
                        <button className="mc-button mc-button-green px-12 py-6 font-pixel text-lg text-white mc-text-shadow w-full">
                          START QUEST
                        </button>
                      </Link>
                      <Link href="/onboarding" className="w-full sm:w-auto">
                        <button className="mc-button mc-button-blue px-12 py-6 font-pixel text-lg text-white mc-text-shadow w-full">
                          TUTORIAL
                        </button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Background Elements */}
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
          
          {/* Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </section>

        {/* Features Section */}
        <section id="features" ref={featuresRef} className="py-24 relative border-t-4 border-black bg-[#0a0a0a]">
          <div className="container mx-auto px-6">
            <div className="feature-header flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-pixel mc-text-shadow mb-6 uppercase leading-none">
                  YOUR <span className="text-yellow-400">ARSENAL</span>
                </h2>
                <p className="font-pixel text-zinc-500 text-[12px] leading-relaxed">
                  EQUIP YOURSELF WITH THE MOST POWERFUL TOOLS IN THE DEV UNIVERSE.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="mc-card p-4 rotate-3">
                  <span className="font-pixel text-[10px] text-black">LEVEL 99 TECH STACK</span>
                </div>
              </div>
            </div>
            <Features />
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" ref={pricingRef} className="py-24 bg-black">
          <div className="container mx-auto px-6">
            <div className="pricing-header text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-pixel mb-6 mc-text-shadow uppercase">
                CHOOSE YOUR <span className="text-blue-400">RANK</span>
              </h2>
              <p className="font-pixel text-zinc-500 text-[12px]">UNLOCK LEGENDARY PERKS AND EXCLUSIVE CONTENT</p>
            </div>
            <div className="pricing-tier-card">
              <CreativePricing 
                tag="Level Up Your Career"
                title="Choose Your Quest Path"
                description="Unlock your potential with our flexible plans"
                tiers={sampleTiers} 
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section id="cta" ref={ctaRef} className="py-40 bg-yellow-400 text-black relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#000_1px,transparent_1px)] bg-[size:20px_20px]" />
          </div>
          <div className="cta-content container mx-auto px-6 text-center relative z-10">
            <h2 className="text-5xl md:text-8xl font-pixel mb-12 leading-[0.9] tracking-tighter uppercase">
              READY TO<br />JOIN THE<br />SERVER?
            </h2>
            <Link href="/signup">
              <button className="mc-button mc-button-blue px-16 py-8 font-pixel text-2xl text-white mc-text-shadow hover:scale-105 transition-transform">
                JOIN THE QUEST
              </button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-16 border-t-4 border-black mc-card">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="font-pixel text-3xl mc-text-shadow text-white">CodeQuest</div>
              <p className="font-pixel text-[10px] text-zinc-500">GAMIFIED CODING EDUCATION FOR THE NEXT GENERATION.</p>
            </div>
            <div className="flex justify-center gap-12 font-pixel text-[12px]">
              <a href="#" className="text-zinc-400 hover:text-yellow-400 transition-colors">DOCS</a>
              <a href="#" className="text-zinc-400 hover:text-yellow-400 transition-colors">API</a>
              <a href="#" className="text-zinc-400 hover:text-yellow-400 transition-colors">DISCORD</a>
            </div>
            <div className="flex flex-col items-center md:items-end gap-4">
              <div className="font-pixel text-[10px] text-zinc-600">
                © {new Date().getFullYear()} CODEQUEST STUDIOS
              </div>
              <div className="flex gap-4">
                <div className="size-8 mc-card bg-zinc-800 flex items-center justify-center">
                  <Terminal size={14} className="text-zinc-400" />
                </div>
                <div className="size-8 mc-card bg-zinc-800 flex items-center justify-center">
                  <Code2 size={14} className="text-zinc-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
