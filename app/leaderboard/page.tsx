"use client";

import { DashboardLayout } from "@/components/ui/dashboard-layout";
import { Trophy, Medal, Crown, Star, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

const leaderboardData = [
  { id: 1, name: "PixelMaster", xp: 15420, level: 42, rank: 1, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelMaster" },
  { id: 2, name: "CodeNinja", xp: 14200, level: 38, rank: 2, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=CodeNinja" },
  { id: 3, name: "BitWizard", xp: 12850, level: 35, rank: 3, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=BitWizard" },
  { id: 4, name: "LogicKnight", xp: 11200, level: 31, rank: 4, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=LogicKnight" },
  { id: 5, name: "SyntaxSlayer", xp: 9800, level: 28, rank: 5, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=SyntaxSlayer" },
  { id: 6, name: "DataDragon", xp: 8500, level: 25, rank: 6, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=DataDragon" },
  { id: 7, name: "VoidWalker", xp: 7200, level: 22, rank: 7, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=VoidWalker" },
  { id: 8, name: "CyberGhost", xp: 6400, level: 19, rank: 8, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=CyberGhost" },
  { id: 9, name: "RustRanger", xp: 5100, level: 16, rank: 9, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=RustRanger" },
  { id: 10, name: "GoGuru", xp: 4200, level: 14, rank: 10, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=GoGuru" },
];

export default function LeaderboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const ctx = gsap.context(() => {
        const rows = containerRef.current?.querySelectorAll(".leaderboard-row");
        if (rows && rows.length > 0) {
          gsap.fromTo(
            rows,
            { opacity: 0, x: -50 },
            {
              opacity: 1,
              x: 0,
              duration: 0.5,
              stagger: 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%",
              },
            }
          );
        }
      }, containerRef);
      return () => ctx.revert();
    }
  }, []);

  return (
    <DashboardLayout>
      <main className="flex-1 py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="inline-block mb-4"
            >
              <Trophy className="w-20 h-20 text-yellow-400 animate-bounce drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-pixel text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-4 uppercase">
              HALL OF <span className="text-[#39ff14]">LEGENDS</span>
            </h1>
            <p className="font-pixel text-[#888] text-[12px] uppercase tracking-widest">
              THE TOP 10 WARRIORS OF THE SOURCE CODE
            </p>
          </div>

          <div ref={containerRef} className="space-y-4">
            {leaderboardData.map((user, index) => (
              <div 
                key={user.id}
                className={`leaderboard-row bg-[#1e1e1e] border-4 p-4 flex items-center gap-6 transition-all hover:scale-[1.02] cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl ${
                  index === 0 ? "border-yellow-400" : 
                  index === 1 ? "border-zinc-300" :
                  index === 2 ? "border-orange-400" : "border-[#000]"
                }`}
              >
                <div className="w-12 font-pixel text-2xl flex justify-center items-center">
                  {index === 0 ? <Crown className="text-yellow-400 w-8 h-8 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" /> : 
                   index === 1 ? <Medal className="text-zinc-300 w-8 h-8 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" /> :
                   index === 2 ? <Medal className="text-orange-400 w-8 h-8 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" /> : 
                   <span className="text-[#555]">#{user.rank}</span>}
                </div>

                <div className="size-12 border-2 border-[#000] overflow-hidden bg-[#141414] shrink-0 relative rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Image src={user.avatar} alt={user.name} fill className="object-cover" referrerPolicy="no-referrer" />
                </div>

                <div className="flex-1">
                  <div className={`font-pixel text-lg uppercase ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-zinc-300' : index === 2 ? 'text-orange-400' : 'text-white'}`}>{user.name}</div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1 text-[#888] font-pixel text-[10px]">
                      <Zap size={10} className="text-[#39ff14]" />
                      LEVEL {user.level}
                    </div>
                    <div className="flex items-center gap-1 text-[#888] font-pixel text-[10px]">
                      <Target size={10} className="text-blue-400" />
                      {user.xp.toLocaleString()} XP
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex gap-2">
                  <div className="bg-[#141414] border-2 border-[#000] px-3 py-1 font-pixel text-[10px] text-[#39ff14] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    TOP {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <div className="bg-[#1e1e1e] border-4 border-[#000] border-dashed inline-block p-8 max-w-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl">
              <h3 className="font-pixel text-xl mb-4 uppercase text-white">WANT TO CLIMB THE RANKS?</h3>
              <p className="font-pixel text-[10px] text-[#888] leading-relaxed mb-6">
                COMPLETE QUESTS, SOLVE CHALLENGES, AND EARN XP TO SEE YOUR NAME IN THE HALL OF LEGENDS. EVERY LINE OF CODE BRINGS YOU CLOSER TO THE TOP.
              </p>
              <button className="bg-[#39ff14] text-black border-4 border-[#000] px-8 py-4 font-pixel text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                START GRINDING
              </button>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
