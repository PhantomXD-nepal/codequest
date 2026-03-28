"use client";

import React, { useEffect, useState, useRef,useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Section, Lesson } from "@/lib/lessons";
import { motion } from "motion/react";
import { Hexagon, Check, Lock, Play, Trophy, Star, Zap, User, Settings, Plus, X, Save } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { Component as LumaSpin } from "@/components/ui/luma-spin";
import Image from "next/image";
import { getUserStatsAction, makeMeAdminAction, getCourseContentAction, createChapterAction, createLessonAction, createSectionAction } from "@/app/actions";
import { Editor } from "@monaco-editor/react";

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [role, setRole] = useState('user');
  const [courseData, setCourseData] = useState<any[]>([]);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [language, setLanguage] = useState('python');
  const mainRef = useRef<HTMLDivElement>(null);

  // Admin Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorType, setEditorType] = useState<'section' | 'chapter' | 'lesson'>('lesson');
  const [parentId, setParentId] = useState<string | null>(null);
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

  const fetchCourse = useCallback(async () => {
    setIsLoadingCourse(true);
    try {
      const data = await getCourseContentAction(language);
      setCourseData(data);
    } catch (err) {
      console.error("Failed to fetch course data:", err);
    } finally {
      setIsLoadingCourse(false);
    }
  }, [language]);

  useEffect(() => {
    // Fetch stats from DB
    async function fetchStats() {
      try {
        const stats = await getUserStatsAction();
        setXp(stats.xp);
        setStreak(stats.streak);
        setRole(stats.role);
        setCompletedLessons(stats.completedLessons);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    }

    if (session) {
      fetchStats();
      fetchCourse();
    }
  }, [session, fetchCourse]);

  const handleMakeAdmin = async () => {
    try {
      await makeMeAdminAction();
      setRole('admin');
      alert("You are now an admin!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveContent = async () => {
    setIsSaving(true);
    try {
      if (editorType === 'section') {
        await createSectionAction({
          title: editorData.title,
          language: language
        });
      } else if (editorType === 'chapter' && parentId) {
        await createChapterAction({
          title: editorData.title,
          sectionId: parentId
        });
      } else if (editorType === 'lesson' && parentId) {
        await createLessonAction({
          title: editorData.title,
          description: editorData.description,
          content: editorData.content,
          challenge: editorData.challenge,
          hint: editorData.hint,
          initialCode: editorData.initialCode,
          expectedOutput: editorData.expectedOutput,
          type: editorData.type,
          chapterId: parentId
        });
      }
      setIsEditorOpen(false);
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
      alert("Failed to save content. Check console.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (mainRef.current && !isPending && session) {
      gsap.fromTo(
        mainRef.current.querySelectorAll(".animate-item"),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
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

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-[#39ff14] selection:text-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(57,255,20,0.03)_0%,transparent_50%)] pointer-events-none" />
      
      {/* Admin Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] border-2 border-[#39ff14]/30 rounded-xl w-full max-w-4xl h-[90vh] flex flex-col shadow-[0_0_50px_rgba(57,255,20,0.1)] overflow-hidden"
          >
            <div className="p-4 border-b border-[#333] flex items-center justify-between bg-[#222]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#39ff14] rounded flex items-center justify-center">
                  <Plus className="text-black w-5 h-5" />
                </div>
                <h2 className="font-pixel text-sm text-[#39ff14]">ADD NEW {editorType.toUpperCase()}</h2>
              </div>
              <button 
                onClick={() => setIsEditorOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-pixel text-[#888]">TITLE</label>
                    <input 
                      type="text"
                      value={editorData.title}
                      onChange={(e) => setEditorData({...editorData, title: e.target.value})}
                      className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-pixel text-xs focus:outline-none focus:border-[#39ff14]"
                      placeholder="Enter title..."
                    />
                  </div>
                  {editorType === 'lesson' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-pixel text-[#888]">DESCRIPTION</label>
                      <textarea 
                        value={editorData.description}
                        onChange={(e) => setEditorData({...editorData, description: e.target.value})}
                        className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-pixel text-xs focus:outline-none focus:border-[#39ff14] h-24 resize-none"
                        placeholder="Enter description..."
                      />
                    </div>
                  )}
                  {editorType === 'lesson' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-pixel text-[#888]">LESSON TYPE</label>
                      <select 
                        value={editorData.type}
                        onChange={(e) => setEditorData({...editorData, type: e.target.value})}
                        className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-pixel text-xs focus:outline-none focus:border-[#39ff14]"
                      >
                        <option value="beginner">BEGINNER</option>
                        <option value="intermediate">INTERMEDIATE</option>
                        <option value="advanced">ADVANCED</option>
                        <option value="challenge">CHALLENGE</option>
                      </select>
                    </div>
                  )}
                </div>

                {editorType === 'lesson' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-pixel text-[#888]">CHALLENGE INSTRUCTIONS (MARKDOWN)</label>
                      <textarea 
                        value={editorData.challenge}
                        onChange={(e) => setEditorData({...editorData, challenge: e.target.value})}
                        className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-pixel text-xs focus:outline-none focus:border-[#39ff14] h-32 resize-none"
                        placeholder="What should the user do?"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-pixel text-[#888]">HINT (OPTIONAL)</label>
                      <input 
                        type="text"
                        value={editorData.hint}
                        onChange={(e) => setEditorData({...editorData, hint: e.target.value})}
                        className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-pixel text-xs focus:outline-none focus:border-[#39ff14]"
                        placeholder="Need a hint?"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-pixel text-[#888]">EXPECTED OUTPUT</label>
                      <input 
                        type="text"
                        value={editorData.expectedOutput}
                        onChange={(e) => setEditorData({...editorData, expectedOutput: e.target.value})}
                        className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-pixel text-xs focus:outline-none focus:border-[#39ff14]"
                        placeholder="What should the code print?"
                      />
                    </div>
                  </div>
                )}
              </div>

              {editorType === 'lesson' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 flex flex-col h-[300px]">
                    <label className="text-[10px] font-pixel text-[#888]">LESSON CONTENT (MARKDOWN)</label>
                    <div className="flex-1 border border-[#333] rounded-lg overflow-hidden">
                      <Editor
                        height="100%"
                        defaultLanguage="markdown"
                        theme="vs-dark"
                        value={editorData.content}
                        onChange={(val) => setEditorData({...editorData, content: val || ''})}
                        options={{ minimap: { enabled: false }, fontSize: 12, padding: { top: 10 } }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 flex flex-col h-[300px]">
                    <label className="text-[10px] font-pixel text-[#888]">INITIAL CODE</label>
                    <div className="flex-1 border border-[#333] rounded-lg overflow-hidden">
                      <Editor
                        height="100%"
                        defaultLanguage={language}
                        theme="vs-dark"
                        value={editorData.initialCode}
                        onChange={(val) => setEditorData({...editorData, initialCode: val || ''})}
                        options={{ minimap: { enabled: false }, fontSize: 12, padding: { top: 10 } }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#333] bg-[#222] flex justify-end gap-3">
              <button 
                onClick={() => setIsEditorOpen(false)}
                className="px-6 py-2 rounded-lg font-pixel text-[10px] text-[#888] hover:text-white transition-colors"
              >
                CANCEL
              </button>
              <button 
                onClick={handleSaveContent}
                disabled={isSaving}
                className="px-8 py-2 bg-[#39ff14] text-black rounded-lg font-pixel text-[10px] flex items-center gap-2 hover:bg-[#32e012] transition-colors disabled:opacity-50"
              >
                {isSaving ? <LumaSpin /> : <Save className="w-3 h-3" />}
                SAVE {editorType.toUpperCase()}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <main ref={mainRef} className="max-w-6xl mx-auto px-4 pt-12 pb-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 relative z-10">
        {/* Learning Path */}
        <div className="space-y-12">
          {/* Language Selector & Add Section */}
          <div className="flex items-center justify-between gap-4 bg-[#1e1e1e] p-4 rounded-xl border-2 border-[#333] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-item">
            <div className="flex items-center gap-4">
              <label className="font-pixel text-[10px] text-[#888]">SELECT LANGUAGE:</label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#0d0d0d] border border-[#333] rounded-lg p-2 text-white font-pixel text-xs focus:outline-none focus:border-[#39ff14]"
              >
                <option value="python">PYTHON</option>
                <option value="javascript">JAVASCRIPT</option>
                <option value="typescript">TYPESCRIPT</option>
                <option value="html">HTML/CSS</option>
                <option value="sql">SQL</option>
              </select>
            </div>
            {role === 'admin' && (
              <button 
                onClick={() => {
                  setEditorType('section');
                  setParentId(null);
                  setIsEditorOpen(true);
                }}
                className="bg-[#39ff14] text-black font-pixel text-[8px] px-3 py-2 rounded flex items-center gap-2 hover:bg-[#32e012] transition-colors"
              >
                <Plus className="w-3 h-3" />
                ADD SECTION
              </button>
            )}
          </div>

          {isLoadingCourse ? (
            <div className="flex justify-center py-12">
              <LumaSpin />
            </div>
          ) : courseData.length === 0 ? (
            <div className="text-center py-12 text-[#888] font-pixel text-xs">NO COURSE DATA FOUND</div>
          ) : courseData.map((section, sIdx) => (
            <div key={section.id} className="space-y-8 animate-item">
              <div className="bg-[#1e1e1e] border-b-4 border-[#000000] p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center">
                <div>
                  <h2 className="text-[10px] font-pixel text-[#888] uppercase tracking-widest mb-2">
                    {section.id.replace('-', ' ')}
                  </h2>
                  <h1 className="text-2xl font-pixel text-[#39ff14] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    {section.title}
                  </h1>
                </div>
                {role === 'admin' && (
                  <button 
                    onClick={() => {
                      setEditorType('chapter');
                      setParentId(section.id);
                      setIsEditorOpen(true);
                    }}
                    className="p-2 bg-[#333] rounded-lg border border-[#444] hover:border-[#39ff14]/50 transition-colors"
                    title="Add Chapter"
                  >
                    <Plus className="w-5 h-5 text-[#39ff14]" />
                  </button>
                )}
              </div>

              <div className="relative flex flex-col items-center space-y-16 py-8">
                {/* Path Line */}
                <div className="absolute top-0 bottom-0 w-1 bg-[#2a2a2a] left-1/2 -translate-x-1/2 z-0" />

                {section.chapters.map((chapter: any, cIdx: number) => (
                  <div key={chapter.id} className="w-full flex flex-col items-center space-y-12 relative z-10 animate-item">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#252525] px-4 py-1 rounded-full border border-[#333] text-[10px] font-pixel text-[#aaa] uppercase">
                        {chapter.title}
                      </div>
                      {role === 'admin' && (
                        <button 
                          onClick={() => {
                            setEditorType('lesson');
                            setParentId(chapter.id);
                            setIsEditorOpen(true);
                          }}
                          className="w-6 h-6 bg-[#333] rounded flex items-center justify-center border border-[#444] hover:border-[#39ff14]/50 transition-colors"
                          title="Add Lesson"
                        >
                          <Plus className="w-3 h-3 text-[#39ff14]" />
                        </button>
                      )}
                    </div>

                    {chapter.lessons.map((lesson: any, lIdx: number) => {
                      const isCompleted = completedLessons.includes(lesson.id);
                      
                      // Find this lesson's index in the global list to determine if it's locked
                      let allLessons: any[] = [];
                      for (const s of courseData) {
                        for (const c of s.chapters) {
                          allLessons = [...allLessons, ...c.lessons];
                        }
                      }
                      const globalIndex = allLessons.findIndex(l => l.id === lesson.id);
                      const isLocked = globalIndex > 0 && !completedLessons.includes(allLessons[globalIndex - 1].id);
                      const isCurrent = !isCompleted && !isLocked;
                      
                      return (
                        <div key={lesson.id} className="relative group flex flex-col items-center">
                          {isCurrent && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute -top-8 bg-[#39ff14] text-black font-pixel text-[8px] px-2 py-1 rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] border border-black z-20 whitespace-nowrap"
                            >
                              CURRENT LESSON
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#39ff14] border-b border-r border-black rotate-45" />
                            </motion.div>
                          )}
                          <Link href={isLocked ? "#" : `/lesson/${lesson.id}`} className={isLocked ? "cursor-not-allowed" : ""}>
                            <motion.div
                              whileHover={!isLocked ? { scale: 1.1 } : {}}
                              whileTap={!isLocked ? { scale: 0.95 } : {}}
                              className={`relative w-24 h-24 flex items-center justify-center transition-all duration-300 ${isLocked ? 'opacity-50' : ''}`}
                            >
                              {isCurrent && (
                                <motion.div 
                                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                  className="absolute inset-0 bg-[#39ff14]/20 rounded-full blur-xl"
                                />
                              )}
                              <Hexagon 
                                className={`w-full h-full fill-current ${
                                  isCompleted ? 'text-[#39ff14]' : isCurrent ? 'text-white' : 'text-[#2a2a2a]'
                                } stroke-[#000] stroke-[2px] relative z-10`}
                              />
                              <div className="absolute inset-0 flex items-center justify-center z-20">
                                {isCompleted ? (
                                  <Check className="w-10 h-10 text-black" />
                                ) : isLocked ? (
                                  <Lock className="w-8 h-8 text-[#555]" />
                                ) : (
                                  <Play className={`w-10 h-10 ml-1 ${isCurrent ? 'text-black fill-black' : 'text-white fill-white'}`} />
                                )}
                              </div>
                              
                              {/* Tooltip-like label */}
                              <div className="absolute left-full ml-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-[#333] p-3 rounded-lg w-48 pointer-events-none shadow-xl z-50">
                                <div className="text-[8px] font-pixel text-[#39ff14] mb-1 uppercase">
                                  {isCompleted ? 'COMPLETED' : isCurrent ? 'CURRENT' : 'UPCOMING'} • {lesson.type}
                                </div>
                                <div className="text-xs font-pixel">{lesson.title}</div>
                                <div className="text-[8px] font-pixel text-[#888] mt-1 leading-tight">{lesson.description}</div>
                              </div>
                            </motion.div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 animate-item">
          {/* User Stats */}
          <div className="bg-[#1e1e1e] border-4 border-[#000] p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#333] border-2 border-[#000] rounded-lg flex items-center justify-center overflow-hidden relative">
                {session.user.image ? (
                  <Image 
                    src={session.user.image} 
                    alt="Avatar" 
                    fill 
                    className="object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="text-[#555]" />
                )}
              </div>
              <div>
                <div className="text-xs font-pixel text-[#39ff14]">{session.user.name}</div>
                <div className="text-[8px] font-pixel text-[#888] mt-1">LVL 1 NOVICE</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#252525] p-2 rounded border border-[#333] text-center">
                <Zap className="w-4 h-4 text-[#39ff14] mx-auto mb-1" />
                <div className="text-[8px] font-pixel text-[#aaa]">STREAK</div>
                <div className="text-[10px] font-pixel">{streak}</div>
              </div>
              <div className="bg-[#252525] p-2 rounded border border-[#333] text-center">
                <Star className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                <div className="text-[8px] font-pixel text-[#aaa]">XP</div>
                <div className="text-[10px] font-pixel">{xp}</div>
              </div>
              <div className="bg-[#252525] p-2 rounded border border-[#333] text-center">
                <Trophy className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                <div className="text-[8px] font-pixel text-[#aaa]">RANK</div>
                <div className="text-[10px] font-pixel">#--</div>
              </div>
            </div>

            {role === 'admin' && (
              <Link href="/admin" className="mt-4 block w-full">
                <button className="w-full bg-[#333] text-[#39ff14] font-pixel text-[10px] py-2 rounded border border-[#39ff14]/30 hover:bg-[#39ff14]/10 transition-colors flex items-center justify-center gap-2">
                  <Settings className="w-3 h-3" />
                  ADMIN DASHBOARD
                </button>
              </Link>
            )}

            {role !== 'admin' && (
              <button 
                onClick={handleMakeAdmin}
                className="mt-4 w-full bg-[#252525] text-[#888] font-pixel text-[8px] py-1 rounded border border-[#333] hover:text-white transition-colors"
              >
                [DEV] MAKE ME ADMIN
              </button>
            )}
          </div>

          {/* Daily Goals */}
          <div className="bg-[#1e1e1e] border-4 border-[#000] p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xs font-pixel mb-4 flex items-center justify-between">
              DAILY GOALS
              <span className="text-[8px] font-pixel text-[#39ff14] cursor-pointer hover:underline">VIEW ALL</span>
            </h3>
            <div className="space-y-4">
              {[
                { label: "Earn 50 XP", current: xp, target: 50 },
                { label: "Complete 2 Lessons", current: completedLessons.length, target: 2 },
              ].map((goal, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[8px] font-pixel">
                    <span>{goal.label}</span>
                    <span>{Math.min(goal.current, goal.target)}/{goal.target}</span>
                  </div>
                  <div className="h-2 bg-[#252525] border border-[#000] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#39ff14] transition-all duration-500" 
                      style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Preview */}
          <div className="bg-[#1e1e1e] border-4 border-[#000] p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xs font-pixel mb-4 flex items-center justify-between">
              LEADERBOARD
              <span className="text-[8px] font-pixel text-[#39ff14] cursor-pointer hover:underline">VIEW</span>
            </h3>
            <div className="flex flex-col items-center justify-center py-4 space-y-4 opacity-50">
              <Lock className="w-8 h-8 text-[#555]" />
              <p className="text-[8px] font-pixel text-center leading-relaxed">REACH 100 XP TO UNLOCK LEADERBOARDS!</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
