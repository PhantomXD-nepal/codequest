"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { Play, Terminal, Code2, FileJson, FileType2, Layout, XCircle, ArrowLeft, Wand2, BookOpen, Clock, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import Editor from "@monaco-editor/react";
import { useSearchParams } from "next/navigation";
import { lessons, Lesson } from "@/lib/lessons-data";
import prettier from "prettier/standalone";
import parserHtml from "prettier/plugins/html";
import parserCss from "prettier/plugins/postcss";
import parserBabel from "prettier/plugins/babel";
import parserEstree from "prettier/plugins/estree";
import { motion } from "motion/react";
import Image from "next/image";
import { useTheme } from "next-themes";

type EditorType = "web" | "python" | "react" | null;

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lesson");
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [editorType, setEditorType] = useState<EditorType>(null);
  
  // Web state
  const [html, setHtml] = useState("<h1>Hello World</h1>\n<div id=\"app\"></div>");
  const [css, setCss] = useState("h1 { color: #254dd5; font-family: sans-serif; }\nbody { background: #f8f9fa; color: #1a1c1e; }");
  const [js, setJs] = useState("console.log('JS loaded');");
  const [ts, setTs] = useState("const greeting: string = 'TS loaded';\nconsole.log(greeting);");
  const [activeWebTab, setActiveWebTab] = useState<"html" | "css" | "js" | "ts">("html");

  // Python state
  const [py, setPy] = useState("print('Python loaded')\n# import js\n# js.document.getElementById('app').innerHTML = 'Python was here!'");

  // React state
  const [reactCode, setReactCode] = useState(`function App() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div className="p-6 bg-white text-slate-900 rounded-2xl font-sans shadow-lg max-w-md mx-auto mt-10 border border-slate-200">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">React Playground</h1>
      <p className="mb-6 text-slate-600">Build interactive UIs directly in the browser using React and Tailwind CSS.</p>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setCount(c => c + 1)}
          className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          Clicks: {count}
        </button>
        <span className="text-sm text-slate-500 font-medium">State updates automatically!</span>
      </div>
    </div>
  );
}`);

  const [logs, setLogs] = useState<{type: string, message: string, time: string}[]>([]);
  const [srcDoc, setSrcDoc] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [tsLoaded, setTsLoaded] = useState(false);

  // Handle lesson loading
  useEffect(() => {
    if (lessonId) {
      const lesson = lessons.find(l => l.id === lessonId);
      if (lesson) {
        // Use a timeout to avoid synchronous setState during render
        setTimeout(() => {
          setActiveLesson(lesson);
          if (lesson.category === 'python') {
            setEditorType('python');
            if (lesson.initialCode.py) setPy(lesson.initialCode.py);
          } else if (lesson.category === 'react') {
            setEditorType('react');
            if (lesson.initialCode.react) setReactCode(lesson.initialCode.react);
          } else {
            setEditorType('web');
            if (lesson.initialCode.html) setHtml(lesson.initialCode.html);
            if (lesson.initialCode.css) setCss(lesson.initialCode.css);
            if (lesson.initialCode.js) setJs(lesson.initialCode.js);
            if (lesson.initialCode.ts) setTs(lesson.initialCode.ts);
          }
        }, 0);
      }
    }
  }, [lessonId]);

  // Load TypeScript compiler only when web editor is selected
  useEffect(() => {
    if (editorType === 'web' && !tsLoaded) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/typescript/5.3.3/typescript.min.js";
      script.onload = () => setTsLoaded(true);
      document.head.appendChild(script);
      
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [editorType, tsLoaded]);

  const formatCode = async () => {
    try {
      if (editorType === 'web') {
        if (activeWebTab === 'html') {
          const formatted = await prettier.format(html, { parser: "html", plugins: [parserHtml] });
          setHtml(formatted);
        } else if (activeWebTab === 'css') {
          const formatted = await prettier.format(css, { parser: "css", plugins: [parserCss] });
          setCss(formatted);
        } else if (activeWebTab === 'js' || activeWebTab === 'ts') {
          const code = activeWebTab === 'js' ? js : ts;
          const formatted = await prettier.format(code, { 
            parser: "babel", 
            plugins: [parserBabel, parserEstree] 
          });
          if (activeWebTab === 'js') setJs(formatted);
          else setTs(formatted);
        }
      } else if (editorType === 'react') {
        const formatted = await prettier.format(reactCode, { 
          parser: "babel", 
          plugins: [parserBabel, parserEstree] 
        });
        setReactCode(formatted);
      }
    } catch (err) {
      console.error("Formatting error:", err);
    }
  };

  const compileAndRun = () => {
    if (!editorType) return;

    let htmlContent = "";
    let currentTsError = "";

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

    if (editorType === 'web') {
      let compiledTs = "";
      if (ts.trim()) {
        if (typeof window !== 'undefined' && (window as any).ts) {
          try {
            compiledTs = (window as any).ts.transpile(ts);
          } catch (err: any) {
            currentTsError = `TS Compilation Error: ${err.message}`;
          }
        } else {
          compiledTs = "// TypeScript compiler not loaded yet";
        }
      }

      const combinedJs = `
        try {
          eval(\`${js.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/</g, '\\x3c')}\`);
        } catch (err) {
          console.error("JS Runtime Error: " + err.message);
        }
        try {
          eval(\`${compiledTs.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/</g, '\\x3c')}\`);
        } catch (err) {
          console.error("TS Runtime Error: " + err.message);
        }
      `;

      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>${css}</style>
          </head>
          <body>
            ${html}
            ${consoleOverride}
            <script>
              ${combinedJs}
            </script>
          </body>
        </html>
      `;
    } else if (editorType === 'python') {
      const pythonScript = py.trim() ? `
        <script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js" crossorigin="anonymous"></script>
        <script>
          async function runPython() {
            try {
              let retries = 0;
              while (typeof loadPyodide === 'undefined' && retries < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                retries++;
              }
              if (typeof loadPyodide === 'undefined') {
                throw new Error("Failed to load Pyodide");
              }
              let pyodide = await loadPyodide();
              await pyodide.loadPackage("micropip");
              const micropip = pyodide.pyimport("micropip");
              
              pyodide.setStdout({ batched: (msg) => console.log(msg) });
              pyodide.setStderr({ batched: (msg) => console.error(msg) });
              await pyodide.runPythonAsync(\`${py.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/</g, '\\x3c')}\`);
            } catch (err) {
              console.error("Python Error: " + err.message);
            }
          }
          runPython();
        </script>
      ` : "";

      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>body { background: #f8f9fa; color: #1a1c1e; font-family: sans-serif; padding: 1rem; }</style>
          </head>
          <body>
            <div id="app">Python Output will appear in console.</div>
            ${consoleOverride}
            ${pythonScript}
          </body>
        </html>
      `;
    } else if (editorType === 'react') {
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>body { margin: 0; padding: 1rem; background: #f8f9fa; }</style>
          </head>
          <body>
            ${consoleOverride}
            <div id="root"></div>
            <script type="text/babel" data-type="module">
              try {
                ${reactCode}
                
                const root = ReactDOM.createRoot(document.getElementById('root'));
                root.render(<App />);
              } catch (err) {
                console.error("React Error: " + err.message);
              }
            </script>
          </body>
        </html>
      `;
    }

    setLogs(prev => currentTsError ? [{type: 'error', message: currentTsError, time: new Date().toLocaleTimeString()}] : []);
    setSrcDoc(htmlContent);
  };

  useEffect(() => {
    if (editorType) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      compileAndRun();
    }
  }, [editorType, tsLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && (event.data.type === 'log' || event.data.type === 'error')) {
        setLogs(prev => [...prev, { type: event.data.type, message: event.data.message, time: event.data.time }]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const clearConsole = () => setLogs([]);
  const { theme } = useTheme();

  if (!editorType) {
    return (
      <DashboardLayout>
        <main className="lg:pl-64 pt-28 px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            <section className="mb-12 relative">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-tertiary-container/20 rounded-full blur-3xl -z-10"></div>
              <div className="absolute top-20 -left-10 w-48 h-48 bg-primary-container/20 rounded-full blur-3xl -z-10"></div>
              <h1 className="text-4xl md:text-6xl font-headline font-extrabold text-on-surface mb-4 leading-tight">
                Choose Your <span className="bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">Creative Playground</span>
              </h1>
              <p className="text-lg text-on-surface-variant max-w-2xl font-body">
                Pick a dimension to start building. Whether you&apos;re a logic master, a visual wizard, or a modern architect, your next big quest starts here.
              </p>
            </section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Python Explorer Card */}
              <div className="group relative flex flex-col bg-surface-container-low rounded-xl overflow-hidden hover:translate-y-[-8px] transition-all duration-300">
                <div className="h-48 relative overflow-hidden">
                  <Image alt="Python coding abstract" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3P0uJdpEZvU7WqAdCgKmCWfy4T9F0EwrdVpQs0EkrlCEaBYimCzJBjviKW_MyLkN30wHFYuRHy20hLQ8Lhbh8sAFJq-3itPArQ0_0J27LA6ySYG3ViWYKvSuj5E2nHPwIpC81tNavG9HtKOVE4WCnOw7goNqtPr0fXSp8iZSKw56Nc6-YrwbYYgxhf1Xlb0j784SisbI-cfW9tW9U-oH9m7QLVeT6ym5KBMz1lvWHsQjO10utI2xRaZMjPgyzP4-_9EuhiY4bdVk" width={400} height={200} />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent"></div>
                  <div className="absolute bottom-4 left-6 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">Logic Quest</span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-3">Python Explorer</h2>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-8 font-body">
                    Master the language of data and automation. Solve puzzles, build smart bots, and explore the power of clean code.
                  </p>
                  <button onClick={() => setEditorType('python')} className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-headline font-bold text-lg shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center gap-2 mt-auto">
                    Launch Playground
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Web Wizard Card */}
              <div className="group relative flex flex-col bg-surface-container-low rounded-xl overflow-hidden hover:translate-y-[-8px] transition-all duration-300">
                <div className="h-48 relative overflow-hidden">
                  <Image alt="Web Design illustration" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlJeyUyDk-8cpowAif3osxIsvqpbfDr1Irq2IHbGTFF2iZ3HSi86YiZslLgbNlsdTlinsyT6Lem1BOpQcmOX5N2QemAecU-mVdxVOhoplj-r4OTCgmDE2lcVzEuH64fAQdpmcZsx9oOKKrO5nlGvDo1V84PmPK0maKAhNHzlHE4akmXliQs5brkJz3Tpr8AYGlEdC2dwyxdMxdoPpyMB5Hn4LprhOGulX_OrUffvu53tS8xK8v-HVz93Cy4HNUy0iHkKESQmKntIw" width={400} height={200} />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent"></div>
                  <div className="absolute bottom-4 left-6 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white shadow-lg">
                      <Wand2 className="w-6 h-6" />
                    </div>
                    <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">Visual Magic</span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-3">Web Wizard</h2>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-8 font-body">
                    The architect of the internet. Weave beautiful layouts, add interactive sparks, and bring your digital dreams to life.
                  </p>
                  <button onClick={() => setEditorType('web')} className="w-full py-4 bg-gradient-to-br from-secondary to-secondary-fixed text-white rounded-full font-headline font-bold text-lg shadow-lg hover:shadow-secondary/25 transition-all flex items-center justify-center gap-2 mt-auto">
                    Launch Playground
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* React Ranger Card */}
              <div className="group relative flex flex-col bg-surface-container-low rounded-xl overflow-hidden hover:translate-y-[-8px] transition-all duration-300">
                <div className="h-48 relative overflow-hidden">
                  <Image alt="React abstract art" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYxxVjYw76CBGOSTRCol4KAiRE8mWWHsrah7rIml74ERuP63gdIlneHQt3NdFJTVpYpMid9o0v3V8ba5QqtyzoBsXgsZxjKm7BYE33EvT-HBD0QnlS3GnrL63metsQf7MyuWhERdMMVLUlf_ILguRKP538BMoMxRfUWvlwR06UpzWRjbvg-r4y4GwOoXROW7y6jRsc2GP24-HnDRlda8p0ODTs_iLO51nJTO6GmeYS-Ae_5Ekz8dJ6YRzTwqKyjiXwqbV9uzqIAS0" width={400} height={200} />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent"></div>
                  <div className="absolute bottom-4 left-6 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-tertiary flex items-center justify-center text-white shadow-lg">
                      <Code2 className="w-6 h-6" />
                    </div>
                    <span className="bg-tertiary/10 text-tertiary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">Pro Engineering</span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-3">React Ranger</h2>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-8 font-body">
                    Harness the power of components. Build high-performance apps with modular efficiency. For the true masters of scale.
                  </p>
                  <button onClick={() => setEditorType('react')} className="w-full py-4 bg-gradient-to-br from-tertiary to-tertiary-fixed-dim text-white rounded-full font-headline font-bold text-lg shadow-lg hover:shadow-tertiary/25 transition-all flex items-center justify-center gap-2 mt-auto">
                    Launch Playground
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-80px)] p-4 gap-4 bg-background font-body">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setEditorType(null);
                setLogs([]);
                setActiveLesson(null);
              }}
              className="p-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              title="Back to Selection"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-headline font-extrabold text-on-surface flex items-center gap-3">
              {editorType === 'web' ? <Layout className="w-8 h-8 text-primary" /> : 
               editorType === 'python' ? <Terminal className="w-8 h-8 text-tertiary" /> : 
               <Code2 className="w-8 h-8 text-secondary" />}
              <span className="capitalize">{editorType}</span> Playground
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={formatCode}
              className="px-4 py-2 bg-surface-container-high text-on-surface font-bold rounded-full flex items-center gap-2 hover:bg-surface-container-highest transition-colors text-sm shadow-sm"
              title="Format Code"
            >
              <Wand2 className="w-4 h-4" />
              Format
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={compileAndRun}
              className="px-6 py-2 bg-primary text-white font-bold rounded-full flex items-center gap-2 hover:bg-primary-dim transition-colors text-sm shadow-md"
            >
              <Play className="w-4 h-4" />
              Run Code
            </motion.button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          
          {/* Editor Section */}
          <div className="flex flex-col bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-sm overflow-hidden">
            
            {editorType === 'web' && (
              <div className="flex border-b border-outline-variant/20 bg-surface-container-low">
                <button onClick={() => setActiveWebTab('html')} className={`flex-1 py-3 font-headline font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeWebTab === 'html' ? 'bg-surface-container-lowest text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
                  <Layout className="w-4 h-4" /> HTML
                </button>
                <button onClick={() => setActiveWebTab('css')} className={`flex-1 py-3 font-headline font-bold text-sm flex items-center justify-center gap-2 transition-colors border-l border-outline-variant/20 ${activeWebTab === 'css' ? 'bg-surface-container-lowest text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
                  <FileType2 className="w-4 h-4" /> CSS
                </button>
                <button onClick={() => setActiveWebTab('js')} className={`flex-1 py-3 font-headline font-bold text-sm flex items-center justify-center gap-2 transition-colors border-l border-outline-variant/20 ${activeWebTab === 'js' ? 'bg-surface-container-lowest text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
                  <FileJson className="w-4 h-4" /> JS
                </button>
                <button onClick={() => setActiveWebTab('ts')} className={`flex-1 py-3 font-headline font-bold text-sm flex items-center justify-center gap-2 transition-colors border-l border-outline-variant/20 ${activeWebTab === 'ts' ? 'bg-surface-container-lowest text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
                  <Code2 className="w-4 h-4" /> TS
                </button>
              </div>
            )}
            
            {editorType === 'python' && (
              <div className="flex border-b border-outline-variant/20 bg-surface-container-low">
                <div className="flex-1 py-3 font-headline font-bold text-sm flex items-center justify-center gap-2 bg-tertiary-container text-on-tertiary-container">
                  <Terminal className="w-4 h-4" /> main.py
                </div>
              </div>
            )}
            
            {editorType === 'react' && (
              <div className="flex border-b border-outline-variant/20 bg-surface-container-low">
                <div className="flex-1 py-3 font-headline font-bold text-sm flex items-center justify-center gap-2 bg-secondary-container text-on-secondary-container">
                  <Code2 className="w-4 h-4" /> App.jsx
                </div>
              </div>
            )}
            
            <div className="flex-1 relative bg-[#1e1e1e]">
              <Editor
                height="100%"
                language={
                  editorType === 'web' ? (activeWebTab === 'js' ? 'javascript' : activeWebTab === 'ts' ? 'typescript' : activeWebTab) :
                  editorType === 'python' ? 'python' :
                  'javascript'
                }
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                value={
                  editorType === 'web' ? (
                    activeWebTab === 'html' ? html :
                    activeWebTab === 'css' ? css :
                    activeWebTab === 'js' ? js :
                    ts
                  ) :
                  editorType === 'python' ? py :
                  reactCode
                }
                onChange={(value) => {
                  const val = value || "";
                  if (editorType === 'web') {
                    if (activeWebTab === 'html') setHtml(val);
                    else if (activeWebTab === 'css') setCss(val);
                    else if (activeWebTab === 'js') setJs(val);
                    else if (activeWebTab === 'ts') setTs(val);
                  } else if (editorType === 'python') {
                    setPy(val);
                  } else if (editorType === 'react') {
                    setReactCode(val);
                  }
                }}
                options={{
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: "on",
                  roundedSelection: false,
                  readOnly: false,
                  cursorStyle: "line",
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 }
                }}
              />
            </div>

            {activeLesson && (
              <div className="bg-surface-container-low border-t border-outline-variant/20 p-4 max-h-48 overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="font-headline font-bold text-sm text-primary">Lesson: {activeLesson.title}</span>
                </div>
                <p className="text-on-surface-variant text-sm leading-relaxed font-medium">
                  {activeLesson.content}
                </p>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="flex flex-col gap-6 min-h-0">
            
            {/* Preview */}
            <div className="flex-1 bg-white border border-outline-variant/20 rounded-2xl shadow-sm overflow-hidden relative flex flex-col">
              <div className="bg-surface-container-low border-b border-outline-variant/20 py-2 px-4 flex items-center shrink-0">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-error" />
                  <div className="w-3 h-3 rounded-full bg-tertiary" />
                  <div className="w-3 h-3 rounded-full bg-primary" />
                </div>
                <span className="ml-4 font-headline font-bold text-xs text-on-surface-variant uppercase tracking-wider">Preview</span>
              </div>
              <div className="flex-1 relative bg-white">
                <iframe
                  ref={iframeRef}
                  srcDoc={srcDoc}
                  sandbox="allow-scripts allow-same-origin"
                  className="absolute inset-0 w-full h-full border-none bg-white"
                  title="preview"
                />
              </div>
            </div>

            {/* Console */}
            <div className="h-64 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-sm flex flex-col overflow-hidden">
              <div className="flex items-center justify-between bg-surface-container-low border-b border-outline-variant/20 py-2 px-4">
                <div className="flex items-center gap-2 font-headline font-bold text-xs text-on-surface-variant uppercase tracking-wider">
                  <Terminal className="w-4 h-4" />
                  Console
                </div>
                <button 
                  onClick={clearConsole}
                  className="text-on-surface-variant hover:text-error transition-colors"
                  title="Clear Console"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 p-0 overflow-y-auto font-mono text-sm bg-[#1e1e1e]">
                {logs.length === 0 ? (
                  <div className="p-4 text-zinc-500 italic">No output</div>
                ) : (
                  <div className="divide-y divide-zinc-800">
                    {logs.map((log, i) => (
                      <div 
                        key={i} 
                        className={`p-3 flex gap-3 group hover:bg-white/5 transition-colors ${
                          log.type === 'error' 
                            ? 'bg-red-500/10 text-red-400' 
                            : 'text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-1 text-xs text-zinc-500 shrink-0 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {log.time}
                        </div>
                        <div className="break-all whitespace-pre-wrap font-medium">
                          {log.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function Playground() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center font-headline font-bold text-primary">Loading...</div>}>
      <PlaygroundContent />
    </Suspense>
  );
}

