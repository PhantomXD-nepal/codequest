import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, User, BarChart2, Home, Settings, LogOut, Menu, X, Zap, Star, Trophy, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Component as LumaSpin } from "@/components/ui/luma-spin";
import { getUserStatsAction } from "@/app/actions";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ xp: 0, streak: 0, role: 'user' });

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    async function fetchStats() {
      if (session) {
        try {
          const data = await getUserStatsAction();
          setStats(data);
        } catch (err) {
          console.error("Failed to fetch stats:", err);
        }
      }
    }
    fetchStats();
  }, [session]);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/signin");
  };

  if (isPending || !session) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center gap-6">
        <LumaSpin />
        <div className="text-white font-pixel text-xs animate-pulse">LOADING QUEST DATA...</div>
      </div>
    );
  }

  const level = Math.floor(Math.sqrt(stats.xp / 100)) + 1;
  const title = level < 5 ? "NOVICE" : level < 10 ? "APPRENTICE" : level < 20 ? "ADEPT" : "MASTER";

  const navLinks = [
    { href: "/dashboard", label: "LEARN", icon: Home },
    { href: "/lessons", label: "LESSONS", icon: BookOpen },
    { href: "/leaderboard", label: "LEADERBOARD", icon: BarChart2 },
    { href: "/profile", label: "PROFILE", icon: User },
    { href: "/playground", label: "PLAYGROUND", icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-[#39ff14] selection:text-black relative flex overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(57,255,20,0.03)_0%,transparent_50%)] pointer-events-none" />

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#141414] border-r-4 border-black transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shrink-0`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b-4 border-black bg-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#39ff14] rounded-lg flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
              <LayoutDashboard className="text-black w-6 h-6" />
            </div>
            <div>
              <h1 className="font-pixel text-[10px] text-[#39ff14] tracking-tighter">CODEQUEST</h1>
              <p className="text-[8px] font-pixel text-[#888]">DASHBOARD v1.0</p>
            </div>
          </div>
        </div>

        {/* User Profile Summary */}
        <div className="p-6 border-b-4 border-black bg-[#1a1a1a]/50">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#333] border-2 border-black rounded-lg flex items-center justify-center overflow-hidden relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {session?.user?.image ? (
                <Image src={session.user.image} alt="Avatar" fill className="object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="text-[#555]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-pixel text-[#39ff14] truncate">{session?.user?.name}</div>
              <div className="text-[8px] font-pixel text-[#888] mt-1 uppercase">LVL {level} {title}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#1a1a1a] p-2 rounded border-2 border-black text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Zap className="w-3 h-3 text-[#39ff14] mx-auto mb-1" />
              <div className="text-[8px] font-pixel">{stats.streak}</div>
            </div>
            <div className="bg-[#1a1a1a] p-2 rounded border-2 border-black text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Star className="w-3 h-3 text-yellow-400 mx-auto mb-1" />
              <div className="text-[8px] font-pixel">{stats.xp}</div>
            </div>
            <div className="bg-[#1a1a1a] p-2 rounded border-2 border-black text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Trophy className="w-3 h-3 text-purple-400 mx-auto mb-1" />
              <div className="text-[8px] font-pixel">#--</div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-pixel text-[10px] transition-all group text-left ${
                  isActive 
                    ? 'bg-[#39ff14] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black' 
                    : 'text-[#888] hover:text-[#39ff14] hover:bg-[#39ff14]/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                {link.label}
              </Link>
            );
          })}
          
          {stats.role === 'admin' && (
            <div className="pt-4 mt-4 border-t-2 border-black space-y-2">
              <div className="px-4 text-[8px] font-pixel text-[#555] mb-2">ADMIN TOOLS</div>
              <Link 
                href="/admin" 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-pixel text-[10px] transition-all group text-left ${
                  pathname === '/admin'
                    ? 'bg-[#39ff14] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black'
                    : 'text-[#39ff14] hover:bg-[#39ff14]/10 border border-[#39ff14]/30'
                }`}
              >
                <Settings className={`w-4 h-4 ${pathname === '/admin' ? '' : 'group-hover:rotate-90 transition-transform'}`} />
                ADMIN PANEL
              </Link>
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t-4 border-black bg-[#1a1a1a]">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg font-pixel text-[10px] transition-all group text-left"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            LOGOUT
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Mobile Top Bar */}
        <header className="lg:hidden h-16 bg-[#1a1a1a] border-b-4 border-black flex items-center justify-between px-6 z-40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#39ff14] rounded flex items-center justify-center border-2 border-black">
              <LayoutDashboard className="text-black w-5 h-5" />
            </div>
            <span className="font-pixel text-[10px] text-[#39ff14]">CODEQUEST</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-[#333] border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {children}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
