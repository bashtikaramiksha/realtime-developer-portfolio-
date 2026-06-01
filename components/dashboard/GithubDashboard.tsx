'use client';

import React, { useState, useEffect } from 'react';
import { 
  Loader, RefreshCw, GitCommit, Star, GitBranch, 
  ExternalLink, BarChart2, PieChart, Calendar, Code 
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface Repo {
  id: string;
  name: string;
  stars: number;
  forks: number;
  language: string | null;
  repo_url: string;
}

interface LanguageMetric {
  language: string;
  count: number;
  percentage: number;
}

interface CommitMetric {
  date: string;
  count: number;
}

export default function GithubDashboard() {
  const { showToast } = useAuth();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [stats, setStats] = useState<{ totalRepos: number; totalStars: number; totalForks: number } | null>(null);
  
  const [repos, setRepos] = useState<Repo[]>([]);
  const [languages, setLanguages] = useState<LanguageMetric[]>([]);
  const [commits, setCommits] = useState<CommitMetric[]>([]);

  const fetchGithubData = async () => {
    try {
      setLoading(true);
      const profileRes = await fetch('/api/github/profile');
      const profileData = await profileRes.json();

      if (profileRes.ok && profileData.status === 'success' && profileData.connected) {
        setConnected(true);
        setGithubUsername(profileData.githubUsername);
        setUsernameInput(profileData.githubUsername);
        setStats(profileData.stats);

        // Fetch other detail APIs
        const [reposRes, langRes, commitsRes] = await Promise.all([
          fetch('/api/github/repos'),
          fetch('/api/github/languages'),
          fetch('/api/github/commits'),
        ]);

        const [reposData, langData, commitsData] = await Promise.all([
          reposRes.json(),
          langRes.json(),
          commitsRes.json(),
        ]);

        if (reposRes.ok) setRepos(reposData.repositories || []);
        if (langRes.ok) setLanguages(langData.languages || []);
        if (commitsRes.ok) setCommits(commitsData.commits || []);
      } else {
        setConnected(false);
      }
    } catch (error) {
      console.error('Error fetching github statistics:', error);
      showToast('Failed to load GitHub statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGithubData();
  }, []);

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      showToast('Please enter a valid GitHub username', 'error');
      return;
    }

    try {
      setSyncing(true);
      const res = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUsername: usernameInput.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(data.message || 'Sync completed!', 'success');
        await fetchGithubData();
      } else {
        showToast(data.message || 'Sync failed', 'error');
      }
    } catch (error) {
      showToast('Network error during synchronization', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Helper to color languages nicely
  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      TypeScript: '#3178c6',
      JavaScript: '#f1e05a',
      Go: '#00ADD8',
      CSS: '#563d7c',
      HTML: '#e34c26',
      Python: '#3572A5',
      Rust: '#dea584',
    };
    return colors[lang] || '#8e8e93';
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in">
      
      {/* 1. Connection / Header Panel */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white font-bold">
            <GithubIcon className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              GitHub Live Sync 
              {connected && (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                  Connected
                </span>
              )}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {connected 
                ? `Active Sync Account: @${githubUsername}` 
                : 'Connect your GitHub profile to load commit heatmaps, stars, and language breakdowns.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSync} className="flex gap-2 max-w-md w-full">
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="GitHub username (e.g. torvalds)"
            className="flex-1 rounded-xl border-0 bg-zinc-950 py-2.5 px-4 text-white ring-1 ring-inset ring-zinc-800 placeholder:text-zinc-700 focus:ring-2 focus:ring-cyan-500 text-sm outline-none"
            disabled={syncing}
          />
          <button
            type="submit"
            disabled={syncing}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition-all active:scale-[0.98] disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {syncing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {connected ? 'Sync Stats' : 'Connect'}
          </button>
        </form>
      </div>

      {connected ? (
        <>
          {/* 2. Top-level stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold uppercase tracking-wider">Synced Repositories</span>
                <GitBranch className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold mt-2 text-white">{stats?.totalRepos}</div>
              <span className="text-[10px] text-zinc-500 mt-1 block">Latest projects synchronized</span>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold uppercase tracking-wider">Total Stars</span>
                <Star className="h-4 w-4 text-yellow-500" />
              </div>
              <div className="text-3xl font-extrabold mt-2 text-white">{stats?.totalStars}</div>
              <span className="text-[10px] text-zinc-500 mt-1 block">Accrued across active projects</span>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold uppercase tracking-wider">Total Commits (30d)</span>
                <GitCommit className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-extrabold mt-2 text-white">
                {commits.reduce((sum, c) => sum + c.count, 0)}
              </div>
              <span className="text-[10px] text-emerald-400 mt-1 block font-medium">Activity graph active</span>
            </div>
          </div>

          {/* 3. Visual Charts section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Commit history calendar chart */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 flex flex-col justify-between">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Calendar className="h-4.5 w-4.5 text-cyan-400" />
                Commit History Heatmap
              </h4>
              
              <div className="flex-1 bg-zinc-950/40 p-4 rounded-xl border border-zinc-850 flex flex-col justify-center min-h-[160px]">
                {commits.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center">No commit data found. Perform a sync to load history.</p>
                ) : (
                  <div className="space-y-4">
                    {/* Simplified heatmap blocks */}
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {commits.slice(-30).map((cmt) => {
                        const level = cmt.count === 0 ? 'bg-zinc-900' 
                                    : cmt.count < 3 ? 'bg-emerald-950 text-emerald-400'
                                    : cmt.count < 6 ? 'bg-emerald-800 text-emerald-200' 
                                    : 'bg-emerald-500 text-white';
                        return (
                          <div 
                            key={cmt.date}
                            title={`${cmt.date}: ${cmt.count} commits`} 
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-bold transition-all hover:scale-115 ${level}`}
                          >
                            {cmt.count > 0 && cmt.count}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 px-4">
                      <span>Older (30 days ago)</span>
                      <span>Today</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Language distribution card */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <PieChart className="h-4.5 w-4.5 text-cyan-400" />
                Language Composition
              </h4>
              
              <div className="space-y-3">
                {languages.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-8">No language distribution data found.</p>
                ) : (
                  languages.map((lang) => (
                    <div key={lang.language} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getLanguageColor(lang.language) }}></span>
                          {lang.language}
                        </span>
                        <span className="text-zinc-500 font-semibold">{lang.percentage}%</span>
                      </div>
                      <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-850">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${lang.percentage}%`,
                            backgroundColor: getLanguageColor(lang.language) 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 4. Repository Grid */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Code className="h-4.5 w-4.5 text-cyan-400" />
              Synced Repositories Grid
            </h4>

            {repos.length === 0 ? (
              <p className="text-xs text-zinc-500">No repositories available. Try syncing.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {repos.map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl border border-zinc-850 hover:border-cyan-500/30 bg-zinc-900/20 hover:bg-cyan-950/[0.03] p-5 transition-all hover:translate-y-[-2px] flex flex-col justify-between min-h-[120px]"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h5 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {repo.name}
                        </h5>
                        <ExternalLink className="h-3.5 w-3.5 text-zinc-600 group-hover:text-cyan-400 transition-colors shrink-0" />
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono mt-1">/github/{githubUsername}/{repo.name}</p>
                    </div>

                    <div className="flex justify-between items-center text-xs text-zinc-400 font-medium pt-4 mt-2 border-t border-zinc-900">
                      <span className="flex items-center gap-1.5">
                        {repo.language ? (
                          <>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getLanguageColor(repo.language) }}></span>
                            {repo.language}
                          </>
                        ) : 'Plain Text'}
                      </span>

                      <div className="flex gap-4">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500/20" />
                          {repo.stars}
                        </span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <GitBranch className="h-3.5 w-3.5 text-cyan-500" />
                          {repo.forks}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Unconnected / Empty State */
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="mx-auto h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
            <GithubIcon className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">No GitHub Profile Connected</h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
              Enter your GitHub handle above to load project statistics, active codes, repositories, and stars.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
