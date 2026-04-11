"use client";

import { LandingHeader, Hero } from "@/components/landing/hero";
import { Star, Sparkles, Terminal, Code2, Cpu, ArrowRight, Shield, Zap, Users } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { data: session } = authClient.useSession();
  const pageRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text animation
      gsap.from(".hero-text", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2
      });

      // Scroll Reveals for sections
      gsap.from(".reveal-up", {
        scrollTrigger: {
          trigger: ".reveal-up",
          start: "top 85%",
        },
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      });
    }, pageRef.current || undefined);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen bg-[#070b0a] text-white flex flex-col selection:bg-[#5ed29c] selection:text-black font-inter">
      <LandingHeader />
      
      <main className="flex-1">
        <Hero />

        {/* Features Section - High End Redesign */}
        <section id="features" ref={featuresRef} className="py-32 relative border-t border-white/5">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mb-24 reveal-up">
              <span className="text-[#5ed29c] font-plus-jakarta font-bold text-[11px] uppercase tracking-[0.2em] mb-4 block">
                The Arsenal
              </span>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                EQUIP YOURSELF WITH THE <br /> FUTURE OF <span className="text-[#5ed29c]">DEVELOPMENT.</span>
              </h2>
              <p className="text-white/60 text-lg max-w-xl">
                Our platform provides everything you need to master modern coding, from interactive lessons to real-world projects.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Large Bento Box */}
              <div className="feature-card group p-8 rounded-3xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 hover:border-[#5ed29c]/50 transition-all duration-500 md:col-span-2 md:row-span-2 relative overflow-hidden flex flex-col justify-between min-h-[400px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#5ed29c_0%,transparent_50%)] opacity-0 group-hover:opacity-10 transition-opacity duration-700" />
                <div className="w-16 h-16 rounded-2xl bg-[#5ed29c]/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform border border-[#5ed29c]/20 relative z-10">
                  <Terminal size={32} className="text-[#5ed29c]" />
                </div>
                <div className="relative z-10 mt-auto">
                  <h3 className="text-3xl font-bold mb-4 tracking-tight">INTERACTIVE IDE</h3>
                  <p className="text-white/60 text-lg leading-relaxed max-w-md">
                    Code directly in your browser with our powerful, integrated development environment. No setup required.
                  </p>
                </div>
              </div>

              {/* Medium Bento Box 1 */}
              <div className="feature-card group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-[#5ed29c]/30 transition-all duration-500 md:col-span-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#5ed29c]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-start gap-6 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[#5ed29c]/10 flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
                    <Zap className="text-[#5ed29c]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 tracking-tight">GAMIFIED LEARNING</h3>
                    <p className="text-white/50 text-sm leading-relaxed">
                      Level up your skills, earn XP, and compete on the leaderboard while you learn.
                    </p>
                  </div>
                </div>
              </div>

              {/* Medium Bento Box 2 */}
              <div className="feature-card group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-[#5ed29c]/30 transition-all duration-500 md:col-span-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-l from-[#5ed29c]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-start gap-6 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[#5ed29c]/10 flex items-center justify-center shrink-0 group-hover:-rotate-12 transition-transform">
                    <Shield className="text-[#5ed29c]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 tracking-tight">CAREER READY</h3>
                    <p className="text-white/50 text-sm leading-relaxed">
                      Build a portfolio of real-world projects that will get you hired by top tech companies.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section - High End Redesign */}
        <section id="pricing" ref={pricingRef} className="py-32 bg-[#0a0a0a] border-t border-white/5">
          <div className="container mx-auto px-6">
            <div className="text-center mb-24 reveal-up">
              <h2 className="text-4xl md:text-7xl font-bold tracking-tighter mb-8 uppercase">
                COMPLETELY <span className="text-[#5ed29c]">FREE.</span>
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
                Our mission is to democratize coding education. We believe every child should have the opportunity to learn the language of the future.
              </p>
            </div>

            <div className="max-w-4xl mx-auto reveal-up">
              <div className="relative p-12 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#5ed29c] to-transparent opacity-50"></div>
                
                <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5ed29c]/10 border border-[#5ed29c]/20 text-[#5ed29c] text-[10px] font-bold uppercase tracking-widest mb-6">
                      <Sparkles size={12} />
                      Community Driven
                    </div>
                    <h3 className="text-3xl font-bold mb-4">DONATIONS APPRECIATED</h3>
                    <p className="text-white/50 text-sm leading-relaxed mb-8">
                      CodeQuest is a 100% free platform. We rely on the generosity of our community to keep the servers running and continue developing new content for students worldwide.
                    </p>
                    <button className="bg-white text-black font-bold px-8 py-4 rounded-full text-sm uppercase tracking-wider hover:bg-[#5ed29c] transition-colors">
                      Support the Mission
                    </button>
                  </div>
                  <div className="w-full md:w-1/3 aspect-square rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#5ed29c]/5 blur-3xl rounded-full"></div>
                    <Users size={80} className="text-[#5ed29c]/20 relative z-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section id="cta" className="py-48 relative overflow-hidden border-t border-white/5">
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#5ed29c_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>
          
          <div className="container mx-auto px-6 text-center relative z-10 reveal-up">
            <h2 className="text-5xl md:text-8xl font-bold mb-12 leading-[1] tracking-tighter uppercase">
              READY TO JOIN <br /> THE <span className="text-[#5ed29c]">QUEST?</span>
            </h2>
            <Link href="/signup">
              <button className="group bg-[#5ed29c] text-[#070b0a] font-bold text-xl uppercase tracking-widest px-16 py-8 rounded-full flex items-center gap-4 mx-auto hover:bg-white transition-all duration-300">
                Start Your Journey
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5 bg-[#070b0a]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-black font-bold text-xl">C</span>
                </div>
                <span className="text-white font-bold tracking-tighter text-xl">CODEQUEST</span>
              </div>
              <p className="text-white/40 text-sm max-w-xs leading-relaxed">
                Gamified coding education for the next generation of digital creators. Built with passion for the community.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-8">Platform</h4>
              <ul className="space-y-4 text-sm text-white/40">
                <li><Link href="/dashboard" className="hover:text-[#5ed29c] transition-colors">Dashboard</Link></li>
                <li><Link href="/leaderboard" className="hover:text-[#5ed29c] transition-colors">Leaderboard</Link></li>
                <li><Link href="/#features" className="hover:text-[#5ed29c] transition-colors">Features</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-8">Connect</h4>
              <ul className="space-y-4 text-sm text-white/40">
                <li><a href="#" className="hover:text-[#5ed29c] transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-[#5ed29c] transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-[#5ed29c] transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-white/20 text-[10px] uppercase tracking-widest">
              © {new Date().getFullYear()} CODEQUEST STUDIOS. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-8">
              <Link href="/privacy" className="text-white/20 text-[10px] uppercase tracking-widest hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-white/20 text-[10px] uppercase tracking-widest hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
