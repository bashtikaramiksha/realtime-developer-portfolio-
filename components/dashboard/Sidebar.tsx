'use client';

import React from 'react';
import { LayoutDashboard, User, Award, FileText, ExternalLink, Shield, Activity, Server, BookOpen, GraduationCap, Briefcase, GitCompare } from 'lucide-react';

import { useAuth } from '@/lib/context/AuthContext';

interface SidebarProps {
  activeTab: 'home' | 'profile' | 'skills' | 'resume' | 'github' | 'leetcode' | 'live' | 'monitoring' | 'blog' | 'learning' | 'admin' | 'certifications' | 'experience';
  setActiveTab: (tab: 'home' | 'profile' | 'skills' | 'resume' | 'github' | 'leetcode' | 'live' | 'monitoring' | 'blog' | 'learning' | 'admin' | 'certifications' | 'experience') => void;
  slug?: string;
}

export default function Sidebar({ activeTab, setActiveTab, slug }: SidebarProps) {
  const { user } = useAuth();

  const baseMenuItems = [
    { id: 'home', label: 'Dashboard Home', icon: LayoutDashboard },
    { id: 'profile', label: 'Edit Profile', icon: User },
    { id: 'skills', label: 'Manage Skills', icon: Award },
    { id: 'resume', label: 'Resume & Avatar', icon: FileText },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'experience', label: 'Work Experience', icon: Briefcase },
    { id: 'github', label: 'GitHub Analytics', icon: ExternalLink },
    { id: 'leetcode', label: 'LeetCode Stats', icon: Award },
    { id: 'live', label: 'Live Presence', icon: Activity },
    { id: 'monitoring', label: 'Service Health', icon: Server },
    { id: 'blog', label: 'Blog RSS Sync', icon: BookOpen },
    { id: 'learning', label: 'Learning Roadmap', icon: GraduationCap },
  ] as const;

  const menuItems: Array<{
    id: 'home' | 'profile' | 'skills' | 'resume' | 'github' | 'leetcode' | 'live' | 'monitoring' | 'blog' | 'learning' | 'admin' | 'certifications' | 'experience';
    label: string;
    icon: React.ComponentType<any>;
  }> = [...baseMenuItems];

  if (user?.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin Center', icon: Shield });
  }

  return (
    <aside className="w-full md:w-64 bg-white/80 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-8 shrink-0 shadow-md dark:shadow-lg transition-colors duration-300">
      
      {/* Workspace indicator */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20">
          <Shield className="h-4.5 w-4.5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">Workspace</h4>
          <span className="text-xs text-zinc-500 font-medium">Portfolio Editor</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 outline-none text-left ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
              }`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* View Live Portfolio link */}
      {slug && (
        <a
          href={`/portfolio/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="portfolio-btn flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 border border-zinc-900 dark:border-zinc-100 py-3 text-xs font-bold text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-sm"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View Live Portfolio
        </a>
      )}
    </aside>
  );
}
