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
import { getUserStatsAction, makeMeAdminAction, getCourseContentByLanguageAction, createChapterAction, createLessonAction, createSectionAction, updateChapterAction, updateLessonAction, updateSectionAction, checkAndUnlockAchievementsAction, getUserRankAction, getLanguagesAction, seedAllCoursesAction } from "@/app/actions";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import dynamic from "next/dynamic";

// Dynamic imports for code splitting
const LanguageSelect = dynamic(() => import("@/components/dashboard/language-select").then(mod => mod.LanguageSelect), { ssr: false });
const AdminEditor = dynamic(() => import("@/components/dashboard/admin-editor").then(mod => mod.AdminEditor), { ssr: false });
const LearningPath = dynamic(() => import("@/components/dashboard/learning-path").then(mod => mod.LearningPath), { ssr: false });
const SidebarStats = dynamic(() => import("@/components/dashboard/sidebar-stats").then(mod => mod.SidebarStats), { ssr: false });

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
  const [showOnboarding, setShowOnboarding] = useState(initialStats.xp === 0 && initialStats.completedLessons.length === 0);

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

  useEffect(() => {
    async function fetchStats() {
      try {
        const stats = await getUserStatsAction();
        setXp(stats.xp);
        setStreak(stats.streak);
        setRole(stats.role);
        setCompletedLessons(stats.completedLessons);
        if (stats.xp === 0 && stats.completedLessons.length === 0) {
          setShowOnboarding(true);
        }
        await checkAndUnlockAchievementsAction();
        const userRank = await getUserRankAction();
        setRank(userRank);

        const langs = await getLanguagesAction();
        setAvailableLanguages(langs);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    }

    if (session) {
      fetchStats();
    }
  }, [session]);

  useEffect(() => {
    if (session) {
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

  if (isPending || !session) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center gap-6">
        <LumaSpin />
        <div className="text-white font-pixel text-xs animate-pulse">LOADING QUEST DATA...</div>
      </div>
    );
  }

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
      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#1a1a1a] border-4 border-[#39ff14] rounded-xl w-full max-w-lg p-8 shadow-[0_0_100px_rgba(57,255,20,0.2)] text-center relative overflow-hidden"
          >
            <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
            <h2 className="font-pixel text-3xl text-white mb-4">WELCOME TO <span className="text-[#39ff14]">THE QUEST</span></h2>
            <p className="font-pixel text-[10px] text-[#aaa] mb-8">YOUR JOURNEY TO BECOMING A MASTER CODER BEGINS HERE.</p>
            <button 
              onClick={() => setShowOnboarding(false)}
              className="w-full bg-[#39ff14] text-black font-pixel text-sm py-4 rounded-lg hover:bg-white transition-colors"
            >
              START MY JOURNEY
            </button>
          </motion.div>
        </div>
      )}

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

      <main ref={mainRef} className="max-w-6xl mx-auto px-4 pt-12 pb-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 relative z-10">
        <div className="space-y-12">
          {/* Header Controls */}
          <div className="flex items-center justify-between gap-4 bg-[#1e1e1e] p-4 rounded-xl border-2 border-[#333] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-item">
            <div className="flex items-center gap-4">
              <label className="font-pixel text-[10px] text-[#888]">CURRENT QUEST:</label>
              <button 
                onClick={() => setShowLanguageSelect(true)}
                className="bg-[#0d0d0d] border border-[#333] rounded-lg px-4 py-2 text-white font-pixel text-xs hover:border-[#39ff14] transition-colors flex items-center gap-3"
              >
                <span className="text-[#39ff14] uppercase">{language.replace('-', ' ')}</span>
                <Edit className="w-3 h-3 text-[#888]" />
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
                  className="bg-blue-500 text-white font-pixel text-[8px] px-3 py-2 rounded flex items-center gap-2 hover:bg-blue-600 transition-colors"
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
                  className="bg-[#39ff14] text-black font-pixel text-[8px] px-3 py-2 rounded flex items-center gap-2 hover:bg-[#32e012] transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  ADD SECTION
                </button>
              </div>
            )}
          </div>

          {isLoadingCourse ? (
            <div className="flex justify-center py-12"><LumaSpin /></div>
          ) : (
            <LearningPath 
              courseData={courseData}
              completedLessons={completedLessons}
              role={role}
              onLessonClick={(id, locked) => { if (!locked) router.push(`/lesson/${id}`); }}
              onAddChapter={(sid) => { setEditorType('chapter'); setParentId(sid); setEditingId(null); setEditorData({ ...editorData, title: '' }); setIsEditorOpen(true); }}
              onAddLesson={(cid) => { setEditorType('lesson'); setParentId(cid); setEditingId(null); setEditorData({ title: '', description: '', content: '', challenge: '', hint: '', initialCode: '', expectedOutput: '', type: 'beginner' }); setIsEditorOpen(true); }}
              onEditSection={(s) => { setEditorType('section'); setEditingId(s.id); setEditorData({ ...editorData, title: s.title }); setIsEditorOpen(true); }}
              onEditChapter={(c) => { setEditorType('chapter'); setEditingId(c.id); setEditorData({ ...editorData, title: c.title }); setIsEditorOpen(true); }}
              onEditLesson={(l) => { setEditorType('lesson'); setEditingId(l.id); setEditorData({ title: l.title, description: l.description, content: l.content, challenge: l.challenge, hint: l.hint || '', initialCode: l.initialCode, expectedOutput: l.expectedOutput, type: l.type }); setIsEditorOpen(true); }}
            />
          )}
        </div>

        <aside className="space-y-6 animate-item hidden xl:block">
          <SidebarStats 
            xp={xp}
            streak={streak}
            rank={rank}
            role={role}
            setRole={setRole}
            onAddSection={() => { setEditorType('section'); setParentId(null); setEditingId(null); setEditorData({ title: '', description: '', content: '', challenge: '', hint: '', initialCode: '', expectedOutput: '', type: 'beginner' }); setIsEditorOpen(true); }}
          />
        </aside>
      </main>
    </DashboardLayout>
  );
}
