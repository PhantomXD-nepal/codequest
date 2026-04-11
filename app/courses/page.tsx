"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import { LANGUAGES } from "@/lib/constants";
import { getCoursesByLanguageAction } from "@/app/actions";
import { Code2, Layout, Terminal, FileType2, FileJson, BookOpen } from "lucide-react";
import Link from "next/link";

const categoryIcons: Record<string, React.ReactElement> = {
  html: <Layout className="w-6 h-6" />,
  css: <FileType2 className="w-6 h-6" />,
  js: <FileJson className="w-6 h-6" />,
  python: <Terminal className="w-6 h-6" />,
  react: <Code2 className="w-6 h-6" />,
  cpp: <Terminal className="w-6 h-6" />,
};

export default function CoursesPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedLanguage) return;
    
    let isMounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      const data = await getCoursesByLanguageAction(selectedLanguage);
      if (isMounted) {
        setCourses(data);
        setLoading(false);
      }
    };
    
    fetchData();
    
    return () => { isMounted = false; };
  }, [selectedLanguage]);

  if (!selectedLanguage) {
    return (
      <DashboardLayout>
        <div className="p-8 max-w-7xl mx-auto">
          <h1 className="text-4xl font-pixel text-[#39ff14] uppercase mb-12">Select a Language</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className="bg-[#1e1e1e] p-6 rounded-xl border-4 border-[#000] hover:border-[#39ff14] transition-all"
              >
                <h2 className="text-xl font-pixel text-white uppercase">{lang.name}</h2>
              </button>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <button onClick={() => setSelectedLanguage(null)} className="mb-8 text-[#39ff14] font-pixel uppercase">← Back to Languages</button>
        <h1 className="text-4xl font-pixel text-[#39ff14] uppercase mb-12">Courses</h1>
        
        {loading ? (
          <p className="text-white">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-[#1e1e1e] border-4 border-[#000] p-6 rounded-xl">
                <h2 className="text-xl font-pixel text-white mb-3 uppercase">{course.title}</h2>
                <p className="text-[#888] font-mono text-sm mb-8">{course.description}</p>
                {course.videoUrl && (
                    <div className="mb-4">
                        <a href={course.videoUrl} target="_blank" rel="noreferrer" className="text-[#39ff14] text-xs font-pixel">Watch Intro</a>
                    </div>
                )}
                <Link href={`/courses/${course.id}`} className="mc-button mc-button-green w-full py-3 flex items-center justify-center gap-2 font-pixel text-[12px] text-white">
                  START COURSE
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
