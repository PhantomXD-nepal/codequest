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

type EditorType = "web" | "python" | "react" | null;

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lesson");
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [editorType, setEditorType] = useState<EditorType>(null);
  
  // Web state
  const [html, setHtml] = useState("<h1>Hello World</h1>\n<div id=\"app\"></div>");
  const [css, setCss] = useState("h1 { color: #39ff14; font-family: sans-serif; }\nbody { background: #111; color: white; }");
  const [js, setJs] = useState("console.log('JS loaded');");
  const [ts, setTs] = useState("const greeting: string = 'TS loaded';\nconsole.log(greeting);");
  const [activeWebTab, setActiveWebTab] = useState<"html" | "css" | "js" | "ts">("html");

  // Python state
  const [py, setPy] = useState("print('Python loaded')\n# import js\n# js.document.getElementById('app').innerHTML = 'Python was here!'");

  // React state
  const [reactCode, setReactCode] = useState(`function App() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div className="p-6 bg-zinc-900 text-white rounded-xl font-sans shadow-xl max-w-md mx-auto mt-10 border border-zinc-800">
      <h1 className="text-2xl font-bold mb-4 text-[#00d8ff]">React Playground</h1>
      <p className="mb-6 text-zinc-400">Build interactive UIs directly in the browser using React and Tailwind CSS.</p>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setCount(c => c + 1)}
          className="px-4 py-2 bg-[#00d8ff] text-black font-bold rounded hover:bg-[#00b8d8] transition-colors"
        >
          Clicks: {count}
        </button>
        <span className="text-sm text-zinc-500">State updates automatically!</span>
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
            <style>body { background: #111; color: white; font-family: sans-serif; padding: 1rem; }</style>
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
            <style>body { margin: 0; padding: 1rem; background: #111; }</style>
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
      const timer = setTimeout(() => {
        compileAndRun();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [html, css, js, ts, py, reactCode, editorType, tsLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

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

  if (!editorType) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <h1 className="text-4xl font-pixel text-[#39ff14] uppercase mb-12 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] text-center">
            CHOOSE YOUR EDITOR
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
            {/* Web Editor Card */}
            <button 
              onClick={() => setEditorType('web')}
              className="bg-[#1e1e1e] border-4 border-[#000] p-8 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col items-center gap-6 group"
            >
              <div className="w-20 h-20 bg-[#141414] border-4 border-[#000] rounded-full flex items-center justify-center group-hover:bg-[#39ff14] transition-colors">
                <Layout className="w-10 h-10 text-[#888] group-hover:text-black" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-pixel text-white mb-2">WEB EDITOR</h2>
                <p className="text-sm text-[#888] font-mono">HTML, CSS, JS, TS</p>
              </div>
            </button>

            {/* Python Editor Card */}
            <button 
              onClick={() => setEditorType('python')}
              className="bg-[#1e1e1e] border-4 border-[#000] p-8 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col items-center gap-6 group"
            >
              <div className="w-20 h-20 bg-[#141414] border-4 border-[#000] rounded-full flex items-center justify-center group-hover:bg-yellow-400 transition-colors">
                <Terminal className="w-10 h-10 text-[#888] group-hover:text-black" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-pixel text-white mb-2">PYTHON EDITOR</h2>
                <p className="text-sm text-[#888] font-mono">Python 3 (Pyodide)</p>
              </div>
            </button>

            {/* React Editor Card */}
            <button 
              onClick={() => setEditorType('react')}
              className="bg-[#1e1e1e] border-4 border-[#000] p-8 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col items-center gap-6 group"
            >
              <div className="w-20 h-20 bg-[#141414] border-4 border-[#000] rounded-full flex items-center justify-center group-hover:bg-[#00d8ff] transition-colors">
                <Code2 className="w-10 h-10 text-[#888] group-hover:text-black" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-pixel text-white mb-2">REACT EDITOR</h2>
                <p className="text-sm text-[#888] font-mono">React 18, JSX, Tailwind</p>
              </div>
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-80px)] p-4 gap-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setEditorType(null);
                setLogs([]);
                setActiveLesson(null);
              }}
              className="p-2 bg-[#1e1e1e] border-2 border-[#000] rounded-lg text-[#888] hover:text-white hover:border-white transition-colors"
              title="Back to Selection"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-pixel text-[#39ff14] uppercase flex items-center gap-3">
              {editorType === 'web' ? <Layout className="w-8 h-8" /> : 
               editorType === 'python' ? <Terminal className="w-8 h-8 text-yellow-400" /> : 
               <Code2 className="w-8 h-8 text-[#00d8ff]" />}
              {editorType} PLAYGROUND
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={formatCode}
              className="mc-button mc-button-blue px-4 py-2 flex items-center gap-2 font-pixel text-[10px] text-white"
              title="Format Code"
            >
              <Wand2 className="w-4 h-4" />
              FORMAT
            </button>
            <button 
              onClick={compileAndRun}
              className="mc-button mc-button-green px-6 py-2 flex items-center gap-2 font-pixel text-sm text-white"
            >
              <Play className="w-4 h-4" />
              RUN
            </button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
          
          {/* Editor Section */}
          <div className="flex flex-col bg-[#1e1e1e] border-4 border-[#000] rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            
            {editorType === 'web' && (
              <div className="flex border-b-4 border-[#000] bg-[#141414]">
                <button onClick={() => setActiveWebTab('html')} className={`flex-1 py-3 font-pixel text-[10px] uppercase flex items-center justify-center gap-2 transition-colors ${activeWebTab === 'html' ? 'bg-[#39ff14] text-black border-b-4 border-transparent' : 'text-[#888] hover:text-white'}`}>
                  <Layout className="w-4 h-4" /> HTML
                </button>
                <button onClick={() => setActiveWebTab('css')} className={`flex-1 py-3 font-pixel text-[10px] uppercase flex items-center justify-center gap-2 transition-colors border-l-4 border-[#000] ${activeWebTab === 'css' ? 'bg-[#39ff14] text-black border-b-4 border-transparent' : 'text-[#888] hover:text-white'}`}>
                  <FileType2 className="w-4 h-4" /> CSS
                </button>
                <button onClick={() => setActiveWebTab('js')} className={`flex-1 py-3 font-pixel text-[10px] uppercase flex items-center justify-center gap-2 transition-colors border-l-4 border-[#000] ${activeWebTab === 'js' ? 'bg-[#39ff14] text-black border-b-4 border-transparent' : 'text-[#888] hover:text-white'}`}>
                  <FileJson className="w-4 h-4" /> JS
                </button>
                <button onClick={() => setActiveWebTab('ts')} className={`flex-1 py-3 font-pixel text-[10px] uppercase flex items-center justify-center gap-2 transition-colors border-l-4 border-[#000] ${activeWebTab === 'ts' ? 'bg-[#39ff14] text-black border-b-4 border-transparent' : 'text-[#888] hover:text-white'}`}>
                  <Code2 className="w-4 h-4" /> TS
                </button>
              </div>
            )}
            
            {editorType === 'python' && (
              <div className="flex border-b-4 border-[#000] bg-[#141414]">
                <div className="flex-1 py-3 font-pixel text-[10px] uppercase flex items-center justify-center gap-2 bg-yellow-400 text-black">
                  <Terminal className="w-4 h-4" /> MAIN.PY
                </div>
              </div>
            )}
            
            {editorType === 'react' && (
              <div className="flex border-b-4 border-[#000] bg-[#141414]">
                <div className="flex-1 py-3 font-pixel text-[10px] uppercase flex items-center justify-center gap-2 bg-[#00d8ff] text-black">
                  <Code2 className="w-4 h-4" /> APP.JSX
                </div>
              </div>
            )}
            
            <div className="flex-1 relative bg-[#141414]">
              <Editor
                height="100%"
                language={
                  editorType === 'web' ? (activeWebTab === 'js' ? 'javascript' : activeWebTab === 'ts' ? 'typescript' : activeWebTab) :
                  editorType === 'python' ? 'python' :
                  'javascript'
                }
                theme="vs-dark"
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
              <div className="bg-[#141414] border-t-4 border-[#000] p-4 max-h-48 overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-[#39ff14]" />
                  <span className="font-pixel text-[10px] text-[#39ff14] uppercase">LESSON: {activeLesson.title}</span>
                </div>
                <p className="text-[#888] font-mono text-xs leading-relaxed">
                  {activeLesson.content}
                </p>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="flex flex-col gap-4 min-h-0">
            
            {/* Preview */}
            <div className="flex-1 bg-white border-4 border-[#000] rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full bg-[#141414] border-b-4 border-[#000] py-2 px-4 flex items-center z-10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-[#000]" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-[#000]" />
                  <div className="w-3 h-3 rounded-full bg-[#39ff14] border-2 border-[#000]" />
                </div>
                <span className="ml-4 font-pixel text-[10px] text-[#888]">PREVIEW</span>
              </div>
              <iframe
                ref={iframeRef}
                srcDoc={srcDoc}
                sandbox="allow-scripts allow-same-origin"
                className="w-full h-full pt-10 border-none bg-white"
                title="preview"
              />
            </div>

            {/* Console */}
            <div className="h-64 bg-[#1e1e1e] border-4 border-[#000] rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between bg-[#141414] border-b-4 border-[#000] py-2 px-4">
                <div className="flex items-center gap-2 font-pixel text-[10px] text-[#888]">
                  <Terminal className="w-4 h-4" />
                  CONSOLE
                </div>
                <button 
                  onClick={clearConsole}
                  className="text-[#888] hover:text-white transition-colors"
                  title="Clear Console"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 p-0 overflow-y-auto font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="p-4 text-[#888] italic">No output</div>
                ) : (
                  <div className="divide-y divide-[#000]">
                    {logs.map((log, i) => (
                      <div 
                        key={i} 
                        className={`p-2 flex gap-3 group hover:bg-white/5 transition-colors ${
                          log.type === 'error' 
                            ? 'bg-red-500/5 text-red-400' 
                            : 'text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-1 text-[9px] text-[#555] font-mono shrink-0">
                          <Clock className="w-3 h-3" />
                          {log.time}
                        </div>
                        <div className="break-all whitespace-pre-wrap">
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
    <Suspense fallback={<div className="min-h-screen bg-[#111] flex items-center justify-center font-pixel text-[#39ff14]">LOADING...</div>}>
      <PlaygroundContent />
    </Suspense>
  );
}

