"use client";

import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Play, Save, Youtube } from "lucide-react";
import { createLessonAction } from "@/app/actions";

import * as Resizable from "react-resizable-panels";

const { Panel, PanelGroup, PanelResizeHandle } = Resizable as any;

declare module 'react-resizable-panels';

export function LessonEditorTab() {
  const [language, setLanguage] = useState('html');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<{ stdout: string; stderr: string; exitCode: number; htmlPreview?: string } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    challenge: '',
    hint: '',
    type: 'beginner',
  });

  const [pyodide, setPyodide] = useState<any>(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);
  const [tsLoaded, setTsLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/typescript/5.3.3/typescript.min.js";
    script.onload = () => setTsLoaded(true);
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    async function loadPyodide() {
      if (language === 'python' && !pyodide) {
        setIsPyodideLoading(true);
        try {
          if ((window as any).loadPyodide) {
            const py = await (window as any).loadPyodide({
              indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
            });
            setPyodide(py);
          } else {
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
            script.onload = async () => {
              const py = await (window as any).loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
              });
              setPyodide(py);
            };
            document.head.appendChild(script);
          }
        } catch (err) {
          console.error("Failed to load Pyodide:", err);
        } finally {
          setIsPyodideLoading(false);
        }
      }
    }
    loadPyodide();
  }, [language, pyodide]);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    
    const isPython = language === 'python';
    
    if (isPython) {
      if (!pyodide) {
        setIsRunning(false);
        return;
      }
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
        setOutput({ stdout: stdout.trim(), stderr: "", exitCode: 0 });
      } catch (error: any) {
        setOutput({ stdout: stdout.trim(), stderr: error.message || "Error executing code.", exitCode: 1 });
      } finally {
        setIsRunning(false);
      }
    } else if (language === 'js' || language === 'ts' || language === 'javascript' || language === 'typescript') {
      let stdout = "";
      let stderr = "";
      const originalLog = console.log;
      const originalError = console.error;
      console.log = (...args) => {
        stdout += args.map(a => a instanceof Error ? a.message : typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
      };
      console.error = (...args) => {
        stderr += args.map(a => a instanceof Error ? a.message : typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
      };

      try {
        let codeToRun = code;
        if (language === 'ts' || language === 'typescript') {
          if (typeof window !== 'undefined' && (window as any).ts) {
            codeToRun = (window as any).ts.transpile(code);
          } else {
            throw new Error("TypeScript compiler not loaded yet");
          }
        }

        const script = document.createElement('script');
        script.textContent = `
          try {
            ${codeToRun}
          } catch (e) {
            console.error(e);
          }
        `;
        document.body.appendChild(script);
        document.body.removeChild(script);
        
        setOutput({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode: stderr ? 1 : 0 });
      } catch (err: any) {
        setOutput({ stdout: stdout.trim(), stderr: err.message || "An error occurred", exitCode: 1 });
      } finally {
        console.log = originalLog;
        console.error = originalError;
        setIsRunning(false);
      }
    } else if (language === 'html' || language === 'css') {
      const htmlContent = language === 'html' ? code : `<style>${code}</style><div id="preview">CSS Preview</div>`;
      setOutput({ stdout: "Rendering preview...", stderr: "", exitCode: 0, htmlPreview: htmlContent });
      setIsRunning(false);
    } else if (language === 'react') {
        const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body>
            <div id="root"></div>
            <script type="text/babel">
              ${code}
              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(<App />);
            </script>
          </body>
        </html>
      `;
      setOutput({ stdout: "Rendering React preview...", stderr: "", exitCode: 0, htmlPreview: htmlContent });
      setIsRunning(false);
    } else {
      setOutput({ stdout: "", stderr: `Language ${language} is not fully supported for execution yet.`, exitCode: 1 });
      setIsRunning(false);
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createLessonAction({
        ...formData,
        initialCode: code,
        chapterId: '', // No chapter ID needed
        expectedOutput: '', // No expected output needed
      });
      alert('Lesson created successfully!');
      setFormData({
        title: '',
        description: '',
        content: '',
        challenge: '',
        hint: '',
        type: 'beginner',
      });
      setCode('');
      setOutput(null);
    } catch (err) {
      console.error("Failed to create lesson:", err);
      alert("Failed to create lesson. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#1e1e1e] border-4 border-[#000] p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6 h-[800px]">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-sm font-pixel text-[#39ff14]">INTERACTIVE LESSON EDITOR</h2>
        <div className="flex items-center gap-4">
          <label className="text-[10px] font-pixel text-[#888]">LANGUAGE:</label>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#0d0d0d] border border-[#333] rounded px-3 py-1 text-white font-sans focus:outline-none focus:border-[#39ff14]"
          >
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="js">JavaScript</option>
            <option value="ts">TypeScript</option>
            <option value="python">Python</option>
            <option value="react">React</option>
          </select>
        </div>
      </div>

      <div className="flex-1 min-h-0 border border-[#333] rounded-lg overflow-hidden">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={40} minSize={20}>
            <div className="h-full overflow-y-auto custom-scrollbar p-4 bg-[#0d0d0d] space-y-6">
              <form id="lesson-form" onSubmit={handleSaveLesson} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-pixel text-[#888]">TITLE</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-pixel text-[#888]">CONTENT (MARKDOWN)</label>
                  <textarea 
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full h-32 bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14] custom-scrollbar"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-pixel text-[#888]">CHALLENGE</label>
                  <textarea 
                    value={formData.challenge}
                    onChange={(e) => setFormData({...formData, challenge: e.target.value})}
                    className="w-full h-24 bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white font-sans focus:outline-none focus:border-[#39ff14] custom-scrollbar"
                    required
                  />
                </div>
              </form>
            </div>
          </Panel>
          
          <PanelResizeHandle className="w-2 bg-[#1a1a1a] hover:bg-[#39ff14] transition-colors cursor-col-resize flex items-center justify-center">
            <div className="w-0.5 h-8 bg-[#333] rounded-full" />
          </PanelResizeHandle>

          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={60} minSize={20}>
                <div className="h-full flex flex-col bg-[#0d0d0d]">
                  <div className="flex items-center justify-between p-2 bg-[#1a1a1a] border-b border-[#333]">
                    <span className="text-[10px] font-pixel text-[#888]">INITIAL CODE</span>
                    <button 
                      onClick={handleRunCode}
                      disabled={isRunning || isPyodideLoading}
                      className="bg-[#39ff14] text-black font-pixel text-[8px] px-4 py-1.5 rounded flex items-center gap-2 hover:bg-[#32e012] disabled:opacity-50"
                    >
                      <Play className="w-3 h-3" /> {isRunning ? 'RUNNING...' : 'TEST CODE'}
                    </button>
                  </div>
                  <div className="flex-1">
                    <Editor
                      height="100%"
                      language={language === 'js' ? 'javascript' : language === 'ts' ? 'typescript' : language === 'react' ? 'javascript' : language}
                      theme="vs-dark"
                      value={code}
                      onChange={(value) => setCode(value || "")}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                  </div>
                </div>
              </Panel>
              
              <PanelResizeHandle className="h-2 bg-[#1a1a1a] hover:bg-[#39ff14] transition-colors cursor-row-resize flex items-center justify-center">
                <div className="h-0.5 w-8 bg-[#333] rounded-full" />
              </PanelResizeHandle>

              <Panel defaultSize={40} minSize={20}>
                <div className="h-full flex flex-col bg-[#0d0d0d]">
                  <div className="p-2 border-b border-[#333] bg-[#1a1a1a] text-[10px] font-pixel text-[#888]">OUTPUT CONSOLE</div>
                  <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-sm">
                    {output ? (
                      <div className="space-y-2 h-full flex flex-col">
                        {output.stdout && <pre className="text-white whitespace-pre-wrap">{output.stdout}</pre>}
                        {output.stderr && <pre className="text-red-400 whitespace-pre-wrap">{output.stderr}</pre>}
                        {output.htmlPreview && (
                          <div className="flex-1 mt-2 border border-[#333] rounded bg-white min-h-[150px]">
                            <iframe srcDoc={output.htmlPreview} className="w-full h-full border-none" sandbox="allow-scripts allow-same-origin" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[#444] italic text-[10px] font-pixel">Run code to see output...</div>
                    )}
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>

      <div className="pt-4 border-t border-[#333] flex justify-end shrink-0">
        <button 
          type="submit"
          form="lesson-form"
          disabled={isSubmitting}
          className="bg-[#39ff14] text-black font-pixel text-[10px] px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-[#32e012] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? 'SAVING...' : 'SAVE LESSON'}
        </button>
      </div>
    </div>
  );
}
