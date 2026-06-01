'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Plus, Trash2, Loader, 
  Calendar, CheckCircle, AlertCircle, Terminal, FileText 
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
  technologies: string;
}

export default function ExperienceManager() {
  const { showToast } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);

  // Input states
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile/experiences', {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setExperiences(data.experiences || []);
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
      showToast('Failed to load experiences', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim() || !duration.trim() || !description.trim()) {
      showToast('Company, Role, Duration, and Description are required', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/profile/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: company.trim(),
          role: role.trim(),
          duration: duration.trim(),
          description: description.trim(),
          technologies: technologies.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast('Experience entry added successfully!', 'success');
        // Reset states
        setCompany('');
        setRole('');
        setDuration('');
        setDescription('');
        setTechnologies('');
        
        await fetchExperiences();
      } else {
        showToast(data.message || 'Failed to add experience', 'error');
      }
    } catch (error) {
      showToast('Network error occurred', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/profile/experiences?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast('Experience entry removed successfully!', 'success');
        await fetchExperiences();
      } else {
        showToast(data.message || 'Failed to remove experience', 'error');
      }
    } catch (error) {
      showToast('Network error occurred', 'error');
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
      
      {/* Header Panel */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/40 p-6 backdrop-blur-sm shadow-sm flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center shrink-0">
          <Briefcase className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Experience Manager</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Document your professional employment history, engineering accomplishments, and specific technologies utilized.
          </p>
        </div>
      </div>

      {/* Main Grid: Form Left, List Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Input Form Column */}
        <div className="lg:col-span-1">
          <form onSubmit={handleAddExperience} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-6 backdrop-blur-sm shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Plus className="h-4.5 w-4.5 text-cyan-500" />
              Add Experience
            </h4>

            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400">Company Name*</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe, Inc."
                required
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent py-2.5 px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-655 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm outline-none transition-all"
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400">Role / Position*</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                required
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent py-2.5 px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-655 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm outline-none transition-all"
              />
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400">Duration (e.g. Start - End Date)*</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. June 2024 - Present"
                required
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent py-2.5 px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-655 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm outline-none transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400">Work Description (Accomplishments)*</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your primary responsibilities, systems constructed, and engineering scale accomplished..."
                required
                rows={4}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent py-2.5 px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-655 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm outline-none transition-all resize-none"
              />
            </div>

            {/* Tech Stack Used */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400">Technologies Used (Comma separated)</label>
              <input
                type="text"
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                placeholder="e.g. React, Next.js, Node.js, PostgreSQL"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent py-2.5 px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-655 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-md shadow-cyan-600/20"
            >
              {saving ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Save Experience
            </button>
          </form>
        </div>

        {/* Display List Column */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="h-4.5 w-4.5 text-cyan-500" />
            Configured Experiences ({experiences.length})
          </h4>

          {experiences.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/10 p-12 text-center text-zinc-500 space-y-2">
              <Briefcase className="h-8 w-8 text-zinc-400 mx-auto" />
              <p className="text-xs">No experience entries added yet. Create one on the left!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="group rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white/80 dark:bg-zinc-900/30 p-6 backdrop-blur-sm shadow-sm relative space-y-3">
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pr-8">
                    <div>
                      <h5 className="text-sm font-bold text-zinc-900 dark:text-white">{exp.role}</h5>
                      <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">{exp.company}</p>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-semibold bg-zinc-100 dark:bg-zinc-950/60 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800/80">
                      <Calendar className="h-3 w-3 text-cyan-500" />
                      {exp.duration}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed whitespace-pre-line font-medium">
                    {exp.description}
                  </p>

                  {exp.technologies && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-150 dark:border-zinc-900">
                      {exp.technologies.split(',').map((tech) => {
                        const trimmedTech = tech.trim();
                        if (!trimmedTech) return null;
                        return (
                          <span 
                            key={trimmedTech} 
                            className="inline-flex items-center gap-1 rounded-md bg-cyan-400/5 px-2 py-0.5 text-[9px] font-bold text-cyan-600 dark:text-cyan-400 ring-1 ring-inset ring-cyan-500/10"
                          >
                            <Terminal className="h-2.5 w-2.5" />
                            {trimmedTech}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="absolute top-6 right-6 text-zinc-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-all shrink-0 cursor-pointer"
                    title="Remove Experience"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
