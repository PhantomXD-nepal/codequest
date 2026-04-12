"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { 
  getLessonDetailsAction,
  getUserStatsAction,
  completeLessonAction
} from "@/app/actions";
import { 
  ArrowLeft, 
  Play, 
  Terminal, 
  Code2, 
  BookOpen, 
  CheckCircle2,
  Settings,
  Trash2,
  Zap,
  RotateCcw
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useTheme } from "next-themes";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });
const PanelGroup = dynamic(() => import("react-resizable-panels").then(mod => mod.Group), { ssr: false });
const Panel = dynamic(() => import("react-resizable-panels").then(mod => mod.Panel), { ssr: false });
const PanelResizeHandle = dynamic(() => import("react-resizable-panels").then(mod => mod.Separator), { ssr: false });

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const { theme } = useTheme();

  const [lessonData, setLessonData] = useState<any>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [code, setCode] = useState("");
  const [logs, setLogs] = useState<{type: string, message: string, time: string}[]>([]);
  const [srcDoc, setSrcDoc] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [details, stats] = await Promise.all([
          getLessonDetailsAction(id),
          getUserStatsAction()
        ]);
        
        if (details) {
          setLessonData(details);
          setCompletedLessons(stats.completedLessons || []);
          setCode(details.lesson.initialCode || "");
        }
      } catch (err) {
        console.error("Failed to fetch lesson data:", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (session) {
      fetchData();
    }
  }, [id, session]);

  const handleCompleteLesson = async () => {
    if (!lessonData || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await completeLessonAction(id, 10);
      setCompletedLessons(prev => [...prev, id]);
      
      if (lessonData.nextLessonId) {
        router.push(`/lessons/${lessonData.nextLessonId}`);
      } else {
        import('@/lib/confetti').then((mod) => {
          mod.triggerConfetti();
          mod.playSuccessSound();
        });
        alert("Congratulations! You've completed the chapter!");
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to complete lesson:", err);
      alert("Failed to save progress.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const compileAndRun = () => {
    const consoleOverride = `
      <script>
        const originalLog = console.log;
        const originalError = console.error;
        
        console.log = function(...args) {
          const msg = args.map(a => a instanceof Error ? a.message : typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
          window.parent.postMessage({ type: 'log', message: msg, time: new Date().toLocaleTimeString() }, '*');
          originalLog.apply(console, args);
        };
        
        console.error = function(...args) {
          const msg = args.map(a => a instanceof Error ? a.message : typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
          window.parent.postMessage({ type: 'error', message: msg, time: new Date().toLocaleTimeString() }, '*');
          originalError.apply(console, args);
        };
        
        window.onerror = function(msg, url, line, col, error) {
          window.parent.postMessage({ type: 'error', message: msg + ' at line ' + line, time: new Date().toLocaleTimeString() }, '*');
          return false;
        };
      </script>
    `;

    const isPython = lessonData?.language === 'python';

    let htmlContent = "";

    if (isPython) {
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>body { background: #f8f9fa; color: #1a1c1e; font-family: sans-serif; padding: 1rem; }</style>
          </head>
          <body>
            <div id="app">Python Output will appear in console.</div>
            ${consoleOverride}
            <script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js" crossorigin="anonymous"></script>
            <script>
              async function runPython() {
                try {
                  let pyodide = await loadPyodide();
                  
                  pyodide.setStdout({ batched: (msg) => {
                    console.log(msg);
                    // Check for expected output
                    const expected = "${lessonData.lesson.expectedOutput || ''}";
                    if (expected && msg.trim() === expected.trim()) {
                      window.parent.postMessage({ type: 'success', message: 'Challenge Completed!' }, '*');
                    }
                  }});
                  pyodide.setStderr({ batched: (msg) => console.error(msg) });
                  await pyodide.runPythonAsync(\`${code.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/</g, '\\x3c')}\`);
                } catch (err) {
                  console.error("Python Error: " + err.message);
                }
              }
              runPython();
            </script>
          </body>
        </html>
      `;
    } else {
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { background: #f8f9fa; color: #1a1c1e; font-family: sans-serif; padding: 1rem; }
            </style>
          </head>
          <body>
            <div id="app"></div>
            ${consoleOverride}
            <script>
              try {
                eval(\`${code.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/</g, '\\x3c')}\`);
              } catch (err) {
                console.error(err.message);
              }
            </script>
          </body>
        </html>
      `;
    }

    setLogs([]);
    setSrcDoc(htmlContent);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && (event.data.type === 'log' || event.data.type === 'error')) {
        setLogs(prev => [...prev, { type: event.data.type, message: event.data.message, time: event.data.time }]);
      }
      if (event.data && event.data.type === 'success') {
        import('@/lib/confetti').then((mod) => {
          mod.triggerConfetti();
          mod.playSuccessSound();
        });
        window.dispatchEvent(new CustomEvent('mascot-message', { detail: { message: "Great job! You nailed it! 🚀", state: "happy" } }));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (isPending || loading) {
    return <LoadingScreen />;
  }

  if (!lessonData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 font-body">
        <h1 className="text-2xl font-headline font-bold text-error">Lesson Not Found</h1>
        <Link href="/dashboard" className="text-primary font-headline font-bold hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const { lesson, language } = lessonData;
  const isCompleted = completedLessons.includes(id);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden text-on-surface font-body">
      {/* Header */}
      <header className="h-14 border-b border-outline-variant/20 bg-surface-container-low flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-surface-container rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-on-surface-variant hover:text-on-surface" />
          </Link>
          <div className="h-6 w-[1px] bg-outline-variant/20" />
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <h1 className="font-headline font-bold text-sm text-primary tracking-tight">
              {lesson.title}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-primary-container/20 px-3 py-1 rounded-full border border-primary/20">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-headline font-bold text-primary uppercase tracking-wider">10 XP</span>
          </div>
          <button className="p-2 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0">
        <PanelGroup orientation="horizontal">
          {/* Left Panel: Instructions */}
          <Panel defaultSize={30} minSize={20}>
            <div className="h-full flex flex-col bg-surface-container-lowest border-r border-outline-variant/20 overflow-y-auto p-8">
              <div className="mb-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary-container/30 px-2 py-0.5 rounded mb-4 inline-block">
                  {language} • {lesson.type || 'BEGINNER'}
                </span>
                <h2 className="text-3xl font-headline font-extrabold text-on-surface mb-4 leading-tight">
                  {lesson.title}
                </h2>
                <p className="text-on-surface-variant font-medium leading-relaxed mb-6">
                  {lesson.description}
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30">
                  <h3 className="text-lg font-headline font-bold text-on-surface mb-3 flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-primary" /> The Challenge
                  </h3>
                  <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                    {lesson.challenge}
                  </p>
                </div>

                {lesson.hint && (
                  <div className="bg-secondary-container/10 p-6 rounded-2xl border border-secondary/20">
                    <h3 className="text-sm font-headline font-bold text-secondary mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4" /> Pro Tip
                    </h3>
                    <p className="text-xs text-on-secondary-container font-medium leading-relaxed">
                      {lesson.hint}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-outline-variant/20 hover:bg-primary transition-colors cursor-col-resize" />

          {/* Middle Panel: Editor */}
          <Panel defaultSize={45} minSize={30}>
            <div className="h-full flex flex-col bg-surface-container-lowest border-r border-outline-variant/20">
              <div className="h-12 border-b border-outline-variant/20 bg-surface-container-low flex items-center justify-between px-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-primary-container rounded-md border border-primary/20">
                  <Code2 className="w-3.5 h-3.5 text-on-primary-container" />
                  <span className="text-[10px] font-headline font-bold text-on-primary-container uppercase">
                    {language === 'python' ? 'main.py' : 'main.js'}
                  </span>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={compileAndRun}
                  className="flex items-center gap-2 bg-primary text-white font-headline font-bold text-xs px-4 py-1.5 rounded-lg hover:bg-primary-dim transition-colors shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  Run Code
                </motion.button>
              </div>
              
              <div className="flex-1 relative bg-[#1e1e1e]">
                <Editor
                  height="100%"
                  language={language === 'python' ? 'python' : 'javascript'}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  value={code}
                  onChange={(val) => setCode(val || "")}
                  options={{
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: "on",
                    roundedSelection: false,
                    cursorStyle: "line",
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 }
                  }}
                />
              </div>
              
              <div className="p-4 bg-surface-container-low border-t border-outline-variant/20">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCompleteLesson}
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white font-headline font-bold text-sm py-3 rounded-xl hover:bg-primary-dim transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Complete & Next
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-outline-variant/20 hover:bg-primary transition-colors cursor-col-resize" />

          {/* Right Panel: Output */}
          <Panel defaultSize={25} minSize={15}>
            <div className="h-full flex flex-col bg-surface-container-lowest">
              <div className="h-12 border-b border-outline-variant/20 bg-surface-container-low flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Terminal className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-headline font-bold uppercase tracking-wider">Output</span>
                </div>
                <button 
                  onClick={() => setLogs([])}
                  className="text-on-surface-variant hover:text-error transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 font-mono text-sm bg-[#1e1e1e]">
                {logs.length === 0 ? (
                  <div className="text-zinc-500 italic text-xs">No output yet. Run your code to see results.</div>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log, i) => (
                      <div key={i} className={`flex gap-3 ${log.type === 'error' ? 'text-red-400' : 'text-zinc-300'}`}>
                        <span className="text-zinc-500 shrink-0 text-[10px]">[{log.time}]</span>
                        <span className="break-all whitespace-pre-wrap font-medium text-xs">{log.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Hidden iframe for execution */}
              <iframe
                ref={iframeRef}
                srcDoc={srcDoc}
                sandbox="allow-scripts allow-same-origin"
                className="hidden"
                title="preview"
              />
            </div>
          </Panel>
        </PanelGroup>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e1e1e;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3f3f46;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #52525b;
        }
      `}</style>
    </div>
  );
}

function Star(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
