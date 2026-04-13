'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { OnboardingModal } from '@/components/dashboard/onboarding';
import Image from 'next/image';

export function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = authClient.useSession();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl shadow-[var(--header-shadow)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[var(--brand-gradient)] rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
            </div>
            <span className="text-xl font-black bg-[var(--brand-gradient)] bg-clip-text text-transparent font-headline">CodeQuest</span>
          </div>
          
          <div className="hidden md:flex gap-8 items-center">
            <nav className="hidden md:flex gap-6">
              <a href="#" className="text-primary font-extrabold font-headline text-sm tracking-tight hover:scale-105 transition-transform duration-200">Home</a>
              <a href="#features" className="text-on-surface font-medium font-headline text-sm tracking-tight hover:scale-105 transition-transform duration-200">Quests</a>
              <a href="#faq" className="text-on-surface font-medium font-headline text-sm tracking-tight hover:scale-105 transition-transform duration-200">FAQ</a>
              <a href="#mission" className="text-on-surface font-medium font-headline text-sm tracking-tight hover:scale-105 transition-transform duration-200">About Nepal Mission</a>
            </nav>
            <div className="flex items-center gap-4">
              {session ? (
                <Link href="/dashboard">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg font-headline"
                  >
                    Dashboard
                  </motion.button>
                </Link>
              ) : (
                <>
                  <Link href="/signin">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2.5 rounded-full text-primary font-bold text-sm hover:bg-primary/5 transition-colors font-headline"
                    >
                      Sign In
                    </motion.button>
                  </Link>
                  <Link href="/signup">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg font-headline"
                    >
                      Start Your Quest
                    </motion.button>
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(true)}>
              <span className="material-symbols-outlined text-primary text-3xl">menu</span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center gap-8"
          >
            <button 
              className="absolute top-6 right-6 text-on-surface p-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
            <a href="#" className="text-on-surface text-2xl font-bold font-headline hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Home</a>
            <a href="#features" className="text-on-surface text-2xl font-bold font-headline hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Quests</a>
            <a href="#faq" className="text-on-surface text-2xl font-bold font-headline hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>FAQ</a>
            <a href="#mission" className="text-on-surface text-2xl font-bold font-headline hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>About Nepal Mission</a>
            
            <div className="flex flex-col items-center gap-4 mt-8">
              {session ? (
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <button className="bg-gradient-to-br from-primary to-primary-container text-white font-bold text-lg px-12 py-4 rounded-full font-headline">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/signin" onClick={() => setIsMenuOpen(false)}>
                    <button className="text-primary font-bold text-lg px-12 py-4 rounded-full font-headline">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    <button className="bg-gradient-to-br from-primary to-primary-container text-white font-bold text-lg px-12 py-4 rounded-full font-headline">
                      Start Your Quest
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleGetStarted = () => {
    if (session) {
      const onboardingData = localStorage.getItem('onboarding_data');
      if (onboardingData) {
        router.push('/dashboard');
      } else {
        setShowOnboarding(true);
      }
    } else {
      setShowOnboarding(true);
    }
  };

  return (
    <section className="relative px-6 py-12 md:py-24 max-w-7xl mx-auto pt-32">
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="lg:col-span-6 space-y-8 relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high text-primary font-bold text-sm font-headline">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            Nepal&apos;s Premiere Coding Platform for Kids
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-on-surface leading-[1.1] tracking-tight font-headline">
            Your Coding <span className="bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">Adventure</span> Starts Here
          </h1>
          
          <p className="text-lg md:text-xl text-on-surface-variant max-w-xl font-medium leading-relaxed">
            Join thousands of young explorers in Nepal learning to build games, apps, and the future. Free, fun, and designed for heroes like you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <motion.button 
              onClick={handleGetStarted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group px-8 py-4 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-bold text-lg shadow-xl flex items-center justify-center gap-3 font-headline"
            >
              Start Your Quest
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">rocket_launch</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full bg-surface-container-highest text-on-surface font-bold text-lg hover:bg-surface-variant transition-all font-headline"
            >
              View Curriculum
            </motion.button>
          </div>
          
          <div className="flex items-center gap-6 pt-8">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-4 border-background bg-surface-container-highest overflow-hidden relative">
                <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLl4podet2mNSsnmJSnCCguNGvZjjS17UnTtrPv4gBpKx_bKNtHWsX8Orkg7dguiCR3239Odd50J7T9GsCwPkW7BkEYV3BvIpAYAq0HAFcJ-8xuDAax2nRUqZ2P29MOksJaL9rstSmWeOKv2BClDLrbPXuX65NREm7JKOLAwTWrYrApPgvdNzn_6z_Q6MJz_LdYvajxOefYfikuThTsvb8KCx7N13IcvW2XIrDETt-bT5y3NVMXCAAWYvCE-kWlFavsbr9NULVqfA" alt="Student" fill sizes="40px" className="object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="w-10 h-10 rounded-full border-4 border-background bg-surface-container-highest overflow-hidden relative">
                <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCfvEyfOj-TxQfaG6S2EL8c3nOkK3Hckx0_fv-CIptt6xzKxUUu97M7dVi-QuMpzjxsv1pJpCj3__coArIHxWCVBM1VGewj2zEd1fT2xqsnrUZ-PJY48d9RmNE0UEhX5QmL_ZTvWk66fWaZ2g1DHTFTVHv4IoiWj_4bIPo2e8KMGaSDDe62LzVk5PDLUQcHQdRr1VoKYrFMOscNQHzr03y_mmMQaZsdXtD58KGAgK_1crkNenzpObEMF8xLytHla8ftKbZmol0tB4" alt="Student" fill sizes="40px" className="object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="w-10 h-10 rounded-full border-4 border-background bg-surface-container-highest overflow-hidden relative">
                <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWo02XFwFshrCwj6tJVtRk0Wx4MRCNBhcIZwBYfSp2aIbTlfCmqJyvDzTRCRacRE4FutnFluYqHrrnIp33_xzCLY_-M4IL7CdQzetYiQg1XsqxAiyN4KcoDabiDydKONAm_SWRBlVidzjHQWkDyx-p3w0RtzCklUqZvos59mvHNSpFNuq3Yw9IvxGfJDrIue6hQ6IqKdXt8FjmG_Jjv5WFYdtwPPjB4Vth0Ns0SIUrjUJ4BLRsGv-a3qaLwE1mf5q8nIJBWfmUhoQ" alt="Student" fill sizes="40px" className="object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
            <p className="text-sm font-semibold text-on-surface-variant"><span className="text-primary">5,000+</span> Kids coding in Nepal</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
          className="lg:col-span-6 relative"
        >
          {/* Decorative Elements */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-tertiary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          
          {/* Main Hero Image */}
          <div className="relative bg-surface-container-low rounded-xl overflow-hidden border-8 border-surface shadow-2xl transform lg:rotate-3 hover:rotate-0 transition-transform duration-700 h-[500px] w-full">
            <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvq9XhQYUHP1rAHlJwvMw-aB3YwyIBG0ghDD_dFE-srhrAC-GbPKf90g6E7Q_GHWJbj6KWxHa6mbf6ZxGTpuQcNmcUd5swHm5OsbWPxNjlLjcta1i5nZNbtRfEnpH6BIZ84Jfogpf-TrFgIqAsHA22h1CYrHDX2bU0qV7kr9PpGDWVqaX9oz-BIpX4IaA95zAWhhgEdPf4xxu7Fm1k02Lij1ividx3n0SUq42YTZmhFHbeHG46-OUeegBZ3EiIuShSkcNtpQ8YWI8" alt="Kids coding" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" referrerPolicy="no-referrer" />
            
            {/* Floating Glass Card */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute bottom-6 left-6 right-6 p-6 bg-surface-container-lowest/80 backdrop-blur-md rounded-lg shadow-xl flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
              </div>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest font-headline">Recent Achievement</p>
                <p className="text-on-surface font-extrabold font-headline">Quest: Logic Mountain Cleared!</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {showOnboarding && (
        <OnboardingModal onComplete={() => {
          setShowOnboarding(false);
          router.push('/signup');
        }} />
      )}
    </section>
  );
}
