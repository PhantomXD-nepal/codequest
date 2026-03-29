"use client";

import React from "react";
import { motion } from "motion/react";
import { Hexagon, Check, Lock, Play, Plus, Edit, Zap, RotateCcw } from "lucide-react";

interface LearningPathProps {
  courseData: any[];
  completedLessons: string[];
  role: string;
  onLessonClick: (lessonId: string, isLocked: boolean) => void;
  onAddChapter: (sectionId: string) => void;
  onAddLesson: (chapterId: string) => void;
  onEditSection: (section: any) => void;
  onEditChapter: (chapter: any) => void;
  onEditLesson: (lesson: any) => void;
  onRevertProgress?: (lessonId: string) => void;
}

export function LearningPath({
  courseData = [],
  completedLessons = [],
  role,
  onLessonClick,
  onAddChapter,
  onAddLesson,
  onEditSection,
  onEditChapter,
  onEditLesson,
  onRevertProgress
}: LearningPathProps) {
  // Flatten all lessons to determine locking logic
  const allLessons: any[] = [];
  courseData?.forEach(section => {
    section.chapters?.forEach((chapter: any) => {
      chapter.lessons?.forEach((lesson: any) => {
        allLessons.push(lesson);
      });
    });
  });

  return (
    <div className="space-y-24 pb-32">
      {courseData.map((section, sIdx) => (
        <div key={section.id} className="relative animate-item">
          {/* Section Header */}
          <div className="bg-[#1e1e1e] border-b-4 border-[#000000] p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center mb-12">
            <div>
              <h2 className="text-[10px] font-pixel text-[#888] uppercase tracking-widest mb-2">
                SECTION {sIdx + 1}
              </h2>
              <h1 className="text-2xl font-pixel text-[#39ff14] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                {section.title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {role === 'admin' && (
                <button 
                  onClick={() => onEditSection(section)}
                  className="p-2 bg-[#333] rounded-lg border border-[#444] hover:border-[#39ff14]/50 transition-colors"
                  title="Edit Section"
                >
                  <Edit className="w-4 h-4 text-[#39ff14]" />
                </button>
              )}
              {role === 'admin' && (
                <button 
                  onClick={() => onAddChapter(section.id)}
                  className="p-2 bg-[#333] rounded-lg border border-[#444] hover:border-[#39ff14]/50 transition-colors"
                  title="Add Chapter"
                >
                  <Plus className="w-5 h-5 text-[#39ff14]" />
                </button>
              )}
            </div>
          </div>

          <div className="relative flex flex-col items-center space-y-20 py-8">
            {/* Path Line (The "Wire") */}
            <div className="absolute top-0 bottom-0 w-1 bg-[#2a2a2a] left-1/2 -translate-x-1/2 z-0">
              {/* Pulsing Glow on the wire */}
              <motion.div 
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-[#39ff14]/20 blur-sm"
              />
            </div>

            {section.chapters?.map((chapter: any, cIdx: number) => (
              <div key={chapter.id} className="w-full flex flex-col items-center space-y-16 relative z-10">
                {/* Chapter Label */}
                <div className="flex items-center gap-4">
                  <div className="bg-[#252525] px-6 py-2 rounded-full border-2 border-[#333] text-[10px] font-pixel text-[#aaa] uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {chapter.title}
                  </div>
                  {role === 'admin' && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onEditChapter(chapter)}
                        className="w-8 h-8 bg-[#333] rounded flex items-center justify-center border border-[#444] hover:border-[#39ff14]/50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        title="Edit Chapter"
                      >
                        <Edit className="w-4 h-4 text-[#39ff14]" />
                      </button>
                      <button 
                        onClick={() => onAddLesson(chapter.id)}
                        className="w-8 h-8 bg-[#333] rounded flex items-center justify-center border border-[#444] hover:border-[#39ff14]/50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        title="Add Lesson"
                      >
                        <Plus className="w-4 h-4 text-[#39ff14]" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Lessons */}
                <div className="flex flex-col items-center space-y-16">
                  {chapter.lessons?.map((lesson: any) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    const globalIndex = allLessons.findIndex(l => l.id === lesson.id);
                    const isLocked = globalIndex > 0 && !completedLessons.includes(allLessons[globalIndex - 1].id);
                    const isCurrent = !isCompleted && !isLocked;

                    return (
                      <div key={lesson.id} className="relative group flex flex-col items-center">
                        {/* Current Lesson Indicator */}
                        {isCurrent && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -top-10 bg-[#39ff14] text-black font-pixel text-[8px] px-3 py-1.5 rounded shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black z-30 whitespace-nowrap"
                          >
                            CURRENT QUEST
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#39ff14] border-b-2 border-r-2 border-black rotate-45" />
                          </motion.div>
                        )}

                        <div 
                          onClick={() => onLessonClick(lesson.id, isLocked)}
                          className={`relative cursor-pointer ${isLocked ? "cursor-not-allowed" : ""}`}
                        >
                          <motion.div
                            whileHover={!isLocked ? { scale: 1.15 } : {}}
                            whileTap={!isLocked ? { scale: 0.9 } : {}}
                            className={`relative w-28 h-28 flex items-center justify-center transition-all duration-300 ${isLocked ? 'opacity-40' : ''}`}
                          >
                            {/* Pulsing Background for Current */}
                            {isCurrent && (
                              <motion.div 
                                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.1, 0.6] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-[#39ff14]/30 rounded-full blur-2xl"
                              />
                            )}

                            {/* Hexagon Node */}
                            <Hexagon 
                              className={`w-full h-full fill-current transition-colors duration-500 ${
                                isCompleted ? 'text-[#39ff14]' : isCurrent ? 'text-white' : 'text-[#1a1a1a]'
                              } stroke-[#000] stroke-[3px] relative z-10 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]`}
                            />

                            {/* Icon Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                              {isCompleted ? (
                                <Check className="w-12 h-12 text-black stroke-[3]" />
                              ) : isLocked ? (
                                <Lock className="w-10 h-10 text-[#444]" />
                              ) : (
                                <Play className={`w-12 h-12 ml-1 ${isCurrent ? 'text-black fill-black' : 'text-white fill-white'}`} />
                              )}
                            </div>

                            {/* Detail Card (Tooltip) */}
                            <div className="absolute left-full ml-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 bg-[#1a1a1a] border-2 border-[#333] p-5 rounded-xl w-64 pointer-events-none group-hover:pointer-events-auto shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] z-50">
                              <div className="flex justify-between items-start mb-3">
                                <div className="text-[10px] font-pixel text-[#39ff14] uppercase tracking-wider">
                                  {isCompleted ? 'COMPLETED' : isCurrent ? 'ACTIVE' : 'LOCKED'} • {lesson.type || 'BEGINNER'}
                                </div>
                                {role === 'admin' && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditLesson(lesson);
                                    }}
                                    className="p-1.5 bg-[#333] rounded border border-[#444] hover:border-[#39ff14] transition-colors"
                                  >
                                    <Edit className="w-3 h-3 text-[#39ff14]" />
                                  </button>
                                )}
                              </div>
                              <h4 className="text-sm font-pixel text-white mb-2 uppercase tracking-tight">{lesson.title}</h4>
                              <p className="text-[10px] font-pixel text-[#888] leading-relaxed">{lesson.description}</p>
                              
                              {!isLocked && (
                                <div className="mt-4 pt-4 border-t border-[#333] flex flex-col gap-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Zap className="w-3 h-3 text-[#39ff14]" />
                                      <span className="text-[10px] font-pixel text-[#39ff14]">10 XP</span>
                                    </div>
                                    <div className="text-[8px] font-pixel text-[#888]">
                                      {isCompleted ? 'REVIEW' : 'CLICK TO START'}
                                    </div>
                                  </div>
                                  
                                  {isCompleted && onRevertProgress && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onRevertProgress(lesson.id);
                                      }}
                                      className="w-full py-2 bg-[#ff4444]/10 border border-[#ff4444]/30 rounded text-[8px] font-pixel text-[#ff4444] hover:bg-[#ff4444]/20 transition-colors flex items-center justify-center gap-2"
                                    >
                                      <RotateCcw className="w-2 h-2" />
                                      MARK AS INCOMPLETE
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
