"use client" 

import * as React from "react"
import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Mail, Lock, LogIn, Github, Chrome, ArrowRight } from "lucide-react";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const SignIn1 = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setIsLoading(true);
    
    const { data, error: authError } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/",
    });

    if (authError) {
      setError(authError.message || "Failed to sign in.");
      setIsLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden w-full font-body selection:bg-primary-container/30">
      {/* Background Decor */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-surface-variant/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -right-48 w-[32rem] h-[32rem] bg-tertiary-container/20 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="relative z-10 w-full max-w-md p-8 md:p-12 flex flex-col items-center bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-2xl"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-12 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-white text-xl">terminal</span>
          </div>
          <span className="text-on-surface font-headline font-black tracking-tighter text-2xl">CodeQuest</span>
        </Link>
        
        <div className="w-full text-center mb-10">
          <h2 className="text-3xl font-headline font-extrabold text-on-surface mb-3 tracking-tight">
            Welcome back
          </h2>
          <p className="text-on-surface-variant text-sm font-medium">
            Enter your credentials to access your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignIn} className="flex flex-col w-full gap-5">
          <div className="flex flex-col gap-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                <Mail size={18} />
              </div>
              <input
                placeholder="Email address"
                type="email"
                value={email}
                className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-on-surface placeholder-on-surface-variant/50 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                <Lock size={18} />
              </div>
              <input
                placeholder="Secret Password"
                type="password"
                value={password}
                className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-on-surface placeholder-on-surface-variant/50 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="text-sm text-error font-medium px-1">{error}</div>
            )}
          </div>

          <div className="flex justify-end">
            <a href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors font-bold">Forgot password?</a>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full group bg-surface border-2 border-primary text-primary font-headline font-extrabold text-lg py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-sm"
          >
            {isLoading ? "Signing in..." : "Sign In"}
            {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </motion.button>

          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/20"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="bg-surface-container-lowest px-4 text-on-surface-variant">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button type="button" className="py-3 px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-on-surface text-sm font-bold flex items-center justify-center gap-3 hover:bg-surface-container transition-colors">
              <Chrome className="w-4 h-4" />
              Google
            </button>
            <button type="button" className="py-3 px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-on-surface text-sm font-bold flex items-center justify-center gap-3 hover:bg-surface-container transition-colors">
              <Github className="w-4 h-4" />
              GitHub
            </button>
          </div>

          <div className="w-full text-center mt-8">
            <span className="text-sm text-on-surface-variant font-medium">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-primary font-bold hover:underline transition-all"
              >
                Sign up
              </Link>
            </span>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
 
export { SignIn1 };
