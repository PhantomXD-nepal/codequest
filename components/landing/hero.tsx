'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { ArrowRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = authClient.useSession();

  const navLinks = [
    { label: 'FEATURES', href: '#features' },
    { label: 'PRICING', href: '#pricing' },
  ];

  return (
    <>
      <header className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-6 md:px-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
            <span className="text-black font-bold text-xl">C</span>
          </div>
          <span className="text-white font-bold tracking-tighter text-xl hidden sm:block">CODEQUEST</span>
        </div>

        <nav className="hidden md:flex items-center gap-12">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-white/70 hover:text-[#5ed29c] transition-colors text-base font-medium tracking-wide font-inter"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/onboarding">
            <button className="text-white/70 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
              Onboarding
            </button>
          </Link>
          {session ? (
            <Link href="/dashboard">
              <button className="bg-[#5ed29c] text-[#070b0a] font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-full hover:bg-white transition-all duration-300">
                Dashboard
              </button>
            </Link>
          ) : (
            <>
              <Link href="/signin">
                <button className="text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-full border border-white/20 hover:border-[#5ed29c] hover:text-[#5ed29c] transition-all duration-300">
                  Sign In
                </button>
              </Link>
              <Link href="/signup">
                <button className="bg-[#5ed29c] text-[#070b0a] font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-full hover:bg-white transition-all duration-300">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>

        <button 
          className="md:hidden text-white p-2"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#070b0a] flex flex-col items-center justify-center gap-8"
          >
            <button 
              className="absolute top-8 right-8 text-white p-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <X size={32} />
            </button>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-white text-3xl font-bold hover:text-[#5ed29c] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/onboarding"
              className="text-white text-3xl font-bold hover:text-[#5ed29c] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              ONBOARDING
            </Link>
            
            <div className="flex flex-col items-center gap-4 mt-8">
              {session ? (
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <button className="bg-[#5ed29c] text-[#070b0a] font-bold text-lg uppercase tracking-widest px-12 py-4 rounded-full">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/signin" onClick={() => setIsMenuOpen(false)}>
                    <button className="text-white font-bold text-lg uppercase tracking-widest px-12 py-4 rounded-full border border-white/20">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    <button className="bg-[#5ed29c] text-[#070b0a] font-bold text-lg uppercase tracking-widest px-12 py-4 rounded-full">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsUrl = 'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';

  useEffect(() => {
    if (videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: false,
        });
        hls.loadSource(hlsUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current?.play().catch(e => console.error("Video play failed", e));
        });

        return () => {
          hls.destroy();
        };
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = hlsUrl;
      }
    }
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#070b0a] flex flex-col items-center justify-center px-6">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="w-full h-full object-cover opacity-60"
          muted
          loop
          playsInline
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b0a] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b0a] via-transparent to-transparent opacity-80" />
      </div>

      {/* Grid System */}
      <div className="absolute inset-0 z-10 pointer-events-none hidden md:block">
        <div className="h-full w-[1px] bg-white/10 absolute left-1/4" />
        <div className="h-full w-[1px] bg-white/10 absolute left-1/2" />
        <div className="h-full w-[1px] bg-white/10 absolute left-3/4" />
      </div>

      {/* Central Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 pointer-events-none w-full max-w-4xl h-64 overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_f)">
            <ellipse cx="400" cy="0" rx="300" ry="80" fill="#0d9488" fillOpacity="0.4" />
            <ellipse cx="400" cy="0" rx="150" ry="40" fill="#2dd4bf" fillOpacity="0.3" />
          </g>
          <defs>
            <filter id="filter0_f" x="0" y="-105" width="800" height="210" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="25" result="blur" />
            </filter>
          </defs>
        </svg>
      </div>

      {/* Hero Content */}
      <div className="relative z-20 flex flex-col items-center text-center max-w-4xl">
        <span className="text-[#5ed29c] font-plus-jakarta font-bold text-[11px] uppercase tracking-[0.2em] mb-4">
          Career-Ready Curriculum
        </span>

        <h1 className="text-white font-inter font-extrabold text-4xl md:text-[72px] leading-[1.1] tracking-tight uppercase mb-6">
          LAUNCH YOUR CODING <br className="hidden md:block" /> CAREER<span className="text-[#5ed29c]">.</span>
        </h1>

        <p className="text-white/70 font-inter text-sm md:text-base max-w-[512px] mb-10 leading-relaxed">
          Master in-demand coding skills with our immersive, gamified platform. Build real-world projects and launch your career in tech.
        </p>

        <button className="group bg-[#5ed29c] text-[#070b0a] font-inter font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-full flex items-center gap-3 hover:bg-white transition-all duration-300">
          Get Started
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
}
