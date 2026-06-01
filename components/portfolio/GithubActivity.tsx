'use client';

import React from 'react';
import { 
  GitCommit, Star, GitBranch, ExternalLink, Calendar, 
  PieChart, Users, Flame, Terminal, Code, Award, Server, 
  Activity, RefreshCw, RefreshCcw, Info
} from 'lucide-react';

interface GithubActivityProps {
  githubUsername?: string | null;
}

export default function GithubActivity({ githubUsername }: GithubActivityProps) {
  const [username, setUsername] = React.useState(githubUsername || '');
  const [loading, setLoading] = React.useState(true);
  const [syncing, setSyncing] = React.useState(false);
  const [githubData, setGithubData] = React.useState<any>(null);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [toastMsg, setToastMsg] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [mounted, setMounted] = React.useState(false);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchPublicStats = React.useCallback(async (targetUser: string, isSync: boolean = false) => {
    try {
      if (isSync) {
        setSyncing(true);
      } else {
        setLoading(true);
      }
      setErrorMsg('');
      const res = await fetch(`/api/github/public-sync?username=${encodeURIComponent(targetUser.trim())}`);
      const payload = await res.json();
      
      if (res.ok && payload.status === 'success') {
        setGithubData(payload.data);
        if (isSync) {
          showToast(`Successfully synchronized profile for @${payload.data.username}!`, 'success');
        }
      } else {
        const errorText = payload.message || 'Failed to fetch GitHub data';
        setErrorMsg(errorText);
        if (isSync) {
          showToast(errorText, 'error');
        }
      }
    } catch (err) {
      console.error(err);
      const networkError = 'Network error occurred while fetching GitHub data';
      setErrorMsg(networkError);
      if (isSync) {
        showToast(networkError, 'error');
      }
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  React.useEffect(() => {
    setMounted(true);
    if (githubUsername) {
      fetchPublicStats(githubUsername);
    } else {
      setLoading(false);
    }
  }, [githubUsername, fetchPublicStats]);

  const handleSync = (e: React.FormEvent) => {
    e.preventDefault();
    const queryUser = username || githubUsername;
    if (!queryUser || !queryUser.trim()) {
      showToast('No GitHub username specified', 'error');
      return;
    }
    fetchPublicStats(queryUser, true);
  };

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

  if (!mounted) return null;

  // Render glassmorphic banner if username is not linked
  if (!githubUsername) {
    return (
      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-8 backdrop-blur-md text-center space-y-4 shadow-sm dark:shadow-none">
        <div className="h-12 w-12 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
          <Code className="h-6 w-6" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">GitHub Account Not Linked</h3>
          <p className="text-xs text-zinc-500 leading-relaxed font-medium">
            This developer has not connected their GitHub profile to their DevPulse AI workspace yet. 
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => {
              setUsername('octocat');
              fetchPublicStats('octocat');
            }}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 text-xs font-bold text-white transition-all active:scale-[0.98] shadow-md shadow-cyan-600/20 cursor-pointer"
          >
            Show Demonstration Profile
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-cyan-500" />
            <p className="text-[10px] text-zinc-500 font-medium">Loading demo stats...</p>
          </div>
        )}

        {githubData && (
          <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-8 mt-6 text-left">
            <div className="flex items-center gap-2 mb-4 bg-cyan-500/5 border border-cyan-500/10 p-3 rounded-xl">
              <Info className="h-4.5 w-4.5 text-cyan-500 shrink-0" />
              <p className="text-[11px] text-cyan-650 dark:text-cyan-400 font-medium">
                This is a preview using live API metrics for <strong>@{githubData.username}</strong> to demonstrate DevPulse integrations.
              </p>
            </div>
            {renderShowcaseData()}
          </div>
        )}
      </section>
    );
  }

  function renderShowcaseData() {
    if (!githubData) return null;

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Dynamic Telemetry Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          
          {/* Commits */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white/50 dark:bg-zinc-900/40 p-4 backdrop-blur-sm shadow-sm hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Commits</span>
              <GitCommit className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold mt-2 text-zinc-900 dark:text-white">{githubData.totalCommits}</div>
          </div>

          {/* Followers */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white/50 dark:bg-zinc-900/40 p-4 backdrop-blur-sm shadow-sm hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Followers</span>
              <Users className="h-4 w-4 text-cyan-500" />
            </div>
            <div className="text-2xl font-extrabold mt-2 text-zinc-900 dark:text-white">{githubData.followers}</div>
          </div>

          {/* Streak */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white/50 dark:bg-zinc-900/40 p-4 backdrop-blur-sm shadow-sm hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Streak</span>
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-2xl font-extrabold mt-2 text-zinc-900 dark:text-white">{githubData.streak} days</div>
          </div>

          {/* Repositories */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white/50 dark:bg-zinc-900/40 p-4 backdrop-blur-sm shadow-sm hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Repositories</span>
              <GitBranch className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-extrabold mt-2 text-zinc-900 dark:text-white">{githubData.totalRepos}</div>
          </div>

          {/* Stars */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white/50 dark:bg-zinc-900/40 p-4 backdrop-blur-sm shadow-sm hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Stars Tally</span>
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
            <div className="text-2xl font-extrabold mt-2 text-zinc-900 dark:text-white">{githubData.totalStars}</div>
          </div>

          {/* Push Activity */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white/50 dark:bg-zinc-900/40 p-4 backdrop-blur-sm shadow-sm hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pushes (30d)</span>
              <RefreshCcw className="h-4 w-4 text-violet-500" />
            </div>
            <div className="text-2xl font-extrabold mt-2 text-zinc-900 dark:text-white">{githubData.recentActivity.length}</div>
          </div>

        </div>

        {/* Heatmap & Languages section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Heatmap */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 p-6 backdrop-blur-sm shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="h-4.5 w-4.5 text-cyan-500" />
                30-Day Contribution Heatmap
              </h3>
              <p className="text-[11px] text-zinc-550 mb-4 font-medium">Commit density visualization for @{githubData.username}</p>
            </div>

            <div className="bg-zinc-100/50 dark:bg-zinc-950/40 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-850 flex flex-col justify-center min-h-[160px]">
              {githubData.commitsGrouped.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center font-medium">No recent commit history found.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {githubData.commitsGrouped.slice(-30).map((cmt: any, idx: number) => {
                      const level = cmt.count === 0 ? 'bg-zinc-200 dark:bg-zinc-900' 
                                  : cmt.count < 3 ? 'bg-emerald-950 text-emerald-400'
                                  : cmt.count < 6 ? 'bg-emerald-800 text-emerald-200' 
                                  : 'bg-emerald-500 text-white';
                      return (
                        <div 
                          key={`${cmt.date}-${idx}`}
                          title={`${cmt.date}: ${cmt.count} commits`} 
                          className={`w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-extrabold transition-all hover:scale-115 cursor-default ${level}`}
                        >
                          {cmt.count > 0 && cmt.count}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-500 px-4 font-mono">
                    <span>30 Days Ago</span>
                    <span>Today</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Languages Chart */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 p-6 backdrop-blur-sm shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <PieChart className="h-4.5 w-4.5 text-cyan-500" />
              Stack Composition & Languages
            </h3>
            <p className="text-[11px] text-zinc-500 mb-4 font-medium">Breakdown based on repositories updated</p>

            <div className="space-y-3.5">
              {githubData.languages.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-8 font-medium">No language distribution data found.</p>
              ) : (
                githubData.languages.map((lang: any) => (
                  <div key={lang.language} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getLanguageColor(lang.language) }}></span>
                        {lang.language}
                      </span>
                      <span className="text-zinc-500 font-semibold">{lang.percentage}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-300/30 dark:border-zinc-850">
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

        {/* Bottom Repos & Timeline lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Synced Repos */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Code className="h-4.5 w-4.5 text-cyan-500" />
              Synced Projects Grid
            </h3>

            {githubData.repos.length === 0 ? (
              <p className="text-xs text-zinc-500 font-medium">No public repositories found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {githubData.repos.map((repo: any) => (
                  <a
                    key={repo.name}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl border border-zinc-200 dark:border-zinc-855 hover:border-cyan-500/30 bg-white/50 dark:bg-zinc-900/20 hover:bg-cyan-955/[0.02] p-4 transition-all hover:translate-y-[-2px] flex flex-col justify-between min-h-[110px] shadow-sm hover:shadow-md"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate max-w-[85%]">
                          {repo.name}
                        </h4>
                        <ExternalLink className="h-3.5 w-3.5 text-zinc-400 group-hover:text-cyan-500 transition-colors shrink-0" />
                      </div>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-550 font-mono mt-1 truncate">
                        @{githubData.username}/{repo.name}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-3 mt-2 border-t border-zinc-200/50 dark:border-zinc-900 font-bold">
                      <span className="flex items-center gap-1">
                        {repo.language ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getLanguageColor(repo.language) }}></span>
                            {repo.language}
                          </>
                        ) : 'Text'}
                      </span>
                      <div className="flex gap-3">
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500/20" />
                          {repo.stargazers_count}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <GitBranch className="h-3 w-3 text-cyan-500" />
                          {repo.forks_count}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Pusher Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="h-4.5 w-4.5 text-cyan-500" />
              Recent Live Push Activity
            </h3>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/30 p-5 backdrop-blur-sm shadow-sm flex-1 min-h-[240px] flex flex-col justify-between">
              {githubData.recentActivity.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-10 font-medium">No recent commit activity found.</p>
              ) : (
                <div className="space-y-4">
                  {githubData.recentActivity.slice(0, 4).map((act: any, idx: number) => (
                    <div key={idx} className="flex gap-3 items-start text-xs border-b border-zinc-200/50 dark:border-zinc-900 pb-3 last:border-0 last:pb-0 animate-slide-in">
                      <div className="h-7 w-7 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0 mt-0.5">
                        <GitCommit className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-zinc-200 dark:bg-zinc-800 text-[10px] text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-full font-bold">
                            {act.repo}
                          </span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-550 font-mono">
                            {new Date(act.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-zinc-650 dark:text-zinc-300 font-sans mt-1 text-[11px] leading-relaxed line-clamp-2 font-medium">
                          {act.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <section id="github-activity" className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-8 backdrop-blur-md space-y-6 shadow-sm dark:shadow-none relative">
      
      {/* Dynamic Toast Indicator */}
      {toastMsg && (
        <div className={`absolute top-4 right-4 z-50 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-lg transition-all duration-300 animate-slide-in ${
          toastMsg.type === 'success' ? 'bg-emerald-600 shadow-emerald-600/25' : 'bg-red-600 shadow-red-600/25'
        }`}>
          {toastMsg.text}
        </div>
      )}

      {/* Segment Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-cyan-550 dark:text-cyan-400 animate-pulse" />
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Live GitHub Consistency & Analytics
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              Dynamic cache pipeline updating developer stats directly from GitHub API
            </p>
          </div>
        </div>

        <form onSubmit={handleSync} className="flex gap-2 self-start sm:self-center shrink-0">
          <button
            type="submit"
            disabled={syncing || loading}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-md shadow-cyan-600/20"
          >
            {syncing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
            Sync Telemetry
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-cyan-500" />
          <p className="text-xs text-zinc-500 animate-pulse font-medium">Retrieving live developer analytics from GitHub...</p>
        </div>
      ) : errorMsg ? (
        <div className="text-center py-12 space-y-4">
          <p className="text-xs text-red-500 font-medium">Failed to retrieve GitHub telemetry: {errorMsg}</p>
          <button
            onClick={() => fetchPublicStats(githubUsername)}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-white/50 dark:bg-zinc-950/40 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        renderShowcaseData()
      )}
    </section>
  );
}
