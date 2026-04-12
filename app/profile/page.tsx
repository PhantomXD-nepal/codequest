"use client";

import { DashboardLayout } from "@/components/ui/dashboard-layout";
import { User, Settings, LogOut, BookOpen, Trophy, X, Edit2, Award, Zap, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { authClient } from "@/lib/auth-client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  getUserStatsAction, 
  getUserAchievementsAction, 
  getAchievementsAction, 
  getAllCourseContentAction, 
  getUserRankAction 
} from "@/app/actions";

export default function ProfilePage() {
  const { data: session } = authClient.useSession();
  const [stats, setStats] = useState({ xp: 0, streak: 0, role: 'student', completedLessons: [] as string[] });
  const [achievements, setAchievements] = useState<any[]>([]);
  const [allAchievements, setAllAchievements] = useState<any[]>([]);
  const [courseData, setCourseData] = useState<any[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (session?.user?.id) {
        try {
          const [statsData, userAch, allAch, courses, userRank] = await Promise.all([
            getUserStatsAction(),
            getUserAchievementsAction(),
            getAchievementsAction(),
            getAllCourseContentAction(),
            getUserRankAction()
          ]);
          
          setStats(statsData as any);
          setAchievements(userAch);
          setAllAchievements(allAch);
          setCourseData(courses);
          setRank(userRank);
        } catch (err) {
          console.error("Failed to fetch profile data:", err);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchStats();
  }, [session?.user?.id]);

  if (!session) return null;

  const user = session.user;
  const level = Math.floor(Math.sqrt(stats.xp / 100)) + 1;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const prevLevelXp = Math.pow(level - 1, 2) * 100;
  const xpProgress = Math.min(100, Math.max(0, ((stats.xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100));

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 space-y-12 max-w-6xl mx-auto font-body">
        {/* Profile Header Card */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 bg-surface-container-low rounded-3xl p-8 flex flex-col md:flex-row gap-10 items-center md:items-start relative overflow-hidden shadow-sm"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            
            <div className="relative group shrink-0">
              <div className="w-40 h-40 rounded-3xl bg-surface-container-highest flex items-center justify-center p-1 border-4 border-primary-container overflow-hidden shadow-xl">
                <Image 
                  src={user.image || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.name}`} 
                  alt={user.name} 
                  width={160}
                  height={160}
                  className="w-full h-full object-cover rounded-2xl" 
                  referrerPolicy="no-referrer"
                  priority
                />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-primary text-white p-3 rounded-2xl shadow-xl border-4 border-surface-container-low">
                <Zap className="w-5 h-5 fill-white" />
              </div>
            </div>

            <div className="flex-grow space-y-6 text-center md:text-left relative z-10">
              <div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-4xl font-black font-headline text-on-surface tracking-tight">{user.name}</h1>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                    {stats.role}
                  </span>
                </div>
                <p className="text-on-surface-variant font-medium">{user.email}</p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Global Rank</p>
                    <p className="text-xl font-headline font-black text-on-surface">#{rank || '?'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Total XP</p>
                    <p className="text-xl font-headline font-black text-on-surface">{stats.xp}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-primary uppercase tracking-widest">Level {level} Progress</span>
                  <span className="text-xs font-bold text-on-surface-variant">{stats.xp} / {nextLevelXp} XP</span>
                </div>
                <div className="h-4 w-full bg-surface-container-high rounded-full overflow-hidden p-1 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full shadow-lg"
                  />
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 bg-surface-container-low rounded-3xl p-8 flex flex-col gap-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-headline font-black text-xl text-on-surface">Badges</h4>
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {achievements.length > 0 ? achievements.map((ach, i) => (
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  key={i} 
                  className="aspect-square bg-surface-container-highest rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-outline-variant/30" 
                  title={ach.achievement.title}
                >
                  {ach.achievement.icon}
                </motion.div>
              )) : (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-surface-container-highest/30 rounded-2xl border-2 border-dashed border-outline-variant/30 flex items-center justify-center">
                    <Award className="w-6 h-6 text-on-surface-variant/20" />
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-on-surface-variant font-medium text-center mt-auto">
              {achievements.length} of {allAchievements.length} achievements unlocked
            </p>
          </motion.div>
        </section>

        {/* Quest Progress Section */}
        <section className="bg-surface-container-low rounded-3xl p-8 md:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h4 className="text-3xl font-black font-headline text-on-surface tracking-tight">Active Quests</h4>
              <p className="text-on-surface-variant font-medium">Your current learning adventures in progress.</p>
            </div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-headline font-bold text-sm hover:bg-primary-dim transition-all shadow-md">
              Adventure Map
              <BookOpen className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 bg-surface-container-highest/30 rounded-3xl animate-pulse" />
              ))
            ) : courseData.length > 0 ? (
              courseData.map((lang, i) => {
                let totalLessons = 0;
                let completed = 0;
                lang.sections?.forEach((section: any) => {
                  section.chapters?.forEach((chapter: any) => {
                    chapter.lessons?.forEach((lesson: any) => {
                      totalLessons++;
                      if (stats.completedLessons.includes(lesson.id)) {
                        completed++;
                      }
                    });
                  });
                });
                
                const progress = totalLessons === 0 ? 0 : Math.round((completed / totalLessons) * 100);
                
                // Only show languages with some progress or if it's the first one
                if (progress === 0 && completed === 0 && i > 0) return null;

                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={lang.id} 
                    className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 hover:border-primary/50 hover:shadow-xl transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                    
                    <div className="flex items-center gap-5 mb-8 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <BookOpen className="w-7 h-7" />
                      </div>
                      <div className="flex-grow">
                        <h5 className="text-xl font-black text-on-surface capitalize font-headline tracking-tight">{lang.title || lang.name}</h5>
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{completed} / {totalLessons} Quests</p>
                      </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Mastery</span>
                        <span className="text-2xl font-black text-primary font-headline">{progress}%</span>
                      </div>
                      <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden p-0.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center bg-surface-container-highest/20 rounded-3xl border-4 border-dashed border-outline-variant/30">
                <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-on-surface-variant/30" />
                </div>
                <h3 className="text-2xl font-black font-headline text-on-surface mb-2">No Quests Started</h3>
                <p className="text-on-surface-variant font-medium max-w-md mx-auto mb-8">Your adventure is waiting! Pick a language and start your first quest to see your progress here.</p>
                <Link href="/dashboard" className="px-8 py-4 bg-primary text-white rounded-full font-headline font-bold text-lg hover:bg-primary-dim transition-all shadow-lg">
                  Start Your First Quest
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
