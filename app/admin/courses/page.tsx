"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { 
  getUserStatsAction, 
  getAllCourseContentAction, 
  updateSectionAction, 
  updateChapterAction, 
  updateLessonAction, 
  deleteSectionAction, 
  deleteChapterAction, 
  deleteLessonAction 
} from "@/app/actions";
import { ArrowLeft, BookOpen, Settings, Save, Edit2, Trash2, ChevronDown, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

export default function AdminCoursesPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [courseData, setCourseData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit States
  const [editingItem, setEditingItem] = useState<{ type: 'section' | 'chapter' | 'lesson', id: string } | null>(null);
  const [formData, setFormData] = useState<any>({});
  
  // UI States
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function checkAdmin() {
      try {
        const stats = await getUserStatsAction();
        if (stats.role === 'admin') {
          setIsAdmin(true);
          fetchCourseData();
        } else {
          setIsAdmin(false);
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Failed to verify admin status:", err);
        router.push("/dashboard");
      }
    }
    
    if (session) {
      checkAdmin();
    }
  }, [session, router]);

  const fetchCourseData = async () => {
    setIsLoading(true);
    try {
      const data = await getAllCourseContentAction();
      setCourseData(data);
    } catch (err) {
      console.error("Failed to fetch course data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleChapter = (id: string) => {
    setExpandedChapters(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAllSections = () => {
    const allExpanded = courseData.length > 0 && courseData.every(section => expandedSections[section.id]);
    const newState: Record<string, boolean> = {};
    courseData.forEach(section => {
      newState[section.id] = !allExpanded;
    });
    setExpandedSections(newState);
  };

  const handleEdit = (type: 'section' | 'chapter' | 'lesson', item: any) => {
    setEditingItem({ type, id: item.id });
    setFormData({ ...item });
  };

  const handleDelete = async (type: 'section' | 'chapter' | 'lesson', id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;
    
    try {
      if (type === 'section') await deleteSectionAction(id);
      else if (type === 'chapter') await deleteChapterAction(id);
      else if (type === 'lesson') await deleteLessonAction(id);
      
      alert(`${type.toUpperCase()} deleted successfully!`);
      fetchCourseData();
    } catch (err) {
      console.error(`Failed to delete ${type}:`, err);
      alert(`Failed to delete ${type}.`);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    setIsSubmitting(true);
    try {
      if (editingItem.type === 'section') {
        await updateSectionAction(editingItem.id, {
          title: formData.title,
          language: formData.language,
        });
      } else if (editingItem.type === 'chapter') {
        await updateChapterAction(editingItem.id, {
          title: formData.title,
        });
      } else if (editingItem.type === 'lesson') {
        await updateLessonAction(editingItem.id, {
          title: formData.title,
          description: formData.description,
          content: formData.content,
          challenge: formData.challenge,
          hint: formData.hint,
          initialCode: formData.initialCode,
          expectedOutput: formData.expectedOutput,
          type: formData.type,
        });
      }
      
      alert(`${editingItem.type.toUpperCase()} updated successfully!`);
      setEditingItem(null);
      fetchCourseData();
    } catch (err) {
      console.error(`Failed to update ${editingItem.type}:`, err);
      alert(`Failed to update ${editingItem.type}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending || isAdmin === null || isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-[#333] border-t-[#39ff14] rounded-full animate-spin" />
        <div className="text-[#39ff14] font-pixel text-xs animate-pulse tracking-widest">LOADING COURSE DATA...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-[#39ff14] selection:text-black">
      {/* Top Bar */}
      <div className="h-14 border-b border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-[#252525] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#888] hover:text-white" />
          </Link>
          <div className="h-6 w-[1px] bg-[#2a2a2a]" />
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#39ff14]" />
            <h1 className="font-pixel text-xs text-[#39ff14] tracking-tighter">
              COURSE MANAGEMENT
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleAllSections}
            className="bg-[#252525] text-white font-pixel text-[10px] px-4 py-2 rounded border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#333] transition-colors"
          >
            {courseData.length > 0 && courseData.every(s => expandedSections[s.id]) ? "COLLAPSE ALL" : "EXPAND ALL"}
          </button>
          <Link href="/admin" className="bg-[#39ff14] text-black font-pixel text-[10px] px-4 py-2 rounded border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#32e012] transition-colors">
            ADD NEW CONTENT
          </Link>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {courseData.map((section) => (
            <div key={section.id} className="bg-[#1e1e1e] border-4 border-[#000] rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <div className="p-4 bg-[#252525] border-b-2 border-black flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleSection(section.id)} className="text-[#39ff14]">
                    {expandedSections[section.id] ? <ChevronDown /> : <ChevronRight />}
                  </button>
                  <div>
                    <h2 className="font-pixel text-xs text-[#39ff14]">{section.title}</h2>
                    <span className="text-[8px] font-pixel text-[#888] uppercase">{section.language}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit('section', section)} className="p-2 hover:bg-[#333] rounded text-blue-400">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete('section', section.id)} className="p-2 hover:bg-[#333] rounded text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {expandedSections[section.id] && (
                <div className="p-4 space-y-4">
                  {section.chapters.map((chapter: any) => (
                    <div key={chapter.id} className="ml-6 border-l-2 border-[#333] pl-4">
                      <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]">
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleChapter(chapter.id)} className="text-[#aaa]">
                            {expandedChapters[chapter.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          <h3 className="font-pixel text-[10px] text-white">{chapter.title}</h3>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit('chapter', chapter)} className="p-1 hover:bg-[#333] rounded text-blue-400">
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDelete('chapter', chapter.id)} className="p-1 hover:bg-[#333] rounded text-red-400">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {expandedChapters[chapter.id] && (
                        <div className="mt-2 space-y-2 ml-6">
                          {chapter.lessons.map((lesson: any) => (
                            <div key={lesson.id} className="flex items-center justify-between p-2 bg-[#151515] rounded border border-[#2a2a2a] hover:border-[#39ff14] transition-colors group">
                              <div className="flex items-center gap-3">
                                <BookOpen className="w-3 h-3 text-[#39ff14]" />
                                <span className="text-[9px] font-pixel text-[#aaa] group-hover:text-white">{lesson.title}</span>
                                <span className="text-[7px] font-pixel px-1 bg-[#333] text-[#888] rounded uppercase">{lesson.type}</span>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => handleEdit('lesson', lesson)} className="p-1 hover:bg-[#333] rounded text-blue-400">
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button onClick={() => handleDelete('lesson', lesson.id)} className="p-1 hover:bg-[#333] rounded text-red-400">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] border-4 border-[#000] p-8 rounded-xl shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-pixel text-[#39ff14]">EDIT {editingItem.type.toUpperCase()}</h2>
              <button onClick={() => setEditingItem(null)} className="text-[#888] hover:text-white font-pixel text-xs">CLOSE</button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-pixel text-[#888]">TITLE</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                  required
                />
              </div>

              {editingItem.type === 'section' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-pixel text-[#888]">LANGUAGE</label>
                  <input 
                    type="text" 
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                    className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                    required
                  />
                </div>
              )}

              {editingItem.type === 'lesson' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-pixel text-[#888]">DIFFICULTY</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-pixel text-[#888]">DESCRIPTION</label>
                    <input 
                      type="text" 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-pixel text-[#888]">CONTENT (MARKDOWN)</label>
                    <textarea 
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      className="w-full h-32 bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14] custom-scrollbar"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-pixel text-[#888]">CHALLENGE</label>
                    <textarea 
                      value={formData.challenge}
                      onChange={(e) => setFormData({...formData, challenge: e.target.value})}
                      className="w-full h-24 bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14] custom-scrollbar"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-pixel text-[#888]">HINT (OPTIONAL)</label>
                    <textarea 
                      value={formData.hint}
                      onChange={(e) => setFormData({...formData, hint: e.target.value})}
                      className="w-full h-20 bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14] custom-scrollbar"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-pixel text-[#888]">INITIAL CODE</label>
                      <textarea 
                        value={formData.initialCode}
                        onChange={(e) => setFormData({...formData, initialCode: e.target.value})}
                        className="w-full h-32 bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-[#39ff14] font-mono text-sm focus:outline-none focus:border-[#39ff14] custom-scrollbar"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-pixel text-[#888]">EXPECTED OUTPUT</label>
                      <textarea 
                        value={formData.expectedOutput}
                        onChange={(e) => setFormData({...formData, expectedOutput: e.target.value})}
                        className="w-full h-32 bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-[#39ff14] font-mono text-sm focus:outline-none focus:border-[#39ff14] custom-scrollbar"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-[#333] flex justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="bg-[#252525] text-white font-pixel text-[10px] px-6 py-3 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#333]"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#39ff14] text-black font-pixel text-[10px] px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#32e012] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'SAVING...' : 'UPDATE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}</style>
    </div>
  );
}
