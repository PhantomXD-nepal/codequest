import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, User, BarChart2, Home, Settings, LogOut, Menu, X, Zap, Star, Trophy, BookOpen, Sun, Moon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getUserStatsAction } from "@/app/actions";
import { Mascot } from "@/components/ui/mascot";
import { useTheme } from "next-themes";

import { LoadingScreen } from "@/components/ui/loading-screen";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ xp: 0, streak: 0, role: 'user' });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    async function fetchStats() {
      if (session) {
        setIsLoadingStats(true);
        try {
          const data = await getUserStatsAction();
          setStats(data);
        } catch (err) {
          console.error("Failed to fetch stats:", err);
        } finally {
          setIsLoadingStats(false);
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
    return <LoadingScreen />;
  }

  const level = Math.floor(Math.sqrt(stats.xp / 100)) + 1;
  const title = level < 5 ? "Novice" : level < 10 ? "Apprentice" : level < 20 ? "Adept" : "Master";

  const navLinks = [
    { href: "/dashboard", label: "Adventure", icon: "map", className: "nav-learn" },
    { href: "/playground", label: "Sandbox", icon: "code_blocks", className: "nav-playground" },
    { href: "/leaderboard", label: "Challenges", icon: "workspace_premium", className: "nav-leaderboard" },
    { href: "/courses", label: "Backpack", icon: "inventory_2", className: "nav-courses" },
    { href: "/profile", label: "Settings", icon: "settings", className: "nav-profile" },
  ];

  return (
    <div className="bg-background font-body text-on-surface min-h-screen flex">
      {/* TopNavBar */}
      <header className="fixed top-0 right-0 left-0 md:left-64 z-40 bg-background/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(46,42,80,0.08)] flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 hover:bg-surface-container rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-on-surface" />
          </button>
          <h1 className="text-xl font-black bg-gradient-to-br from-[#254dd5] to-[#839aff] bg-clip-text text-transparent font-headline">Radiant Explorer</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Streak */}
          <div className="hidden sm:flex items-center gap-2 bg-secondary-container px-4 py-1.5 rounded-full hover:scale-105 transition-transform duration-200">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            {isLoadingStats ? (
              <div className="w-16 h-4 bg-secondary/20 animate-pulse rounded" />
            ) : (
              <span className="font-headline font-bold text-sm tracking-tight text-on-secondary-container">{stats.streak} Day Streak</span>
            )}
          </div>
          {/* XP */}
          <div className="flex items-center gap-2 bg-primary-container/20 px-4 py-1.5 rounded-full hover:scale-105 transition-transform duration-200">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            {isLoadingStats ? (
              <div className="w-12 h-4 bg-primary/20 animate-pulse rounded" />
            ) : (
              <span className="font-headline font-bold text-sm tracking-tight text-primary">{stats.xp} XP</span>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant"
            >
              {mounted && (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
            </button>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:scale-105 transition-transform">notifications</span>
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden border-2 border-primary/20">
              {session?.user?.image ? (
                <Image src={session.user.image} alt="User avatar" width={40} height={40} className="w-full h-full object-cover" referrerPolicy="no-referrer" priority />
              ) : (
                <User className="text-on-surface-variant" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* SideNavBar */}
      <nav className={`fixed left-0 top-0 h-full w-64 bg-surface-container-low flex-col py-8 z-50 transition-transform duration-300 md:translate-x-0 md:flex ${isSidebarOpen ? 'translate-x-0 flex' : '-translate-x-full hidden'}`}>
        <div className="flex justify-end px-4 md:hidden">
          <button onClick={() => setIsSidebarOpen(false)} className="p-2">
            <X className="w-6 h-6 text-on-surface" />
          </button>
        </div>
        <div className="px-6 mb-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-xl bg-surface-container-highest mb-4 flex items-center justify-center overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-300 border-2 border-primary/20 shadow-lg">
            {session?.user?.image ? (
              <Image 
                src={session.user.image} 
                alt="User profile" 
                width={80} 
                height={80} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
                priority 
              />
            ) : (
              <Image 
                width={80} 
                height={80} 
                alt="Hero character portrait" 
                className="w-full h-full p-2" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCy34l30dYEwPrLTp9CABgMTJ1mO9F105ZH4HanjywViKbjBzf6Dj5p1Bhd7V6LJsQqxL-g7Gn3P_4bKQcI5BFWLtezEDhWsKWigPdEb-E5i17dO6rjsee6ss4UtyGVGc8xLzidLxakTQ-MWKhyh0XjhYAgB1M1MhNb4-9_3qE0zdS1Ea9ez9wLdBUX0m9PejFA1OlxY2mJCzyuEx9HrM2QyeKPRDUmUYQTISntWxRBVXHtO1QrOz-bEsF1nCTxjt4VNi55SBqQVMk" 
                referrerPolicy="no-referrer" 
                priority 
              />
            )}
          </div>
          <h2 className="text-lg font-black text-on-surface font-headline text-center">
            {isLoadingStats ? (
              <div className="w-24 h-6 bg-primary/10 animate-pulse rounded mx-auto" />
            ) : (
              `Level ${level} Explorer`
            )}
          </h2>
          <div className="text-sm font-semibold text-primary/70 font-label">
            {isLoadingStats ? (
              <div className="w-16 h-4 bg-primary/5 animate-pulse rounded mx-auto mt-1" />
            ) : (
              title
            )}
          </div>
        </div>
        
        <div className="flex-1 space-y-2 px-4 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={isActive 
                  ? "bg-gradient-to-r from-[#254dd5] to-[#839aff] text-white rounded-full py-3 px-4 flex items-center gap-3 font-headline font-semibold translate-x-1 transition-transform"
                  : "text-on-surface-variant mx-2 py-3 px-4 flex items-center gap-3 font-headline font-semibold hover:bg-surface-container-highest rounded-full transition-all"
                }
              >
                <span className="material-symbols-outlined">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}

          {stats.role === 'admin' && (
            <div className="pt-4 mt-4 border-t border-surface-variant space-y-2">
              <Link 
                href="/admin" 
                className={pathname === '/admin'
                  ? "bg-gradient-to-r from-[#254dd5] to-[#839aff] text-white rounded-full py-3 px-4 flex items-center gap-3 font-headline font-semibold translate-x-1 transition-transform"
                  : "text-on-surface-variant mx-2 py-3 px-4 flex items-center gap-3 font-headline font-semibold hover:bg-surface-container-highest rounded-full transition-all"
                }
              >
                <span className="material-symbols-outlined">admin_panel_settings</span>
                Admin Panel
              </Link>
            </div>
          )}
        </div>
        
        <div className="px-4 mt-auto pt-4">
          <button onClick={handleLogout} className="w-full bg-surface-variant text-on-surface-variant font-bold py-3 px-6 rounded-xl hover:bg-surface-container-highest transition-all text-sm font-headline flex items-center justify-center gap-2 mb-4">
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </button>
          <button className="w-full bg-secondary text-on-secondary font-bold py-4 px-6 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-sm font-headline">
            Unlock Pro Quests
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 pt-24 pb-20 px-6 min-h-screen w-full relative">
        {children}
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg flex justify-around items-center py-4 px-2 z-50 rounded-t-xl shadow-[0_-10px_30px_rgba(46,42,80,0.08)]">
        {navLinks.slice(0, 4).map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
              <span className="material-symbols-outlined text-2xl" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{link.icon}</span>
              <span className="text-[10px] font-bold font-headline">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
