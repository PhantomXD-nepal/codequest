"use client";

import { DashboardLayout } from "@/components/ui/dashboard-layout";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getLeaderboardAction } from "@/app/actions";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await getLeaderboardAction();
        setLeaderboardData(data);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingScreen />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="max-w-4xl mx-auto px-6 pt-8 pb-32">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight mb-4">Top Explorers</h1>
          <p className="text-on-surface-variant max-w-lg mx-auto leading-relaxed">
            Celebrating the brightest minds in Nepal. Fueling a future of <span className="text-primary font-bold">free education</span> through the power of code.
          </p>
        </div>

        {/* Podium Section (Asymmetric Layout) */}
        {leaderboardData.length >= 3 && (
          <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-16 pt-12">
            {/* Rank 2 */}
            <div className="order-2 md:order-1 flex flex-col items-center w-full md:w-1/3 group">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-outline-variant to-surface-container-highest">
                  <Image width={96} height={96} alt="Explorer Rank 2" className="w-full h-full rounded-full object-cover" src={leaderboardData[1].avatar} />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-outline-variant text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">#2</div>
              </div>
              <div className="bg-surface-container-high w-full rounded-t-xl pt-6 pb-8 text-center px-4 transition-all group-hover:scale-105">
                <h3 className="font-bold text-lg text-on-surface">{leaderboardData[1].name}</h3>
                <p className="text-secondary font-black text-xl">{leaderboardData[1].xp.toLocaleString()} XP</p>
                <span className="inline-block mt-2 px-3 py-1 bg-surface-container-highest rounded-full text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Level {leaderboardData[1].level}</span>
              </div>
            </div>

            {/* Rank 1 (The Peak) */}
            <div className="order-1 md:order-2 flex flex-col items-center w-full md:w-2/5 -mt-8 group">
              <div className="relative mb-6">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-500">
                  <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                </div>
                <div className="w-32 h-32 rounded-full p-1.5 bg-gradient-to-tr from-primary to-primary-container shadow-xl">
                  <Image width={128} height={128} alt="Explorer Rank 1" className="w-full h-full rounded-full object-cover border-4 border-surface" src={leaderboardData[0].avatar} />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold shadow-2xl">#1</div>
              </div>
              <div className="bg-primary-container w-full rounded-t-xl pt-10 pb-12 text-center px-4 shadow-2xl relative overflow-hidden transition-all group-hover:scale-105">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="material-symbols-outlined text-6xl">workspace_premium</span>
                </div>
                <h3 className="font-black text-2xl text-on-primary-container">{leaderboardData[0].name}</h3>
                <p className="text-primary font-black text-3xl">{leaderboardData[0].xp.toLocaleString()} XP</p>
                <div className="mt-4 flex justify-center gap-2">
                  <span className="px-3 py-1 bg-white/40 backdrop-blur-md rounded-full text-[11px] font-bold text-on-primary-container">Level {leaderboardData[0].level}</span>
                  <span className="px-3 py-1 bg-primary text-white rounded-full text-[11px] font-bold uppercase tracking-wider">Master</span>
                </div>
              </div>
            </div>

            {/* Rank 3 */}
            <div className="order-3 md:order-3 flex flex-col items-center w-full md:w-1/3 group">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-secondary-container to-secondary-fixed">
                  <Image width={96} height={96} alt="Explorer Rank 3" className="w-full h-full rounded-full object-cover" src={leaderboardData[2].avatar} />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-secondary-dim text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">#3</div>
              </div>
              <div className="bg-surface-container-high w-full rounded-t-xl pt-6 pb-8 text-center px-4 transition-all group-hover:scale-105">
                <h3 className="font-bold text-lg text-on-surface">{leaderboardData[2].name}</h3>
                <p className="text-secondary font-black text-xl">{leaderboardData[2].xp.toLocaleString()} XP</p>
                <span className="inline-block mt-2 px-3 py-1 bg-surface-container-highest rounded-full text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Level {leaderboardData[2].level}</span>
              </div>
            </div>
          </div>
        )}

        {/* List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-8 py-2 text-on-surface-variant font-bold text-xs uppercase tracking-widest">
            <div className="flex items-center gap-8">
              <span className="w-8">Rank</span>
              <span>Student</span>
            </div>
            <div className="hidden sm:flex gap-12">
              <span className="w-24 text-center">Progress</span>
              <span className="w-20 text-right">Points</span>
            </div>
          </div>

          {leaderboardData.slice(3).map((user, index) => (
            <div key={user.id} className="bg-surface-container-low rounded-lg p-4 flex items-center justify-between hover:bg-surface-container-high transition-colors cursor-pointer group">
              <div className="flex items-center gap-6">
                <span className="w-8 font-black text-on-surface-variant text-lg">{user.rank}</span>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-surface-container-highest">
                    <Image width={48} height={48} alt={`Student ${user.rank}`} className="w-full h-full object-cover" src={user.avatar} />
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">{user.name}</p>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-tighter">Level {user.level}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="hidden sm:flex flex-col items-center w-24">
                  <span className="text-sm font-bold text-on-surface">Level {user.level}</span>
                  <div className="w-full h-1 bg-surface-container-highest rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(user.level % 10) * 10}%` }}></div>
                  </div>
                </div>
                <div className="text-right w-20">
                  <p className="font-black text-on-surface">{user.xp.toLocaleString()}</p>
                  <p className="text-[10px] text-on-surface-variant font-medium">XP</p>
                </div>
                <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">chevron_right</span>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action / Mission */}
        <div className="mt-20 p-1 bg-gradient-to-r from-primary via-tertiary to-secondary rounded-xl">
          <div className="bg-surface p-8 rounded-lg text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-[300px]">school</span>
            </div>
            <h2 className="text-2xl font-black text-on-surface mb-2">Want to climb the ranks?</h2>
            <p className="text-on-surface-variant mb-6 max-w-md mx-auto">Start a new coding quest today and contribute to the goal of 1 Million free coding lessons for Nepal&apos;s youth.</p>
            <button className="bg-gradient-to-r from-primary to-primary-container text-white font-bold py-4 px-10 rounded-full shadow-xl hover:opacity-90 transition-all active:scale-95 duration-150">
              START NEXT QUEST
            </button>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
