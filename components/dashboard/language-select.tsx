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

export function LanguageSelect({
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
    if (n === 'python') return 'text-blue-400';
    if (n === 'js') return 'text-yellow-400';
    if (n === 'ts') return 'text-blue-600';
    if (n === 'html') return 'text-orange-500';
    if (n === 'css') return 'text-blue-500';
    if (n.includes('dsa')) return 'text-[#39ff14]';
    return 'text-white';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-12 pb-12">
      <div className="flex items-center gap-4 mb-12 animate-item">
        <button 
          onClick={() => setShowLanguageSelect(false)}
          className="p-2 bg-[#1e1e1e] border-2 border-[#333] rounded-lg hover:border-[#39ff14]/50 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <ArrowLeft className="w-5 h-5 text-[#39ff14]" />
        </button>
        <h1 className="font-pixel text-2xl text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">SELECT YOUR <span className="text-[#39ff14]">QUEST</span></h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {availableLanguages.length === 0 && role === 'admin' && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[#1e1e1e] border-4 border-dashed border-[#333] rounded-xl">
            <Database className="w-16 h-16 text-[#39ff14] mb-4 opacity-50" />
            <h2 className="font-pixel text-xl text-white mb-2">NO QUESTS FOUND</h2>
            <p className="font-pixel text-[10px] text-[#888] mb-8">INITIALIZE THE PLATFORM WITH DEFAULT COURSES</p>
            <button 
              onClick={async () => {
                setIsLoadingCourse(true);
                await seedAllCoursesAction();
                const langs = await getLanguagesAction();
                setAvailableLanguages(langs);
                setIsLoadingCourse(false);
              }}
              className="bg-[#39ff14] text-black font-pixel text-sm px-8 py-4 rounded-lg hover:bg-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              SEED INITIAL DATA
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
            className="bg-[#1e1e1e] border-4 border-[#000] p-8 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] cursor-pointer group hover:border-[#39ff14]/50 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              {getIcon(lang.name)}
            </div>
            
            <div className={`mb-6 ${getColor(lang.name)}`}>
              {getIcon(lang.name)}
            </div>

            <h3 className="font-pixel text-lg text-white mb-2 uppercase group-hover:text-[#39ff14] transition-colors">
              {lang.title || lang.name}
            </h3>
            
            <div className="flex items-center gap-2 text-[#888] font-pixel text-[10px]">
              <BookOpen className="w-3 h-3" />
              <span>{lang.chapterCount} CHAPTERS</span>
            </div>

            <div className="mt-8 flex items-center gap-2 text-[#39ff14] font-pixel text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
              <span>START QUEST</span>
              <Play className="w-2 h-2 fill-[#39ff14]" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
