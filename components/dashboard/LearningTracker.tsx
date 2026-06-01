'use client';

import React, { useState, useEffect } from 'react';
import { 
  Loader, Plus, BookOpen, ExternalLink, Award, 
  TrendingUp, Calendar, Zap, Star, ShieldCheck, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { calculateAverageProgress, categorizeSkills } from '@/lib/learning';

interface SkillItem {
  id: string;
  skillName: string;
  progress: number;
  resourceUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function LearningTracker() {
  const { showToast } = useAuth();
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Add Skill Form fields
  const [skillName, setSkillName] = useState('');
  const [progress, setProgress] = useState(10);
  const [resourceUrl, setResourceUrl] = useState('');

  const fetchSkills = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await fetch('/api/learning');
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSkills(data.learning || []);
      } else {
        showToast(data.message || 'Failed to fetch learning logs', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while retrieving skills roadmap', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!skillName.trim()) {
      showToast('Skill name is required', 'error');
      return;
    }

    if (resourceUrl.trim()) {
      try {
        new URL(resourceUrl.trim());
      } catch (e) {
        showToast('Please provide a valid resource URL (starting with http:// or https://)', 'error');
        return;
      }
    }

    try {
      setAdding(true);
      const res = await fetch('/api/learning/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillName: skillName.trim(),
          progress,
          resourceUrl: resourceUrl.trim()
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        showToast(data.message || 'Skill added to roadmap successfully!', 'success');
        setSkillName('');
        setResourceUrl('');
        setProgress(10);
        // Refresh items
        await fetchSkills(true);
      } else {
        showToast(data.message || 'Failed to add skill target', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while adding skill', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleSliderChange = async (id: string, newProgress: number) => {
    try {
      setUpdatingId(id);
      // Optimistic state update
      setSkills(prev => prev.map(s => s.id === id ? { ...s, progress: newProgress } : s));

      const res = await fetch('/api/learning/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, progress: newProgress }),
      });

      const data = await res.json();

      if (!res.ok || data.status !== 'success') {
        showToast(data.message || 'Failed to update progress on server', 'error');
        // Fetch to reset state
        fetchSkills(true);
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error updating progress', 'error');
      fetchSkills(true);
    } finally {
      setUpdatingId(null);
    }
  };

  // Math metrics for summary analytics cards
  const averageProgress = calculateAverageProgress(skills);
  const categories = categorizeSkills(skills);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
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
      
      {/* 1. Overall Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Progress Score Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center justify-between text-zinc-500 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider">Overall Average Progress</span>
            <TrendingUp className="h-4.5 w-4.5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold mt-2 text-white group-hover:text-cyan-400 transition-colors relative z-10">
            {averageProgress}%
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block relative z-10">Average completion of all target roadmaps</span>
        </div>

        {/* Categories Distribution Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm relative overflow-hidden group md:col-span-2">
          <div className="flex items-center justify-between text-zinc-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Skill Level Distribution</span>
            <Award className="h-4.5 w-4.5 text-yellow-400" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center mt-2">
            <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900">
              <span className="text-[10px] font-bold text-emerald-400 block uppercase">Advanced</span>
              <span className="text-xl font-extrabold text-white mt-1 block">{categories.advanced}</span>
              <span className="text-[8px] text-zinc-500 font-mono mt-0.5 block">&gt; 70% Progress</span>
            </div>
            <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900">
              <span className="text-[10px] font-bold text-yellow-500 block uppercase">Intermediate</span>
              <span className="text-xl font-extrabold text-white mt-1 block">{categories.intermediate}</span>
              <span className="text-[8px] text-zinc-500 font-mono mt-0.5 block">30% - 70% Progress</span>
            </div>
            <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900">
              <span className="text-[10px] font-bold text-rose-500 block uppercase">Beginner</span>
              <span className="text-xl font-extrabold text-white mt-1 block">{categories.beginner}</span>
              <span className="text-[8px] text-zinc-500 font-mono mt-0.5 block">&lt; 30% Progress</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Interactive Input Control Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm shadow-xl space-y-6">
        <div className="border-b border-zinc-850 pb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Track New Technical Skill
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Log your study progress and attach learning resource documentations.
          </p>
        </div>

        <form onSubmit={handleAddSkill} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Skill/Tech Name</label>
            <input
              type="text"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g. Next.js, WebSockets, Rust"
              className="mt-2 block w-full rounded-xl border-0 bg-zinc-950/80 py-2.5 px-4 text-white ring-1 ring-inset ring-zinc-800 placeholder:text-zinc-700 focus:ring-2 focus:ring-cyan-500 text-sm outline-none transition-all"
              disabled={adding}
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Resource Study Link</label>
            <input
              type="url"
              value={resourceUrl}
              onChange={(e) => setResourceUrl(e.target.value)}
              placeholder="https://nextjs.org/docs"
              className="mt-2 block w-full rounded-xl border-0 bg-zinc-950/80 py-2.5 px-4 text-white ring-1 ring-inset ring-zinc-800 placeholder:text-zinc-700 focus:ring-2 focus:ring-cyan-500 text-sm outline-none transition-all"
              disabled={adding}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider flex justify-between">
              <span>Progress</span>
              <span className="text-cyan-400 font-bold">{progress}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value))}
              className="mt-4.5 block w-full accent-cyan-500 cursor-pointer"
              disabled={adding}
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={adding}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2.5 text-xs font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 h-[38px] cursor-pointer"
            >
              {adding ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Add Skill
            </button>
          </div>
        </form>
      </div>

      {/* 3. Skill roadmap List & Timelines */}
      {skills.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* List of active progress meters (Column 7) */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Zap className="h-4.5 w-4.5 text-cyan-500" />
              Active Skill Progress Meters
            </h3>

            <div className="space-y-4">
              {skills.map((skill) => {
                // Color tags based on level
                const levelColor = skill.progress >= 70 
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' 
                  : skill.progress >= 30 
                  ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25' 
                  : 'text-rose-400 bg-rose-500/10 border-rose-500/25';

                return (
                  <div
                    key={skill.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 backdrop-blur-sm shadow-md space-y-3 group transition-all duration-300 hover:border-zinc-700 relative"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {skill.skillName}
                        </span>
                        
                        {skill.resourceUrl && (
                          <a
                            href={skill.resourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-zinc-500 hover:text-cyan-400 transition-colors flex items-center gap-1 font-mono"
                          >
                            Study Reference
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      <div className={`text-[10px] font-bold border px-2 py-0.5 rounded-full capitalize ${levelColor}`}>
                        {skill.progress}%
                      </div>
                    </div>

                    {/* Adjustable slider progress controller */}
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={skill.progress}
                        onChange={(e) => handleSliderChange(skill.id, parseInt(e.target.value))}
                        className="flex-1 accent-cyan-500 cursor-pointer h-1.5 bg-zinc-950 rounded-lg"
                      />
                      {updatingId === skill.id && (
                        <Loader className="h-3.5 w-3.5 animate-spin text-cyan-400 shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline roadmap (Column 5) */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-cyan-500" />
              Learning Timeline / History
            </h3>

            <div className="relative pl-6 border-l border-zinc-800 space-y-6">
              {skills.map((skill, idx) => (
                <div key={skill.id} className="relative space-y-1">
                  
                  {/* Timeline bullet dot */}
                  <span className="absolute -left-[30px] top-1.5 h-4 w-4 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                    {skill.progress >= 100 ? (
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </span>

                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                    <span>{formatDate(skill.createdAt)}</span>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-cyan-500/80 font-bold uppercase">{skill.progress >= 70 ? 'expert' : skill.progress >= 30 ? 'active' : 'begun'}</span>
                  </div>

                  <h4 className="text-xs font-bold text-white">
                    Logged "{skill.skillName}" in roadmap
                  </h4>

                  {skill.resourceUrl && (
                    <span className="text-[10px] text-zinc-500 block truncate">
                      Using material: {skill.resourceUrl}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* Empty roadmap block */
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="mx-auto h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
            <Star className="h-6 w-6 text-zinc-600 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">No Roadmap Goals Defined</h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
              Configure and trace study roadmap targets above to construct your professional education history logs.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
