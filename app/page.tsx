'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { 
  ArrowRight, Server, Layers, Cpu, Activity, Award, Flame, 
  GitBranch, GraduationCap, Briefcase, GitCommit, CheckCircle,
  ExternalLink, BarChart3, Database, Globe
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="relative isolate overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-sans min-h-screen flex flex-col justify-center text-zinc-900 dark:text-white transition-colors duration-300 bg-noise bg-grid-pattern">
      
      {/* Drifting Background Radial Blur Blobs */}
      <div className="absolute top-[10%] left-[10%] w-[32rem] h-[32rem] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl pointer-events-none animate-drift-1 -z-10" />
      <div className="absolute top-[35%] right-[5%] w-[38rem] h-[38rem] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none animate-drift-2 -z-10" />
      <div className="absolute bottom-[10%] left-[15%] w-[30rem] h-[30rem] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none animate-drift-1 -z-10" />

      {/* Decorative Top Glow Mesh */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none" aria-hidden="true">
        <div
          className="relative left-[calc(50%-18rem)] aspect-1155/678 w-[40rem] -translate-x-1/2 rotate-[25deg] bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 opacity-20 dark:opacity-10 sm:left-[calc(50%-35rem)] sm:w-[80rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 flex flex-col justify-center w-full relative z-10 space-y-16 animate-fade-up">
        
        {/* HERO SECTION CONTAINER */}
        <div className="mx-auto max-w-3xl text-center space-y-6 relative">
          
          {/* ==========================================
             Floating Tech Stack Capsules
             ========================================== */}
          
          {/* React (Top-Left) */}
          <div className="absolute -top-10 -left-6 md:-left-24 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/80 backdrop-blur-md shadow-md animate-float-slow select-none">
            <svg className="h-3.5 w-3.5 text-cyan-400 animate-[spin_10s_linear_infinite]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 9.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zm0-7.5c-5.8 0-10.5 1.57-10.5 3.5s4.7 3.5 10.5 3.5 10.5-1.57 10.5-3.5-4.7-3.5-10.5-3.5zm0 5c-4.14 0-7.5-.67-7.5-1.5s3.36-1.5 7.5-1.5 7.5.67 7.5 1.5-3.36 1.5-7.5 1.5zm0 9c-5.8 0-10.5 1.57-10.5 3.5s4.7 3.5 10.5 3.5 10.5-1.57 10.5-3.5-4.7-3.5-10.5-3.5zm0 5c-4.14 0-7.5-.67-7.5-1.5s3.36-1.5 7.5-1.5 7.5.67 7.5 1.5-3.36 1.5-7.5 1.5z"/>
            </svg>
            <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-500 dark:text-zinc-400">React</span>
          </div>

          {/* Next.js (Top-Right) */}
          <div className="absolute -top-6 -right-6 md:-right-24 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/80 backdrop-blur-md shadow-md animate-float-medium select-none">
            <span className="text-[10px] font-bold font-sans text-zinc-950 dark:text-white">▲</span>
            <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-500 dark:text-zinc-400">Next.js</span>
          </div>

          {/* TypeScript (Left-Center) */}
          <div className="absolute top-[40%] -left-12 md:-left-36 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/80 backdrop-blur-md shadow-md animate-float-fast select-none">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#3178c6] text-[8px] font-extrabold text-white">TS</span>
            <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-500 dark:text-zinc-400">TypeScript</span>
          </div>

          {/* PostgreSQL (Right-Center) */}
          <div className="absolute top-[45%] -right-12 md:-right-36 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/80 backdrop-blur-md shadow-md animate-float-slow select-none">
            <Database className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-500 dark:text-zinc-400">PostgreSQL</span>
          </div>

          {/* Docker (Bottom-Left) */}
          <div className="absolute -bottom-6 -left-6 md:-left-24 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/80 backdrop-blur-md shadow-md animate-float-medium select-none">
            <svg className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.983 11.078h2.119c.51 0 .922-.411.922-.921V8.038c0-.51-.413-.922-.922-.922h-2.119c-.51 0-.922.412-.922.922v2.119c0 .51.412.921.922.921zm-2.825 0h2.12c.51 0 .922-.411.922-.921V8.038c0-.51-.413-.922-.922-.922h-2.12c-.51 0-.922.412-.922.922v2.119c0 .51.412.921.922.921zm-2.825 0h2.12c.51 0 .922-.411.922-.921V8.038c0-.51-.413-.922-.922-.922h-2.12c-.51 0-.922.412-.922.922v2.119c0 .51.412.921.922.921zm-2.825 0h2.12c.51 0 .922-.411.922-.921V8.038c0-.51-.413-.922-.922-.922h-2.12c-.51 0-.922.412-.922.922v2.119c0 .51.412.921.922.921zm1.412-2.824h2.12c.51 0 .922-.411.922-.921V5.214c0-.51-.413-.922-.922-.922h-2.12c-.51 0-.922.412-.922.922v2.119c0 .51.412.921.922.921zm2.825 0h2.12c.51 0 .922-.411.922-.921V5.214c0-.51-.413-.922-.922-.922h-2.12c-.51 0-.922.412-.922.922v2.119c0 .51.412.921.922.921zm2.825 0h2.119c.51 0 .922-.411.922-.921V5.214c0-.51-.413-.922-.922-.922h-2.119c-.51 0-.922.412-.922.922v2.119c0 .51.412.921.922.921zm-5.65 5.648h2.12c.51 0 .922-.412.922-.922V10.85c0-.51-.413-.922-.922-.922h-2.12c-.51 0-.922.412-.922.922v2.119c0 .51.412.922.922.922zm2.825 0h2.12c.51 0 .922-.412.922-.922V10.85c0-.51-.413-.922-.922-.922h-2.12c-.51 0-.922.412-.922.922v2.119c0 .51.412.922.922.922zM23.99 13.918c-.224-.461-.75-.724-1.28-.667-.533.057-.962.457-1.127.959-.516 1.571-1.463 2.921-2.738 3.901-1.325 1.018-2.973 1.579-4.664 1.579H5.016c-.378 0-.74-.038-1.096-.109.117-.184.275-.348.463-.473.652-.434 1.547-.434 2.199 0 .428.286.953.44 1.493.44H14.19c1.371 0 2.709-.434 3.812-1.246 1.093-.804 1.903-1.921 2.308-3.197.35-.11.666-.312.909-.588.423-.48.599-1.134.48-1.782l-.004-.023c-.11-.595-.515-1.082-1.084-1.3l.004-.01c-.13-.404-.457-.704-.875-.783-.509-.096-1 .184-1.226.652-.07.147-.1.309-.09.47l-.022.012c-.08-.09-.176-.17-.282-.236-.65-.407-1.5-.272-2.002.324-.316.376-.435.88-.328 1.354l-.008.006c-.035-.008-.071-.013-.108-.013H4.51c-.604 0-1.11.458-1.173 1.059C2.261 14.787.96 16.377.96 18.256c0 .484.086.964.254 1.417-.189.141-.334.341-.413.576-.188.556.038 1.168.544 1.467.432.256.97.234 1.382-.058.261-.184.453-.459.539-.777 2.053 1.34 4.542 2.08 7.094 2.08H14.19c2.082 0 4.103-.687 5.733-1.939 1.579-1.212 2.753-2.887 3.394-4.839.297-.13.541-.351.688-.636.27-.52.203-1.15-.172-1.602z"/>
            </svg>
            <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-500 dark:text-zinc-400">Docker</span>
          </div>

          {/* GitHub (Bottom-Right) */}
          <div className="absolute -bottom-10 -right-6 md:-right-24 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/80 backdrop-blur-md shadow-md animate-float-slow select-none">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </span>
            <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-500 dark:text-zinc-400">GitHub</span>
          </div>

          {/* Futuristic Version Badge */}
          <div className="inline-flex items-center gap-x-2.5 rounded-full bg-zinc-100/80 dark:bg-zinc-900/60 px-4 py-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 ring-1 ring-inset ring-zinc-300/30 dark:ring-zinc-800/80 backdrop-blur-md mb-2 shadow-[0_4px_20px_rgba(6,182,212,0.05)]">
            <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></span>
            DevPulse 2.0 Engine Live
          </div>

          {/* SaaS Core Heading */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-600 dark:from-white dark:via-zinc-200 dark:to-zinc-500 bg-clip-text text-transparent leading-[1.1] sm:leading-[1.1] pb-2">
            Build Your Developer <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">Identity in Real Time</span>
          </h1>
          
          {/* Subtitle */}
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-zinc-650 dark:text-zinc-400 max-w-2xl mx-auto font-medium">
            Your code is your story. Instantly transform your dynamic GitHub telemetry, LeetCode milestones, and service deployments into an elegant, recruiter-ready profile built to impress.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 rounded-xl bg-cyan-600 px-7 py-4 text-sm font-extrabold text-white shadow-lg hover:bg-cyan-500 transition-all active:scale-[0.98] shadow-cyan-600/30 cursor-pointer"
              >
                Go to Workspace Dashboard
                <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="w-full sm:w-auto group flex items-center justify-center gap-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 px-7 py-4 text-sm font-extrabold text-white shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] transition-all active:scale-[0.98] cursor-pointer"
                >
                  Create Developer Space
                  <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/portfolio/octocat"
                  className="w-full sm:w-auto flex items-center justify-center rounded-xl bg-zinc-200/50 dark:bg-zinc-900/40 hover:bg-zinc-300 dark:hover:bg-zinc-800 px-7 py-4 text-sm font-bold text-zinc-800 dark:text-zinc-300 border border-zinc-300/40 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all active:scale-[0.98] backdrop-blur-md cursor-pointer hover:shadow-md"
                >
                  Explore Live Demo
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ==========================================
           STATISTICS SHOWCASE BAND
           ========================================== */}
        <div className="mx-auto max-w-4xl w-full pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
            
            <div className="rounded-2xl border border-zinc-200/50 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-900/20 px-4 py-5 backdrop-blur-md shadow-sm transition-all hover:translate-y-[-2px] duration-300 select-none">
              <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">10K+</div>
              <div className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">Connected Devs</div>
            </div>

            <div className="rounded-2xl border border-zinc-200/50 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-900/20 px-4 py-5 backdrop-blur-md shadow-sm transition-all hover:translate-y-[-2px] duration-300 select-none">
              <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">50K+</div>
              <div className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">Portfolio Views</div>
            </div>

            <div className="rounded-2xl border border-zinc-200/50 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-900/20 px-4 py-5 backdrop-blur-md shadow-sm transition-all hover:translate-y-[-2px] duration-300 select-none">
              <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">99.9%</div>
              <div className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">Monitored Uptime</div>
            </div>

            <div className="rounded-2xl border border-zinc-200/50 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-900/20 px-4 py-5 backdrop-blur-md shadow-sm transition-all hover:translate-y-[-2px] duration-300 select-none">
              <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">100K+</div>
              <div className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">GitHub Syncs</div>
            </div>

          </div>
        </div>

        {/* ==========================================
           SAAS DASHBOARD PREVIEW Overhaul
           ========================================== */}
        <div className="mx-auto max-w-5xl w-full pt-4 relative group isolate">
          {/* Radial glow background behind preview */}
          <div className="absolute -inset-1 -z-10 rounded-3xl bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-20 dark:opacity-10 blur-xl transition-all duration-1000 group-hover:opacity-30 dark:group-hover:opacity-15 pointer-events-none" />
          
          <div className="relative rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/40 p-4 sm:p-6 backdrop-blur-md shadow-2xl flex flex-col gap-5 min-h-[380px]">
            
            {/* Fake Dashboard Top Header */}
            <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800 pb-4 px-2 select-none">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Active Engine telemetry console</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-950 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 font-bold">
                  API Sync Status: Active
                </span>
                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20 font-bold">
                  Uptime 100%
                </span>
              </div>
            </div>

            {/* Fake Dashboard Inner Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">
              
              {/* Column 1: Active Workspace & Coding Streak */}
              <div className="flex flex-col gap-4">
                
                {/* Active Workspace */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 p-4 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Active Workspace</span>
                    <Activity className="h-4 w-4 text-cyan-500 animate-pulse" />
                  </div>
                  <div className="text-lg font-extrabold text-zinc-900 dark:text-white leading-tight">devpulse-ai-core</div>
                  <span className="text-[10px] text-zinc-500 font-bold font-mono block">Streaming VS Code log stream</span>
                </div>

                {/* Streak widget */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 p-4 space-y-2.5 shadow-sm flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Coding streak</span>
                    <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-zinc-900 dark:text-white">28</span>
                    <span className="text-[11px] font-bold text-zinc-500 uppercase">Days Consistent</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="w-[85%] h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full" />
                  </div>
                  <span className="text-[9px] text-emerald-500 font-bold block mt-1">🟢 98% Consistency rating (Outstanding)</span>
                </div>

              </div>

              {/* Column 2: Heatmap & Languages Chart */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 p-4 flex flex-col justify-between gap-4">
                
                {/* 30-Day Heatmap grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Git Contribution Heatmap</span>
                    <span className="text-[9px] font-mono text-zinc-400">Past 30 Days</span>
                  </div>
                  
                  {/* Heatmap cells */}
                  <div className="grid grid-cols-10 gap-1.5 p-1 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-lg border border-zinc-200/30 dark:border-zinc-800/30">
                    {Array.from({ length: 30 }).map((_, i) => {
                      const intensities = [
                        'bg-zinc-200 dark:bg-zinc-900', 
                        'bg-emerald-950 text-emerald-400', 
                        'bg-emerald-800 text-emerald-200', 
                        'bg-emerald-500 text-white'
                      ];
                      const level = i % 4 === 0 ? intensities[0] 
                                  : i % 4 === 1 ? intensities[1] 
                                  : i % 4 === 2 ? intensities[2] 
                                  : intensities[3];
                      return (
                        <div 
                          key={i} 
                          className={`w-full aspect-square rounded-sm transition-all hover:scale-110 cursor-help ${level}`}
                          title={`Contributions level: ${i % 4}`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Tech stack composition chart */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Stack composition</span>
                    <span className="text-[9px] font-bold text-cyan-500">TypeScript lead</span>
                  </div>
                  <div className="space-y-1.5">
                    
                    {/* TS */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-zinc-500 font-bold">
                        <span>TypeScript</span>
                        <span>64%</span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-900 h-1 rounded-full overflow-hidden">
                        <div className="w-[64%] h-full bg-[#3178c6] rounded-full" />
                      </div>
                    </div>

                    {/* Go */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-zinc-500 font-bold">
                        <span>Go Lang</span>
                        <span>24%</span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-900 h-1 rounded-full overflow-hidden">
                        <div className="w-[24%] h-full bg-[#00ADD8] rounded-full" />
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Column 3: Microservice nodes & Git terminal */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 p-4 flex flex-col justify-between gap-4">
                
                {/* Microservice uptime status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Deployment Uptime</span>
                    <Server className="h-4 w-4 text-emerald-500" />
                  </div>
                  
                  {/* Uptime nodes list */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] px-2 py-1 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-lg border border-zinc-200/30 dark:border-zinc-800/30">
                      <span className="font-mono font-bold text-zinc-650 dark:text-zinc-400">api-engine.io</span>
                      <span className="text-emerald-500 font-bold">🟢 Uptime 100%</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] px-2 py-1 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-lg border border-zinc-200/30 dark:border-zinc-800/30">
                      <span className="font-mono font-bold text-zinc-650 dark:text-zinc-400">db-replica.internal</span>
                      <span className="text-emerald-500 font-bold">🟢 Active</span>
                    </div>
                  </div>
                </div>

                {/* Simulated activity logger */}
                <div className="bg-zinc-950 rounded-xl p-3.5 border border-zinc-900 font-mono space-y-1.5 flex-1 flex flex-col justify-end text-[9px] leading-relaxed text-cyan-400/90 overflow-hidden shadow-inner">
                  <div className="text-zinc-600 font-bold select-none">// live git trace:</div>
                  <div className="flex items-center gap-1 text-zinc-500">
                    <GitCommit className="h-3 w-3 shrink-0 text-zinc-600" />
                    <span>pushed 2 commits to main</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 shrink-0 text-emerald-500" />
                    <span className="text-zinc-300 font-bold">build-profile [success] - 1.4s</span>
                  </div>
                  <div className="text-emerald-400 font-bold flex items-center gap-1 select-none">
                    <span>$</span>
                    <span className="text-white animate-pulse">sync-telemetry --done</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* ==========================================
           "BUILT FOR DEVELOPERS" Segment Matrix
           ========================================== */}
        <div className="mx-auto max-w-5xl w-full space-y-6 pt-4">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-cyan-600 dark:text-cyan-400">
              Built for Every Path
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              Engineered for Your Workflow
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Student */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/20 p-5 backdrop-blur-sm shadow-sm transition-all hover:translate-y-[-4px] hover:border-cyan-500/30 hover:shadow-md duration-300 flex flex-col justify-between gap-4 group">
              <div className="space-y-3">
                <div className="h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                  <GraduationCap className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Students</h4>
                <p className="text-[10px] text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                  Highlight LeetCode credentials, academic projects, and build portfolio trust without job history.
                </p>
              </div>
              <span className="text-[9px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider select-none group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Learn more <ArrowRight className="h-2.5 w-2.5" />
              </span>
            </div>

            {/* Freelancer */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/20 p-5 backdrop-blur-sm shadow-sm transition-all hover:translate-y-[-4px] hover:border-cyan-500/30 hover:shadow-md duration-300 flex flex-col justify-between gap-4 group">
              <div className="space-y-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Briefcase className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Freelancers</h4>
                <p className="text-[10px] text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                  Showcase working client URLs, real-time uptime monitors, and verify full-stack deliveries dynamically.
                </p>
              </div>
              <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider select-none group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Learn more <ArrowRight className="h-2.5 w-2.5" />
              </span>
            </div>

            {/* Open Source */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/20 p-5 backdrop-blur-sm shadow-sm transition-all hover:translate-y-[-4px] hover:border-cyan-500/30 hover:shadow-md duration-300 flex flex-col justify-between gap-4 group">
              <div className="space-y-3">
                <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <GitBranch className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">OS Contributors</h4>
                <p className="text-[10px] text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                  Highlight commit heatmaps, pull request distributions, and stars tally from real open-source repos.
                </p>
              </div>
              <span className="text-[9px] font-mono text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider select-none group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Learn more <ArrowRight className="h-2.5 w-2.5" />
              </span>
            </div>

            {/* Full Stack */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/20 p-5 backdrop-blur-sm shadow-sm transition-all hover:translate-y-[-4px] hover:border-cyan-500/30 hover:shadow-md duration-300 flex flex-col justify-between gap-4 group">
              <div className="space-y-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Layers className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Full Stack Devs</h4>
                <p className="text-[10px] text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                  Map aggregate technologies distribution graphs automatically and catalog complex full-stack timelines.
                </p>
              </div>
              <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider select-none group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Learn more <ArrowRight className="h-2.5 w-2.5" />
              </span>
            </div>

            {/* DevOps */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/20 p-5 backdrop-blur-sm shadow-sm transition-all hover:translate-y-[-4px] hover:border-cyan-500/30 hover:shadow-md duration-300 flex flex-col justify-between gap-4 group">
              <div className="space-y-3">
                <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Server className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">DevOps</h4>
                <p className="text-[10px] text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                  Verify production service availability, latency logs, and streaming server deployment nodes dynamically.
                </p>
              </div>
              <span className="text-[9px] font-mono text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider select-none group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Learn more <ArrowRight className="h-2.5 w-2.5" />
              </span>
            </div>

          </div>
        </div>

        {/* ==========================================
           DEVELOPER-FOCUSED FEATURE CARDS GRID
           ========================================== */}
        <div id="features" className="mx-auto max-w-5xl w-full space-y-6 pt-4 scroll-mt-20">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-cyan-600 dark:text-cyan-400">
              SaaS Infrastructure
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              Engineered for Technical Recruitment
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Live GitHub Activity Tracking */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/20 p-6 backdrop-blur-sm shadow-sm hover:border-cyan-500/20 hover:shadow-md transition-all hover:translate-y-[-2px] duration-300 space-y-4">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
                <GitBranch className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">Live GitHub Activity Tracking</h4>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">
                Streamlessly synchronize your git commit telemetry, public repositories count, contribution heatmap structures, and stars tally into local cache tables instantly.
              </p>
            </div>

            {/* Card 2: Recruiter Ready Developer Profiles */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/20 p-6 backdrop-blur-sm shadow-sm hover:border-cyan-500/20 hover:shadow-md transition-all hover:translate-y-[-2px] duration-300 space-y-4">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">Recruiter Ready Profiles</h4>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">
                Combine your verified LeetCode rankings, uploaded credentials, and detailed career timeline segments into a single, high-fidelity landing page that commands focus.
              </p>
            </div>

            {/* Card 3: Real-Time Deployment Monitoring */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/20 p-6 backdrop-blur-sm shadow-sm hover:border-cyan-500/20 hover:shadow-md transition-all hover:translate-y-[-2px] duration-300 space-y-4">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <Server className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">Real-Time Deployment Monitors</h4>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">
                Automatically verify live service deployments, production latency, and active backend nodes, proving to engineering managers that your creations remain high-availability.
              </p>
            </div>

            {/* Card 4: Coding Analytics Dashboard */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/20 p-6 backdrop-blur-sm shadow-sm hover:border-cyan-500/20 hover:shadow-md transition-all hover:translate-y-[-2px] duration-300 space-y-4 md:col-span-2">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white">Coding Analytics Dashboard</h4>
                  <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium mt-1">
                    Visualize complex stack composition metrics, coding hours consistency, and weekly progress charts. Get comprehensive dashboards illustrating your actual developer growth telemetry securely.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 5: AI Portfolio Insights */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/20 p-6 backdrop-blur-sm shadow-sm hover:border-cyan-500/20 hover:shadow-md transition-all hover:translate-y-[-2px] duration-300 space-y-4">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                <Cpu className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">AI Portfolio Insights</h4>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">
                Map aggregates and build automated developer identity index scorecards mapping commits and credentials to score and highlights your core capabilities.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Decorative Bottom Glow Mesh */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)] pointer-events-none" aria-hidden="true">
        <div
          className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 bg-gradient-to-tr from-cyan-400 to-indigo-600 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </div>
  );
}
