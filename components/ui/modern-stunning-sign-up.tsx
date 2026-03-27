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
  const router = useRouter();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<HTMLDivElement[]>([]);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    tl.fromTo(cardRef.current, 
      { opacity: 0, x: 50, scale: 0.95 },
      { opacity: 1, x: 0, scale: 1, duration: 1 }
    );

    tl.fromTo(elementsRef.current,
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.1 },
      "-=0.4"
    );
  }, { scope: containerRef });
  
  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    
    const { data, error: authError } = await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: "/",
    });

    if (authError) {
      setError(authError.message || "Failed to sign up.");
    } else {
      router.push("/");
    }
  };
 
  const addToRefs = (el: any) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col items-center justify-center mc-container relative overflow-hidden w-full font-pixel">
      {/* Centered glass card */}
      <div 
        ref={cardRef}
        className="relative z-10 w-full max-w-sm mc-card p-8 flex flex-col items-center"
      >
        {/* Decorative elements */}
        <div className="absolute -top-10 -left-10 w-20 h-20 opacity-20 pointer-events-none">
          <Image 
            src="https://picsum.photos/seed/mc3/100/100" 
            alt="deco" 
            width={100}
            height={100}
            className="mc-border"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute -bottom-10 -right-10 w-20 h-20 opacity-20 pointer-events-none">
          <Image 
            src="https://picsum.photos/seed/mc4/100/100" 
            alt="deco" 
            width={100}
            height={100}
            className="mc-border"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Logo */}
        <div ref={addToRefs} className="flex items-center justify-center w-14 h-14 mc-border bg-zinc-700 mb-6">
          <User className="text-white w-7 h-7" />
        </div>
        
        {/* Title */}
        <h2 ref={addToRefs} className="text-xl font-bold text-white mb-2 text-center mc-text-shadow">
          CREATE ACCOUNT
        </h2>
        <p ref={addToRefs} className="text-zinc-400 text-[10px] mb-8 text-center uppercase">
          Join the community
        </p>

        {/* Form */}
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            <div ref={addToRefs} className="relative group">
              <input
                placeholder="FULL NAME"
                type="text"
                value={name}
                className="w-full px-5 py-3 bg-zinc-800 border-4 border-black text-white placeholder-zinc-500 text-[10px] focus:outline-none focus:border-yellow-400 transition-all"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div ref={addToRefs} className="relative group">
              <input
                placeholder="EMAIL"
                type="email"
                value={email}
                className="w-full px-5 py-3 bg-zinc-800 border-4 border-black text-white placeholder-zinc-500 text-[10px] focus:outline-none focus:border-yellow-400 transition-all"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div ref={addToRefs} className="relative group">
              <input
                placeholder="PASSWORD"
                type="password"
                value={password}
                className="w-full px-5 py-3 bg-zinc-800 border-4 border-black text-white placeholder-zinc-500 text-[10px] focus:outline-none focus:border-yellow-400 transition-all"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="text-[8px] text-red-500 px-2 mt-1 mc-text-shadow">{error}</div>
            )}
          </div>

          <div ref={addToRefs} className="pt-2">
            <button
              onClick={handleSignUp}
              className="w-full mc-button mc-button-green py-4 text-white text-[12px] mc-text-shadow flex items-center justify-center gap-2"
            >
              SIGN UP
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div ref={addToRefs} className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-4 border-black/20"></div>
            </div>
            <div className="relative flex justify-center text-[8px] uppercase">
              <span className="bg-[#c6c6c6] px-2 text-zinc-600">Or sign up with</span>
            </div>
          </div>

          <div ref={addToRefs} className="grid grid-cols-2 gap-3">
            <button className="mc-button py-3 text-white text-[10px] mc-text-shadow flex items-center justify-center gap-2">
              <Chrome className="w-4 h-4" />
              GOOGLE
            </button>
            <button className="mc-button py-3 text-white text-[10px] mc-text-shadow flex items-center justify-center gap-2">
              <Github className="w-4 h-4" />
              GITHUB
            </button>
          </div>

          <div ref={addToRefs} className="w-full text-center mt-4">
            <span className="text-[8px] text-zinc-600">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-black font-bold hover:underline"
              >
                SIGN IN
              </Link>
            </span>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div ref={addToRefs} className="relative z-10 mt-12 flex flex-col items-center text-center">
        <p className="text-zinc-500 text-sm mb-4">
          Trusted by <span className="font-medium text-white">50,000+</span> developers worldwide.
        </p>
        <div className="flex -space-x-3">
          {[
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop"
          ].map((src, i) => (
            <div key={i} className="relative w-10 h-10 rounded-full border-2 border-[#0a0a0a] overflow-hidden">
              <Image
                src={src}
                alt="user"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
 
export { SignUp1 };
