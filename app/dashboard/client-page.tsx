"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Trophy, Star, Zap, User, Settings, Plus, X, Save, Edit, Home, LogOut, Menu, LayoutDashboard, BarChart2, Award, Shield, Database, Code, Terminal, Globe, ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Component as LumaSpin } from "@/components/ui/luma-spin";
import { getUserStatsAction, makeMeAdminAction, getCourseContentByLanguageAction, createChapterAction, createLessonAction, createSectionAction, updateChapterAction, updateLessonAction, updateSectionAction, checkAndUnlockAchievementsAction, getUserRankAction, getLanguagesAction, seedAllCoursesAction, revertLessonProgressAction, completeOnboardingAction, completeTourAction } from "@/app/actions";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import dynamic from "next/dynamic";
import { type Step, type EventData, STATUS } from 'react-joyride';
import { OnboardingModal } from '@/components/dashboard/onboarding';
import { CustomTooltip } from '@/components/dashboard/custom-tooltip';

// Dynamic imports for code splitting
const Joyride = dynamic(() => import('react-joyride').then((mod) => mod.Joyride), { ssr: false });
const LanguageSelect = dynamic(() => import("@/components/dashboard/language-select"), { ssr: false });
const AdminEditor = dynamic(() => import("@/components/dashboard/admin-editor"), { ssr: false });
const LearningPath = dynamic(() => import("@/components/dashboard/learning-path"), { ssr: false });
const SidebarStats = dynamic(() => import("@/components/dashboard/sidebar-stats"), { ssr: false });

import { LoadingScreen } from "@/components/ui/loading-screen";

export default function DashboardClientPage({ 
  initialCourseData, 
  initialStats, 
  initialRank,
  initialLanguages 
}: { 
  initialCourseData: any[], 
  initialStats: any, 
  initialRank: number | null,
  initialLanguages: any[]
}) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [completedLessons, setCompletedLessons] = useState<string[]>(initialStats.completedLessons || []);
  const [xp, setXp] = useState(initialStats.xp || 0);
  const [streak, setStreak] = useState(initialStats.streak || 0);
  const [role, setRole] = useState(initialStats.role || 'user');
  const [courseData, setCourseData] = useState<any[]>(initialCourseData || []);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
  const [language, setLanguage] = useState('python');
  const [availableLanguages, setAvailableLanguages] = useState<any[]>(initialLanguages || []);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [rank, setRank] = useState<number | null>(initialRank);
  const mainRef = useRef<HTMLDivElement>(null);

  // Admin Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorType, setEditorType] = useState<'section' | 'chapter' | 'lesson'>('lesson');
  const [parentId, setParentId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorData, setEditorData] = useState({
    title: '',
    description: '',
    content: '',
    challenge: '',
    hint: '',
    initialCode: '',
    expectedOutput: '',
    type: 'beginner'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (session) {
      if (!initialStats.hasCompletedOnboarding) {
        setShowOnboarding(true);
      } else if (!initialStats.hasCompletedTour) {
        const timer = setTimeout(() => {
          setRunTour(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [session, initialStats]);

  const tourSteps: Step[] = [
    {
      target: '.nav-learn',
      content: 'This is the Learn tab. Here you will find your main quest line and course modules.',
      title: 'The Learning Path',
      skipBeacon: true,
      placement: 'right',
    },
    {
      target: '.nav-lessons',
      content: 'Access all individual lessons and challenges directly from here.',
      title: 'Lesson Library',
      placement: 'right',
    },
    {
      target: '.nav-leaderboard',
      content: 'Compete with other coders and see your rank on the global leaderboard!',
      title: 'Leaderboard',
      placement: 'right',
    },
    {
      target: '.nav-profile',
      content: 'View your stats, achievements, and customize your avatar.',
      title: 'Your Profile',
      placement: 'right',
    },
    {
      target: '.nav-playground',
      content: 'Experiment with code freely in the interactive playground.',
      title: 'Playground',
      placement: 'right',
    }
  ];

  const handleJoyrideCallback = async (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      await completeTourAction();
      import('@/lib/confetti').then((mod) => {
        mod.triggerConfetti();
        mod.playSuccessSound();
      });
      window.dispatchEvent(new CustomEvent('mascot-message', { detail: { message: "You're all set! Let the coding begin! 🎉", state: "happy" } }));
    }
  };

  const fetchCourse = useCallback(async () => {
    setIsLoadingCourse(true);
    try {
      const data = await getCourseContentByLanguageAction(language);
      setCourseData(data);
    } catch (err) {
      console.error("Failed to fetch course data:", err);
    } finally {
      setIsLoadingCourse(false);
    }
  }, [language]);

  const isFirstLoadStats = useRef(true);
  const prevLevelRef = useRef(Math.floor(initialStats.xp / 100) + 1);

  useEffect(() => {
    const currentLevel = Math.floor(xp / 100) + 1;
    if (currentLevel > prevLevelRef.current) {
      import('@/lib/confetti').then((mod) => {
        mod.playLevelUpSound();
        mod.triggerConfetti();
      });
      window.dispatchEvent(new CustomEvent('mascot-message', { detail: { message: `Level Up! You are now level ${currentLevel}! 🎉`, state: "happy" } }));
      prevLevelRef.current = currentLevel;
    }
  }, [xp]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const stats = await getUserStatsAction();
        setXp(stats.xp);
        setStreak(stats.streak);
        setRole(stats.role);
        setCompletedLessons(stats.completedLessons);
        const newAchievements = await checkAndUnlockAchievementsAction();
        if (newAchievements && newAchievements.length > 0) {
          import('@/lib/confetti').then((mod) => {
            mod.playAchievementSound();
            mod.triggerConfetti();
          });
          window.dispatchEvent(new CustomEvent('mascot-message', { detail: { message: `Achievement Unlocked: ${newAchievements[0].title}! 🏆`, state: "happy" } }));
        }
        const userRank = await getUserRankAction();
        setRank(userRank);

        const langs = await getLanguagesAction();
        setAvailableLanguages(langs);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    }

    if (session) {
      if (isFirstLoadStats.current) {
        isFirstLoadStats.current = false;
        return;
      }
      fetchStats();
    }
  }, [session]);

  const isFirstLoadCourse = useRef(true);
  useEffect(() => {
    if (session) {
      if (isFirstLoadCourse.current) {
        isFirstLoadCourse.current = false;
        return;
      }
      fetchCourse();
    }
  }, [session, language, fetchCourse]);

  const handleSaveContent = async () => {
    setIsSaving(true);
    try {
      if (editorType === 'section') {
        if (editingId) {
          await updateSectionAction(editingId, { title: editorData.title, language: language });
        } else {
          await createSectionAction({ title: editorData.title, language: language });
        }
      } else if (editorType === 'chapter') {
        if (editingId) {
          await updateChapterAction(editingId, { title: editorData.title });
        } else if (parentId) {
          await createChapterAction({ title: editorData.title, sectionId: parentId });
        }
      } else if (editorType === 'lesson') {
        const lessonPayload = {
          title: editorData.title,
          description: editorData.description,
          content: editorData.content,
          challenge: editorData.challenge,
          hint: editorData.hint,
          initialCode: editorData.initialCode,
          expectedOutput: editorData.expectedOutput,
          type: editorData.type,
        };
        if (editingId) {
          await updateLessonAction(editingId, lessonPayload);
        } else if (parentId) {
          await createLessonAction({ ...lessonPayload, chapterId: parentId });
        }
      }
      setIsEditorOpen(false);
      setEditingId(null);
      fetchCourse();
      setEditorData({
        title: '',
        description: '',
        content: '',
        challenge: '',
        hint: '',
        initialCode: '',
        expectedOutput: '',
        type: 'beginner'
      });
    } catch (err) {
      console.error("Failed to save content:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevertProgress = async (lessonId: string) => {
    try {
      const result = await revertLessonProgressAction(lessonId);
      if (result.success) {
        setCompletedLessons(prev => prev.filter(id => id !== lessonId));
        // Refresh stats to update XP and streak
        const stats = await getUserStatsAction();
        setXp(stats.xp);
        setStreak(stats.streak);
      }
    } catch (err) {
      console.error("Failed to revert progress:", err);
    }
  };

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [session, isPending, router]);

  const initialAnimationPlayed = useRef(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (mainRef.current && !isPending && session) {
      const ctx = gsap.context(() => {
        if (!initialAnimationPlayed.current) {
          gsap.fromTo(
            ".animate-item",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }
          );
          initialAnimationPlayed.current = true;
        }
      }, mainRef);

      return () => ctx.revert();
    }
  }, [isPending, session]);

  if (showLanguageSelect) {
    return (
      <DashboardLayout>
        <LanguageSelect 
          availableLanguages={availableLanguages}
          role={role}
          setAvailableLanguages={setAvailableLanguages}
          setIsLoadingCourse={setIsLoadingCourse}
          setLanguage={setLanguage}
          setShowLanguageSelect={setShowLanguageSelect}
          fetchCourse={fetchCourse}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {showOnboarding && (
        <OnboardingModal onComplete={async (data) => {
          await completeOnboardingAction(data);
          setShowOnboarding(false);
          setRunTour(true);
        }} />
      )}
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous={true}
        options={{
          zIndex: 10000,
          buttons: ['back', 'close', 'primary', 'skip'],
        }}
        onEvent={handleJoyrideCallback}
        tooltipComponent={CustomTooltip}
      />

      <AdminEditor 
        isEditorOpen={isEditorOpen}
        setIsEditorOpen={setIsEditorOpen}
        editorType={editorType}
        editorData={editorData}
        setEditorData={setEditorData}
        isSaving={isSaving}
        handleSaveContent={handleSaveContent}
        language={language}
      />

      <div ref={mainRef} className="max-w-4xl mx-auto relative z-10">
        <div className="space-y-12">
          {/* Header Controls */}
          <div className="flex items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm animate-item">
            <div className="flex items-center gap-4">
              <label className="font-headline font-bold text-xs text-on-surface-variant uppercase tracking-widest">Current Quest:</label>
              <button 
                onClick={() => setShowLanguageSelect(true)}
                className="bg-surface-variant border border-outline-variant rounded-lg px-4 py-2 text-on-surface font-headline font-bold text-xs hover:border-primary transition-colors flex items-center gap-3"
              >
                <span className="text-primary uppercase">{language.replace('-', ' ')}</span>
                <Edit className="w-3 h-3 text-on-surface-variant" />
              </button>
            </div>
            {role === 'admin' && (
              <div className="flex gap-2">
                <button 
                  onClick={async () => {
                    setIsLoadingCourse(true);
                    await seedAllCoursesAction();
                    const langs = await getLanguagesAction();
                    setAvailableLanguages(langs);
                    fetchCourse();
                    setIsLoadingCourse(false);
                  }}
                  className="bg-secondary text-on-secondary font-headline font-bold text-[10px] px-3 py-2 rounded flex items-center gap-2 hover:brightness-110 transition-all shadow-sm"
                >
                  <Database className="w-3 h-3" />
                  SEED ALL
                </button>
                <button 
                  onClick={() => {
                    setEditorType('section');
                    setParentId(null);
                    setEditingId(null);
                    setEditorData({ title: '', description: '', content: '', challenge: '', hint: '', initialCode: '', expectedOutput: '', type: 'beginner' });
                    setIsEditorOpen(true);
                  }}
                  className="bg-primary text-on-primary font-headline font-bold text-[10px] px-3 py-2 rounded flex items-center gap-2 hover:brightness-110 transition-all shadow-sm"
                >
                  <Plus className="w-3 h-3" />
                  ADD SECTION
                </button>
              </div>
            )}
          </div>

          {isLoadingCourse ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-surface-variant border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <LearningPath 
              courseData={courseData}
              completedLessons={completedLessons}
              role={role}
              onLessonClick={(id, locked) => { if (!locked) router.push(`/lessons/${id}`); }}
              onAddChapter={(sid) => { setEditorType('chapter'); setParentId(sid); setEditingId(null); setEditorData({ ...editorData, title: '' }); setIsEditorOpen(true); }}
              onAddLesson={(cid) => { setEditorType('lesson'); setParentId(cid); setEditingId(null); setEditorData({ title: '', description: '', content: '', challenge: '', hint: '', initialCode: '', expectedOutput: '', type: 'beginner' }); setIsEditorOpen(true); }}
              onEditSection={(s) => { setEditorType('section'); setEditingId(s.id); setEditorData({ ...editorData, title: s.title }); setIsEditorOpen(true); }}
              onEditChapter={(c) => { setEditorType('chapter'); setEditingId(c.id); setEditorData({ ...editorData, title: c.title }); setIsEditorOpen(true); }}
              onEditLesson={(l) => { setEditorType('lesson'); setEditingId(l.id); setEditorData({ title: l.title, description: l.description, content: l.content, challenge: l.challenge, hint: l.hint || '', initialCode: l.initialCode, expectedOutput: l.expectedOutput, type: l.type }); setIsEditorOpen(true); }}
              onRevertProgress={handleRevertProgress}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
