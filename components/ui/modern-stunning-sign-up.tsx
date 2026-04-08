"use client" 

import * as React from "react"
import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Mail, Lock, User, Github, Chrome, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const SignUp1 = () => {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    tl.fromTo(cardRef.current, 
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1 }
    );
  }, { scope: containerRef });
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setIsLoading(true);
    
    const { data, error: authError } = await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: "/",
    });

    if (authError) {
      setError(authError.message || "Failed to sign up.");
      setIsLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col items-center justify-center bg-[#070b0a] relative overflow-hidden w-full font-inter selection:bg-[#5ed29c] selection:text-black">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#5ed29c]/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div 
        ref={cardRef}
        className="relative z-10 w-full max-w-md p-8 md:p-12 flex flex-col items-center"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-12 group">
          <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center group-hover:bg-[#5ed29c] transition-colors duration-300">
            <span className="text-black font-bold text-2xl">C</span>
          </div>
          <span className="text-white font-bold tracking-tighter text-2xl">CODEQUEST</span>
        </Link>
        
        <div className="w-full text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Create account
          </h2>
          <p className="text-white/50 text-sm">
            Join the community of developers
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp} className="flex flex-col w-full gap-5">
          <div className="flex flex-col gap-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#5ed29c] transition-colors">
                <User size={18} />
              </div>
              <input
                placeholder="Full name"
                type="text"
                value={name}
                className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#5ed29c]/50 focus:bg-white/[0.05] transition-all"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#5ed29c] transition-colors">
                <Mail size={18} />
              </div>
              <input
                placeholder="Email address"
                type="email"
                value={email}
                className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#5ed29c]/50 focus:bg-white/[0.05] transition-all"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#5ed29c] transition-colors">
                <Lock size={18} />
              </div>
              <input
                placeholder="Password"
                type="password"
                value={password}
                className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#5ed29c]/50 focus:bg-white/[0.05] transition-all"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="text-sm text-red-400 px-1">{error}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full group bg-[#5ed29c] text-[#070b0a] font-bold text-sm uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? "Creating..." : "Sign Up"}
            {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
          </button>

          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-[#070b0a] px-4 text-white/30">Or sign up with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button type="button" className="py-3 px-4 bg-white/[0.03] border border-white/10 rounded-xl text-white text-xs font-medium flex items-center justify-center gap-3 hover:bg-white/[0.08] transition-colors">
              <Chrome className="w-4 h-4" />
              Google
            </button>
            <button type="button" className="py-3 px-4 bg-white/[0.03] border border-white/10 rounded-xl text-white text-xs font-medium flex items-center justify-center gap-3 hover:bg-white/[0.08] transition-colors">
              <Github className="w-4 h-4" />
              GitHub
            </button>
          </div>

          <div className="w-full text-center mt-8">
            <span className="text-sm text-white/50">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-white font-medium hover:text-[#5ed29c] transition-colors"
              >
                Sign in
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
 
export { SignUp1 };
