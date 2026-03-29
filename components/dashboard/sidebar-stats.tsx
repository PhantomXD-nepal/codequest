"use client";

import React from "react";
import { motion } from "motion/react";
import { Trophy, Star, Zap, User, Settings, LogOut, BarChart2, Award, Shield, Database, Plus } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { makeMeAdminAction } from "@/app/actions";

interface SidebarStatsProps {
  xp: number;
  streak: number;
  rank: number | null;
  role: string;
  setRole: (role: string) => void;
  onAddSection: () => void;
}

export function SidebarStats({
  xp,
  streak,
  rank,
  role,
  setRole,
  onAddSection
}: SidebarStatsProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userName = session?.user?.name || "PLAYER_01";

  return (
    <div className="space-y-8">
      {/* Profile Card */}
      <div className="bg-[#1e1e1e] border-4 border-[#000] p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-[#39ff14] border-2 border-[#000] rounded-lg flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            {session?.user?.image ? (
              <img src={session.user.image} alt={userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="w-6 h-6 text-black" />
            )}
          </div>
          <div>
            <h3 className="font-pixel text-xs text-white uppercase tracking-wider">{userName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-[#39ff14] rounded-full animate-pulse" />
              <span className="font-pixel text-[8px] text-[#39ff14] uppercase">ONLINE</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#0d0d0d] p-4 rounded-lg border-2 border-[#333] flex items-center justify-between group hover:border-[#39ff14]/50 transition-colors">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-[#39ff14]" />
              <span className="font-pixel text-[10px] text-[#888] group-hover:text-white transition-colors uppercase">EXPERIENCE</span>
            </div>
            <span className="font-pixel text-xs text-[#39ff14]">{xp} XP</span>
          </div>
          <div className="bg-[#0d0d0d] p-4 rounded-lg border-2 border-[#333] flex items-center justify-between group hover:border-[#39ff14]/50 transition-colors">
            <div className="flex items-center gap-3">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="font-pixel text-[10px] text-[#888] group-hover:text-white transition-colors uppercase">STREAK</span>
            </div>
            <span className="font-pixel text-xs text-yellow-400">{streak} DAYS</span>
          </div>
          <div className="bg-[#0d0d0d] p-4 rounded-lg border-2 border-[#333] flex items-center justify-between group hover:border-[#39ff14]/50 transition-colors">
            <div className="flex items-center gap-3">
              <Trophy className="w-4 h-4 text-orange-400" />
              <span className="font-pixel text-[10px] text-[#888] group-hover:text-white transition-colors uppercase">RANK</span>
            </div>
            <span className="font-pixel text-xs text-orange-400">#{rank || '---'}</span>
          </div>
        </div>
      </div>

      {/* Admin Panel */}
      {role === 'admin' ? (
        <div className="bg-[#1e1e1e] border-4 border-[#000] p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-pixel text-[10px] text-[#39ff14] mb-6 flex items-center gap-2 uppercase">
            <Shield className="w-3 h-3" />
            ADMIN_CONTROL_PANEL
          </h3>
          <div className="space-y-3">
            <button 
              onClick={onAddSection}
              className="w-full p-4 bg-[#0d0d0d] border-2 border-[#333] rounded-lg flex items-center gap-3 hover:border-[#39ff14] hover:bg-[#39ff14]/5 transition-all group"
            >
              <Plus className="w-4 h-4 text-[#888] group-hover:text-[#39ff14]" />
              <span className="font-pixel text-[10px] text-[#888] group-hover:text-white uppercase">ADD NEW SECTION</span>
            </button>
            <button 
              onClick={() => router.push('/admin/users')}
              className="w-full p-4 bg-[#0d0d0d] border-2 border-[#333] rounded-lg flex items-center gap-3 hover:border-[#39ff14] hover:bg-[#39ff14]/5 transition-all group"
            >
              <BarChart2 className="w-4 h-4 text-[#888] group-hover:text-[#39ff14]" />
              <span className="font-pixel text-[10px] text-[#888] group-hover:text-white uppercase">USER ANALYTICS</span>
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={async () => {
            await makeMeAdminAction();
            setRole('admin');
          }}
          className="w-full p-4 bg-[#1e1e1e] border-4 border-[#000] rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-pixel text-[10px] text-[#888] hover:text-[#39ff14] hover:border-[#39ff14]/50 transition-all uppercase flex items-center justify-center gap-3"
        >
          <Shield className="w-4 h-4" />
          BECOME ADMIN
        </button>
      )}

      {/* Quick Actions */}
      <div className="bg-[#1e1e1e] border-4 border-[#000] p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="font-pixel text-[10px] text-white mb-6 uppercase">SYSTEM_ACTIONS</h3>
        <div className="space-y-3">
          <button className="w-full p-4 bg-[#0d0d0d] border-2 border-[#333] rounded-lg flex items-center gap-3 hover:border-[#39ff14] hover:bg-[#39ff14]/5 transition-all group">
            <Settings className="w-4 h-4 text-[#888] group-hover:text-[#39ff14]" />
            <span className="font-pixel text-[10px] text-[#888] group-hover:text-white uppercase">SETTINGS</span>
          </button>
          <button 
            onClick={async () => {
              await authClient.signOut();
              router.push("/");
            }}
            className="w-full p-4 bg-[#0d0d0d] border-2 border-[#333] rounded-lg flex items-center gap-3 hover:border-red-500 hover:bg-red-500/5 transition-all group"
          >
            <LogOut className="w-4 h-4 text-[#888] group-hover:text-red-500" />
            <span className="font-pixel text-[10px] text-[#888] group-hover:text-white uppercase">LOGOUT</span>
          </button>
        </div>
      </div>
    </div>
  );
}
