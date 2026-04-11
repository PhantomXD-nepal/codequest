"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { 
  getCourseByIdAction,
  getUserStatsAction,
  completeLessonAction
} from "@/app/actions";
import { 
  ArrowLeft, 
  Play, 
  Terminal, 
  Code2, 
  Layout, 
  BookOpen, 
  ChevronRight, 
  ChevronDown,
  Video,
  CheckCircle2,
  Lock,
  Maximize2,
  Settings,
  Clock,
  Trash2
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { DashboardLayout } from "@/components/ui/dashboard-layout";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });
const PanelGroup = dynamic(() => import("react-resizable-panels").then(mod => mod.Group), { ssr: false });
const Panel = dynamic(() => import("react-resizable-panels").then(mod => mod.Panel), { ssr: false });
const PanelResizeHandle = dynamic(() => import("react-resizable-panels").then(mod => mod.Separator), { ssr: false });

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [session, isPending, router]);
  
  const [course, setCourse] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Editor & Execution State
  const [code, setCode] = useState("");
  const [logs, setLogs] = useState<{type: string, message: string, time: string}[]>([]);
  const [srcDoc, setSrcDoc] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [foundCourse, stats] = await Promise.all([
          getCourseByIdAction(id),
          getUserStatsAction()
        ]);
        
        if (foundCourse) {
          setCourse(foundCourse);
          setCompletedLessons(stats.completedLessons || []);
          
          // Set first lesson as active by default
          if (foundCourse.sections?.[0]?.chapters?.[0]?.lessons?.[0]) {
            const firstLesson = foundCourse.sections[0].chapters[0].lessons[0];
            setActiveLesson(firstLesson);
            setCode(firstLesson.initialCode || "");
          }
        }
      } catch (err) {
        console.error("Failed to fetch course data:", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (session) {
      fetchData();
    }
  }, [id, session]);

  const handleCompleteLesson = async () => {
    if (!activeLesson || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await completeLessonAction(activeLesson.id, 10);
      setCompletedLessons(prev => [...prev, activeLesson.id]);
      
      // Find next lesson
      let nextLesson = null;
      let foundActive = false;
      
      for (const section of course.sections || []) {
        for (const chapter of section.chapters || []) {
          for (const lesson of chapter.lessons || []) {
            if (foundActive) {
              nextLesson = lesson;
              break;
            }
            if (lesson.id === activeLesson.id) {
              foundActive = true;
            }
          }
          if (nextLesson) break;
        }
        if (nextLesson) break;
      }
      
      if (nextLesson) {
        setActiveLesson(nextLesson);
        setCode(nextLesson.initialCode || "");
      } else {
        alert("Congratulations! You've completed the course!");
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

    const isPython = course?.languageId === 'python' || course?.title?.toLowerCase().includes('python');

    let htmlContent = "";

    if (isPython) {
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>body { background: #111; color: white; font-family: sans-serif; padding: 1rem; }</style>
          </head>
          <body>
            <div id="app">Python Output will appear in console.</div>
            ${consoleOverride}
            <script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js" crossorigin="anonymous"></script>
            <script>
              async function runPython() {
                try {
                  let pyodide = await loadPyodide();
                  await pyodide.loadPackage("micropip");
                  const micropip = pyodide.pyimport("micropip");
                  await micropip.install("requests");
                  
                  pyodide.setStdout({ batched: (msg) => console.log(msg) });
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
              body { background: #111; color: white; font-family: sans-serif; padding: 1rem; }
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

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && (event.data.type === 'log' || event.data.type === 'error')) {
        setLogs(prev => [...prev, { type: event.data.type, message: event.data.message, time: event.data.time }]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-[#333] border-t-[#39ff14] rounded-full animate-spin" />
        <div className="text-[#39ff14] font-pixel text-xs animate-pulse tracking-widest">LOADING COURSE...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full text-white">
          <h1 className="text-2xl font-pixel text-red-500 mb-4">COURSE NOT FOUND</h1>
          <Link href="/courses" className="text-[#39ff14] font-pixel text-xs hover:underline">BACK TO COURSES</Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <div className="h-screen bg-[#0f0f0f] flex flex-col overflow-hidden text-white font-sans">
      {/* Header */}
      <header className="h-14 border-b border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/courses" className="p-2 hover:bg-[#252525] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#888] hover:text-white" />
          </Link>
          <div className="h-6 w-[1px] bg-[#2a2a2a]" />
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#39ff14]" />
            <h1 className="font-pixel text-xs text-[#39ff14] tracking-tighter uppercase">
              {course.title}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#0d0d0d] px-3 py-1.5 rounded-full border border-[#333]">
            <div className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse" />
            <span className="text-[10px] font-pixel text-[#888]">LIVE SESSION</span>
          </div>
          <button className="p-2 hover:bg-[#252525] rounded-lg transition-colors text-[#888]">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0">
        <PanelGroup orientation="horizontal">
          {/* Left Panel: Editor */}
          <Panel defaultSize={60} minSize={30}>
            <div className="h-full flex flex-col bg-[#141414] border-r border-[#2a2a2a]">
              {/* Editor Header */}
              <div className="h-12 border-b border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#39ff14]/10 rounded-md border border-[#39ff14]/20">
                    <Code2 className="w-3.5 h-3.5 text-[#39ff14]" />
                    <span className="text-[10px] font-pixel text-[#39ff14] uppercase">
                      {course?.languageId === 'python' || course?.title?.toLowerCase().includes('python') ? 'main.py' : 'main.js'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={compileAndRun}
                    className="flex items-center gap-2 bg-[#39ff14] text-black font-pixel text-[10px] px-4 py-1.5 rounded hover:bg-[#32e012] transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    RUN CODE
                  </button>
                </div>
              </div>
              
              {/* Challenge Text */}
              {activeLesson && (
                <div className="bg-[#1e1e1e] p-4 border-b border-[#2a2a2a]">
                  <h3 className="text-[#39ff14] font-pixel text-[10px] mb-2 uppercase flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> {activeLesson.title}
                  </h3>
                  <p className="text-sm text-zinc-300 font-mono leading-relaxed">
                    {activeLesson.challenge || activeLesson.description}
                  </p>
                </div>
              )}

              {/* Editor */}
              <div className="flex-1 relative">
                <Editor
                  height="100%"
                  language={course?.languageId === 'python' || course?.title?.toLowerCase().includes('python') ? 'python' : 'javascript'}
                  theme="vs-dark"
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
                    padding: { top: 16, bottom: 16 },
                    backgroundColor: "#141414"
                  }}
                />
              </div>
              
              {/* Complete Button */}
              {activeLesson && (
                <div className="p-4 bg-[#1a1a1a] border-t border-[#2a2a2a]">
                  <button 
                    onClick={handleCompleteLesson}
                    disabled={isSubmitting}
                    className="w-full bg-[#39ff14] text-black font-pixel text-xs py-3 rounded-xl hover:bg-[#32e012] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? "SAVING..." : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        COMPLETE & NEXT
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-[#000] hover:bg-[#39ff14] transition-colors cursor-col-resize" />

          {/* Right Panel: Video & Console */}
          <Panel defaultSize={40} minSize={20}>
            <PanelGroup orientation="vertical">
              {/* Top: Video */}
              <Panel defaultSize={50} minSize={20}>
                <div className="h-full bg-black relative group overflow-hidden border-b border-[#2a2a2a]">
                  {course?.videoUrl ? (
                    <iframe 
                      src={getEmbedUrl(course.videoUrl)}
                      className="w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-[#444]">
                      <Video className="w-12 h-12" />
                      <span className="font-pixel text-[10px]">NO VIDEO AVAILABLE</span>
                    </div>
                  )}
                </div>
              </Panel>

              <PanelResizeHandle className="h-1 bg-[#000] hover:bg-[#39ff14] transition-colors cursor-row-resize" />

              {/* Bottom: Console */}
              <Panel defaultSize={50} minSize={20}>
                <div className="h-full flex flex-col bg-[#141414]">
                  <div className="h-10 border-b border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2 text-[#888]">
                      <Terminal className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-pixel uppercase">OUTPUT</span>
                    </div>
                    <button 
                      onClick={() => setLogs([])}
                      className="text-[#555] hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 font-mono text-xs">
                    {logs.length === 0 ? (
                      <div className="text-[#444] italic">No output yet. Run your code to see results.</div>
                    ) : (
                      <div className="space-y-2">
                        {logs.map((log, i) => (
                          <div key={i} className={`flex gap-3 ${log.type === 'error' ? 'text-red-400' : 'text-zinc-300'}`}>
                            <span className="text-[#444] shrink-0">[{log.time}]</span>
                            <span className="break-all whitespace-pre-wrap">{log.message}</span>
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
          </Panel>
        </PanelGroup>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #141414;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}</style>
    </div>
  );
}
