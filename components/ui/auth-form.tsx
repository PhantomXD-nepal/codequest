"use client"
import * as React from "react"
import { motion } from "motion/react";
import { Mail, Lock, ArrowRight, User, School, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function AuthForm({ isSignUp = false }: { isSignUp?: boolean }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("student");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error: authError } = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/",
        });
        if (authError) throw authError;
      } else {
        const { error: authError } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/",
        });
        if (authError) throw authError;
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message || "An error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-surface-container-low rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(46,42,80,0.08)]">
      {/* Branding & Visual Side */}
      <section className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary to-primary-container relative overflow-hidden">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary font-bold">auto_awesome</span>
            </div>
            <span className="text-2xl font-black text-white tracking-tight">Radiant Explorer</span>
          </div>
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">Start your coding <span className="text-secondary-container">adventure</span> today.</h1>
          <p className="text-on-primary text-lg max-w-md opacity-90 leading-relaxed">Join thousands of young explorers in Nepal and beyond, leveling up their skills through play and magic.</p>
        </div>
        <div className="z-10">
          <div className="flex -space-x-3 mb-4">
            <Image className="w-12 h-12 rounded-full border-4 border-primary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQp2O38qcwaFu-rGTYsENBjsbJeFsvfwisXcPl6ly19Y6pZVKtH7Hiw0Kw9mmbaziz7ETn4VeulwVs2rYVJD9qF9BFfkGytaGoSHXc6iPwegUgspsf7vhbG9EAgiRkCx76d8vxLjqT1kyasC7jKiNzNHSKRSKsKi0McK0iwCsp4iJkdSmwzWYvRm5B8xee9mAfQ51J2f7ZOs7FVC26l4GueC5UWnoRFprjQuWNdTZB2t9Nh7OfaDbo8kHt_1boNlyEgk6l3Z1JvdI" alt="Student" referrerPolicy="no-referrer" width={48} height={48} />
            <Image className="w-12 h-12 rounded-full border-4 border-primary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAT3KlHgyIOT3gyjSV0OtjhP_oYwN4rcZyhOUeSgS7sl1d7p1NM8HbFrKB_0RIScdYKZYEJ3sPyGYeQcE2W52UeEkp5W0zS5n60JtWRUxG6MlGCOe3e_Qcem073ARRnykdH8b42FXEUwIwJPzoKczGV2M9rQQfwWdaNgL9q51X6k13BD3ppswVtMV1FIg5y3Pvwus7SlE9Dl1fpTxM0afeH8SWR6Mj24xGgAkkOoCbAPXeWIslNfZ3_rNqDN3RHejC5jK95DjLm-5U" alt="Student" referrerPolicy="no-referrer" width={48} height={48} />
            <Image className="w-12 h-12 rounded-full border-4 border-primary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm1gBQ5UNpCNLZSj0Jo_CaFTHD8J57flqBReQNfhywuqlFHLZ3EWlrgDbgo1RBx3L1l7Bg0J8ZETssSOq_TkFU6ndOvEDtPDjDd7tTBVz98VSQDeSLIfiaAodJ481a9JcnlfZJHLZ-X0nqbnqMCeftAbZqryMF9C4brt0Vk4_utdPRWFSxZBkeYoGcuE_L51Ym7zc57CtIpnQLNEQTOSzf9hN-p88S6NeHywgURDABXWK5dCRgxLwibcDVWmyxqkJP2dklMkM5Za0" alt="Student" referrerPolicy="no-referrer" width={48} height={48} />
          </div>
          <p className="text-white font-semibold">Join 5,000+ Students this week</p>
        </div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
          <span className="material-symbols-outlined text-[20rem] text-white select-none">code_blocks</span>
        </div>
      </section>

      {/* Form Side */}
      <section className="bg-surface-container-lowest p-8 md:p-16 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          {/* Role Toggle */}
          <div className="flex p-1 bg-surface-container-high rounded-full mb-10 relative">
            <button 
              onClick={() => setRole("student")}
              className={`flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${role === "student" ? "bg-white text-primary shadow-sm z-10" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              <School className="w-4 h-4" />
              I&apos;m a Student
            </button>
            <button 
              onClick={() => setRole("parent")}
              className={`flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${role === "parent" ? "bg-white text-primary shadow-sm z-10" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              <Users className="w-4 h-4" />
              I&apos;m a Parent
            </button>
          </div>
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-on-surface mb-2 tracking-tight">{isSignUp ? "Create Account" : "Welcome Back!"}</h2>
            <p className="text-on-surface-variant font-medium">Please enter your details to continue your quest.</p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-6">
            {isSignUp && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors w-5 h-5" />
                  <input className="w-full pl-12 pr-12 py-4 bg-surface-container-high border-none rounded-2xl focus:ring-2 focus:ring-primary/40 transition-all text-on-surface font-medium placeholder:text-outline/60" placeholder="Your Name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors w-5 h-5" />
                <input className="w-full pl-12 pr-12 py-4 bg-surface-container-high border-none rounded-2xl focus:ring-2 focus:ring-primary/40 transition-all text-on-surface font-medium placeholder:text-outline/60" placeholder="explorer@radiant.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors w-5 h-5" />
                <input className="w-full pl-12 pr-12 py-4 bg-surface-container-high border-none rounded-2xl focus:ring-2 focus:ring-primary/40 transition-all text-on-surface font-medium placeholder:text-outline/60" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
            
            {error && <p className="text-error text-sm font-bold">{error}</p>}

            <button disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white font-black text-lg rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2" type="submit">
              {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
          
          <p className="mt-10 text-center font-semibold text-on-surface-variant">
            {isSignUp ? "Already have an account?" : "New to the journey?"}
            <Link className="text-primary font-black hover:underline ml-1" href={isSignUp ? "/signin" : "/signup"}>
              {isSignUp ? "Sign In" : "Create an Account"}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
