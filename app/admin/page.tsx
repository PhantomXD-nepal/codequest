"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { getUserStatsAction, getUsersAction, createSectionAction, createChapterAction, createLessonAction, createCourseAction, createLanguageAction, getLanguagesAction, importNestedCourseAction, getAchievementsAction, createAchievementAction, deleteAchievementAction, deleteAllCoursesAction, getLlmsTxtAction, updateLlmsTxtAction, getAllCoursesAction, deleteCourseAction, deleteSectionAction, deleteChapterAction, deleteLessonAction, updateCourseAction, updateSectionAction, updateChapterAction, updateLessonAction } from "@/app/actions";
import { ArrowLeft, Users, BookOpen, Plus, Settings, Save, Trash2, FileText, Edit, Search, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { LessonEditorTab } from "@/components/admin/lesson-editor-tab";

export default function AdminPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'content' | 'achievements' | 'llms' | 'courses'>('users');
  const [contentSubTab, setContentSubTab] = useState<'courses' | 'sections' | 'chapters' | 'lessons'>('courses');
  const [languages, setLanguages] = useState<any[]>([]);
  const [allSections, setAllSections] = useState<any[]>([]);
  const [allChapters, setAllChapters] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'title', direction: 'asc' });
  const [editingItem, setEditingItem] = useState<{ type: 'course' | 'section' | 'chapter' | 'lesson'; id: string; data: any } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // LLMS.txt State
  const [llmsContent, setLlmsContent] = useState("");
  
  // Achievements State
  const [achievements, setAchievements] = useState<any[]>([]);
  const [achievementForm, setAchievementForm] = useState({
    title: '',
    description: '',
    icon: '🏆',
    conditionType: 'xp',
    conditionValue: 100
  });
  
  // Content Form States
  const [contentType, setContentType] = useState<'section' | 'chapter' | 'lesson' | 'course' | 'language'>('section');
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    description: '',
    content: '',
    challenge: '',
    hint: '',
    initialCode: '',
    expectedOutput: '',
    type: 'beginner',
    sectionId: '',
    chapterId: '',
    courseId: '',
    language: 'python',
    languageId: '',
    videoUrl: ''
  });

  useEffect(() => {
    async function checkAdmin() {
      try {
        const stats = await getUserStatsAction();
        if (stats.role === 'admin') {
          setIsAdmin(true);
          const usersList = await getUsersAction();
          setUsers(usersList);
          const achievementsList = await getAchievementsAction();
          setAchievements(achievementsList);
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

  useEffect(() => {
    if (activeTab === 'llms') {
      const fetchLlms = async () => {
        const content = await getLlmsTxtAction();
        setLlmsContent(content);
      };
      fetchLlms();
    } else if (activeTab === 'courses') {
      const fetchCourses = async () => {
        const coursesList = await getAllCoursesAction();
        setCourses(coursesList);
      };
      fetchCourses();
    } else if (activeTab === 'content') {
      const fetchData = async () => {
        const langs = await getLanguagesAction();
        setLanguages(langs);
        const allData = await getAllCoursesAction();
        setCourses(allData);
        
        const sections: any[] = [];
        const chapters: any[] = [];
        allData.forEach((c: any) => {
          c.sections?.forEach((s: any) => {
            sections.push({ ...s, courseTitle: c.title });
            s.chapters?.forEach((ch: any) => {
              chapters.push({ ...ch, sectionTitle: s.title });
            });
          });
        });
        setAllSections(sections);
        setAllChapters(chapters);
      };
      fetchData();
    }
  }, [activeTab]);

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (contentType === 'section') {
        await createSectionAction({
          title: formData.title,
          language: formData.language,
          courseId: formData.courseId,
          languageId: formData.languageId,
        });
      } else if (contentType === 'chapter') {
        await createChapterAction({
          title: formData.title,
          sectionId: formData.sectionId,
        });
      } else if (contentType === 'lesson') {
        await createLessonAction({
          title: formData.title,
          description: formData.description,
          content: formData.content,
          challenge: formData.challenge,
          hint: formData.hint,
          initialCode: formData.initialCode,
          expectedOutput: formData.expectedOutput,
          type: formData.type,
          chapterId: formData.chapterId,
        });
      } else if (contentType === 'course') {
        await createCourseAction({
          title: formData.title,
          description: formData.description,
          languageId: formData.languageId,
          videoUrl: formData.videoUrl,
          language: formData.language,
        });
      } else if (contentType === 'language') {
        await createLanguageAction({
          name: formData.name,
          title: formData.title,
          description: formData.description,
        });
      }
      alert(`${contentType.toUpperCase()} created successfully!`);
      setFormData({
        title: '',
        name: '',
        description: '',
        content: '',
        challenge: '',
        hint: '',
        initialCode: '',
        expectedOutput: '',
        type: 'beginner',
        sectionId: '',
        chapterId: '',
        courseId: '',
        language: 'python',
        languageId: '',
        videoUrl: ''
      });
    } catch (err) {
      console.error("Failed to create content:", err);
      alert("Failed to create content. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const processJsonImport = async (json: any) => {
    try {
      if (json.sections && Array.isArray(json.sections)) {
        setIsSubmitting(true);
        await importNestedCourseAction(json);
        alert("Nested course JSON imported successfully!");
      } else if (json.title && json.content) {
        setContentType('lesson');
        setFormData({
            ...formData,
            title: json.title || '',
            description: json.description || '',
            content: json.content || '',
            challenge: json.challenge || '',
            hint: json.hint || '',
            initialCode: json.initialCode || '',
            expectedOutput: json.expectedOutput || '',
            type: json.type || 'beginner',
            chapterId: json.chapterId || formData.chapterId
        });
        alert("Lesson JSON loaded into form. Please review and save.");
      } else {
        alert("Invalid JSON format. Expected a nested course structure or single lesson fields.");
      }
    } catch (err) {
      console.error("Failed to process JSON:", err);
      alert("Failed to process JSON. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJsonImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await processJsonImport(json);
      } catch (err) {
        console.error("Failed to parse JSON:", err);
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
  };

  const handleJsonPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    try {
      const json = JSON.parse(pastedText);
      processJsonImport(json);
      // Clear the textarea after successful parse
      setTimeout(() => {
        if (e.target instanceof HTMLTextAreaElement) {
          e.target.value = '';
        }
      }, 10);
    } catch (err) {
      // Not valid JSON, ignore or show error
      console.log("Pasted text is not valid JSON.");
    }
  };

  const handleAchievementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createAchievementAction({
        title: achievementForm.title,
        description: achievementForm.description,
        icon: achievementForm.icon,
        conditionType: achievementForm.conditionType,
        conditionValue: achievementForm.conditionValue
      });
      alert('Achievement created successfully!');
      setAchievementForm({
        title: '',
        description: '',
        icon: '🏆',
        conditionType: 'xp',
        conditionValue: 100
      });
      const achievementsList = await getAchievementsAction();
      setAchievements(achievementsList);
    } catch (err) {
      console.error("Failed to create achievement:", err);
      alert("Failed to create achievement. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;
    try {
      await deleteAchievementAction(id);
      const achievementsList = await getAchievementsAction();
      setAchievements(achievementsList);
    } catch (err) {
      console.error("Failed to delete achievement:", err);
      alert("Failed to delete achievement.");
    }
  };

  const handleDeleteAllCourses = async () => {
    if (!confirm('⚠️ WARNING: This will delete ALL languages, sections, chapters, lessons, and user progress. This action is IRREVERSIBLE. Are you sure?')) return;
    setIsSubmitting(true);
    try {
      await deleteAllCoursesAction();
      alert("All course data has been deleted.");
    } catch (err) {
      console.error("Failed to delete all courses:", err);
      alert("Failed to delete all courses.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    setIsSubmitting(true);
    try {
      await deleteCourseAction(id);
      const coursesList = await getAllCoursesAction();
      setCourses(coursesList);
      alert('Course deleted successfully!');
    } catch (err) {
      console.error("Failed to delete course:", err);
      alert("Failed to delete course. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    setIsSubmitting(true);
    try {
      await deleteSectionAction(id);
      const coursesList = await getAllCoursesAction();
      setCourses(coursesList);
      alert('Section deleted successfully!');
    } catch (err) {
      console.error("Failed to delete section:", err);
      alert("Failed to delete section.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChapter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;
    setIsSubmitting(true);
    try {
      await deleteChapterAction(id);
      const coursesList = await getAllCoursesAction();
      setCourses(coursesList);
      alert('Chapter deleted successfully!');
    } catch (err) {
      console.error("Failed to delete chapter:", err);
      alert("Failed to delete chapter.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    setIsSubmitting(true);
    try {
      await deleteLessonAction(id);
      const coursesList = await getAllCoursesAction();
      setCourses(coursesList);
      alert('Lesson deleted successfully!');
    } catch (err) {
      console.error("Failed to delete lesson:", err);
      alert("Failed to delete lesson.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSubmitting(true);
    try {
      if (editingItem.type === 'course') {
        await updateCourseAction(editingItem.id, editingItem.data);
      } else if (editingItem.type === 'section') {
        await updateSectionAction(editingItem.id, editingItem.data);
      } else if (editingItem.type === 'chapter') {
        await updateChapterAction(editingItem.id, { title: editingItem.data.title });
      } else if (editingItem.type === 'lesson') {
        await updateLessonAction(editingItem.id, editingItem.data);
      }
      alert(`${editingItem.type.toUpperCase()} updated successfully!`);
      setEditingItem(null);
      const coursesList = await getAllCoursesAction();
      setCourses(coursesList);
    } catch (err) {
      console.error("Failed to update item:", err);
      alert("Failed to update item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLlms = async () => {
    setIsSubmitting(true);
    try {
      await updateLlmsTxtAction(llmsContent);
      alert("llms.txt updated successfully!");
    } catch (err) {
      console.error("Failed to update llms.txt:", err);
      alert("Failed to update llms.txt.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSections = () => {
    return courses.flatMap(c => c.sections.map((s: any) => ({ ...s, courseTitle: c.title })));
  };

  const getChapters = () => {
    return courses.flatMap(c => 
      c.sections.flatMap((s: any) => 
        s.chapters.map((ch: any) => ({ ...ch, sectionTitle: s.title, courseTitle: c.title }))
      )
    );
  };

  const getLessons = () => {
    return courses.flatMap(c => 
      c.sections.flatMap((s: any) => 
        s.chapters.flatMap((ch: any) => 
          ch.lessons.map((l: any) => ({ ...l, chapterTitle: ch.title, sectionTitle: s.title, courseTitle: c.title }))
        )
      )
    );
  };

  const getFilteredAndSortedData = () => {
    let data: any[] = [];
    if (contentSubTab === 'courses') data = courses;
    else if (contentSubTab === 'sections') data = getSections();
    else if (contentSubTab === 'chapters') data = getChapters();
    else if (contentSubTab === 'lessons') data = getLessons();

    // Filter
    if (searchQuery) {
      data = data.filter(item => 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    data.sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (isPending || isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-[#333] border-t-[#39ff14] rounded-full animate-spin" />
        <div className="text-[#39ff14] font-pixel text-xs animate-pulse tracking-widest">VERIFYING CLEARANCE...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-[#39ff14] selection:text-black">
      {/* Top Bar */}
      <div className="h-14 border-b border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-[#252525] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#888] hover:text-white" />
          </Link>
          <div className="h-6 w-[1px] bg-[#2a2a2a]" />
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#39ff14]" />
            <h1 className="font-pixel text-xs text-[#39ff14] tracking-tighter">
              ADMIN DASHBOARD
            </h1>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-[#2a2a2a] pb-4">
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 font-pixel text-xs px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'users' ? 'bg-[#39ff14] text-black' : 'text-[#888] hover:bg-[#252525] hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            USERS
          </button>
          <button 
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 font-pixel text-xs px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'content' ? 'bg-[#39ff14] text-black' : 'text-[#888] hover:bg-[#252525] hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            CONTENT
          </button>
          <button 
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center gap-2 font-pixel text-xs px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'achievements' ? 'bg-[#39ff14] text-black' : 'text-[#888] hover:bg-[#252525] hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            ACHIEVEMENTS
          </button>
          <button 
            onClick={() => setActiveTab('llms')}
            className={`flex items-center gap-2 font-pixel text-xs px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'llms' ? 'bg-[#39ff14] text-black' : 'text-[#888] hover:bg-[#252525] hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            LLMS.TXT
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 font-pixel text-xs px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'courses' ? 'bg-[#39ff14] text-black' : 'text-[#888] hover:bg-[#252525] hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            COURSES
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-[#1e1e1e] border-4 border-[#000] p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-sm font-pixel mb-6 text-[#39ff14]">USER DIRECTORY</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#333]">
                    <th className="p-4 font-pixel text-[10px] text-[#888]">USER</th>
                    <th className="p-4 font-pixel text-[10px] text-[#888]">ROLE</th>
                    <th className="p-4 font-pixel text-[10px] text-[#888]">XP</th>
                    <th className="p-4 font-pixel text-[10px] text-[#888]">STREAK</th>
                    <th className="p-4 font-pixel text-[10px] text-[#888]">JOINED</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-[#2a2a2a] hover:bg-[#252525] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#333] overflow-hidden relative">
                            {user.image ? (
                              <Image src={user.image} alt={user.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#888] text-xs">
                                {user.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-pixel text-[10px]">{user.name}</div>
                            <div className="text-[8px] text-[#888]">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[8px] font-pixel ${
                          user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-[#333] text-[#aaa]'
                        }`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 font-pixel text-[10px] text-yellow-400">{user.xp}</td>
                      <td className="p-4 font-pixel text-[10px] text-[#39ff14]">{user.streak}</td>
                      <td className="p-4 font-pixel text-[8px] text-[#888]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="bg-[#1e1e1e] border-4 border-[#000] p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-pixel text-[#39ff14]">COURSE CONTENT MANAGER</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.open('/llms.txt', '_blank')}
                    className="font-pixel text-[10px] px-4 py-2 rounded border border-[#333] transition-colors bg-[#252525] text-white hover:bg-[#333]"
                  >
                    LLMS.TXT
                  </button>
                  <button 
                    onClick={() => document.getElementById('json-upload')?.click()}
                    className="font-pixel text-[10px] px-4 py-2 rounded border border-[#333] transition-colors bg-[#252525] text-white hover:bg-[#333]"
                  >
                    IMPORT JSON
                  </button>
                  <a 
                    href="/llms.txt"
                    target="_blank"
                    className="font-pixel text-[10px] px-4 py-2 rounded border border-[#333] transition-colors bg-[#252525] text-[#39ff14] hover:bg-[#333] flex items-center"
                  >
                    LLMS.TXT
                  </a>
                  <input 
                    type="file" 
                    id="json-upload" 
                    accept=".json" 
                    className="hidden" 
                    onChange={handleJsonImport} 
                  />
                  <div className="w-[1px] h-8 bg-[#333] mx-2" />
                  <button 
                    onClick={() => setContentType('section')}
                    className={`font-pixel text-[10px] px-4 py-2 rounded border border-[#333] transition-colors ${contentType === 'section' ? 'bg-[#39ff14] text-black' : 'bg-[#252525] text-white hover:bg-[#333]'}`}
                  >
                    ADD SECTION
                  </button>
                  <button 
                    onClick={() => setContentType('chapter')}
                    className={`font-pixel text-[10px] px-4 py-2 rounded border border-[#333] transition-colors ${contentType === 'chapter' ? 'bg-[#39ff14] text-black' : 'bg-[#252525] text-white hover:bg-[#333]'}`}
                  >
                    ADD CHAPTER
                  </button>
                  <button 
                    onClick={() => setContentType('lesson')}
                    className={`font-pixel text-[10px] px-4 py-2 rounded border border-[#333] transition-colors ${contentType === 'lesson' ? 'bg-[#39ff14] text-black' : 'bg-[#252525] text-white hover:bg-[#333]'}`}
                  >
                    ADD LESSON
                  </button>
                  <button 
                    onClick={() => setContentType('course')}
                    className={`font-pixel text-[10px] px-4 py-2 rounded border border-[#333] transition-colors ${contentType === 'course' ? 'bg-[#39ff14] text-black' : 'bg-[#252525] text-white hover:bg-[#333]'}`}
                  >
                    ADD COURSE
                  </button>
                  <button 
                    onClick={() => setContentType('language')}
                    className={`font-pixel text-[10px] px-4 py-2 rounded border border-[#333] transition-colors ${contentType === 'language' ? 'bg-[#39ff14] text-black' : 'bg-[#252525] text-white hover:bg-[#333]'}`}
                  >
                    ADD LANGUAGE
                  </button>
                  <div className="w-[1px] h-8 bg-[#333] mx-2" />
                  <Link 
                    href="/admin/courses"
                    className="font-pixel text-[10px] px-4 py-2 rounded border border-[#39ff14] transition-colors bg-[#1a1a1a] text-[#39ff14] hover:bg-[#39ff14] hover:text-black"
                  >
                    MANAGE COURSES
                  </Link>
                  <button 
                    onClick={handleDeleteAllCourses}
                    disabled={isSubmitting}
                    className="font-pixel text-[10px] px-4 py-2 rounded border border-red-500 transition-colors bg-[#1a1a1a] text-red-500 hover:bg-red-500 hover:text-white disabled:opacity-50"
                  >
                    DELETE ALL DATA
                  </button>
                </div>
              </div>
              
              <div className="mb-6 p-4 border border-dashed border-[#333] rounded-lg bg-[#151515]">
                <label className="text-[10px] font-pixel text-[#888] mb-2 block">QUICK IMPORT (PASTE JSON HERE)</label>
                <textarea 
                  onPaste={handleJsonPaste}
                  className="w-full h-20 bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-mono text-xs focus:outline-none focus:border-[#39ff14] custom-scrollbar"
                  placeholder='Paste nested course JSON or lesson JSON here to auto-import...'
                />
              </div>

              <form onSubmit={handleContentSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-pixel text-[#888]">TITLE</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                    placeholder={`Enter ${contentType} title...`}
                    required
                  />
                </div>

                {contentType === 'language' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-pixel text-[#888]">NAME (ID)</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                        placeholder="e.g., python, javascript"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-pixel text-[#888]">DESCRIPTION</label>
                      <input 
                        type="text" 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                        placeholder="Language description..."
                        required
                      />
                    </div>
                  </>
                )}

                {contentType === 'section' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-pixel text-[#888]">COURSE</label>
                      <select 
                        value={formData.courseId}
                        onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                        className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                        required
                      >
                        <option value="">Select Course...</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-pixel text-[#888]">LANGUAGE (LEGACY)</label>
                      <input 
                        type="text" 
                        value={formData.language}
                        onChange={(e) => setFormData({...formData, language: e.target.value})}
                        className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                        placeholder="e.g., python, javascript"
                      />
                    </div>
                  </div>
                )}

                {contentType === 'course' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-pixel text-[#888]">DESCRIPTION</label>
                      <input 
                        type="text" 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                        placeholder="Course description..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-pixel text-[#888]">LANGUAGE</label>
                      <select 
                        value={formData.languageId}
                        onChange={(e) => setFormData({...formData, languageId: e.target.value})}
                        className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                        required
                      >
                        <option value="">Select Language...</option>
                        {languages.map(l => (
                          <option key={l.id} value={l.id}>{l.title} ({l.name})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-pixel text-[#888]">VIDEO URL</label>
                      <input 
                        type="text" 
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                        className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                        placeholder="Video URL..."
                      />
                    </div>
                  </>
                )}

                {contentType === 'chapter' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-pixel text-[#888]">SECTION</label>
                    <select 
                      value={formData.sectionId}
                      onChange={(e) => setFormData({...formData, sectionId: e.target.value})}
                      className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                      required
                    >
                      <option value="">Select Section...</option>
                      {allSections.map(s => (
                        <option key={s.id} value={s.id}>{s.courseTitle} - {s.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                {contentType === 'lesson' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-pixel text-[#888]">CHAPTER</label>
                        <select 
                          value={formData.chapterId}
                          onChange={(e) => setFormData({...formData, chapterId: e.target.value})}
                          className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                          required
                        >
                          <option value="">Select Chapter...</option>
                          {allChapters.map(ch => (
                            <option key={ch.id} value={ch.id}>{ch.sectionTitle} - {ch.title}</option>
                          ))}
                        </select>
                      </div>
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
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-pixel text-[#888]">DESCRIPTION</label>
                      <input 
                        type="text" 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                        placeholder="Short description..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-pixel text-[#888]">CONTENT (MARKDOWN)</label>
                      <textarea 
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        className="w-full h-32 bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14] custom-scrollbar"
                        placeholder="Lesson content..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-pixel text-[#888]">CHALLENGE</label>
                      <textarea 
                        value={formData.challenge}
                        onChange={(e) => setFormData({...formData, challenge: e.target.value})}
                        className="w-full h-24 bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14] custom-scrollbar"
                        placeholder="What should the user do?"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-pixel text-[#888]">HINT (OPTIONAL)</label>
                      <textarea 
                        value={formData.hint}
                        onChange={(e) => setFormData({...formData, hint: e.target.value})}
                        className="w-full h-20 bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14] custom-scrollbar"
                        placeholder="Helpful hint..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-pixel text-[#888]">INITIAL CODE</label>
                        <textarea 
                          value={formData.initialCode}
                          onChange={(e) => setFormData({...formData, initialCode: e.target.value})}
                          className="w-full h-32 bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-[#39ff14] font-mono text-sm focus:outline-none focus:border-[#39ff14] custom-scrollbar"
                          placeholder="# Write your code here"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-pixel text-[#888]">EXPECTED OUTPUT</label>
                        <textarea 
                          value={formData.expectedOutput}
                          onChange={(e) => setFormData({...formData, expectedOutput: e.target.value})}
                          className="w-full h-32 bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-[#39ff14] font-mono text-sm focus:outline-none focus:border-[#39ff14] custom-scrollbar"
                          placeholder="Hello World!"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-4 border-t border-[#333] flex justify-end">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#39ff14] text-black font-pixel text-[10px] px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#32e012] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {isSubmitting ? 'SAVING...' : `SAVE ${contentType.toUpperCase()}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="bg-[#1e1e1e] border-4 border-[#000] p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-sm font-pixel text-[#39ff14] mb-6">CREATE ACHIEVEMENT</h2>
              <form onSubmit={handleAchievementSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-pixel text-[#888]">TITLE</label>
                    <input 
                      type="text" 
                      value={achievementForm.title}
                      onChange={(e) => setAchievementForm({...achievementForm, title: e.target.value})}
                      className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                      placeholder="e.g., Python Master"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-pixel text-[#888]">ICON (EMOJI OR URL)</label>
                    <input 
                      type="text" 
                      value={achievementForm.icon}
                      onChange={(e) => setAchievementForm({...achievementForm, icon: e.target.value})}
                      className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                      placeholder="e.g., 🐍"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-pixel text-[#888]">DESCRIPTION</label>
                  <input 
                    type="text" 
                    value={achievementForm.description}
                    onChange={(e) => setAchievementForm({...achievementForm, description: e.target.value})}
                    className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                    placeholder="e.g., Complete all Python lessons."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-pixel text-[#888]">CONDITION TYPE</label>
                    <select 
                      value={achievementForm.conditionType}
                      onChange={(e) => setAchievementForm({...achievementForm, conditionType: e.target.value})}
                      className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                    >
                      <option value="xp">XP Earned</option>
                      <option value="lessons">Lessons Completed</option>
                      <option value="streak">Day Streak</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-pixel text-[#888]">CONDITION VALUE</label>
                    <input 
                      type="number" 
                      value={achievementForm.conditionValue}
                      onChange={(e) => setAchievementForm({...achievementForm, conditionValue: parseInt(e.target.value) || 0})}
                      className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                      placeholder="e.g., 1000"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#333] flex justify-end">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#39ff14] text-black font-pixel text-[10px] px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#32e012] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {isSubmitting ? 'SAVING...' : 'SAVE ACHIEVEMENT'}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-[#1e1e1e] border-4 border-[#000] p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-sm font-pixel text-[#39ff14] mb-6">EXISTING ACHIEVEMENTS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((ach) => (
                  <div key={ach.id} className="bg-[#0d0d0d] border border-[#333] rounded-lg p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-xl">
                          {ach.icon}
                        </div>
                        <div>
                          <h3 className="font-pixel text-[10px] text-white">{ach.title}</h3>
                          <p className="text-[10px] text-[#888] font-sans">{ach.description}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <span className="px-2 py-1 bg-[#1a1a1a] border border-[#333] rounded text-[8px] font-pixel text-[#39ff14]">
                          {ach.conditionType.toUpperCase()}: {ach.conditionValue}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#333] flex justify-end">
                      <button 
                        onClick={() => handleDeleteAchievement(ach.id)}
                        className="text-red-500 hover:text-red-400 font-pixel text-[8px] transition-colors"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                ))}
                {achievements.length === 0 && (
                  <div className="col-span-full text-center py-8 text-[#888] font-pixel text-[10px]">
                    NO ACHIEVEMENTS FOUND
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="bg-[#1e1e1e] border-4 border-[#000] p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-sm font-pixel text-[#39ff14]">COURSE MANAGER</h2>
                  <button 
                    onClick={() => {
                      setActiveTab('content');
                      setContentType('course');
                    }}
                    className="flex items-center gap-2 bg-[#39ff14] text-black font-pixel text-[10px] px-4 py-2 rounded-lg hover:bg-[#32e012] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                  >
                    <Plus className="w-4 h-4" />
                    ADD NEW COURSE
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['courses', 'sections', 'chapters', 'lessons'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setContentSubTab(tab);
                        setSearchQuery('');
                        setSortConfig({ key: 'title', direction: 'asc' });
                      }}
                      className={`font-pixel text-[10px] px-4 py-2 rounded border border-[#333] transition-colors ${contentSubTab === tab ? 'bg-[#39ff14] text-black' : 'bg-[#252525] text-white hover:bg-[#333]'}`}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6 bg-[#0d0d0d] border border-[#333] rounded-lg p-2">
                <Search className="w-4 h-4 text-[#888] ml-2" />
                <input
                  type="text"
                  placeholder={`Search ${contentSubTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-white font-sans text-sm w-full"
                />
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#333]">
                      <th 
                        className="p-4 font-pixel text-[10px] text-[#888] cursor-pointer hover:text-white"
                        onClick={() => requestSort('title')}
                      >
                        <div className="flex items-center gap-2">
                          TITLE
                          {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                        </div>
                      </th>
                      {contentSubTab === 'courses' && (
                        <th className="p-4 font-pixel text-[10px] text-[#888]">LANG ID</th>
                      )}
                      {contentSubTab === 'sections' && (
                        <th className="p-4 font-pixel text-[10px] text-[#888]">COURSE</th>
                      )}
                      {contentSubTab === 'chapters' && (
                        <th className="p-4 font-pixel text-[10px] text-[#888]">SECTION</th>
                      )}
                      {contentSubTab === 'lessons' && (
                        <th className="p-4 font-pixel text-[10px] text-[#888]">CHAPTER</th>
                      )}
                      <th 
                        className="p-4 font-pixel text-[10px] text-[#888] cursor-pointer hover:text-white"
                        onClick={() => requestSort('order')}
                      >
                        <div className="flex items-center gap-2">
                          ORDER
                          {sortConfig.key === 'order' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                        </div>
                      </th>
                      <th className="p-4 font-pixel text-[10px] text-[#888] text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredAndSortedData().map((item: any) => (
                      <tr key={item.id} className="border-b border-[#333] hover:bg-[#252525] transition-colors">
                        <td className="p-4">
                          <div className="font-pixel text-[10px] text-white">{item.title}</div>
                          {item.description && <div className="text-[8px] text-[#888] font-sans mt-1 line-clamp-1">{item.description}</div>}
                        </td>
                        {contentSubTab === 'courses' && (
                          <td className="p-4 font-pixel text-[10px] text-[#39ff14]">{item.languageId}</td>
                        )}
                        {contentSubTab === 'sections' && (
                          <td className="p-4 font-pixel text-[10px] text-[#aaa]">{item.courseTitle}</td>
                        )}
                        {contentSubTab === 'chapters' && (
                          <td className="p-4 font-pixel text-[10px] text-[#aaa]">{item.sectionTitle}</td>
                        )}
                        {contentSubTab === 'lessons' && (
                          <td className="p-4 font-pixel text-[10px] text-[#aaa]">{item.chapterTitle}</td>
                        )}
                        <td className="p-4 font-pixel text-[10px] text-yellow-400">{item.order}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                const typeMap: Record<string, 'course' | 'section' | 'chapter' | 'lesson'> = {
                                  courses: 'course',
                                  sections: 'section',
                                  chapters: 'chapter',
                                  lessons: 'lesson'
                                };
                                setEditingItem({ type: typeMap[contentSubTab], id: item.id, data: { ...item } });
                              }}
                              className="p-2 hover:bg-[#333] rounded-lg text-[#39ff14] transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                if (contentSubTab === 'courses') handleDeleteCourse(item.id);
                                else if (contentSubTab === 'sections') handleDeleteSection(item.id);
                                else if (contentSubTab === 'chapters') handleDeleteChapter(item.id);
                                else if (contentSubTab === 'lessons') handleDeleteLesson(item.id);
                              }}
                              className="p-2 hover:bg-[#333] rounded-lg text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {getFilteredAndSortedData().length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[#888] font-pixel text-[10px]">
                          NO {contentSubTab.toUpperCase()} FOUND
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit Modal Overlay */}
            {editingItem && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#1e1e1e] border-4 border-[#000] p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-pixel text-[#39ff14]">EDIT {editingItem.type.toUpperCase()}</h2>
                    <button 
                      onClick={() => setEditingItem(null)}
                      className="text-[#888] hover:text-white font-pixel text-[10px]"
                    >
                      [CLOSE]
                    </button>
                  </div>

                  <form onSubmit={handleUpdateItem} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-pixel text-[#888]">TITLE</label>
                      <input 
                        type="text" 
                        value={editingItem.data.title}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                        className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                        required
                      />
                    </div>

                    {(editingItem.type === 'course' || editingItem.type === 'lesson') && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-pixel text-[#888]">DESCRIPTION</label>
                        <input 
                          type="text" 
                          value={editingItem.data.description}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: e.target.value } })}
                          className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                          required
                        />
                      </div>
                    )}

                    {editingItem.type === 'lesson' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-pixel text-[#888]">CONTENT (MARKDOWN)</label>
                          <textarea 
                            value={editingItem.data.content}
                            onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, content: e.target.value } })}
                            className="w-full h-32 bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14] custom-scrollbar"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-pixel text-[#888]">CHALLENGE</label>
                          <textarea 
                            value={editingItem.data.challenge}
                            onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, challenge: e.target.value } })}
                            className="w-full h-24 bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14] custom-scrollbar"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-pixel text-[#888]">DIFFICULTY</label>
                            <select 
                              value={editingItem.data.type}
                              onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, type: e.target.value } })}
                              className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="pt-6 border-t border-[#333] flex justify-end gap-3">
                      <button 
                        type="button"
                        onClick={() => setEditingItem(null)}
                        className="font-pixel text-[10px] px-6 py-3 rounded-lg border border-[#333] text-white hover:bg-[#252525] transition-colors"
                      >
                        CANCEL
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#39ff14] text-black font-pixel text-[10px] px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#32e012] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {isSubmitting ? 'SAVING...' : 'SAVE CHANGES'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LLMS.txt Tab */}
        {activeTab === 'llms' && (
          <div className="bg-[#1e1e1e] border-4 border-[#000] p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-pixel text-[#39ff14]">LLMS.TXT EDITOR</h2>
              <button 
                onClick={handleUpdateLlms}
                disabled={isSubmitting}
                className="bg-[#39ff14] text-black font-pixel text-[10px] px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#32e012] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </div>
            <p className="text-[10px] text-[#888] mb-4 font-pixel">
              THIS FILE PROVIDES GUIDELINES FOR LLMS ON HOW TO GENERATE CONTENT FOR THIS PLATFORM.
            </p>
            <textarea 
              value={llmsContent}
              onChange={(e) => setLlmsContent(e.target.value)}
              className="w-full h-[500px] bg-[#0d0d0d] border border-[#333] rounded-lg p-4 text-[#39ff14] font-mono text-xs focus:outline-none focus:border-[#39ff14] custom-scrollbar"
              placeholder="Enter llms.txt content..."
            />
          </div>
        )}
      </main>
    </div>
  );
}
