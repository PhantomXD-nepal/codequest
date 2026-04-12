"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import { LANGUAGES } from "@/lib/constants";
import { getCoursesByLanguageAction } from "@/app/actions";
import { Code2, Layout, Terminal, FileType2, FileJson, ArrowRight, BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

const categoryIcons: Record<string, React.ReactElement> = {
  html: <Layout className="w-6 h-6" />,
  css: <FileType2 className="w-6 h-6" />,
  js: <FileJson className="w-6 h-6" />,
  python: <Terminal className="w-6 h-6" />,
  react: <Code2 className="w-6 h-6" />,
  cpp: <Terminal className="w-6 h-6" />,
};

export default function LessonsPage() {
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
      <div className="p-8 max-w-7xl mx-auto font-body">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-12 tracking-tight"
          >
            Select a <span className="text-primary">Language</span>
          </motion.h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LANGUAGES.map((lang, index) => (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 hover:shadow-xl transition-all flex flex-col items-center gap-4 group"
              >
                <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {categoryIcons[lang.id] || <Code2 className="w-8 h-8 text-on-primary-container" />}
                </div>
                <h2 className="text-xl font-headline font-bold text-on-surface capitalize">{lang.name}</h2>
              </motion.button>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto font-body">
        <button 
          onClick={() => setSelectedLanguage(null)} 
          className="mb-8 text-on-surface-variant hover:text-primary font-headline font-bold flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Languages
        </button>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-12 tracking-tight capitalize"
        >
          {LANGUAGES.find(l => l.id === selectedLanguage)?.name} <span className="text-primary">Courses</span>
        </motion.h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={course.id} 
                className="bg-surface-container-lowest border border-outline-variant/30 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all flex flex-col"
              >
                <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center mb-6">
                  <BookOpen className="w-6 h-6 text-on-primary-container" />
                </div>
                <h2 className="text-xl font-headline font-bold text-on-surface mb-3 capitalize">{course.title}</h2>
                <p className="text-on-surface-variant font-medium text-sm mb-8 flex-1">{course.description}</p>
                <Link 
                  href={`/courses/${course.id}`} 
                  className="w-full py-4 bg-primary text-white font-headline font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-dim transition-colors shadow-md group"
                >
                  Start Course
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
