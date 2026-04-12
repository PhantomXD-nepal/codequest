"use client";

import React from "react";
import { motion } from "motion/react";
import { ArrowLeft, Database, Terminal, Zap, Shield, Globe, LayoutDashboard, Code, BookOpen, Play } from "lucide-react";
import { seedAllCoursesAction, getLanguagesAction } from "@/app/actions";

interface LanguageSelectProps {
  availableLanguages: any[];
  role: string;
  setAvailableLanguages: (langs: any[]) => void;
  setIsLoadingCourse: (loading: boolean) => void;
  setLanguage: (lang: string) => void;
  setShowLanguageSelect: (show: boolean) => void;
  fetchCourse: () => void;
}

export default function LanguageSelect({
  availableLanguages,
  role,
  setAvailableLanguages,
  setIsLoadingCourse,
  setLanguage,
  setShowLanguageSelect,
  fetchCourse
}: LanguageSelectProps) {
  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n === 'python') return <Terminal className="w-12 h-12" />;
    if (n === 'js') return <Zap className="w-12 h-12" />;
    if (n === 'ts') return <Shield className="w-12 h-12" />;
    if (n === 'html') return <Globe className="w-12 h-12" />;
    if (n === 'css') return <LayoutDashboard className="w-12 h-12" />;
    if (n.includes('dsa')) return <Code className="w-12 h-12" />;
    return <BookOpen className="w-12 h-12" />;
  };

  const getColor = (name: string) => {
    const n = name.toLowerCase();
    if (n === 'python') return 'text-blue-500';
    if (n === 'js') return 'text-yellow-500';
    if (n === 'ts') return 'text-blue-700';
    if (n === 'html') return 'text-orange-600';
    if (n === 'css') return 'text-blue-600';
    if (n.includes('dsa')) return 'text-primary';
    return 'text-on-surface';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-12 pb-12">
      <div className="flex items-center gap-4 mb-12 animate-item">
        <button 
          onClick={() => setShowLanguageSelect(false)}
          className="p-2 bg-surface-variant border border-outline-variant rounded-lg hover:border-primary transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        <h1 className="font-headline font-black text-2xl text-on-surface">Select Your <span className="text-primary">Quest</span></h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {availableLanguages.length === 0 && role === 'admin' && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-xl">
            <Database className="w-16 h-16 text-primary mb-4 opacity-50" />
            <h2 className="font-headline font-bold text-xl text-on-surface mb-2">No Quests Found</h2>
            <p className="font-body text-sm text-on-surface-variant mb-8">Initialize the platform with default courses</p>
            <button 
              onClick={async () => {
                setIsLoadingCourse(true);
                await seedAllCoursesAction();
                const langs = await getLanguagesAction();
                setAvailableLanguages(langs);
                setIsLoadingCourse(false);
              }}
              className="bg-primary text-on-primary font-headline font-bold text-sm px-8 py-4 rounded-lg hover:brightness-110 transition-all shadow-md"
            >
              Seed Initial Data
            </button>
          </div>
        )}
        {availableLanguages.map((lang, idx) => (
          <motion.div
            key={lang.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setLanguage(lang.name);
              setShowLanguageSelect(false);
            }}
            className="bg-surface-container-lowest border border-outline-variant p-8 rounded-xl shadow-md cursor-pointer group hover:border-primary transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              {getIcon(lang.name)}
            </div>
            
            <div className={`mb-6 ${getColor(lang.name)}`}>
              {getIcon(lang.name)}
            </div>

            <h3 className="font-headline font-bold text-lg text-on-surface mb-2 uppercase group-hover:text-primary transition-colors">
              {lang.title || lang.name}
            </h3>
            
            <div className="flex items-center gap-2 text-on-surface-variant font-headline font-bold text-[10px]">
              <BookOpen className="w-3 h-3" />
              <span>{lang.chapterCount} CHAPTERS</span>
            </div>

            <div className="mt-8 flex items-center gap-2 text-primary font-headline font-bold text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
              <span>START QUEST</span>
              <Play className="w-3 h-3 fill-primary" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
