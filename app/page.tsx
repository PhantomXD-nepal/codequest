"use client";

import { LandingHeader, Hero } from "@/components/landing/hero";
import FAQSection from "@/components/landing/faq";
import Link from "next/link";
import { motion } from "motion/react";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";

export default function Home() {
  const { data: session } = authClient.useSession();

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 200, damping: 20 } }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col overflow-x-hidden">
      <LandingHeader />
      
      <main className="flex-1">
        <Hero />

        {/* Features Bento Grid */}
        <section id="features" className="py-24 px-6 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="mb-16 text-center"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-4 font-headline">Craft Your Superpowers</h2>
              <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">Learning to code shouldn&apos;t feel like school. It should feel like a game.</p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {/* Game Based Card */}
              <motion.div variants={fadeUp} className="md:col-span-2 bg-surface-container-highest rounded-xl p-8 flex flex-col md:flex-row gap-8 items-center overflow-hidden group">
                <div className="flex-1 space-y-4">
                  <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>videogame_asset</span>
                  </div>
                  <h3 className="text-2xl font-bold font-headline">Game-Based Learning</h3>
                  <p className="text-on-surface-variant leading-relaxed">Turn loops into magic spells and variables into inventory slots. Our quests are designed by game experts to keep you engaged and excited.</p>
                </div>
                <div className="flex-1 transform group-hover:scale-110 transition-transform duration-500 relative h-64 md:h-auto w-full">
                  <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_teGu-4109fzKiUyT0KjeTu016-jlcwGWnB5RZJT5k_XOqF2D6K4Md3qyFUJbLEA_wgNlWbRohv9XVO7LAEx7NEDqcTykYRbPloKvH7etAflj_DUPCsZ3EHlIuqVZZpbza-NesS1tS5t7HK99TMy_Znaawt1TAbkJ4qm-UQrpwO2AxVXfXFxYVQGKDhIVkktWr4xaf3Ke6ADR0kv0ziT4m7GUml0XlD0xP73YLbdCysTtNeVokA8cZNf3fpeoCuSCzmO2gGvSJ60" alt="Gaming UI" fill sizes="(max-width: 768px) 100vw, 33vw" className="rounded-lg shadow-lg object-cover" referrerPolicy="no-referrer" />
                </div>
              </motion.div>

              {/* Free Card */}
              <motion.div variants={fadeUp} className="bg-gradient-to-br from-tertiary to-tertiary-dim rounded-xl p-8 text-white flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
                  </div>
                  <h3 className="text-2xl font-bold font-headline">100% Free Forever</h3>
                  <p className="text-white/80 leading-relaxed">We believe knowledge belongs to everyone. No subscriptions, no hidden fees—just pure learning for every child in Nepal.</p>
                </div>
                <div className="mt-8 flex justify-end">
                  <span className="material-symbols-outlined text-6xl opacity-30">redeem</span>
                </div>
              </motion.div>

              {/* Community Card */}
              <motion.div variants={fadeUp} className="bg-surface-container-lowest rounded-xl p-8 border-4 border-surface-container-highest flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-secondary-container rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-secondary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                  </div>
                  <h3 className="text-2xl font-bold text-on-surface font-headline">Local Community</h3>
                  <p className="text-on-surface-variant leading-relaxed">Connect with fellow coders from Kathmandu to Pokhara. Join local clubs, share projects, and win national challenges.</p>
                </div>
                <div className="mt-8 overflow-hidden rounded-lg relative h-48 w-full">
                  <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpOqel0tgyMsn8ZWMCrnrnmB1_Z7HJhxVX3fCxu0bPZn0U2y555Nm6jqKmkReT6dPeiqQ1By5q9mSSpNum8uFbZyBaHk-VT1MNQYoL_nPLWbqvP3pcQCMbby2_qV0EmtcH3V9ma7695S2jgMG3W_0HdJBBCDmf0inR_Q45pYpUirzXuSx5NgY-KNbSg2c3U4lSLrm8iZ_1RXrsIVi9w7T7nx1nIPGdk5vV-dhOow4Fz3PaHEkgm0vg2-wpcsPYsuM4HkQ_H6aeD9o" alt="Group of kids" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
                </div>
              </motion.div>

              {/* Curriculum Card */}
              <motion.div variants={fadeUp} className="md:col-span-2 bg-surface-container-highest rounded-xl p-8 flex flex-col-reverse md:flex-row gap-8 items-center">
                <div className="flex-1 w-full grid grid-cols-2 gap-4">
                  <div className="bg-surface p-4 rounded-lg text-center shadow-sm">
                    <p className="text-2xl font-black text-primary font-headline">Python</p>
                  </div>
                  <div className="bg-surface p-4 rounded-lg text-center shadow-sm">
                    <p className="text-2xl font-black text-tertiary font-headline">Scratch</p>
                  </div>
                  <div className="bg-surface p-4 rounded-lg text-center shadow-sm">
                    <p className="text-2xl font-black text-secondary font-headline">Web Dev</p>
                  </div>
                  <div className="bg-surface p-4 rounded-lg text-center shadow-sm">
                    <p className="text-2xl font-black text-on-surface font-headline">AI Art</p>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <h3 className="text-2xl font-bold font-headline">World-Class Curriculum</h3>
                  <p className="text-on-surface-variant leading-relaxed">From visual block coding to professional Python and Web Development. We grow with you, step by step, from age 8 to 18.</p>
                  <button className="flex items-center gap-2 text-primary font-bold hover:underline">
                    Explore Path
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Mission Statement */}
        <section id="mission" className="py-24 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="relative bg-surface rounded-xl p-8 md:p-16 border-2 border-outline-variant/10"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[12rem]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </div>
              <div className="max-w-3xl relative z-10">
                <h2 className="text-primary font-black uppercase tracking-[0.2em] text-sm mb-6 font-headline">Our Mission</h2>
                <h3 className="text-3xl md:text-5xl font-extrabold text-on-surface leading-tight mb-8 font-headline">
                  Empowering Nepal&apos;s Next Generation of Digital Creators
                </h3>
                <div className="space-y-6 text-xl text-on-surface-variant leading-relaxed font-medium">
                  <p>
                    CodeQuest was born from a simple belief: <span className="text-on-surface font-bold">Every child in Nepal deserves to speak the language of the future.</span>
                  </p>
                  <p>
                    Whether they live in the heart of Kathmandu or in a remote Himalayan village, our platform provides the tools, the community, and the guidance to turn curiosity into creation. We aren&apos;t just teaching code; we are teaching problem-solving, resilience, and digital literacy.
                  </p>
                </div>
                <div className="flex flex-wrap gap-12 mt-12">
                  <div>
                    <p className="text-4xl font-black text-primary font-headline">100+</p>
                    <p className="text-sm font-bold text-on-surface-variant">Schools Reached</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black text-tertiary font-headline">12</p>
                    <p className="text-sm font-bold text-on-surface-variant">Unique Quests</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black text-secondary font-headline">∞</p>
                    <p className="text-sm font-bold text-on-surface-variant">Possibilities</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <FAQSection />

        {/* CTA Section */}
        <section className="py-24 px-6">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="max-w-5xl mx-auto bg-gradient-to-r from-primary-dim to-primary rounded-xl p-12 text-center text-white relative overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight font-headline">Ready to join the quest?</h2>
              <p className="text-xl text-on-primary/80 max-w-xl mx-auto font-medium">
                Create your free account today and start your first coding adventure in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link href={session ? "/dashboard" : "/signup"}>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-5 rounded-full bg-white text-primary font-black text-xl shadow-xl font-headline"
                  >
                    Start Your Quest
                  </motion.button>
                </Link>
                <p className="text-sm font-bold text-on-primary/60">No credit card required. Ever.</p>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="bg-surface-container-low py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">terminal</span>
                </div>
                <span className="text-xl font-black text-on-surface font-headline">CodeQuest</span>
              </div>
              <p className="text-on-surface-variant mb-6 font-medium">Building a brighter digital future for Nepal, one quest at a time.</p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary cursor-pointer hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined">public</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary cursor-pointer hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined">chat</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-on-surface mb-6 font-headline">Platform</h4>
              <ul className="space-y-4 text-on-surface-variant font-medium">
                <li><a href="#" className="hover:text-primary transition-colors">Quests</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Curriculum</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Challenges</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-on-surface mb-6 font-headline">Community</h4>
              <ul className="space-y-4 text-on-surface-variant font-medium">
                <li><a href="#" className="hover:text-primary transition-colors">Hall of Fame</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Local Clubs</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Events</a></li>
              </ul>
            </div>
            
            <div className="col-span-2">
              <h4 className="font-bold text-on-surface mb-6 font-headline">Stay Updated</h4>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="flex-1 bg-surface-container-lowest border-none rounded-full px-6 focus:ring-2 focus:ring-primary/20"
                />
                <button type="submit" className="p-3 rounded-full bg-primary text-white hover:bg-primary-dim transition-colors">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-bold text-on-surface-variant">
            <p>© {new Date().getFullYear()} CodeQuest Nepal. All Rights Reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Quest</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
