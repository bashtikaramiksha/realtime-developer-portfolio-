'use client';

import React, { useState, useEffect } from 'react';
import { 
  GitCompare, UserPlus, Trash2, Award, Star, GitFork, 
  GitPullRequest, AlertCircle, FileText, CheckCircle, Trophy, 
  ChevronRight, Sparkles, Copy, Printer, Check, History, Loader,
  Search, X, Briefcase, GraduationCap, Code2, Plus, Eye,
  ArrowRight, Activity, FileDown, ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface LanguageMetric {
  language: string;
  count: number;
  percentage: number;
}

interface Developer {
  id?: string;
  username: string;
  name: string;
  avatarUrl: string;
  followers: number;
  following: number;
  publicRepos: number;
  stars: number;
  forks: number;
  totalContributions: number;
  commitActivity: Array<{ date: string; count: number }>;
  pullRequests: number;
  issues: number;
  accountAgeYears: number;
  mostUsedLanguages: LanguageMetric[];
  techStackAnalysis: any;
  overallScore: number;
  isShortlisted?: boolean;

  // Enriched optional properties
  leetcodeStats?: {
    totalSolved: number;
    easyCount: number;
    mediumCount: number;
    hardCount: number;
    globalRank: number;
  } | null;
  skills?: Array<{ skillName: string; skillLevel: string }>;
  certificationsCount?: number;
  experiencesCount?: number;
  certificationsList?: string[];
  experiencesList?: string[];

  // Recruiter Upgrade properties
  hiringScore?: number;
  matchPercentage?: number;
  skillsGap?: {
    matchingSkills: string[];
    missingSkills: string[];
    recommendedUpskilling: string[];
  };
  interviewReadiness?: {
    technicalReadiness: number;
    portfolioQuality: number;
    codingConsistency: number;
    profileCompleteness: number;
  };
  candidateGrowth?: {
    commitGrowth: Array<{ label: string; value: number }>;
    projectGrowth: Array<{ label: string; value: number }>;
    certsGrowth: Array<{ label: string; value: number }>;
  };
  openToWork?: boolean;
  recentlyActive?: boolean;
  expYears?: number;
}

interface AIInsight {
  username: string;
  name: string;
  rationale: string;
  score?: number;
  matchPercentage?: number;
}

interface AIInsights {
  mostConsistent: AIInsight;
  strongestFrontend: AIInsight;
  strongestBackend: AIInsight;
  strongestFullstack?: AIInsight;
  bestOpenSource: AIInsight;
  mostActive: AIInsight;
  overallWinner: AIInsight;
  jobDescription?: string | null;
}

interface HistoryItem {
  id: string;
  title: string;
  createdAt: string;
  developers: Developer[];
  aiInsights: AIInsights | null;
  rankings: Array<{ username: string; rank: number; score: number }> | null;
}

const JD_TEMPLATES = {
  fullstack: `We are looking for a Senior Full Stack Engineer.
Requirements:
- 5+ years of experience with software development.
- Deep expertise in TypeScript, JavaScript, HTML, CSS.
- Production experience with React, Next.js, Node.js, and PostgreSQL database.
- Exposure to containerization (Docker, Kubernetes) and CI/CD pipelines.
- Solid technical design capabilities and experience building high-availability SaaS platforms.`,
  backend: `We are looking for a Cloud Infrastructure Backend Engineer.
Requirements:
- 3+ years of experience writing system-level tools.
- Strong language proficiency in Go (Golang), Python, or Rust.
- Deep understanding of database modeling, query tuning, and caching with PostgreSQL, Redis, or MongoDB.
- Practical experience with Docker, Kubernetes, GCP or AWS, and automated CI/CD configurations.`,
  frontend: `We are looking for a Senior Frontend Developer / Web Specialist.
Requirements:
- 2+ years of professional front-end experience.
- Master level in modern JavaScript, TypeScript, Tailwind CSS, and HTML5.
- Deep understanding of React, Next.js, and server-side rendering (SSR) paradigms.
- Outstanding eye for visual excellence, micro-animations, and responsive designs.`
};

export default function DeveloperCompare() {
  const { showToast } = useAuth();
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [comparing, setComparing] = useState(false);
  
  // Platform Users Selection State
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [developerList, setDeveloperList] = useState<string[]>([]);
  const [jobDescription, setJobDescription] = useState('');
  
  // Results
  const [comparisonResults, setComparisonResults] = useState<{
    id?: string;
    developers: Developer[];
    aiInsights: AIInsights;
    rankings: Array<{ username: string; rank: number; score: number }>;
  } | null>(null);

  // Tab management inside results
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'leaderboard' | 'gaps' | 'readiness' | 'timeline' | 'table' | 'stack' | 'heatmap'>('overview');
  
  // Comparison history
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Detailed Candidate Dossier Modal State
  const [selectedDossierDev, setSelectedDossierDev] = useState<Developer | null>(null);

  // Parse structured techStackAnalysis with backward-compatibility helper
  const parseDevStats = (dev: Developer) => {
    const tsa = dev.techStackAnalysis;
    const isObject = tsa && !Array.isArray(tsa) && typeof tsa === 'object';
    
    // Extract calculated/saved recruiter metrics or generate high-fidelity defaults for legacy comparisons
    const hiringScore = dev.hiringScore || (isObject && tsa.hiringScore) || dev.overallScore || 50;
    
    // Calculate or backfill match percentage if missing
    const matchPercentage = dev.matchPercentage || (isObject && tsa.matchPercentage) || Math.round(65 + (hiringScore - 30) * 0.35);

    const skillsGap = dev.skillsGap || (isObject && tsa.skillsGap) || {
      matchingSkills: (isObject && tsa.skills?.map((s: any) => s.skillName)) || dev.skills?.map((s: any) => s.skillName) || [],
      missingSkills: [],
      recommendedUpskilling: ['System Architecture & Production Engineering']
    };

    const interviewReadiness = dev.interviewReadiness || (isObject && tsa.interviewReadiness) || {
      technicalReadiness: Math.round(30 + (dev.totalContributions || 0) * 0.1),
      portfolioQuality: Math.round(50 + ((tsa.certificationsCount || 0) + (tsa.experiencesCount || 0)) * 10),
      codingConsistency: Math.round(40 + (dev.commitActivity?.filter(c => c.count > 0).length || 0) * 2),
      profileCompleteness: Math.round(60 + (tsa.skills?.length || 0) * 5)
    };

    // Clamp subscores
    interviewReadiness.technicalReadiness = Math.min(100, Math.max(30, interviewReadiness.technicalReadiness));
    interviewReadiness.portfolioQuality = Math.min(100, Math.max(30, interviewReadiness.portfolioQuality));
    interviewReadiness.codingConsistency = Math.min(100, Math.max(30, interviewReadiness.codingConsistency));
    interviewReadiness.profileCompleteness = Math.min(100, Math.max(30, interviewReadiness.profileCompleteness));

    // Weekly contribution sum activity for growth timelines
    const commitGrowth = dev.candidateGrowth?.commitGrowth || (isObject && tsa.candidateGrowth?.commitGrowth) || [
      { label: 'Week 1', value: Math.round((dev.totalContributions || 0) * 0.2) },
      { label: 'Week 2', value: Math.round((dev.totalContributions || 0) * 0.45) },
      { label: 'Week 3', value: Math.round((dev.totalContributions || 0) * 0.75) },
      { label: 'Week 4', value: dev.totalContributions || 0 }
    ];

    const projectGrowth = dev.candidateGrowth?.projectGrowth || (isObject && tsa.candidateGrowth?.projectGrowth) || [
      { label: '12m Ago', value: Math.max(1, Math.round((dev.publicRepos || 0) * 0.6)) },
      { label: '6m Ago', value: Math.max(1, Math.round((dev.publicRepos || 0) * 0.85)) },
      { label: 'Current', value: dev.publicRepos || 1 }
    ];

    const certsGrowth = dev.candidateGrowth?.certsGrowth || (isObject && tsa.candidateGrowth?.certsGrowth) || [
      { label: '12m Ago', value: Math.max(0, (isObject ? tsa.certificationsCount : 0) - 1) },
      { label: '6m Ago', value: (isObject ? tsa.certificationsCount : 0) },
      { label: 'Current', value: (isObject ? tsa.certificationsCount : 0) }
    ];

    const openToWork = dev.openToWork !== undefined ? dev.openToWork : (isObject && tsa.openToWork !== undefined ? tsa.openToWork : dev.followers > 10);
    const recentlyActive = dev.recentlyActive !== undefined ? dev.recentlyActive : (isObject && tsa.recentlyActive !== undefined ? tsa.recentlyActive : dev.totalContributions > 15);

    const experiencesCount = isObject ? (tsa.experiencesCount || 0) : (dev.experiencesCount || 0);
    const expYears = dev.expYears !== undefined 
      ? dev.expYears 
      : (isObject && tsa.expYears !== undefined 
        ? tsa.expYears 
        : (experiencesCount === 0 ? 0 : Math.max(0.5, parseFloat((experiencesCount * 1.5).toFixed(1)))));

    return {
      tags: isObject ? (tsa.tags || []) : (Array.isArray(tsa) ? tsa : []),
      leetcodeStats: isObject ? tsa.leetcodeStats : (dev.leetcodeStats || null),
      skills: isObject ? (tsa.skills || []) : (dev.skills || []),
      certificationsCount: isObject ? (tsa.certificationsCount || 0) : (dev.certificationsCount || 0),
      experiencesCount,
      certificationsList: isObject ? (tsa.certificationsList || []) : (dev.certificationsList || []),
      experiencesList: isObject ? (tsa.experiencesList || []) : (dev.experiencesList || []),
      // Recruiter analytics
      hiringScore,
      matchPercentage,
      skillsGap,
      interviewReadiness,
      candidateGrowth: { commitGrowth, projectGrowth, certsGrowth },
      openToWork,
      recentlyActive,
      expYears
    };
  };

  // Fetch registered platform developers
  const fetchRegisteredUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch('/api/compare/users');
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setRegisteredUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load registered developers:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch saved comparison history
  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await fetch('/api/compare/history');
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to load comparison history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleToggleExperienceLevel = (level: string) => {
    setSelectedExperienceLevels(prev => 
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const getExperienceCategory = (years: number) => {
    if (years === 0) return 'Fresher (0 Years)';
    if (years <= 1) return '0-1 Years';
    if (years <= 3) return '1-3 Years';
    if (years <= 5) return '3-5 Years';
    return '5+ Years';
  };

  useEffect(() => {
    fetchHistory();
    fetchRegisteredUsers();
  }, []);

  const handleSelectUser = (user: any) => {
    const username = user.githubUsername;
    if (developerList.some(item => item.toLowerCase() === username.toLowerCase())) {
      showToast('Developer has already been added to the comparison list', 'error');
      setIsDropdownOpen(false);
      setSearchQuery('');
      return;
    }
    setDeveloperList(prev => [...prev, username]);
    setSearchQuery('');
    setIsDropdownOpen(false);
    showToast(`Added ${user.name} (@${username}) to compare list`, 'info');
  };

  const handleRemoveDeveloper = (index: number) => {
    setDeveloperList(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleRunComparison = async () => {
    if (developerList.length < 2) {
      showToast('Please add at least 2 developers to perform comparison', 'error');
      return;
    }

    try {
      setComparing(true);
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: developerList, jobDescription }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setComparisonResults({
          id: data.comparisonId,
          developers: data.developers,
          aiInsights: data.aiInsights,
          rankings: data.rankings,
        });
        showToast('Recruiter dashboard generated successfully!', 'success');
        fetchHistory();
      } else {
        showToast(data.message || 'Comparison failed', 'error');
      }
    } catch (err) {
      showToast('Connection error during comparison', 'error');
    } finally {
      setComparing(false);
    }
  };

  const handleToggleShortlist = async (devIndex: number) => {
    if (!comparisonResults) return;
    const targetDev = comparisonResults.developers[devIndex];
    
    if (!comparisonResults.id) return;
    
    try {
      const userRes = await fetch('/api/compare/history');
      const histData = await userRes.json();
      
      let dbCandidateId = '';
      if (histData.status === 'success') {
        const matchingComp = histData.history.find((h: any) => h.id === comparisonResults.id);
        if (matchingComp) {
          const matchingUser = matchingComp.developers.find((d: any) => d.username.toLowerCase() === targetDev.username.toLowerCase());
          if (matchingUser) dbCandidateId = matchingUser.id;
        }
      }

      const nextState = !targetDev.isShortlisted;

      if (!dbCandidateId) {
        setComparisonResults(prev => {
          if (!prev) return null;
          const updatedDevs = [...prev.developers];
          updatedDevs[devIndex] = { ...updatedDevs[devIndex], isShortlisted: nextState };
          return { ...prev, developers: updatedDevs };
        });
        
        // Also update local selected dossier dev if modal is open
        if (selectedDossierDev && selectedDossierDev.username === targetDev.username) {
          setSelectedDossierDev(prev => prev ? { ...prev, isShortlisted: nextState } : null);
        }

        showToast(`Shortlisted candidate @${targetDev.username} successfully`, 'success');
        return;
      }

      const shortlistRes = await fetch('/api/compare/shortlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: dbCandidateId, isShortlisted: nextState }),
      });

      const resData = await shortlistRes.json();
      if (shortlistRes.ok && resData.status === 'success') {
        setComparisonResults(prev => {
          if (!prev) return null;
          const updatedDevs = [...prev.developers];
          updatedDevs[devIndex] = { ...updatedDevs[devIndex], isShortlisted: nextState };
          return { ...prev, developers: updatedDevs };
        });

        if (selectedDossierDev && selectedDossierDev.username === targetDev.username) {
          setSelectedDossierDev(prev => prev ? { ...prev, isShortlisted: nextState } : null);
        }

        showToast(resData.message || 'Shortlist status synchronized', 'success');
        fetchHistory();
      } else {
        showToast(resData.message || 'Failed to toggle shortlist status', 'error');
      }
    } catch (err) {
      showToast('Network error during candidate shortlisting', 'error');
    }
  };

  const handleLoadHistory = (item: HistoryItem) => {
    setComparisonResults({
      id: item.id,
      developers: item.developers,
      aiInsights: item.aiInsights || {
        mostConsistent: { username: '', name: '', rationale: '' },
        strongestFrontend: { username: '', name: '', rationale: '' },
        strongestBackend: { username: '', name: '', rationale: '' },
        bestOpenSource: { username: '', name: '', rationale: '' },
        mostActive: { username: '', name: '', rationale: '' },
        overallWinner: { username: '', name: '', rationale: '', score: 0 }
      },
      rankings: item.rankings || []
    });
    setDeveloperList(item.developers.map(d => d.username));
    
    // Autofill saved Job Description
    if (item.aiInsights && (item.aiInsights as any).jobDescription) {
      setJobDescription((item.aiInsights as any).jobDescription);
    } else {
      setJobDescription('');
    }

    setShowHistory(false);
    showToast('Loaded saved recruiter comparison session', 'success');
  };

  const handleShareResults = () => {
    if (!comparisonResults) return;
    const winner = comparisonResults.aiInsights.overallWinner;
    const textSummary = `🏆 Recruiter Hiring Report 🏆\n` + 
      `Top Rated Candidate: ${winner.name} (@${winner.username}) — Hiring Score: ${winner.score}/100\n` +
      `Compared Candidates: ${comparisonResults.developers.map(d => `@${d.username} (Hiring Score: ${parseDevStats(d).hiringScore}/100)`).join(', ')}\n` +
      `Generated by DevPulse Recruiter Dashboard. Compare Session Token: [${comparisonResults.id || 'Draft Report'}]`;
    
    navigator.clipboard.writeText(textSummary);
    showToast('Recruiter summary report copied to clipboard!', 'success');
  };

  const handleExportPDF = () => {
    window.print();
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
      C: '#555555',
      Ruby: '#701516',
      'C#': '#178600',
      Java: '#b07219',
      PHP: '#4F5D95'
    };
    return colors[lang] || '#8e8e93';
  };

  // Find peak values in developers array to highlight the winner for each metric
  const getPeakDeveloper = (metric: keyof Developer) => {
    if (!comparisonResults) return null;
    return comparisonResults.developers.reduce((maxDev, currentDev) => {
      const val1 = (maxDev[metric] as number) || 0;
      const val2 = (currentDev[metric] as number) || 0;
      return val2 > val1 ? currentDev : maxDev;
    });
  };

  // Summary Metrics calculations
  const summaryMetrics = React.useMemo(() => {
    if (!comparisonResults) return null;
    const totalCount = comparisonResults.developers.length;
    const stats = comparisonResults.developers.map(d => parseDevStats(d));
    const avgScore = Math.round(stats.reduce((sum, s) => sum + s.hiringScore, 0) / totalCount);
    const activeCount = stats.filter(s => s.recentlyActive).length;
    const openCount = stats.filter(s => s.openToWork).length;
    
    const topIdx = stats.reduce((maxI, curr, i, arr) => curr.hiringScore > arr[maxI].hiringScore ? i : maxI, 0);
    const topCandidate = comparisonResults.developers[topIdx];
    const topScore = stats[topIdx].hiringScore;

    return { totalCount, avgScore, activeCount, openCount, topCandidate, topScore };
  }, [comparisonResults]);

  return (
    <div className="space-y-8 animate-slide-in pb-12 print:bg-white print:text-zinc-900 print:p-0">
      
      {/* 1. Comparison Control Panel */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/40 p-6 backdrop-blur-sm shadow-xl flex flex-col gap-6 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-md">
              <GitCompare className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                Recruiter Selection & Setup
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Paste a job description, search platform users, and calculate deep AI-powered matches and recruiter readiness ratings.
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 px-4 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer"
            >
              <History className="h-4 w-4" />
              Saved Dashboards ({history.length})
            </button>

            {showHistory && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 shadow-2xl z-50 animate-slide-in">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-3 py-2 border-b border-zinc-200 dark:border-zinc-800/80 mb-2">Previous Comparisons</h4>
                {historyLoading ? (
                  <div className="flex justify-center p-4">
                    <Loader className="h-5 w-5 animate-spin text-cyan-500" />
                  </div>
                ) : history.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-4">No saved comparisons found.</p>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleLoadHistory(item)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all group cursor-pointer"
                      >
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-cyan-500 dark:group-hover:text-cyan-400">
                          {item.title}
                        </div>
                        <span className="text-[9px] text-zinc-500 block mt-0.5">
                          {new Date(item.createdAt).toLocaleDateString()} &bull; {item.developers.length} Candidates
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Setup Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Paste Job Description */}
          <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-extrabold uppercase tracking-wider block">1. Paste Job Description (JD)</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-zinc-400">Templates:</span>
                  <button 
                    onClick={() => setJobDescription(JD_TEMPLATES.fullstack)}
                    className="text-[9px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 hover:dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    Full Stack
                  </button>
                  <button 
                    onClick={() => setJobDescription(JD_TEMPLATES.backend)}
                    className="text-[9px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 hover:dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    Backend
                  </button>
                  <button 
                    onClick={() => setJobDescription(JD_TEMPLATES.frontend)}
                    className="text-[9px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 hover:dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    Frontend
                  </button>
                </div>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here to analyze skills, technologies, experience levels, and calculate suitability match percentages..."
                className="w-full h-32 p-3 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-zinc-900 dark:text-white transition-all resize-none shadow-inner"
              />
            </div>

            {/* Custom Searchable Dropdown */}
            <div className="relative space-y-2">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-extrabold uppercase tracking-wider block">2. Search Registered Developers</span>
              
              <div className="space-y-1">
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold block">Filter by Role:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {['All', 'Frontend', 'Backend', 'Full Stack', 'AI/ML', 'DevOps'].map((cat) => {
                    const isActive = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-[10px] px-3 py-1 rounded-full font-bold transition-all border cursor-pointer ${
                          isActive
                            ? 'bg-cyan-600 border-cyan-600 text-white shadow-md'
                            : 'bg-zinc-150/60 hover:bg-zinc-200 dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold block">Filter by Experience Level:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {['Fresher (0 Years)', '0-1 Years', '1-3 Years', '3-5 Years', '5+ Years'].map((level) => {
                    const isActive = selectedExperienceLevels.includes(level);
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => handleToggleExperienceLevel(level)}
                        className={`text-[10px] px-3 py-1 rounded-full font-bold transition-all border cursor-pointer ${
                          isActive
                            ? 'bg-cyan-600 border-cyan-600 text-white shadow-md'
                            : 'bg-zinc-150/60 hover:bg-zinc-200 dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400'
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-4.5 w-4.5 text-zinc-450 dark:text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder={`Search ${selectedCategory !== 'All' ? selectedCategory : ''} developers by name, username, or skills...`}
                  className="w-full pl-11 pr-10 rounded-xl border bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-700 focus:ring-2 focus:ring-cyan-500 text-sm outline-none transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 text-zinc-450 hover:text-zinc-600 dark:hover:text-zinc-250"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {isDropdownOpen && (
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setIsDropdownOpen(false)}
                />
              )}

              {isDropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 max-h-56 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl z-50 animate-slide-in divide-y divide-zinc-150 dark:divide-zinc-900">
                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-6 gap-2 text-xs text-zinc-500">
                      <Loader className="h-4 w-4 animate-spin text-cyan-500" />
                      Fetching developers...
                    </div>
                  ) : (() => {
                    const filteredOptions = registeredUsers.filter(user => {
                      const matchesSearch = 
                        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.githubUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.headline.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesCategory = 
                        selectedCategory === 'All' || 
                        user.categories.some((cat: string) => cat.toLowerCase() === selectedCategory.toLowerCase());
                      const matchesExperience = 
                        selectedExperienceLevels.length === 0 ||
                        selectedExperienceLevels.includes(getExperienceCategory(user.expYears || 0));
                      const isAlreadySelected = developerList.some(username => username.toLowerCase() === user.githubUsername.toLowerCase());
                      return matchesSearch && matchesCategory && matchesExperience && !isAlreadySelected;
                    });

                    if (filteredOptions.length === 0) {
                      return (
                        <div className="text-center py-6 text-zinc-500 text-xs font-semibold">
                          {searchQuery ? 'No matching developers found.' : 'No other developers available.'}
                        </div>
                      );
                    }

                    return filteredOptions.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 flex items-center gap-3 transition-colors group cursor-pointer"
                      >
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="h-9 w-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-850"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${user.githubUsername}`;
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 text-xs truncate">
                              {user.name}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 px-1.5 py-0.5 rounded font-extrabold shrink-0">
                                {user.expYears !== undefined ? (user.expYears > 0 ? `${user.expYears}y Exp` : 'Fresher') : 'Fresher'}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-bold shrink-0">
                                @{user.githubUsername}
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] text-zinc-550 truncate mt-0.5 font-medium">
                            {user.headline}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {user.categories.map((cat: string) => (
                              <span
                                key={cat}
                                className="text-[8px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 font-bold"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Selected Preview List */}
          <div className="border border-zinc-200 dark:border-zinc-850 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20 p-5 space-y-4 flex flex-col justify-between h-full">
            <div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-3">
                Candidates Queue ({developerList.length})
              </span>
              {developerList.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs font-semibold">
                  No candidates added. Search developers to begin dashboard setup.
                </div>
              ) : (
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {developerList.map((username, idx) => {
                    const user = registeredUsers.find(u => u.githubUsername.toLowerCase() === username.toLowerCase()) || {
                      githubUsername: username,
                      name: username,
                      headline: 'Platform Developer',
                      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`
                    };
                    return (
                      <div 
                        key={username + idx}
                        className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 p-2 rounded-xl shadow-sm text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img 
                            src={user.avatarUrl} 
                            alt={user.name} 
                            className="h-7 w-7 rounded-full border border-zinc-200 dark:border-zinc-800 object-cover shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${user.githubUsername}`;
                            }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block truncate max-w-[100px]">{user.name}</span>
                              <span className="text-[8px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 px-1 py-0.2 rounded font-extrabold shrink-0">
                                {user.expYears !== undefined ? (user.expYears > 0 ? `${user.expYears}y` : '0y') : '0y'}
                              </span>
                            </div>
                            <span className="text-[9px] text-zinc-550 block">@{user.githubUsername}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveDeveloper(idx)}
                          className="text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-955 p-1 rounded-lg transition-all cursor-pointer"
                          type="button"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={handleRunComparison}
              disabled={comparing || developerList.length < 2}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-4 py-3 text-xs font-bold text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-all cursor-pointer"
            >
              {comparing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Generating Dashboard...
                </>
              ) : (
                <>
                  <GitCompare className="h-4 w-4" />
                  Generate Recruiter Analytics
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Results Dashboard Panel */}
      {comparisonResults && summaryMetrics && (
        <div className="space-y-8">
          
          {/* Quick Header Summary Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-4 print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full font-extrabold uppercase tracking-wider">
                Recruiter Mode Active
              </span>
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Session: {comparisonResults.id?.substring(0, 8) || 'Draft Report'}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShareResults}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 px-4.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer"
              >
                <Copy className="h-4 w-4" />
                Copy Dashboard Summary
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 px-4.5 py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                Export PDF Report
              </button>
            </div>
          </div>

          {/* SaaS Summary Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
            {/* Total Compared Candidates */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/30 p-4.5 shadow-sm space-y-2 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Total Candidates</span>
                <span className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500"><UserPlus className="h-4 w-4" /></span>
              </div>
              <div>
                <div className="text-2xl font-black text-zinc-900 dark:text-white">{summaryMetrics.totalCount}</div>
                <p className="text-[9px] text-zinc-500">Developers in lineup</p>
              </div>
            </div>

            {/* Top Rated Candidate */}
            <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-tr from-yellow-500/[0.03] to-transparent p-4.5 shadow-sm space-y-2 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-yellow-600 dark:text-yellow-500 font-extrabold uppercase tracking-wider">Top Rated candidate</span>
                <span className="p-1 rounded-lg bg-yellow-500/10 text-yellow-500"><Trophy className="h-4 w-4" /></span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black text-zinc-850 dark:text-zinc-150 truncate flex items-center gap-1">
                  {summaryMetrics.topCandidate.name}
                </div>
                <div className="text-xl font-black text-yellow-650 dark:text-yellow-500 mt-0.5">
                  {summaryMetrics.topScore} <span className="text-[10px] text-zinc-550 font-normal">Score</span>
                </div>
              </div>
            </div>

            {/* Open to Work Candidates */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.01] p-4.5 shadow-sm space-y-2 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-extrabold uppercase tracking-wider">Open to Work</span>
                <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500"><Briefcase className="h-4 w-4" /></span>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-650 dark:text-emerald-500">{summaryMetrics.openCount}</div>
                <p className="text-[9px] text-zinc-500">Actively hiring matches</p>
              </div>
            </div>

            {/* Recently Active Candidates */}
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.01] p-4.5 shadow-sm space-y-2 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-indigo-650 dark:text-indigo-400 font-extrabold uppercase tracking-wider">Recently Active</span>
                <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-500"><Activity className="h-4 w-4" /></span>
              </div>
              <div>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{summaryMetrics.activeCount}</div>
                <p className="text-[9px] text-zinc-500">Commits within 30 days</p>
              </div>
            </div>

            {/* Average Hiring Score */}
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.01] p-4.5 shadow-sm space-y-2 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-extrabold uppercase tracking-wider">Average Score</span>
                <span className="p-1 rounded-lg bg-cyan-500/10 text-cyan-500"><Award className="h-4 w-4" /></span>
              </div>
              <div>
                <div className="text-2xl font-black text-cyan-650 dark:text-cyan-455">{summaryMetrics.avgScore} <span className="text-xs text-zinc-500">/100</span></div>
                <p className="text-[9px] text-zinc-500">Linuep average rating</p>
              </div>
            </div>

          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800/80 gap-6 overflow-x-auto pb-px print:hidden">
            {[
              { id: 'overview', label: 'Dashboard Overview' },
              { id: 'leaderboard', label: 'Hiring Leaderboard' },
              { id: 'gaps', label: 'Skills Gap Analysis' },
              { id: 'readiness', label: 'Interview Readiness' },
              { id: 'timeline', label: 'Growth Timelines' },
              { id: 'table', label: 'Side-by-Side Table' },
              { id: 'stack', label: 'Tech Stack & Skills' },
              { id: 'heatmap', label: 'Activity Heatmaps' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition-all outline-none shrink-0 cursor-pointer ${
                  activeSubTab === tab.id
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* VIEW 1: OVERVIEW & AI INSIGHTS */}
          {(activeSubTab === 'overview' || typeof window === 'undefined') && (
            <div className="space-y-8 animate-slide-in print:block">
              
              {/* Champion Card Banner */}
              <div className="rounded-3xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/[0.06] via-amber-500/[0.01] to-transparent p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-inner relative overflow-hidden">
                <div className="absolute right-0 top-0 h-40 w-40 bg-yellow-500/5 rounded-full filter blur-xl"></div>
                
                <div className="h-16 w-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-500 shrink-0 shadow-lg">
                  <Trophy className="h-8 w-8 animate-bounce" />
                </div>
                
                <div className="space-y-2 text-center md:text-left flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-bold text-yellow-600 dark:text-yellow-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    Overall Hiring Recommendation
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white">
                    {comparisonResults.aiInsights.overallWinner.name} is the Best Match!
                  </h3>
                  <p className="text-xs md:text-sm text-zinc-650 dark:text-zinc-450 max-w-3xl leading-relaxed">
                    {comparisonResults.aiInsights.overallWinner.rationale}
                  </p>
                </div>
                
                <div className="text-center md:text-right shrink-0">
                  <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider block">Hiring Score</span>
                  <div className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white mt-1">
                    {comparisonResults.aiInsights.overallWinner.score}<span className="text-zinc-500 text-lg">/100</span>
                  </div>
                  {comparisonResults.aiInsights.overallWinner.matchPercentage !== undefined && (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-extrabold mt-1 block">
                      {comparisonResults.aiInsights.overallWinner.matchPercentage}% JD Match
                    </span>
                  )}
                </div>
              </div>

              {/* Developer overall scores cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comparisonResults.developers.map((dev, idx) => {
                  const stats = parseDevStats(dev);
                  const isWinner = dev.username === comparisonResults.aiInsights.overallWinner.username;
                  return (
                    <div 
                      key={dev.username} 
                      className={`rounded-2xl border bg-white/80 dark:bg-zinc-900/30 p-5 flex flex-col justify-between shadow-sm relative ${
                        isWinner ? 'border-yellow-500/30 ring-1 ring-yellow-500/20' : 'border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={dev.avatarUrl} 
                            alt={dev.name} 
                            className="h-11 w-11 rounded-full object-cover border border-zinc-200 dark:border-zinc-850"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${dev.username}`;
                            }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[110px]">{dev.name}</h4>
                              <span className="text-[8px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 px-1 py-0.2 rounded font-extrabold shrink-0">
                                {stats.expYears !== undefined ? (stats.expYears > 0 ? `${stats.expYears}y Exp` : 'Fresher') : 'Fresher'}
                              </span>
                            </div>
                            <span className="text-[9px] text-zinc-550 block">@{dev.username}</span>
                            {stats.openToWork && (
                              <span className="text-[7px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1 rounded uppercase font-bold mt-1 inline-block">
                                Open to Work
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`text-xl font-black ${isWinner ? 'text-yellow-500' : 'text-cyan-500'}`}>
                            {stats.hiringScore}
                          </div>
                          <span className="text-[8px] text-zinc-550 font-bold uppercase tracking-wider">Hiring Score</span>
                        </div>
                      </div>

                      {/* Progress bar matching */}
                      <div className="space-y-1 mt-4">
                        <div className="flex justify-between text-[9px] font-bold text-zinc-600 dark:text-zinc-400">
                          <span>JD Compatibility</span>
                          <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">{stats.matchPercentage}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-850">
                          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${stats.matchPercentage}%` }}></div>
                        </div>
                      </div>

                      {/* Tech stack Tags */}
                      <div className="flex flex-wrap gap-1 mt-4">
                        {stats.tags.slice(0, 3).map((tag: string) => (
                          <span 
                            key={tag}
                            className="text-[9px] bg-zinc-150/50 dark:bg-zinc-950 px-2 py-0.5 rounded-md text-zinc-650 dark:text-zinc-400 font-extrabold border border-zinc-200/50 dark:border-zinc-850"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Database details grid */}
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-zinc-150 dark:border-zinc-800/80 text-center">
                        <div>
                          <span className="text-[8px] text-zinc-500 block font-bold uppercase tracking-wider">LeetCode</span>
                          <span className="text-[10px] text-zinc-800 dark:text-zinc-200 font-black mt-0.5 block">
                            {stats.leetcodeStats ? `${stats.leetcodeStats.totalSolved} solved` : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-zinc-500 block font-bold uppercase tracking-wider">Certifications</span>
                          <span className="text-[10px] text-zinc-800 dark:text-zinc-200 font-black mt-0.5 block">
                            {stats.certificationsCount > 0 ? `${stats.certificationsCount} certs` : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-zinc-500 block font-bold uppercase tracking-wider">Experience</span>
                          <span className="text-[10px] text-zinc-800 dark:text-zinc-200 font-black mt-0.5 block">
                            {stats.experiencesCount > 0 ? `${stats.experiencesCount} roles` : '—'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/80 print:hidden">
                        <button
                          onClick={() => setSelectedDossierDev(dev)}
                          className="flex-1 flex items-center justify-center gap-1 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-350 hover:dark:bg-zinc-800 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer"
                          title="View Dossier"
                        >
                          <Eye className="h-3 w-3 shrink-0" /> Dossier
                        </button>
                        <a
                          href={`/portfolio/${dev.username}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-1.5 rounded-lg text-[10px] font-extrabold shadow-sm hover:shadow-md transition-all cursor-pointer text-center"
                          title="View Portfolio"
                        >
                          <Briefcase className="h-3 w-3 shrink-0" /> Portfolio
                        </a>
                        <button
                          onClick={() => handleToggleShortlist(idx)}
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                            dev.isShortlisted
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-855 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-350 hover:text-zinc-950 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <Check className="h-3 w-3 shrink-0" />
                          {dev.isShortlisted ? 'Shortlisted' : 'Shortlist'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Glowing AI Badges Section */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  AI-Powered Recruiter Badges
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Badge 1: Consistency */}
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.01] p-5 space-y-3 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-20 w-20 bg-emerald-500/5 rounded-full filter blur-lg"></div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                        <Award className="h-4 w-4" />
                      </span>
                      <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-500">Most Consistent Developer</h5>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                        {comparisonResults.aiInsights.mostConsistent.name}
                      </span>
                      <p className="text-[11px] text-zinc-550 dark:text-zinc-400 leading-relaxed mt-1">
                        {comparisonResults.aiInsights.mostConsistent.rationale}
                      </p>
                    </div>
                  </div>

                  {/* Badge 2: Frontend */}
                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.01] p-5 space-y-3 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-20 w-20 bg-cyan-500/5 rounded-full filter blur-lg"></div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-500">
                        <Award className="h-4 w-4" />
                      </span>
                      <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-550 dark:text-cyan-400">Strongest Frontend Developer</h5>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                        {comparisonResults.aiInsights.strongestFrontend.name}
                      </span>
                      <p className="text-[11px] text-zinc-550 dark:text-zinc-400 leading-relaxed mt-1">
                        {comparisonResults.aiInsights.strongestFrontend.rationale}
                      </p>
                    </div>
                  </div>

                  {/* Badge 3: Backend */}
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.01] p-5 space-y-3 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-20 w-20 bg-blue-500/5 rounded-full filter blur-lg"></div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400">
                        <Award className="h-4 w-4" />
                      </span>
                      <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-blue-550 dark:text-blue-450">Strongest Backend Developer</h5>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                        {comparisonResults.aiInsights.strongestBackend.name}
                      </span>
                      <p className="text-[11px] text-zinc-550 dark:text-zinc-400 leading-relaxed mt-1">
                        {comparisonResults.aiInsights.strongestBackend.rationale}
                      </p>
                    </div>
                  </div>

                  {/* Badge 4: Full Stack */}
                  <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.01] p-5 space-y-3 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-20 w-20 bg-purple-500/5 rounded-full filter blur-lg"></div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-500">
                        <Award className="h-4 w-4" />
                      </span>
                      <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-purple-550 dark:text-purple-400">Best Full Stack Developer</h5>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                        {comparisonResults.aiInsights.strongestFullstack?.name || comparisonResults.aiInsights.overallWinner.name}
                      </span>
                      <p className="text-[11px] text-zinc-550 dark:text-zinc-400 leading-relaxed mt-1">
                        {comparisonResults.aiInsights.strongestFullstack?.rationale || 'Demonstrates stellar capacities handling complex cross-system full stack integration requirements.'}
                      </p>
                    </div>
                  </div>

                  {/* Badge 5: Open Source */}
                  <div className="rounded-2xl border border-orange-500/20 bg-orange-500/[0.01] p-5 space-y-3 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-20 w-20 bg-orange-500/5 rounded-full filter blur-lg"></div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500">
                        <Award className="h-4 w-4" />
                      </span>
                      <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-orange-500">Best Open Source Contributor</h5>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                        {comparisonResults.aiInsights.bestOpenSource.name}
                      </span>
                      <p className="text-[11px] text-zinc-550 dark:text-zinc-400 leading-relaxed mt-1">
                        {comparisonResults.aiInsights.bestOpenSource.rationale}
                      </p>
                    </div>
                  </div>

                  {/* Badge 6: Most Active */}
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/[0.01] dark:bg-zinc-900/[0.01] p-5 space-y-3 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-20 w-20 bg-zinc-500/5 rounded-full filter blur-lg"></div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        <Award className="h-4 w-4" />
                      </span>
                      <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-550 dark:text-zinc-400">Most Active Developer</h5>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                        {comparisonResults.aiInsights.mostActive.name}
                      </span>
                      <p className="text-[11px] text-zinc-550 dark:text-zinc-400 leading-relaxed mt-1">
                        {comparisonResults.aiInsights.mostActive.rationale}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: HIRING LEADERBOARD */}
          {activeSubTab === 'leaderboard' && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-6 backdrop-blur-sm shadow-xl space-y-6 animate-slide-in">
              <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  Ranked Recruitment Leaderboard
                </h4>
                <span className="text-[10px] text-zinc-500">Sorted by hiring score</span>
              </div>

              <div className="space-y-4">
                {comparisonResults.developers.map((dev, idx) => {
                  const stats = parseDevStats(dev);
                  const rank = idx + 1;
                  const medalColor = rank === 1 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' :
                                     rank === 2 ? 'bg-zinc-300/10 border-zinc-300/30 text-zinc-400' :
                                     rank === 3 ? 'bg-amber-600/10 border-amber-600/30 text-amber-600 dark:text-amber-500' :
                                     'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500';
                  
                  return (
                    <div 
                      key={dev.username} 
                      className="rounded-xl border border-zinc-200/60 dark:border-zinc-850 bg-white dark:bg-zinc-900/40 p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-cyan-500/20"
                    >
                      {/* Left: Rank & Avatar */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className={`h-8 w-8 rounded-lg border flex items-center justify-center font-extrabold text-xs shrink-0 ${medalColor}`}>
                          #{rank}
                        </div>
                        <img 
                          src={dev.avatarUrl} 
                          alt={dev.name} 
                          className="h-10 w-10 rounded-full border border-zinc-200 dark:border-zinc-850 object-cover shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${dev.username}`;
                          }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[120px]">{dev.name}</h4>
                            <span className="text-[8px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 px-1 py-0.2 rounded font-extrabold shrink-0">
                              {stats.expYears !== undefined ? (stats.expYears > 0 ? `${stats.expYears}y Exp` : 'Fresher') : 'Fresher'}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-semibold block">@{dev.username}</span>
                        </div>
                      </div>

                      {/* Middle: Match Rating progress slider */}
                      <div className="flex items-center gap-4.5 flex-1 w-full md:max-w-xs shrink-0">
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-zinc-650 dark:text-zinc-400">
                            <span>JD Compatibility Match</span>
                            <span className="text-cyan-500 font-extrabold">{stats.matchPercentage}%</span>
                          </div>
                          <div className="w-full bg-zinc-150 dark:bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-850">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${stats.matchPercentage}%` }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Scores & Actions */}
                      <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 border-t border-zinc-100 dark:border-zinc-800/80 md:border-t-0 pt-3 md:pt-0">
                        <div className="text-center md:text-right shrink-0">
                          <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Hiring score</span>
                          <span className="text-xl font-black text-cyan-600 dark:text-cyan-400">{stats.hiringScore} <span className="text-[10px] text-zinc-500 font-bold">/100</span></span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedDossierDev(dev)}
                            className="bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 p-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            title="Generate Dossier"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <a
                            href={`/portfolio/${dev.username}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg"
                            title="View Portfolio"
                          >
                            <Briefcase className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => handleToggleShortlist(idx)}
                            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              dev.isShortlisted
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-855 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-350 hover:text-zinc-950 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                            {dev.isShortlisted ? 'Shortlisted' : 'Shortlist'}
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: SKILLS GAP ANALYSIS */}
          {activeSubTab === 'gaps' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-in">
              {comparisonResults.developers.map((dev, idx) => {
                const stats = parseDevStats(dev);
                return (
                  <div key={dev.username} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-5 shadow-sm flex flex-col justify-between gap-6">
                    <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-850 pb-4">
                      <img 
                        src={dev.avatarUrl} 
                        alt={dev.name} 
                        className="h-10 w-10 rounded-full border border-zinc-200 dark:border-zinc-800 object-cover shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${dev.username}`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">{dev.name}</h4>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] text-zinc-555 font-semibold">@{dev.username}</span>
                          <span className="text-zinc-350 dark:text-zinc-700">&bull;</span>
                          <a 
                            href={`/portfolio/${dev.username}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-0.5 text-[9px] text-cyan-600 dark:text-cyan-400 hover:underline font-bold"
                          >
                            <Briefcase className="h-3 w-3" />
                            Portfolio
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4.5 flex-1">
                      
                      {/* Matching Skills */}
                      <div className="space-y-2">
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-extrabold uppercase tracking-wider block">✔ Matching Skills ({stats.skillsGap.matchingSkills.length})</span>
                        {stats.skillsGap.matchingSkills.length === 0 ? (
                          <span className="text-[10px] text-zinc-500 block italic">No matching keywords parsed from this candidate's profile.</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {stats.skillsGap.matchingSkills.map((skill: string) => (
                              <span key={skill} className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-lg font-bold">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Missing Skills */}
                      <div className="space-y-2">
                        <span className="text-[9px] text-rose-600 dark:text-rose-500 font-extrabold uppercase tracking-wider block">🗙 Missing Skills ({stats.skillsGap.missingSkills.length})</span>
                        {stats.skillsGap.missingSkills.length === 0 ? (
                          <span className="text-[10px] text-emerald-500 block font-bold">Perfect fit! No missing skills.</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {stats.skillsGap.missingSkills.map((skill: string) => (
                              <span key={skill} className="text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-650 dark:text-rose-400 px-2.5 py-0.5 rounded-lg font-bold">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Recommended Upskilling */}
                      <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                        <span className="text-[9px] text-yellow-600 dark:text-yellow-500 font-extrabold uppercase tracking-wider block">⚠ Recommended Upskilling Areas</span>
                        <ul className="space-y-1.5">
                          {stats.skillsGap.recommendedUpskilling.map((rec: string, index: number) => (
                            <li key={index} className="text-[10px] text-zinc-650 dark:text-zinc-400 font-semibold flex items-start gap-1.5">
                              <span className="text-yellow-500 text-xs mt-0.5">●</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    <button
                      onClick={() => setSelectedDossierDev(dev)}
                      className="w-full text-center py-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-xl transition-all cursor-pointer"
                    >
                      Inspect Advanced Career Progression
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 4: INTERVIEW READINESS */}
          {activeSubTab === 'readiness' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-in">
              {comparisonResults.developers.map((dev, idx) => {
                const stats = parseDevStats(dev);
                return (
                  <div key={dev.username} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-5 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-850 pb-4">
                      <img 
                        src={dev.avatarUrl} 
                        alt={dev.name} 
                        className="h-10 w-10 rounded-full border border-zinc-200 dark:border-zinc-800 object-cover shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${dev.username}`;
                        }}
                      />
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{dev.name}</h4>
                        <span className="text-[9px] text-zinc-550 block">@{dev.username}</span>
                      </div>
                    </div>

                    {/* Progress meters */}
                    <div className="space-y-4">
                      
                      {/* Technical Readiness */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-zinc-750 dark:text-zinc-350">Technical Readiness</span>
                          <span className="text-cyan-500 font-black">{stats.interviewReadiness.technicalReadiness}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-850">
                          <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${stats.interviewReadiness.technicalReadiness}%` }}></div>
                        </div>
                        <p className="text-[8px] text-zinc-500">LeetCode rankings, public system repos, and algorithmic expertise</p>
                      </div>

                      {/* Portfolio Quality */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-zinc-750 dark:text-zinc-350">Portfolio Quality</span>
                          <span className="text-emerald-500 font-black">{stats.interviewReadiness.portfolioQuality}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-850">
                          <div className="h-full bg-emerald-555 rounded-full" style={{ width: `${stats.interviewReadiness.portfolioQuality}%` }}></div>
                        </div>
                        <p className="text-[8px] text-zinc-500">Biography depth, location credentials, verified connections</p>
                      </div>

                      {/* Coding Consistency */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-zinc-750 dark:text-zinc-350">Coding Consistency</span>
                          <span className="text-yellow-500 font-black">{stats.interviewReadiness.codingConsistency}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-850">
                          <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${stats.interviewReadiness.codingConsistency}%` }}></div>
                        </div>
                        <p className="text-[8px] text-zinc-500">Active commit streaks and code contributions over 30 days</p>
                      </div>

                      {/* Profile Completeness */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-zinc-750 dark:text-zinc-350">Professional Profile Completeness</span>
                          <span className="text-indigo-500 font-black">{stats.interviewReadiness.profileCompleteness}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-850">
                          <div className="h-full bg-indigo-555 rounded-full" style={{ width: `${stats.interviewReadiness.profileCompleteness}%` }}></div>
                        </div>
                        <p className="text-[8px] text-zinc-500">Work experience roles, verified skill matrices, and certification counts</p>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 5: DYNAMIC GROWTH TIMELINES (PURE SVGS) */}
          {activeSubTab === 'timeline' && (
            <div className="space-y-8 animate-slide-in">
              {comparisonResults.developers.map((dev) => {
                const stats = parseDevStats(dev);
                
                // Helper to render pure SVG Area Chart
                const renderCommitChart = () => {
                  const points = stats.candidateGrowth.commitGrowth;
                  const width = 360;
                  const height = 110;
                  const maxVal = Math.max(...points.map((p: any) => p.value), 20);
                  
                  // Compute x & y coordinates
                  const coordinates = points.map((p: any, i: number) => {
                    const x = 30 + (i * 100);
                    const y = height - 15 - ((p.value / maxVal) * 80);
                    return { x, y, val: p.value, label: p.label };
                  });

                  // D-Path string for svg
                  const linePath = coordinates.reduce((path: string, p: any, i: number) => 
                    i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`, ''
                  );

                  const areaPath = linePath + ` L ${coordinates[coordinates.length - 1].x} ${height - 15} L ${coordinates[0].x} ${height - 15} Z`;

                  return (
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-cyan-500">
                      <defs>
                        <linearGradient id={`grad-${dev.username}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Grid Line */}
                      <line x1="30" y1={height - 15} x2={width - 20} y2={height - 15} stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
                      <line x1="30" y1="15" x2={width - 20} y2="15" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
                      
                      {/* Fill Area */}
                      <path d={areaPath} fill={`url(#grad-${dev.username})`} />
                      
                      {/* Line */}
                      <path d={linePath} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      
                      {/* Points & Text */}
                      {coordinates.map((p: any, i: number) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="4" fill="currentColor" />
                          <text x={p.x} y={p.y - 8} fill="currentColor" fontSize="8" fontWeight="bold" textAnchor="middle">
                            {p.val}
                          </text>
                          <text x={p.x} y={height - 4} fill="#8e8e93" fontSize="8" textAnchor="middle">
                            {p.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  );
                };

                return (
                  <div key={dev.username} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-6 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-850 pb-4">
                      <img 
                        src={dev.avatarUrl} 
                        alt={dev.name} 
                        className="h-10 w-10 rounded-full border border-zinc-200 dark:border-zinc-800 object-cover shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${dev.username}`;
                        }}
                      />
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{dev.name}</h4>
                        <span className="text-[9px] text-zinc-550 block">@{dev.username}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* GitHub Commit growth */}
                      <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-150 dark:border-zinc-850 space-y-3">
                        <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-wider block">GitHub Commit Activity Growth (30d)</span>
                        <div className="h-28 flex items-center justify-center">
                          {renderCommitChart()}
                        </div>
                      </div>

                      {/* Public Project Growth */}
                      <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-150 dark:border-zinc-850 space-y-3">
                        <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-wider block">Public Repositories Timeline</span>
                        <div className="space-y-4.5 pt-3">
                          {stats.candidateGrowth.projectGrowth.map((p: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                              <span className="text-zinc-550">{p.label}</span>
                              <span className="font-extrabold text-zinc-950 dark:text-zinc-150 flex items-center gap-1">
                                {p.value} repos
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Certification progression */}
                      <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-150 dark:border-zinc-850 space-y-3">
                        <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-wider block">Acquired Certifications</span>
                        <div className="space-y-4.5 pt-3">
                          {stats.candidateGrowth.certsGrowth.map((p: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                              <span className="text-zinc-550">{p.label}</span>
                              <span className="font-extrabold text-zinc-950 dark:text-zinc-150 flex items-center gap-1">
                                {p.value} certs
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 6: SIDE BY SIDE TABLE */}
          {(activeSubTab === 'table' || typeof window === 'undefined') && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-6 backdrop-blur-sm shadow-xl overflow-x-auto animate-slide-in print:block">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-850 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-4 px-4">Developer</th>
                    <th className="py-4 px-4 text-center">Hiring Score</th>
                    <th className="py-4 px-4 text-center">JD Match %</th>
                    <th className="py-4 px-4 text-center">Stars</th>
                    <th className="py-4 px-4 text-center">Forks</th>
                    <th className="py-4 px-4 text-center">Followers</th>
                    <th className="py-4 px-4 text-center">Public Repos</th>
                    <th className="py-4 px-4 text-center">LeetCode</th>
                    <th className="py-4 px-4 text-center">Certs</th>
                    <th className="py-4 px-4 text-center">Experience</th>
                    <th className="py-4 px-4 text-center">Contributions (30d)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-850/80 font-medium">
                  {comparisonResults.developers.map((dev) => {
                    const stats = parseDevStats(dev);
                    const isWinner = dev.username === comparisonResults.aiInsights.overallWinner.username;
                    return (
                      <tr 
                        key={dev.username}
                        className={`hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 transition-colors ${
                          isWinner ? 'bg-yellow-500/[0.01]' : ''
                        }`}
                      >
                        <td className="py-4 px-4 flex items-center gap-3">
                          <img 
                            src={dev.avatarUrl} 
                            alt={dev.name} 
                            className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800 shrink-0 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${dev.username}`;
                            }}
                          />
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-white block truncate max-w-[120px]">{dev.name}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] text-zinc-550">@{dev.username}</span>
                              <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
                              <a 
                                href={`/portfolio/${dev.username}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[9px] text-cyan-600 dark:text-cyan-400 hover:underline font-bold"
                              >
                                Portfolio
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center text-zinc-900 dark:text-white font-extrabold text-sm md:text-base">
                          {stats.hiringScore}
                        </td>
                        <td className="py-4 px-4 text-center text-cyan-600 dark:text-cyan-400 font-extrabold text-sm">
                          {stats.matchPercentage}%
                        </td>
                        <td className={`py-4 px-4 text-center font-bold ${
                          dev.username === getPeakDeveloper('stars')?.username ? 'text-yellow-500' : 'text-zinc-650 dark:text-zinc-300'
                        }`}>
                          {dev.stars.toLocaleString()}
                        </td>
                        <td className={`py-4 px-4 text-center font-bold ${
                          dev.username === getPeakDeveloper('forks')?.username ? 'text-cyan-500' : 'text-zinc-650 dark:text-zinc-300'
                        }`}>
                          {dev.forks.toLocaleString()}
                        </td>
                        <td className={`py-4 px-4 text-center font-bold ${
                          dev.username === getPeakDeveloper('followers')?.username ? 'text-emerald-500' : 'text-zinc-650 dark:text-zinc-300'
                        }`}>
                          {dev.followers.toLocaleString()}
                        </td>
                        <td className={`py-4 px-4 text-center font-bold ${
                          dev.username === getPeakDeveloper('publicRepos')?.username ? 'text-cyan-500' : 'text-zinc-650 dark:text-zinc-300'
                        }`}>
                          {dev.publicRepos}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-zinc-650 dark:text-zinc-300">
                          {stats.leetcodeStats ? stats.leetcodeStats.totalSolved : '—'}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-zinc-650 dark:text-zinc-300">
                          {stats.certificationsCount > 0 ? stats.certificationsCount : '—'}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-zinc-650 dark:text-zinc-300">
                          {stats.experiencesCount > 0 ? stats.experiencesCount : '—'}
                        </td>
                        <td className={`py-4 px-4 text-center font-bold ${
                          dev.username === getPeakDeveloper('totalContributions')?.username ? 'text-emerald-500' : 'text-zinc-650 dark:text-zinc-300'
                        }`}>
                          {dev.totalContributions}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW 7: TECH STACK & SKILLS */}
          {activeSubTab === 'stack' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-in">
              {comparisonResults.developers.map((dev) => {
                const stats = parseDevStats(dev);
                return (
                  <div key={dev.username} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-6 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-850 pb-4">
                      <img 
                        src={dev.avatarUrl} 
                        alt={dev.name} 
                        className="h-10 w-10 rounded-full border border-zinc-200 dark:border-zinc-800 object-cover shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${dev.username}`;
                        }}
                      />
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{dev.name}</h4>
                        <span className="text-[9px] text-zinc-550 block">@{dev.username}</span>
                      </div>
                    </div>

                    {/* Languages progress bars */}
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Languages composition</h5>
                      {dev.mostUsedLanguages.length === 0 ? (
                        <p className="text-xs text-zinc-500">No language details found.</p>
                      ) : (
                        <div className="space-y-3">
                          {dev.mostUsedLanguages.map((lang) => (
                            <div key={lang.language} className="space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-zinc-700 dark:text-zinc-350 flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getLanguageColor(lang.language) }}></span>
                                  {lang.language}
                                </span>
                                <span className="text-zinc-500 font-semibold">{lang.percentage}%</span>
                              </div>
                              <div className="w-full bg-zinc-150 dark:bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-850/80">
                                <div 
                                  className="h-full rounded-full transition-all" 
                                  style={{ 
                                    width: `${lang.percentage}%`,
                                    backgroundColor: getLanguageColor(lang.language) 
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Validated Skills */}
                    {stats.skills.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                        <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Validated Skill Levels</span>
                        <div className="grid grid-cols-2 gap-3">
                          {stats.skills.map((s: any, idx: number) => {
                            const levelPct = s.skillLevel === 'Expert' ? 100 
                                          : s.skillLevel === 'Advanced' ? 80 
                                          : s.skillLevel === 'Intermediate' ? 60 
                                          : 40;
                            const barColor = s.skillLevel === 'Expert' ? 'bg-cyan-500'
                                          : s.skillLevel === 'Advanced' ? 'bg-emerald-500'
                                          : s.skillLevel === 'Intermediate' ? 'bg-amber-500'
                                          : 'bg-indigo-500';
                            return (
                              <div key={s.skillName + idx} className="space-y-1">
                                <div className="flex justify-between text-[10px] font-semibold">
                                  <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[100px]">{s.skillName}</span>
                                  <span className="text-zinc-500 text-[9px]">{s.skillLevel}</span>
                                </div>
                                <div className="w-full bg-zinc-100 dark:bg-zinc-950 h-1 rounded-full overflow-hidden border border-zinc-200/50 dark:border-zinc-850">
                                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${levelPct}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 8: CONTRIBUTION HEATMAPS */}
          {activeSubTab === 'heatmap' && (
            <div className="space-y-6 animate-slide-in">
              {comparisonResults.developers.map((dev) => (
                <div key={dev.username} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-3 shrink-0 md:w-48">
                    <img 
                      src={dev.avatarUrl} 
                      alt={dev.name} 
                      className="h-10 w-10 rounded-full border border-zinc-200 dark:border-zinc-850 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${dev.username}`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[120px]">{dev.name}</h4>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] text-zinc-500 font-semibold">{dev.totalContributions} commits (30d)</span>
                        <span className="text-zinc-350 dark:text-zinc-700">&bull;</span>
                        <a 
                          href={`/portfolio/${dev.username}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[9px] text-cyan-600 dark:text-cyan-400 hover:underline font-bold"
                        >
                          Portfolio
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850 flex flex-col justify-center min-h-[100px]">
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {dev.commitActivity.map((cmt) => {
                        const level = cmt.count === 0 ? 'bg-zinc-200 dark:bg-zinc-900' 
                                    : cmt.count < 2 ? 'bg-emerald-900 text-emerald-300'
                                    : cmt.count < 3 ? 'bg-emerald-700 text-emerald-100' 
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
                    <div className="flex justify-between text-[8px] text-zinc-500 px-4 mt-3 font-bold uppercase tracking-wider">
                      <span>30 days ago</span>
                      <span>Today</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* HIDDEN IN DOM: A4 PRINT-READY DOSSIER REPORT */}
          <div id="print-section" className="hidden print:block p-8 space-y-8 bg-white text-zinc-900 font-sans">
            <div className="flex justify-between items-center border-b-2 border-zinc-900 pb-4">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-wider text-black">Candidate Assessment Report</h1>
                <p className="text-xs text-zinc-650 mt-1">Generated by DevPulse Recruiter Dashboard &bull; {new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-zinc-150 text-zinc-800 px-3 py-1 rounded-full font-bold">RECRUITMENT PLATFORM</span>
              </div>
            </div>

            {/* AI Insights Print Block */}
            <div className="border border-zinc-200 p-5 rounded-xl bg-zinc-50 space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-1.5">🏆 Primary Hiring Recommendation</h3>
              <p className="text-xs font-bold leading-relaxed">{comparisonResults.aiInsights.overallWinner.name} is recommended as the prime candidate.</p>
              <p className="text-xs text-zinc-650 leading-relaxed">{comparisonResults.aiInsights.overallWinner.rationale}</p>
            </div>

            {/* Rankings print block */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider">Ranked Candidate Lineup</h3>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-300 text-left font-bold bg-zinc-100">
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Candidate</th>
                    <th className="py-2.5 px-3 text-center">Hiring Score</th>
                    <th className="py-2.5 px-3 text-center">JD Match %</th>
                    <th className="py-2.5 px-3 text-center">Stars</th>
                    <th className="py-2.5 px-3 text-center">LeetCode</th>
                    <th className="py-2.5 px-3 text-center">Experience</th>
                    <th className="py-2.5 px-3">Shortlisted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-250">
                  {comparisonResults.developers.map((dev, idx) => {
                    const stats = parseDevStats(dev);
                    return (
                      <tr key={dev.username}>
                        <td className="py-2.5 px-3 font-bold">#{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold">{dev.name} (@{dev.username})</td>
                        <td className="py-2.5 px-3 text-center font-black text-sm">{stats.hiringScore}</td>
                        <td className="py-2.5 px-3 text-center font-black text-sm text-cyan-600">{stats.matchPercentage}%</td>
                        <td className="py-2.5 px-3 text-center">{dev.stars}</td>
                        <td className="py-2.5 px-3 text-center">{stats.leetcodeStats ? stats.leetcodeStats.totalSolved : '—'}</td>
                        <td className="py-2.5 px-3 text-center">{stats.experiencesCount} roles</td>
                        <td className="py-2.5 px-3 font-bold">{dev.isShortlisted ? 'YES ✓' : 'NO'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="print:break-after"></div>

            {/* Skills gaps print block */}
            <div className="space-y-6 pt-4">
              <h2 className="text-lg font-black uppercase tracking-wider text-black border-b border-zinc-300 pb-2">Technical Skills Gap Analysis</h2>
              {comparisonResults.developers.map((dev) => {
                const stats = parseDevStats(dev);
                return (
                  <div key={dev.username} className="border border-zinc-200 p-4 rounded-xl space-y-3 bg-zinc-50/50">
                    <h3 className="text-xs font-black">{dev.name} (@{dev.username})</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">Matching Competencies</span>
                        <p className="text-[10px] font-semibold text-zinc-700 mt-1">{stats.skillsGap.matchingSkills.join(', ') || 'No parsed matching skills'}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider block">Identified Missing Skills</span>
                        <p className="text-[10px] font-semibold text-zinc-700 mt-1">{stats.skillsGap.missingSkills.join(', ') || 'None (Excellent match)'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* 3. DETAILED CANDIDATE ASSESSMENT DOSSIER MODAL */}
      {selectedDossierDev && (() => {
        const stats = parseDevStats(selectedDossierDev);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in print:hidden">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 md:p-8 shadow-2xl flex flex-col gap-6 animate-scale-in">
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedDossierDev(null)}
                className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition-all cursor-pointer p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Dossier Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-200 dark:border-zinc-850 pb-5">
                <div className="flex items-center gap-4.5">
                  <img 
                    src={selectedDossierDev.avatarUrl} 
                    alt={selectedDossierDev.name} 
                    className="h-16 w-16 rounded-full border border-zinc-200 dark:border-zinc-800 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedDossierDev.username}`;
                    }}
                  />
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2 flex-wrap">
                      {selectedDossierDev.name}
                      <span className="text-[8px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 px-1.5 py-0.5 rounded font-black uppercase">
                        {stats.expYears !== undefined ? (stats.expYears > 0 ? `${stats.expYears}y Experience` : 'Fresher') : 'Fresher'}
                      </span>
                      {stats.openToWork && (
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-black uppercase">
                          Open to work
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-zinc-500 font-semibold mt-0.5">@{selectedDossierDev.username} &bull; Github Candidate Assessment Profile</p>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {stats.tags.map((tag: string) => (
                        <span key={tag} className="text-[8px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 px-2 py-0.5 rounded font-bold text-zinc-550 dark:text-zinc-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center md:text-right">
                    <span className="text-[9px] text-zinc-500 uppercase font-extrabold tracking-wider block">Hiring score</span>
                    <span className="text-3xl font-black text-cyan-600 dark:text-cyan-400">{stats.hiringScore} <span className="text-xs text-zinc-500 font-bold">/100</span></span>
                  </div>
                  
                  <div className="h-12 w-px bg-zinc-200 dark:bg-zinc-800"></div>

                  <div className="text-center md:text-right">
                    <span className="text-[9px] text-zinc-500 uppercase font-extrabold tracking-wider block">JD compatibility</span>
                    <span className="text-3xl font-black text-emerald-500">{stats.matchPercentage}%</span>
                  </div>
                </div>
              </div>

              {/* Dossier Body Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1: Interview Readiness progress bars */}
                <div className="md:col-span-1 border border-zinc-200 dark:border-zinc-850 p-5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 space-y-5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">Interview Readiness</h4>
                  
                  <div className="space-y-4">
                    {/* Tech score */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                        <span>Technical suitability</span>
                        <span>{stats.interviewReadiness.technicalReadiness}%</span>
                      </div>
                      <div className="w-full bg-zinc-150 dark:bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500" style={{ width: `${stats.interviewReadiness.technicalReadiness}%` }}></div>
                      </div>
                    </div>

                    {/* portfolio */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                        <span>Portfolio completeness</span>
                        <span>{stats.interviewReadiness.portfolioQuality}%</span>
                      </div>
                      <div className="w-full bg-zinc-150 dark:bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${stats.interviewReadiness.portfolioQuality}%` }}></div>
                      </div>
                    </div>

                    {/* Consistency */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                        <span>Commit consistency</span>
                        <span>{stats.interviewReadiness.codingConsistency}%</span>
                      </div>
                      <div className="w-full bg-zinc-150 dark:bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500" style={{ width: `${stats.interviewReadiness.codingConsistency}%` }}></div>
                      </div>
                    </div>

                    {/* profile */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                        <span>Career history depth</span>
                        <span>{stats.interviewReadiness.profileCompleteness}%</span>
                      </div>
                      <div className="w-full bg-zinc-150 dark:bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${stats.interviewReadiness.profileCompleteness}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Leetcode breakdown */}
                  {stats.leetcodeStats && (
                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                      <span className="text-[9px] text-zinc-550 uppercase font-black block">LeetCode performance stats</span>
                      <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
                        <div className="bg-white dark:bg-zinc-950 p-2 border border-zinc-150 dark:border-zinc-850 rounded-lg">
                          <span className="text-emerald-555 block font-black text-xs">{stats.leetcodeStats.easyCount}</span>
                          <span className="text-[7px] text-zinc-500 block uppercase">Easy</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-950 p-2 border border-zinc-150 dark:border-zinc-850 rounded-lg">
                          <span className="text-amber-555 block font-black text-xs">{stats.leetcodeStats.mediumCount}</span>
                          <span className="text-[7px] text-zinc-500 block uppercase">Medium</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-950 p-2 border border-zinc-150 dark:border-zinc-850 rounded-lg">
                          <span className="text-rose-500 block font-black text-xs">{stats.leetcodeStats.hardCount}</span>
                          <span className="text-[7px] text-zinc-500 block uppercase">Hard</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Column 2: Skills Gap checklist */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Skills lists */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-zinc-200 dark:border-zinc-850 p-4.5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 space-y-2">
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider block">✔ Matching competencies</span>
                      {stats.skillsGap.matchingSkills.length === 0 ? (
                        <p className="text-[10px] text-zinc-500 block italic">No matching skills found.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {stats.skillsGap.matchingSkills.map((skill: string) => (
                            <span key={skill} className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border border-zinc-200 dark:border-zinc-850 p-4.5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 space-y-2">
                      <span className="text-[9px] text-rose-555 dark:text-rose-400 font-extrabold uppercase tracking-wider block">🗙 Missing requirements</span>
                      {stats.skillsGap.missingSkills.length === 0 ? (
                        <p className="text-[10px] text-emerald-500 block font-bold">Fits perfectly! No missing skill parameters.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {stats.skillsGap.missingSkills.map((skill: string) => (
                            <span key={skill} className="text-[9px] bg-rose-500/10 border border-rose-500/20 text-rose-650 dark:text-rose-455 px-2 py-0.5 rounded-md font-bold">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Career upskilling tracks */}
                  <div className="border border-zinc-200 dark:border-zinc-850 p-5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 space-y-3">
                    <span className="text-[9px] text-yellow-600 dark:text-yellow-500 font-extrabold uppercase tracking-wider block">⚠ Recommended Career Upskilling Roadmap</span>
                    <div className="space-y-2.5">
                      {stats.skillsGap.recommendedUpskilling.map((rec: string, i: number) => (
                        <div key={i} className="flex gap-2.5 items-start text-xs font-semibold text-zinc-650 dark:text-zinc-350">
                          <span className="h-5 w-5 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-yellow-600 dark:text-yellow-500 text-[10px] font-black flex items-center justify-center shrink-0">
                            0{i + 1}
                          </span>
                          <span className="mt-0.5">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certification lists */}
                  {stats.certificationsList.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] text-zinc-500 uppercase font-black block">Acquired Professional Credentials</span>
                      <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                        {stats.certificationsList.map((cert: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-cyan-500 shrink-0">✔</span>
                            <span>{cert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              </div>

              {/* Dossier footer / actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-zinc-200 dark:border-zinc-850">
                <div className="flex items-center gap-3">
                  <a
                    href={`/portfolio/${selectedDossierDev.username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 bg-gradient-to-tr from-cyan-600 to-blue-600 text-white px-4.5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    View Developer Portfolio <ChevronRight className="h-3.5 w-3.5" />
                  </a>
                  
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 px-4.5 py-2.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-350 transition-colors cursor-pointer"
                  >
                    <FileDown className="h-4 w-4" /> Download Resume Dossier
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle Shortlist inside modal */}
                  <button
                    onClick={() => {
                      const idx = comparisonResults ? comparisonResults.developers.findIndex((d: any) => d.username === selectedDossierDev.username) : -1;
                      if (idx !== -1) handleToggleShortlist(idx);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-4.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedDossierDev.isShortlisted
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Check className="h-4 w-4" />
                    {selectedDossierDev.isShortlisted ? 'Candidate Shortlisted' : 'Add to Shortlist'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
