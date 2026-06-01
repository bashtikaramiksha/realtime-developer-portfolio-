'use client';

import React, { useState, useEffect } from 'react';
import { Loader, RefreshCw, Trophy, Flame, Target, Star, Award, ExternalLink, Zap } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface LeetCodeStatsData {
  leetcodeUsername: string;
  totalSolved: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  contestRating: number;
  globalRank: number;
  streak: number;
}

export default function LeetcodeDashboard() {
  const { showToast } = useAuth();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [stats, setStats] = useState<LeetCodeStatsData | null>(null);

  const fetchLeetCodeData = async () => {
    try {
      setLoading(true);
      const profileRes = await fetch('/api/leetcode/profile');
      const profileData = await profileRes.json();

      if (profileRes.ok && profileData.status === 'success' && profileData.connected) {
        setConnected(true);
        setLeetcodeUsername(profileData.leetcodeUsername);
        setUsernameInput(profileData.leetcodeUsername);

        const statsRes = await fetch('/api/leetcode/stats');
        const statsData = await statsRes.json();
        if (statsRes.ok && statsData.status === 'success') {
          setStats(statsData.stats);
        }
      } else {
        setConnected(false);
      }
    } catch (error) {
      console.error('Error fetching LeetCode stats:', error);
      showToast('Failed to load LeetCode statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeetCodeData();
  }, []);

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      showToast('Please enter a valid LeetCode username', 'error');
      return;
    }

    try {
      setSyncing(true);
      const res = await fetch('/api/leetcode/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leetcodeUsername: usernameInput.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(data.message || 'Sync completed!', 'success');
        await fetchLeetCodeData();
      } else {
        showToast(data.message || 'Sync failed', 'error');
      }
    } catch (error) {
      showToast('Network error during synchronization', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Radial progress calculations
  const calculateStrokeDashOffset = (solved: number, total: number, radius: number) => {
    const circumference = 2 * Math.PI * radius;
    if (total === 0) return circumference;
    const percentage = Math.min(100, (solved / total) * 100);
    return circumference - (percentage / 100) * circumference;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  // Simulated total values on LeetCode platform
  const totalPlatformEasy = 800;
  const totalPlatformMedium = 1600;
  const totalPlatformHard = 700;
  const totalPlatformQuestions = totalPlatformEasy + totalPlatformMedium + totalPlatformHard;

  return (
    <div className="space-y-8 animate-slide-in">
      
      {/* 1. Connection Header */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white font-bold">
            <Trophy className="h-6 w-6 text-yellow-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              LeetCode Statistics
              {connected && (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                  Linked
                </span>
              )}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {connected
                ? `Syncing profile stats for @${leetcodeUsername}`
                : 'Connect your LeetCode handle to display easy/medium/hard progress rings, ratings, and active streaks.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSync} className="flex gap-2 max-w-md w-full">
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="LeetCode handle (e.g. storm-coder)"
            className="flex-1 rounded-xl border-0 bg-zinc-950 py-2.5 px-4 text-white ring-1 ring-inset ring-zinc-800 placeholder:text-zinc-700 focus:ring-2 focus:ring-cyan-500 text-sm outline-none"
            disabled={syncing}
          />
          <button
            type="submit"
            disabled={syncing}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition-all active:scale-[0.98] disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {syncing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {connected ? 'Sync Stats' : 'Link Profile'}
          </button>
        </form>
      </div>

      {connected && stats ? (
        <>
          {/* 2. Top-level dashboard cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Global rank card */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm relative overflow-hidden group">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold uppercase tracking-wider">Global Rank</span>
                <Target className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold mt-2 text-white group-hover:text-cyan-400 transition-colors">
                #{stats.globalRank.toLocaleString()}
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">Top 10% of active developers</span>
            </div>

            {/* Contest rating card */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm relative overflow-hidden group">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold uppercase tracking-wider">Contest Rating</span>
                <Star className="h-4 w-4 text-yellow-500" />
              </div>
              <div className="text-3xl font-extrabold mt-2 text-white group-hover:text-yellow-400 transition-colors">
                {stats.contestRating}
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">Guardian / Knight potential</span>
            </div>

            {/* Current streak card */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm relative overflow-hidden group">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold uppercase tracking-wider">Active Streak</span>
                <Flame className="h-4 w-4 text-orange-500 animate-bounce" />
              </div>
              <div className="text-3xl font-extrabold mt-2 text-white group-hover:text-orange-400 transition-colors">
                {stats.streak} Days
              </div>
              <span className="text-[10px] text-emerald-400 mt-1 block font-medium">+3 days relative to last week</span>
            </div>

          </div>

          {/* 3. Progress Ring Visualizations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Radial SVGs rings */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 flex flex-col justify-between items-center text-center">
              <div className="w-full text-left">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="h-4.5 w-4.5 text-cyan-400" />
                  Difficulty Breakdown
                </h4>
              </div>

              {/* Multi-layered progress SVG ring */}
              <div className="relative w-48 h-48 my-6 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Outer circle: Easy (green) */}
                  <circle cx="96" cy="96" r="80" stroke="#18181b" strokeWidth="12" fill="transparent" />
                  <circle 
                    cx="96" cy="96" r="80" 
                    stroke="#10b981" strokeWidth="12" fill="transparent" 
                    strokeDasharray={2 * Math.PI * 80}
                    strokeDashoffset={calculateStrokeDashOffset(stats.easyCount, totalPlatformEasy, 80)}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />

                  {/* Middle circle: Medium (orange) */}
                  <circle cx="96" cy="96" r="62" stroke="#18181b" strokeWidth="12" fill="transparent" />
                  <circle 
                    cx="96" cy="96" r="62" 
                    stroke="#f59e0b" strokeWidth="12" fill="transparent" 
                    strokeDasharray={2 * Math.PI * 62}
                    strokeDashoffset={calculateStrokeDashOffset(stats.mediumCount, totalPlatformMedium, 62)}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />

                  {/* Inner circle: Hard (red) */}
                  <circle cx="96" cy="96" r="44" stroke="#18181b" strokeWidth="12" fill="transparent" />
                  <circle 
                    cx="96" cy="96" r="44" 
                    stroke="#ef4444" strokeWidth="12" fill="transparent" 
                    strokeDasharray={2 * Math.PI * 44}
                    strokeDashoffset={calculateStrokeDashOffset(stats.hardCount, totalPlatformHard, 44)}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>

                {/* Central numbers display */}
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold text-white block">{stats.totalSolved}</span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Solved</span>
                </div>
              </div>

              {/* Labels list */}
              <div className="grid grid-cols-3 gap-6 w-full pt-4 border-t border-zinc-900">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 block uppercase">Easy</span>
                  <span className="text-lg font-bold text-white block mt-0.5">{stats.easyCount}</span>
                  <span className="text-[9px] text-zinc-500 font-mono">/ {totalPlatformEasy}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-yellow-500 block uppercase">Medium</span>
                  <span className="text-lg font-bold text-white block mt-0.5">{stats.mediumCount}</span>
                  <span className="text-[9px] text-zinc-500 font-mono">/ {totalPlatformMedium}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-rose-500 block uppercase">Hard</span>
                  <span className="text-lg font-bold text-white block mt-0.5">{stats.hardCount}</span>
                  <span className="text-[9px] text-zinc-500 font-mono">/ {totalPlatformHard}</span>
                </div>
              </div>
            </div>

            {/* Contest rating / Performance progress */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="h-4.5 w-4.5 text-cyan-400" />
                  Contest Analytics
                </h4>
              </div>

              <div className="flex-1 bg-zinc-950/40 p-5 rounded-xl border border-zinc-850 my-4 flex flex-col justify-center gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-400">Contest Percentile</span>
                    <span className="font-bold text-emerald-400">Top 4.2%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-850">
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full" style={{ width: '95.8%' }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-400">Streak Milestones</span>
                    <span className="font-bold text-cyan-400">{stats.streak} / 30 Days</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-850">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, (stats.streak / 30) * 100)}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-400">Global Solved Proportions</span>
                    <span className="font-bold text-yellow-500">{(stats.totalSolved / totalPlatformQuestions * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-850">
                    <div className="bg-gradient-to-r from-yellow-500 to-rose-500 h-full rounded-full" style={{ width: `${(stats.totalSolved / totalPlatformQuestions * 100)}%` }}></div>
                  </div>
                </div>
              </div>

              <a
                href={`https://leetcode.com/${leetcodeUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800/80 py-3 text-xs font-bold text-zinc-300 hover:text-white transition-all active:scale-[0.98]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View LeetCode Public Profile
              </a>
            </div>

          </div>

          {/* 4. Active Daily Coding Streaks calendar */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Flame className="h-4.5 w-4.5 text-orange-500" />
              Daily Active Streak Calendar
            </h4>

            <div className="bg-zinc-950/40 p-6 rounded-xl border border-zinc-850 flex flex-wrap gap-2.5 justify-center">
              {Array.from({ length: 28 }).map((_, idx) => {
                const daysInPast = 27 - idx;
                // Highlight active coding days based on streak value
                const active = daysInPast < stats.streak;
                const levelClass = active 
                                 ? 'bg-orange-500/20 border-orange-500/50 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.1)]' 
                                 : 'bg-zinc-900 border-zinc-850 text-zinc-600';
                return (
                  <div 
                    key={idx}
                    title={active ? 'Day Active: Code Submitted!' : 'No submissions'}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center text-[10px] font-bold transition-all hover:scale-115 ${levelClass}`}
                  >
                    {active ? '🔥' : idx + 1}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 px-4 mt-3">
              <span>28 Days Ago</span>
              <span>Today</span>
            </div>
          </div>
        </>
      ) : (
        /* Empty / Connection Block */
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="mx-auto h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
            <Trophy className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">No LeetCode Profile Connected</h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
              Enter your LeetCode handle above to link your coding progress, global rank, and streaks.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
