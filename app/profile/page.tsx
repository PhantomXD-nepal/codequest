"use client";

import { DashboardLayout } from "@/components/ui/dashboard-layout";
import { User, Shield, Star, Zap, Target, Award, Calendar, Settings, LogOut, ChevronRight, LayoutDashboard, BookOpen, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Image from "next/image";
import { getUserStatsAction, getUserAchievementsAction, getAchievementsAction, getAllCourseContentAction, getUserRankAction } from "@/app/actions";

export default function ProfilePage() {
  const { data: session } = authClient.useSession();
  const profileRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState({ xp: 0, streak: 0, role: 'user', completedLessons: [] as string[] });
  const [achievements, setAchievements] = useState<any[]>([]);
  const [allAchievements, setAllAchievements] = useState<any[]>([]);
  const [courseData, setCourseData] = useState<any[]>([]);
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    async function fetchStats() {
      if (session) {
        try {
          const data = await getUserStatsAction();
          setStats(data as any);
          const userAchievements = await getUserAchievementsAction();
          setAchievements(userAchievements);
          const allAch = await getAchievementsAction();
          setAllAchievements(allAch);
          const courses = await getAllCourseContentAction();
          setCourseData(courses);
          const userRank = await getUserRankAction();
          setRank(userRank);
        } catch (err) {
          console.error("Failed to fetch stats:", err);
        }
      }
    }
    fetchStats();
  }, [session]);

  useEffect(() => {
    if (session && profileRef.current) {
      const ctx = gsap.context(() => {
        const cards = profileRef.current?.querySelectorAll(".profile-card");
        if (cards && cards.length > 0) {
          gsap.fromTo(
            cards,
            { opacity: 0, scale: 0.9, y: 20 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.1,
              ease: "back.out(1.7)",
            }
          );
        }
      }, profileRef);
      return () => ctx.revert();
    }
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen mc-container text-white flex flex-col items-center justify-center p-6">
        <div className="mc-card p-12 text-center max-w-md">
          <Shield className="w-20 h-20 text-red-500 mx-auto mb-6 animate-pulse" />
          <h1 className="text-2xl font-pixel mb-4 uppercase">ACCESS DENIED</h1>
          <p className="font-pixel text-[10px] text-zinc-500 mb-8 leading-relaxed">
            YOU MUST BE LOGGED IN TO VIEW YOUR PROFILE. AUTHENTICATE YOURSELF TO CONTINUE THE QUEST.
          </p>
          <a href="/signin">
            <button className="mc-button mc-button-green px-8 py-4 font-pixel text-sm text-white mc-text-shadow w-full">
              LOGIN NOW
            </button>
          </a>
        </div>
      </div>
    );
  }

  const user = session.user;
  
  // Level calculation: Level = floor(sqrt(xp / 100)) + 1
  const level = Math.floor(Math.sqrt(stats.xp / 100)) + 1;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const currentLevelXp = Math.pow(level - 1, 2) * 100;
  const xpProgress = stats.xp - currentLevelXp;
  const xpRequired = nextLevelXp - currentLevelXp;
  const progressPercentage = Math.min((xpProgress / xpRequired) * 100, 100);

  let title = "NOVICE";
  if (level >= 5) title = "APPRENTICE";
  if (level >= 10) title = "ADEPT";
  if (level >= 20) title = "EXPERT";
  if (level >= 50) title = "MASTER";
  if (level >= 100) title = "GRANDMASTER";

  return (
    <DashboardLayout>
      <main className="flex-1 py-12">
        <div ref={profileRef} className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Sidebar / User Info */}
            <div className="lg:col-span-4 space-y-8">
              <div className="profile-card bg-[#1e1e1e] border-4 border-[#000] p-8 text-center relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-[#39ff14]" />
                <div className="size-32 border-4 border-[#000] mx-auto mb-6 bg-[#141414] overflow-hidden relative group rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Image 
                    src={user.image || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.name}`} 
                    alt={user.name} 
                    fill
                    className="object-cover transition-transform group-hover:scale-110" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Settings className="text-[#39ff14] w-8 h-8 rotate-0 group-hover:rotate-90 transition-transform" />
                  </div>
                </div>
                <h2 className="text-2xl font-pixel text-[#39ff14] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] mb-2 uppercase">{user.name}</h2>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="bg-[#141414] border-2 border-[#000] px-3 py-1 font-pixel text-[8px] text-[#39ff14] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">LVL {level}</div>
                  <div className="bg-[#141414] border-2 border-[#000] px-3 py-1 font-pixel text-[8px] text-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{title}</div>
                </div>
                
                <div className="space-y-4 pt-6 border-t-4 border-[#000]">
                  <div className="flex items-center justify-between font-pixel text-[10px]">
                    <span className="text-[#888]">XP PROGRESS</span>
                    <span className="text-[#39ff14]">{stats.xp} / {nextLevelXp}</span>
                  </div>
                  <div className="h-4 border-2 border-[#000] bg-[#141414] overflow-hidden rounded-full">
                    <div className="h-full bg-[#39ff14] transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                  </div>
                </div>
              </div>

              <div className="profile-card bg-[#1e1e1e] border-4 border-[#000] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl">
                <h3 className="font-pixel text-sm mb-6 uppercase flex items-center gap-2 text-white">
                  <Award className="text-yellow-400 w-4 h-4" />
                  BADGES EARNED
                </h3>
                <div className="flex flex-wrap gap-4">
                  {achievements.length > 0 ? achievements.map((ach, i) => (
                    <div key={i} className="size-12 bg-[#141414] border-2 border-[#000] flex items-center justify-center group cursor-help shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg text-2xl" title={ach.achievement.title}>
                      {ach.achievement.icon}
                    </div>
                  )) : (
                    <div className="text-[#888] font-pixel text-[10px]">NO BADGES YET</div>
                  )}
                </div>
              </div>

              <div className="profile-card bg-[#1e1e1e] border-4 border-[#000] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl">
                <h3 className="font-pixel text-sm mb-6 uppercase flex items-center gap-2 text-white">
                  <Calendar className="text-blue-400 w-4 h-4" />
                  STATISTICS
                </h3>
                <div className="space-y-4 font-pixel text-[10px]">
                  <div className="flex justify-between items-center p-3 bg-[#141414] border-2 border-[#000] rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-[#888]">LESSONS DONE</span>
                    <span className="text-white">{stats.completedLessons?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#141414] border-2 border-[#000] rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-[#888]">STREAK</span>
                    <span className="text-[#39ff14]">{stats.streak} DAYS</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#141414] border-2 border-[#000] rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-[#888]">GLOBAL RANK</span>
                    <span className="text-blue-400">#{rank || '--'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-8 space-y-8">
              <div className="profile-card bg-[#1e1e1e] border-4 border-[#000] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-pixel text-xl uppercase flex items-center gap-3 text-white">
                    <BookOpen className="text-[#39ff14] w-6 h-6" />
                    CURRENT QUESTS
                  </h3>
                  <button className="font-pixel text-[10px] text-[#888] hover:text-[#39ff14] transition-colors">VIEW ALL</button>
                </div>
                
                <div className="space-y-6">
                  {courseData.length > 0 ? courseData.map((section, i) => {
                    let totalLessons = 0;
                    let completed = 0;
                    section.chapters.forEach((chapter: any) => {
                      chapter.lessons.forEach((lesson: any) => {
                        totalLessons++;
                        if (stats.completedLessons.includes(lesson.id as never)) {
                          completed++;
                        }
                      });
                    });
                    const progress = totalLessons === 0 ? 0 : Math.round((completed / totalLessons) * 100);
                    const color = progress === 100 ? "bg-[#39ff14]" : progress > 50 ? "bg-blue-500" : "bg-purple-500";
                    
                    if (progress === 0) return null;

                    return (
                      <div key={i} className="space-y-3 p-4 bg-[#141414] border-2 border-[#000] rounded-lg hover:border-[#39ff14]/50 transition-colors cursor-pointer group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex justify-between items-center font-pixel text-[12px]">
                          <span className="group-hover:text-[#39ff14] transition-colors text-white">{section.title}</span>
                          <span className="text-[#888]">{progress}%</span>
                        </div>
                        <div className="h-3 border-2 border-[#000] bg-[#1a1a1a] overflow-hidden rounded-full">
                          <div className={`h-full ${color}`} style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-4 text-[#888] font-pixel text-[10px]">
                      NO QUESTS AVAILABLE
                    </div>
                  )}
                  {courseData.length > 0 && courseData.every(section => {
                    let completed = 0;
                    section.chapters.forEach((chapter: any) => {
                      chapter.lessons.forEach((lesson: any) => {
                        if (stats.completedLessons.includes(lesson.id as never)) completed++;
                      });
                    });
                    return completed === 0;
                  }) && (
                    <div className="text-center py-4 text-[#888] font-pixel text-[10px]">
                      NO QUESTS STARTED YET
                    </div>
                  )}
                </div>
              </div>

              <div className="profile-card bg-[#1e1e1e] border-4 border-[#000] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl">
                <h3 className="font-pixel text-xl uppercase mb-8 flex items-center gap-3 text-white">
                  <Trophy className="text-yellow-400 w-6 h-6" />
                  ACHIEVEMENTS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allAchievements.length > 0 ? allAchievements.map((ach, i) => {
                    const isUnlocked = achievements.some(ua => ua.achievementId === ach.id);
                    const unlockData = achievements.find(ua => ua.achievementId === ach.id);
                    
                    return (
                      <div key={i} className={`flex gap-4 p-4 bg-[#141414] border-2 border-[#000] rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isUnlocked ? '' : 'opacity-50 grayscale'}`}>
                        <div className="size-12 bg-[#1e1e1e] border-2 border-[#000] rounded-lg shrink-0 flex items-center justify-center text-2xl">
                          {ach.icon}
                        </div>
                        <div className="space-y-1">
                          <div className={`font-pixel text-[10px] uppercase ${isUnlocked ? 'text-[#39ff14]' : 'text-[#888]'}`}>{ach.title}</div>
                          <div className="font-pixel text-[8px] text-[#888] leading-tight">{ach.description}</div>
                          <div className="font-pixel text-[8px] text-blue-400 pt-1">
                            {isUnlocked ? `UNLOCKED: ${new Date(unlockData.unlockedAt).toLocaleDateString()}` : `LOCKED: ${ach.conditionType.toUpperCase()} ${ach.conditionValue}`}
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="col-span-full text-center py-8 text-[#888] font-pixel text-[10px]">
                      NO ACHIEVEMENTS AVAILABLE
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
