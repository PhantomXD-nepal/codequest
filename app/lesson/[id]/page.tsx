"use client";

import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Header } from "@/components/ui/header-2";
import { authClient } from "@/lib/auth-client";
import { useRouter, useParams } from "next/navigation";
import { Lesson } from "@/lib/lessons";
import { motion, AnimatePresence } from "motion/react";
import gsap from "gsap";
import confetti from "canvas-confetti";
import ReactMarkdown from "react-markdown";
import { Component as LumaSpin } from "@/components/ui/luma-spin";
import { 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  BookOpen, 
  Lightbulb,
  Trophy,
  ArrowLeft,
  Sparkles,
  HelpCircle
} from "lucide-react";
import Link from "next/link";
import { completeLessonAction, getLessonDetailsAction, getUserStatsAction } from "@/app/actions";

export default function LessonPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<any | null>(null);
  const [language, setLanguage] = useState<string>('python');
  const [code, setCode] = useState("");
  const [output, setOutput] = useState<{ stdout: string; stderr: string; exitCode: number | null } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(true);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<any[]>([]);
  
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProgress() {
      try {
        const stats = await getUserStatsAction();
        if (stats.completedLessons.includes(lessonId)) {
          setIsCompleted(true);
        }
      } catch (err) {
        console.error("Failed to load progress:", err);
      }
    }
    if (session) {
      loadProgress();
    }
  }, [lessonId, session]);

  useEffect(() => {
    async function loadPyodide() {
      try {
        if ((window as any).loadPyodide) {
          const py = await (window as any).loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
          });
          setPyodide(py);
        }
      } catch (err) {
        console.error("Failed to load Pyodide:", err);
      } finally {
        setIsPyodideLoading(false);
      }
    }
    loadPyodide();
  }, []);

  const initialAnimationPlayed = useRef(false);

  useEffect(() => {
    if (mainRef.current && !isPending && session && lesson && !isPyodideLoading) {
      const ctx = gsap.context(() => {
        if (!initialAnimationPlayed.current) {
          const items = mainRef.current?.querySelectorAll(".animate-lesson-item");
          if (items && items.length > 0) {
            gsap.fromTo(
              items,
              { opacity: 0, x: -20 },
              { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
            );
            initialAnimationPlayed.current = true;
          }
        }
      }, mainRef);
      return () => ctx.revert();
    }
  }, [isPending, session, lesson, isPyodideLoading]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const data = await getLessonDetailsAction(lessonId);
        if (data) {
          setLesson(data.lesson);
          setLanguage(data.language);
          setCode(data.lesson.initialCode);
          setNextLessonId(data.nextLessonId);
        }
      } catch (err) {
        console.error("Failed to fetch course data:", err);
      }
    }
    fetchCourse();
  }, [lessonId]);

  const handleRunCode = async () => {
    if (!lesson) return;
    setIsRunning(true);
    setOutput(null);
    
    const isPython = language === 'python' || language.toLowerCase().includes('dsa') || language.toLowerCase().includes('data structure');
    
    if (isPython) {
      if (!pyodide) {
        setIsRunning(false);
        return;
      }
      // Capture stdout
      let stdout = "";
      pyodide.setStdout({
        write: (buffer: Uint8Array) => {
          const text = new TextDecoder().decode(buffer);
          stdout += text;
          return buffer.length;
        }
      });

      try {
        await pyodide.runPythonAsync(code);
        
        const result = {
          stdout: stdout.trim(),
          stderr: "",
          exitCode: 0
        };
        
        setOutput(result);
        
        // Check if output matches expected
        if (result.stdout.trim() === lesson.expectedOutput.trim()) {
          setIsCompleted(true);
          setShowSuccess(true);
          
          // Trigger confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#39ff14', '#ffffff', '#000000']
          });
          
          // Update database
          try {
            const result = await completeLessonAction(lessonId, 25);
            if (result.newAchievements && result.newAchievements.length > 0) {
              setUnlockedAchievements(result.newAchievements);
            }
          } catch (err) {
            console.error("Failed to update progress in DB:", err);
          }
        }
      } catch (error: any) {
        console.error(error);
        setOutput({ 
          stdout: stdout.trim(), 
          stderr: error.message || "Error executing code.", 
          exitCode: 1 
        });
      } finally {
        setIsRunning(false);
      }
    } else if (language === 'javascript' || language === 'typescript') {
      let stdout = "";
      let stderr = "";
      const originalLog = console.log;
      const originalError = console.error;
      console.log = (...args) => {
        stdout += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
      };
      console.error = (...args) => {
        stderr += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
      };

      try {
        // Simple JS execution
        // Execute code in a slightly safer way than direct eval
        const script = document.createElement('script');
        script.textContent = `
          try {
            ${code}
          } catch (e) {
            console.error(e);
          }
        `;
        document.body.appendChild(script);
        document.body.removeChild(script);
        
        const result = {
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: stderr ? 1 : 0
        };
        
        setOutput(result);
        
        if (result.stdout.trim() === lesson.expectedOutput.trim() && !stderr) {
          setIsCompleted(true);
          setShowSuccess(true);
          
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#39ff14', '#ffffff', '#000000']
          });
          
          try {
            const result = await completeLessonAction(lessonId, 25);
            if (result.newAchievements && result.newAchievements.length > 0) {
              setUnlockedAchievements(result.newAchievements);
            }
          } catch (err) {
            console.error("Failed to update progress in DB:", err);
          }
        }
      } catch (err: any) {
        setOutput({
          stdout: stdout.trim(),
          stderr: err.message || "An error occurred",
          exitCode: 1
        });
      } finally {
        console.log = originalLog;
        console.error = originalError;
        setIsRunning(false);
      }
    } else if (language === 'html' || language === 'css') {
      // For HTML/CSS, we'll just "succeed" if there's content for now, 
      // or we could show a preview. Let's show a simple success if they wrote something.
      setOutput({
        stdout: "Rendering preview...",
        stderr: "",
        exitCode: 0
      });
      
      setIsCompleted(true);
      setShowSuccess(true);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#39ff14', '#ffffff', '#000000']
      });
      
      try {
        await completeLessonAction(lessonId, 25);
      } catch (err) {
        console.error("Failed to update progress:", err);
      }
      setIsRunning(false);
    } else {
      setOutput({
        stdout: "",
        stderr: `Language ${language} is not fully supported for execution yet.`,
        exitCode: 1
      });
      setIsRunning(false);
    }
  };

  if (isPending || !session || !lesson) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center gap-6">
        <LumaSpin />
        <div className="text-white font-pixel text-xs animate-pulse">
          LOADING LESSON...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0f0f0f] text-white font-sans overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.03)_0%,transparent_70%)] pointer-events-none" />
      {/* Top Bar - Removed Header */}
      <div className="h-14 border-b border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-[#252525] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#888] hover:text-white" />
          </Link>
          <div className="h-6 w-[1px] bg-[#2a2a2a]" />
          <h1 className="font-pixel text-xs text-[#39ff14] tracking-tighter">
            {lesson.title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#252525] px-3 py-1 rounded-full border border-[#333]">
            <Trophy className="w-3 h-3 text-yellow-400" />
            <span className="text-[8px] font-pixel text-yellow-400">25 XP</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main ref={mainRef} className="flex-1 flex overflow-hidden">
        {/* Left Panel: Instructions */}
        <div className="w-1/3 border-r border-[#2a2a2a] flex flex-col bg-[#1a1a1a] overflow-y-auto custom-scrollbar animate-lesson-item">
          <div className="p-8 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[#39ff14]">
                <BookOpen className="w-5 h-5" />
                <h2 className="text-sm font-pixel uppercase tracking-tight">Learn</h2>
              </div>
              <div className="text-[#aaa] leading-relaxed text-xs font-pixel markdown-content">
                <ReactMarkdown>{lesson.content}</ReactMarkdown>
              </div>
            </section>

            <section className="space-y-4 bg-[#252525] p-6 rounded-xl border-l-4 border-[#39ff14] shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#39ff14]">
                  <Lightbulb className="w-5 h-5" />
                  <h2 className="text-sm font-pixel uppercase tracking-tight">Challenge</h2>
                </div>
                {lesson.hint && (
                  <button 
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-1 text-[#888] hover:text-[#39ff14] transition-colors text-[10px] font-pixel"
                  >
                    <HelpCircle className="w-3 h-3" />
                    {showHint ? "HIDE HINT" : "SHOW HINT"}
                  </button>
                )}
              </div>
              <div className="text-white font-pixel text-xs leading-relaxed markdown-content">
                <ReactMarkdown>{lesson.challenge}</ReactMarkdown>
              </div>
              
              <AnimatePresence>
                {showHint && lesson.hint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-4 bg-[#1a1a1a] border border-[#333] rounded-lg">
                      <div className="text-[#aaa] font-pixel text-[10px] leading-relaxed markdown-content">
                        <span className="text-yellow-400">HINT:</span> <ReactMarkdown>{lesson.hint}</ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {isCompleted && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#39ff14]/10 border border-[#39ff14]/30 p-6 rounded-xl space-y-4"
              >
                <div className="flex items-center gap-2 text-[#39ff14]">
                  <CheckCircle2 className="w-6 h-6" />
                  <h2 className="text-sm font-pixel uppercase tracking-tight">Completed!</h2>
                </div>
                <p className="text-[#39ff14]/80 text-[10px] font-pixel">
                  Great job! You&apos;ve successfully completed this challenge.
                </p>
                <Link href={nextLessonId ? `/lesson/${nextLessonId}` : "/dashboard"} className="block">
                  <button className="w-full bg-[#39ff14] text-black font-pixel text-xs py-4 rounded-lg hover:bg-[#32e012] transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                    {nextLessonId ? "NEXT LESSON" : "BACK TO DASHBOARD"} <ChevronRight className="w-5 h-5" />
                  </button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Panel: Editor & Console */}
        <div className="flex-1 flex flex-col bg-[#0d0d0d] animate-lesson-item">
          {/* Editor Area */}
          <div className="flex-1 relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button 
                onClick={handleRunCode}
                disabled={isRunning || (isPyodideLoading && language === 'python')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-pixel text-[10px] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black ${
                  isRunning || (isPyodideLoading && language === 'python')
                    ? 'bg-[#333] text-[#555] cursor-not-allowed' 
                    : 'bg-[#39ff14] text-black hover:bg-[#32e012] active:translate-y-1 active:shadow-none'
                }`}
              >
                {isPyodideLoading && language === 'python' ? 'LOADING RUNTIME...' : isRunning ? 'RUNNING...' : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> RUN CODE
                  </>
                )}
              </button>
            </div>
            
            <div className="h-full pt-2">
              <Editor
                height="100%"
                language={
                  language === 'javascript' || language === 'typescript' ? 'javascript' : 
                  language === 'html' ? 'html' : 
                  language === 'css' ? 'css' : 
                  'python'
                }
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  fontSize: 16,
                  fontFamily: "'JetBrains Mono', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: "on",
                  roundedSelection: false,
                  readOnly: false,
                  cursorStyle: "line",
                  automaticLayout: true,
                  padding: { top: 20, bottom: 20 }
                }}
              />
            </div>
          </div>

          {/* Console Area */}
          <div className="h-1/3 border-t border-[#2a2a2a] bg-[#1a1a1a] flex flex-col">
            <div className="h-10 border-b border-[#2a2a2a] flex items-center px-4 gap-4">
              <div className="flex items-center gap-2 text-[#888]">
                <Terminal className="w-4 h-4" />
                <span className="text-[8px] font-pixel uppercase tracking-widest">Console Output</span>
              </div>
              {output && (
                <div className={`text-[8px] font-pixel uppercase px-2 py-0.5 rounded ${
                  output.exitCode === 0 ? 'bg-[#39ff14]/20 text-[#39ff14]' : 'bg-red-500/20 text-red-500'
                }`}>
                  {output.exitCode === 0 ? 'Success' : 'Error'}
                </div>
              )}
            </div>
            <div className="flex-1 p-4 font-mono text-sm overflow-y-auto custom-scrollbar bg-[#0d0d0d]">
              {output ? (
                <div className="space-y-2">
                  {output.stdout && <pre className="text-white whitespace-pre-wrap font-mono">{output.stdout}</pre>}
                  {output.stderr && (
                    <div className="bg-red-950/80 border-2 border-red-500 rounded-lg p-4 mt-4 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <div className="text-red-400 text-xs font-bold uppercase tracking-wider font-pixel">Execution Error</div>
                      </div>
                      <pre className="text-red-300 whitespace-pre-wrap font-mono text-sm bg-black/50 p-3 rounded border border-red-900/50">{output.stderr}</pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[#444] italic font-pixel text-[10px]">Run your code to see the output here...</div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 50, rotateX: 45, opacity: 0 }}
              animate={{ 
                scale: 1, 
                y: 0, 
                rotateX: 0, 
                opacity: 1,
                transition: { type: "spring", damping: 15, stiffness: 100 }
              }}
              exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.2 } }}
              className="bg-[#1e1e1e] border-4 border-[#000] p-12 rounded-2xl shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-md w-full text-center space-y-8 relative overflow-hidden"
            >
              {/* Animated Background Rays */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(57,255,20,0.1)_360deg)] pointer-events-none"
              />
              
              <div className="absolute top-0 left-0 w-full h-2 bg-[#39ff14]" />
              
              <div className="relative z-10">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      "0 0 30px rgba(57,255,20,0.4)",
                      "0 0 60px rgba(57,255,20,0.8)",
                      "0 0 30px rgba(57,255,20,0.4)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-24 h-24 bg-[#39ff14] rounded-full mx-auto flex items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                    transition={{ duration: 1, delay: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Sparkles className="w-12 h-12 text-black" />
                  </motion.div>
                </motion.div>
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-[#39ff14]/50 rounded-full scale-150"
                />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-dotted border-[#39ff14]/30 rounded-full scale-[2]"
                />
              </div>

              <div className="space-y-2 relative z-10">
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="text-4xl font-pixel text-[#39ff14] uppercase tracking-tighter italic drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                >
                  LEVEL UP!
                </motion.h2>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-[#aaa] font-pixel text-[10px]"
                >
                  CHALLENGE COMPLETED SUCCESSFULLY
                </motion.p>
              </div>

              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="bg-[#252525] border-2 border-[#000] p-4 rounded-xl flex items-center justify-around relative z-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: "spring", bounce: 0.5 }}
                    className="text-[#39ff14] text-3xl font-pixel drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]"
                  >
                    +25
                  </motion.div>
                  <div className="text-[8px] font-pixel text-[#888] mt-1">XP EARNED</div>
                </div>
                <div className="w-[2px] h-10 bg-[#111]" />
                <div className="text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9, type: "spring", bounce: 0.5 }}
                    className="text-yellow-400 text-3xl font-pixel drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]"
                  >
                    1
                  </motion.div>
                  <div className="text-[8px] font-pixel text-[#888] mt-1">STREAK</div>
                </div>
              </motion.div>

              {/* Achievement Unlocks */}
              <AnimatePresence>
                {unlockedAchievements.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3"
                  >
                    <div className="text-[10px] font-pixel text-yellow-400 mb-2">ACHIEVEMENTS UNLOCKED!</div>
                    {unlockedAchievements.map((ach, idx) => (
                      <motion.div 
                        key={ach.id}
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1.2 + (idx * 0.2), type: "spring" }}
                        className="bg-[#111] border border-yellow-400/50 p-3 rounded-lg flex items-center gap-4"
                      >
                        <div className="text-2xl">{ach.icon}</div>
                        <div className="text-left flex-1">
                          <div className="text-xs font-pixel text-yellow-400">{ach.title}</div>
                          <div className="text-[8px] font-pixel text-[#aaa] mt-1">{ach.description}</div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowSuccess(false);
                  if (nextLessonId) {
                    router.push(`/lesson/${nextLessonId}`);
                  } else {
                    router.push("/dashboard");
                  }
                }}
                className="w-full bg-[#39ff14] text-black font-pixel py-4 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black hover:bg-[#32e012] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest text-xs relative z-10 overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {nextLessonId ? "CONTINUE JOURNEY" : "FINISH COURSE"}
                  {nextLessonId && <ChevronRight className="w-4 h-4" />}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
        .markdown-content p {
          margin-bottom: 1rem;
        }
        .markdown-content p:last-child {
          margin-bottom: 0;
        }
        .markdown-content code {
          background: #2a2a2a;
          padding: 0.1rem 0.3rem;
          border-radius: 0.2rem;
          font-family: monospace;
        }
        .markdown-content pre {
          background: #0d0d0d;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-bottom: 1rem;
        }
        .markdown-content pre code {
          background: transparent;
          padding: 0;
        }
        .markdown-content ul, .markdown-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .markdown-content ul {
          list-style-type: disc;
        }
        .markdown-content ol {
          list-style-type: decimal;
        }
      `}</style>
    </div>
  );
}
