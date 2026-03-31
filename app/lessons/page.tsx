"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import { lessons, Lesson } from "@/lib/lessons-data";
import { Code2, Layout, Terminal, FileType2, FileJson, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

const categoryIcons = {
  html: <Layout className="w-6 h-6" />,
  css: <FileType2 className="w-6 h-6" />,
  js: <FileJson className="w-6 h-6" />,
  python: <Terminal className="w-6 h-6" />,
  react: <Code2 className="w-6 h-6" />,
};

const categoryColors = {
  html: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  css: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  js: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  python: "bg-blue-400/20 text-blue-300 border-blue-400/50",
  react: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
};

export default function LessonsPage() {
  const [filter, setFilter] = useState<Lesson['category'] | 'all'>('all');

  const filteredLessons = filter === 'all' 
    ? lessons 
    : lessons.filter(l => l.category === filter);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-pixel text-[#39ff14] uppercase mb-4 flex items-center gap-4">
              <BookOpen className="w-10 h-10" />
              LEARNING CENTER
            </h1>
            <p className="text-[#888] font-mono max-w-2xl">
              Master the art of coding with our interactive lessons. Choose a category and start your journey from zero to hero.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 font-pixel text-[10px] uppercase border-2 transition-all ${filter === 'all' ? 'bg-[#39ff14] text-black border-[#39ff14]' : 'bg-[#1e1e1e] text-[#888] border-[#000] hover:border-[#39ff14]'}`}
            >
              ALL
            </button>
            {(['html', 'css', 'js', 'python', 'react'] as const).map(cat => (
              <button 
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 font-pixel text-[10px] uppercase border-2 transition-all ${filter === cat ? 'bg-[#39ff14] text-black border-[#39ff14]' : 'bg-[#1e1e1e] text-[#888] border-[#000] hover:border-[#39ff14]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLessons.map((lesson, idx) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#1e1e1e] border-4 border-[#000] p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center mb-6 ${categoryColors[lesson.category]}`}>
                {categoryIcons[lesson.category]}
              </div>
              
              <h2 className="text-xl font-pixel text-white mb-3 uppercase">{lesson.title}</h2>
              <p className="text-[#888] font-mono text-sm mb-8 flex-1">
                {lesson.description}
              </p>
              
              <Link 
                href={`/playground?lesson=${lesson.id}`}
                className="mc-button mc-button-green w-full py-3 flex items-center justify-center gap-2 font-pixel text-[12px] text-white"
              >
                START LESSON
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
