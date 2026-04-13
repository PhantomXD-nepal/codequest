"use client";

import React, { useEffect } from "react";
import { motion, useAnimate } from "motion/react";
import { Check, Lock, Play, Plus, Edit, Zap, RotateCcw } from "lucide-react";

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

function LessonNode({ 
  lesson, 
  isCompleted, 
  isLocked, 
  isCurrent, 
  onLessonClick, 
  role, 
  onEditLesson, 
  onRevertProgress 
}: any) {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (isCompleted) {
      animate(
        "span.check-icon",
        { scale: [0, 1.5, 1], rotate: [0, 15, 0] },
        { duration: 0.5, ease: "backOut" }
      );
    }
  }, [isCompleted, animate]);

  return (
    <div ref={scope} className="relative group transform transition-all duration-500">
      {isCurrent && (
        <div className="absolute -inset-4 bg-primary/20 rounded-full animate-pulse"></div>
      )}
      
      <div 
        onClick={() => onLessonClick(lesson.id, isLocked)}
        className={`relative cursor-pointer ${isLocked ? "cursor-not-allowed" : ""}`}
      >
        <motion.div
          whileHover={!isLocked ? { scale: 1.1 } : {}}
          whileTap={!isLocked ? { scale: 0.95 } : {}}
          className={`w-24 h-24 rounded-full border-8 border-surface-container-highest flex items-center justify-center shadow-xl transition-all duration-300 ${
            isCompleted ? 'bg-primary' : isCurrent ? 'bg-gradient-to-br from-tertiary to-tertiary-dim ring-4 ring-tertiary-container/50 w-28 h-28' : 'bg-surface-container-high opacity-40 grayscale'
          }`}
        >
          {isCompleted ? (
            <span className="material-symbols-outlined text-white text-3xl check-icon" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
          ) : isLocked ? (
            <span className="material-symbols-outlined text-outline text-2xl">lock</span>
          ) : (
            <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
          )}
        </motion.div>
        
        {isCompleted && (
          <div className="absolute -top-12 -right-4 flex gap-1">
            <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          </div>
        )}

        <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
          <p className={`font-headline font-bold ${isCurrent ? 'text-lg text-on-surface' : isCompleted ? 'text-on-surface' : 'text-on-surface-variant'}`}>{lesson.title}</p>
          {isCompleted && <p className="text-xs font-semibold text-primary/60 uppercase tracking-widest">Mastered</p>}
          {isCurrent && <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter mt-1 inline-block">Current Quest</span>}
        </div>
        
        {/* Detail Card (Tooltip) */}
        <div className="absolute left-full ml-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 bg-surface-container-lowest border border-outline-variant p-5 rounded-xl w-64 pointer-events-none group-hover:pointer-events-auto shadow-lg z-50">
          <div className="flex justify-between items-start mb-3">
            <div className="text-[10px] font-headline font-bold text-primary uppercase tracking-wider">
              {isCompleted ? 'COMPLETED' : isCurrent ? 'ACTIVE' : 'LOCKED'} • {lesson.type || 'BEGINNER'}
            </div>
            {role === 'admin' && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEditLesson(lesson);
                }}
                className="p-1.5 bg-surface-variant rounded border border-outline-variant hover:border-primary transition-colors"
              >
                <Edit className="w-3 h-3 text-primary" />
              </button>
            )}
          </div>
          <h4 className="text-sm font-headline font-bold text-on-surface mb-2 uppercase tracking-tight">{lesson.title}</h4>
          <p className="text-[10px] font-body text-on-surface-variant leading-relaxed">{lesson.description}</p>
          
          {!isLocked && (
            <div className="mt-4 pt-4 border-t border-outline-variant flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-headline font-bold text-primary">10 XP</span>
                </div>
                <div className="text-[8px] font-headline font-bold text-on-surface-variant">
                  {isCompleted ? 'REVIEW' : 'CLICK TO START'}
                </div>
              </div>
              
              {isCompleted && onRevertProgress && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRevertProgress(lesson.id);
                  }}
                  className="w-full py-2 bg-error-container/20 border border-error-container/50 rounded text-[8px] font-headline font-bold text-error hover:bg-error-container/40 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-2 h-2" />
                  MARK AS INCOMPLETE
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LearningPath({
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

  let globalLessonIndex = 0;

  return (
    <div className="space-y-24 pb-32">
      {courseData.map((section, sIdx) => (
        <div key={section.id} className="relative animate-item">
          {/* Section Header */}
          <div className="bg-surface-container-low p-8 rounded-xl flex items-center gap-8 relative overflow-hidden group mb-12">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="z-10 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary-container/30 px-2 py-0.5 rounded">
                  Section {sIdx + 1}
                </span>
              </div>
              <h2 className="text-3xl font-headline font-extrabold text-on-surface mb-2">
                {section.title}
              </h2>
            </div>
            <div className="hidden sm:flex z-10 items-center gap-2">
              {role === 'admin' && (
                <button 
                  onClick={() => onEditSection(section)}
                  className="p-2 bg-surface-variant rounded-lg border border-outline-variant hover:border-primary transition-colors"
                  title="Edit Section"
                >
                  <Edit className="w-4 h-4 text-primary" />
                </button>
              )}
              {role === 'admin' && (
                <button 
                  onClick={() => onAddChapter(section.id)}
                  className="p-2 bg-surface-variant rounded-lg border border-outline-variant hover:border-primary transition-colors"
                  title="Add Chapter"
                >
                  <Plus className="w-5 h-5 text-primary" />
                </button>
              )}
            </div>
          </div>

          <div className="relative max-w-2xl mx-auto flex flex-col items-center pb-32">
            {/* Path SVG (Visual Connection) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 400 1200">
              <path 
                className="curved-path opacity-40" 
                d="M200,0 L200,1200" 
                fill="none" 
                stroke="url(#path-gradient)" 
                strokeLinecap="round" 
                strokeWidth="16"
                strokeDasharray="20 15"
              />
              <defs>
                <linearGradient id="path-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>

            {section.chapters?.map((chapter: any, cIdx: number) => (
              <div key={chapter.id} className="w-full flex flex-col items-center space-y-32 relative z-10 mb-32">
                {/* Chapter Label */}
                <div className="flex items-center gap-4 relative z-20 bg-background p-2 rounded-full">
                  <div className="bg-surface-container-highest px-6 py-2 rounded-full border-2 border-surface-variant text-[10px] font-headline font-bold text-on-surface uppercase tracking-widest shadow-sm">
                    {chapter.title}
                  </div>
                  {role === 'admin' && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onEditChapter(chapter)}
                        className="w-8 h-8 bg-surface-variant rounded flex items-center justify-center border border-outline-variant hover:border-primary transition-colors shadow-sm"
                        title="Edit Chapter"
                      >
                        <Edit className="w-4 h-4 text-primary" />
                      </button>
                      <button 
                        onClick={() => onAddLesson(chapter.id)}
                        className="w-8 h-8 bg-surface-variant rounded flex items-center justify-center border border-outline-variant hover:border-primary transition-colors shadow-sm"
                        title="Add Lesson"
                      >
                        <Plus className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Lessons */}
                <div className="flex flex-col items-center space-y-32 w-full">
                  {chapter.lessons?.map((lesson: any) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    const globalIndex = allLessons.findIndex(l => l.id === lesson.id);
                    const isLocked = globalIndex > 0 && !completedLessons.includes(allLessons[globalIndex - 1].id);
                    const isCurrent = !isCompleted && !isLocked;
                    
                    globalLessonIndex++;

                    return (
                      <LessonNode
                        key={lesson.id}
                        lesson={lesson}
                        isCompleted={isCompleted}
                        isLocked={isLocked}
                        isCurrent={isCurrent}
                        onLessonClick={onLessonClick}
                        role={role}
                        onEditLesson={onEditLesson}
                        onRevertProgress={onRevertProgress}
                      />
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
