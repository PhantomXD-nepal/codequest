"use client";

import React from "react";
import { motion } from "motion/react";
import { X, Save } from "lucide-react";
import dynamic from "next/dynamic";
import { Component as LumaSpin } from "@/components/ui/luma-spin";

const Editor = dynamic(() => import("@monaco-editor/react").then(mod => mod.Editor), { ssr: false });

interface AdminEditorProps {
  isEditorOpen: boolean;
  setIsEditorOpen: (open: boolean) => void;
  editorType: 'section' | 'chapter' | 'lesson';
  editorData: any;
  setEditorData: (data: any) => void;
  isSaving: boolean;
  handleSaveContent: () => void;
  language: string;
}

export function AdminEditor({
  isEditorOpen,
  setIsEditorOpen,
  editorType,
  editorData,
  setEditorData,
  isSaving,
  handleSaveContent,
  language
}: AdminEditorProps) {
  if (!isEditorOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1e1e1e] border-4 border-[#000] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="p-6 border-b border-[#333] flex items-center justify-between bg-[#222]">
          <h2 className="font-pixel text-lg text-white uppercase flex items-center gap-3">
            <div className="w-3 h-3 bg-[#39ff14] animate-pulse rounded-full" />
            {editorType} EDITOR
          </h2>
          <button 
            onClick={() => setIsEditorOpen(false)}
            className="p-2 hover:bg-[#333] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#888]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-pixel text-[#888]">TITLE</label>
            <input 
              type="text" 
              value={editorData.title}
              onChange={(e) => setEditorData({...editorData, title: e.target.value})}
              className="w-full bg-[#0d0d0d] border-2 border-[#333] rounded-lg px-4 py-3 text-white font-pixel text-xs focus:border-[#39ff14] outline-none transition-colors"
              placeholder="ENTER TITLE..."
            />
          </div>

          {editorType === 'lesson' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-pixel text-[#888]">DESCRIPTION</label>
                <textarea 
                  value={editorData.description}
                  onChange={(e) => setEditorData({...editorData, description: e.target.value})}
                  className="w-full bg-[#0d0d0d] border-2 border-[#333] rounded-lg px-4 py-3 text-white font-pixel text-xs focus:border-[#39ff14] outline-none transition-colors h-24 resize-none"
                  placeholder="ENTER DESCRIPTION..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 flex flex-col h-[300px]">
                  <label className="text-[10px] font-pixel text-[#888]">CONTENT (MARKDOWN)</label>
                  <div className="flex-1 border border-[#333] rounded-lg overflow-hidden">
                    <Editor
                      height="100%"
                      defaultLanguage="markdown"
                      theme="vs-dark"
                      value={editorData.content}
                      onChange={(val) => setEditorData({...editorData, content: val || ''})}
                      options={{ minimap: { enabled: false }, fontSize: 12, padding: { top: 10 } }}
                    />
                  </div>
                </div>
                <div className="space-y-2 flex flex-col h-[300px]">
                  <label className="text-[10px] font-pixel text-[#888]">INITIAL CODE</label>
                  <div className="flex-1 border border-[#333] rounded-lg overflow-hidden">
                    <Editor
                      height="100%"
                      defaultLanguage={
                        language === 'js' || language === 'ts' ? 'javascript' : 
                        language === 'html' ? 'html' : 
                        language === 'css' ? 'css' : 
                        'python'
                      }
                      theme="vs-dark"
                      value={editorData.initialCode}
                      onChange={(val) => setEditorData({...editorData, initialCode: val || ''})}
                      options={{ minimap: { enabled: false }, fontSize: 12, padding: { top: 10 } }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#333] bg-[#222] flex justify-end gap-3">
          <button 
            onClick={() => setIsEditorOpen(false)}
            className="px-6 py-2 rounded-lg font-pixel text-[10px] text-[#888] hover:text-white transition-colors"
          >
            CANCEL
          </button>
          <button 
            onClick={handleSaveContent}
            disabled={isSaving}
            className="px-8 py-2 bg-[#39ff14] text-black rounded-lg font-pixel text-[10px] flex items-center gap-2 hover:bg-[#32e012] transition-colors disabled:opacity-50"
          >
            {isSaving ? <LumaSpin /> : <Save className="w-3 h-3" />}
            SAVE {editorType.toUpperCase()}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
