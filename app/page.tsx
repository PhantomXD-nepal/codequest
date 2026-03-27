"use client";

import { Header } from "@/components/ui/header-2";
import { Features } from "@/components/blocks/features-8";
import { CreativePricing, type PricingTier } from "@/components/ui/creative-pricing";
import { Pencil, Star, Sparkles } from "lucide-react";
import Link from "next/link";

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

import { authClient } from "@/lib/auth-client";

export default function Home() {
  const { data: session } = authClient.useSession();

  return (
    <div className="min-h-screen mc-container text-white flex flex-col selection:bg-yellow-400 selection:text-black">
      <Header />
      
      <main className="flex-1">
        <section id="hero" className="relative pt-32 pb-48 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block mc-card px-6 py-2 mb-8 rotate-[-1deg]">
                <span className="font-pixel text-xs text-black">VERSION 1.0.0 RELEASED</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-pixel mb-8 mc-text-shadow leading-tight">
                CRAFT YOUR <span className="text-yellow-400">CODE</span> LEGACY
              </h1>
              <p className="text-xl md:text-2xl font-pixel text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed text-[14px]">
                Level up your skills in a gamified world. Build, battle, and become a master developer.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                {session ? (
                  <Link href="/dashboard">
                    <button className="mc-button mc-button-green px-10 py-5 font-pixel text-lg text-white mc-text-shadow w-full sm:w-auto">
                      PLAY NOW
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signup">
                      <button className="mc-button mc-button-green px-10 py-5 font-pixel text-lg text-white mc-text-shadow w-full sm:w-auto">
                        START QUEST
                      </button>
                    </Link>
                    <Link href="/signin">
                      <button className="mc-button px-10 py-5 font-pixel text-lg text-white mc-text-shadow w-full sm:w-auto">
                        RESUME GAME
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Floating Blocks Decor */}
          <div className="absolute top-1/4 left-10 w-16 h-16 mc-card opacity-20 animate-bounce" />
          <div className="absolute top-1/3 right-20 w-12 h-12 mc-card bg-green-500 opacity-20 animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-20 h-20 mc-card bg-blue-500 opacity-10 rotate-12" />
        </section>

        <section id="features" className="py-24 bg-black/40">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-pixel mb-4 mc-text-shadow">YOUR INVENTORY</h2>
              <p className="font-pixel text-zinc-500 text-xs">Everything you need to conquer the block</p>
            </div>
            <Features />
          </div>
        </section>

        <section id="pricing" className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-pixel mb-4 mc-text-shadow">CHOOSE YOUR RANK</h2>
              <p className="font-pixel text-zinc-500 text-xs text-[10px]">Unlock powerful perks and legendary status</p>
            </div>
            <CreativePricing 
              tag="Level Up Your Career"
              title="Choose Your Quest Path"
              description="Unlock your potential with our flexible plans"
              tiers={sampleTiers} 
            />
          </div>
        </section>

        <section id="cta" className="py-32 bg-yellow-400 text-black">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-pixel mb-12 leading-tight">
              READY TO JOIN THE SERVER?
            </h2>
            <Link href="/signup">
              <button className="mc-button mc-button-blue px-12 py-6 font-pixel text-xl text-white mc-text-shadow">
                JOIN THE QUEST
              </button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t-4 border-black mc-card">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="font-pixel text-2xl mc-text-shadow text-white">CodeQuest</div>
          <div className="flex gap-8 font-pixel text-[10px] text-zinc-600">
            <a href="#" className="hover:text-white transition-colors">PRIVACY</a>
            <a href="#" className="hover:text-white transition-colors">TERMS</a>
            <a href="#" className="hover:text-white transition-colors">SUPPORT</a>
          </div>
          <div className="font-pixel text-[10px] text-zinc-600">
            © {new Date().getFullYear()} CODEQUEST STUDIOS
          </div>
        </div>
      </footer>
    </div>
  );
}
