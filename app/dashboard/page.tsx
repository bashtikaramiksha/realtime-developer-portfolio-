'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/dashboard/Sidebar';
import GithubDashboard from '@/components/dashboard/GithubDashboard';
import LeetcodeDashboard from '@/components/dashboard/LeetcodeDashboard';
import LiveActivityDashboard from '@/components/dashboard/LiveActivityDashboard';
import DeploymentDashboard from '@/components/dashboard/DeploymentDashboard';
import BlogDashboard from '@/components/dashboard/BlogDashboard';
import LearningTracker from '@/components/dashboard/LearningTracker';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import CertificationsManager from '@/components/dashboard/CertificationsManager';
import ExperienceManager from '@/components/dashboard/ExperienceManager';
import { 
  User, Mail, Shield, Calendar, Key, Award, FileText, Globe, 
  MapPin, Eye, Link as LinkIcon, Plus, Trash2, Upload, AlertCircle, Loader, CheckCircle, ExternalLink,
  Phone
} from 'lucide-react';

interface Skill {
  id?: string;
  skillName: string;
  skillLevel: number;
}

interface SocialLink {
  id?: string;
  platform: string;
  url: string;
}

interface ProfileData {
  bio: string;
  headline: string;
  location: string;
  contactNumber: string;
  resumeUrl: string;
  profileImage: string;
  portfolioSlug: string;
}

function DashboardContent() {
  const { user, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'profile' | 'skills' | 'resume' | 'github' | 'leetcode' | 'live' | 'monitoring' | 'blog' | 'learning' | 'admin' | 'certifications' | 'experience'>('home');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile data states
  const [profile, setProfile] = useState<ProfileData>({
    bio: '',
    headline: '',
    location: '',
    contactNumber: '',
    resumeUrl: '',
    profileImage: '',
    portfolioSlug: '',
  });

  const [skills, setSkills] = useState<Skill[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  // Temp local state for adding items
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(70);
  const [newSocialPlatform, setNewSocialPlatform] = useState('GitHub');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  // Refs for file uploads
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Fetch profile on mount
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile', {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setProfile(data.profile);
        setSkills(data.skills);
        setSocialLinks(data.socialLinks);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load portfolio details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Save full profile update
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: profile.bio,
          headline: profile.headline,
          location: profile.location,
          contactNumber: profile.contactNumber,
          portfolioSlug: profile.portfolioSlug,
          skills: skills.map(s => ({ skillName: s.skillName, skillLevel: s.skillLevel })),
          socialLinks: socialLinks.map(s => ({ platform: s.platform, url: s.url })),
        }),
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setProfile(prev => ({ ...prev, portfolioSlug: data.slug }));
        showToast('Portfolio configuration saved successfully!', 'success');
      } else {
        showToast(data.message || 'Failed to save portfolio', 'error');
      }
    } catch (err) {
      showToast('Network error while saving', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Skill Managers
  const handleAddSkill = () => {
    if (!newSkillName.trim()) {
      showToast('Skill name is required', 'error');
      return;
    }
    const skillExists = skills.some(s => s.skillName.toLowerCase() === newSkillName.trim().toLowerCase());
    if (skillExists) {
      showToast('Skill already added', 'error');
      return;
    }
    setSkills(prev => [...prev, { skillName: newSkillName.trim(), skillLevel: newSkillLevel }]);
    setNewSkillName('');
    showToast('Skill added locally (Press save profile to sync)', 'info');
  };

  const handleRemoveSkill = (skillName: string) => {
    setSkills(prev => prev.filter(s => s.skillName !== skillName));
  };

  // Social Links Managers
  const handleAddSocial = () => {
    if (!newSocialUrl.trim()) {
      showToast('Social link URL is required', 'error');
      return;
    }
    try {
      new URL(newSocialUrl); // Validate format
    } catch (e) {
      showToast('Please enter a valid URL (including https://)', 'error');
      return;
    }
    const platformExists = socialLinks.some(l => l.platform.toLowerCase() === newSocialPlatform.toLowerCase());
    if (platformExists) {
      showToast(`Social link for ${newSocialPlatform} already exists`, 'error');
      return;
    }
    setSocialLinks(prev => [...prev, { platform: newSocialPlatform, url: newSocialUrl.trim() }]);
    setNewSocialUrl('');
    showToast('Social link added locally (Press save profile to sync)', 'info');
  };

  const handleRemoveSocial = (platform: string) => {
    setSocialLinks(prev => prev.filter(l => l.platform !== platform));
  };

  // Asset File Uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'avatar') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append(type, file);

    if (type === 'resume') setUploadingResume(true);
    else setUploadingAvatar(true);

    try {
      const res = await fetch('/api/profile/upload-resume', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setProfile(prev => ({
          ...prev,
          ...(type === 'resume' ? { resumeUrl: data.data.resumeUrl } : { profileImage: data.data.profileImage })
        }));
        showToast(`${type === 'resume' ? 'Resume' : 'Avatar'} uploaded successfully!`, 'success');
      } else {
        showToast(data.message || 'File upload failed', 'error');
      }
    } catch (err) {
      showToast('Upload failed due to connection error', 'error');
    } finally {
      if (type === 'resume') setUploadingResume(false);
      else setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-zinc-55 dark:bg-zinc-950 text-zinc-900 dark:text-white min-h-screen flex items-center justify-center transition-colors duration-300">
        <Loader className="h-10 w-10 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white min-h-screen relative overflow-hidden flex flex-col transition-colors duration-300">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f0f13_1px,transparent_1px),linear-gradient(to_bottom,#0f0f13_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 dark:opacity-100"></div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col md:flex-row gap-8 w-full z-10">
        
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} slug={profile.portfolioSlug} />

        {/* Workspace Panels */}
        <main className="flex-1 flex flex-col min-w-0">
          
          {/* Header Panel Actions */}
          <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white capitalize bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">
                {activeTab === 'home' ? 'Dashboard Overview' : activeTab === 'github' ? 'GitHub Live Analytics' : activeTab === 'leetcode' ? 'LeetCode Statistics' : activeTab === 'live' ? 'Real-Time Coding Presence' : activeTab === 'monitoring' ? 'Service Health Monitor' : activeTab === 'blog' ? 'Blog RSS Sync' : activeTab === 'learning' ? 'Learning Roadmap' : activeTab === 'admin' ? 'Admin Control Center' : `${activeTab} Configuration`}
              </h2>
              <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1">
                Customize parameters and preview live updates
              </p>
            </div>
            
            {activeTab !== 'home' && activeTab !== 'github' && activeTab !== 'leetcode' && activeTab !== 'live' && activeTab !== 'monitoring' && activeTab !== 'blog' && activeTab !== 'learning' && activeTab !== 'admin' && (
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
              >
                {saving ? <Loader className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Save Portfolio
              </button>
            )}
          </div>

          {/* TAB 1: HOME PANEL */}
          {activeTab === 'home' && (
            <div className="space-y-8 animate-slide-in">
              
              {/* Analytics Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Portfolio Views</span>
                  <div className="text-3xl font-extrabold mt-2 text-zinc-900 dark:text-white">412</div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">+14% increase this week</span>
                </div>
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Resume Downloads</span>
                  <div className="text-3xl font-extrabold mt-2 text-zinc-900 dark:text-white">38</div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">+8% increase this week</span>
                </div>
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Contact Inquiries</span>
                  <div className="text-3xl font-extrabold mt-2 text-zinc-900 dark:text-white">12</div>
                  <span className="text-[10px] text-zinc-500 mt-1 block font-medium">Standard response SLA: &lt; 24h</span>
                </div>
              </div>

              {/* Developer Profile card */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/40 p-8 backdrop-blur-sm shadow-md dark:shadow-xl flex flex-col md:flex-row gap-6 items-center md:items-start">
                
                {/* Avatar preview */}
                <div className="relative h-24 w-24 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-cyan-500/20 overflow-hidden flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-inner">
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-10 w-10" />
                  )}
                </div>

                <div className="flex-1 text-center md:text-left space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{user?.name}</h3>
                    <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium mt-0.5">{profile.headline || 'Developer Headline (e.g. Fullstack Engineer)'}</p>
                  </div>

                  <p className="text-sm text-zinc-650 dark:text-zinc-400 max-w-lg leading-relaxed">
                    {profile.bio || 'Your developer biography. Add details about your tech stack, goals, and passions under the edit tabs.'}
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center md:justify-start text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    <span className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <MapPin className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
                      {profile.location || 'Location (e.g. San Francisco)'}
                    </span>
                    
                    {profile.portfolioSlug && (
                      <span className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <Globe className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
                        /{profile.portfolioSlug}
                      </span>
                    )}

                    {profile.resumeUrl && (
                      <span className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <FileText className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
                        Resume Active
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills and Social Links preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Skills tags card */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-6 shadow-sm dark:shadow-none">
                  <h4 className="text-sm font-bold text-zinc-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Award className="h-4.5 w-4.5 text-cyan-550 dark:text-cyan-400" />
                    Skills tags
                  </h4>
                  {skills.length === 0 ? (
                    <p className="text-xs text-zinc-500">No skill sets defined yet. Head over to Manage Skills tab.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((sk) => (
                        <div key={sk.skillName} className="flex flex-col gap-1 bg-zinc-100/50 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 min-w-[100px]">
                          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">{sk.skillName}</span>
                          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
                            <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${sk.skillLevel}%` }}></div>
                          </div>
                          <span className="text-[9px] text-zinc-500 text-right mt-0.5">{sk.skillLevel}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Social links card */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-6 shadow-sm dark:shadow-none">
                  <h4 className="text-sm font-bold text-zinc-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Globe className="h-4.5 w-4.5 text-cyan-550 dark:text-cyan-400" />
                    Social Platforms
                  </h4>
                  {socialLinks.length === 0 ? (
                    <p className="text-xs text-zinc-500">No social platforms linked yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {socialLinks.map((link) => (
                        <a
                          key={link.platform}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-xl bg-zinc-100/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">{link.platform}</span>
                          <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1 truncate max-w-[200px]">
                            {link.url}
                            <ExternalLink className="h-3 w-3" />
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: EDIT PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-slide-in">
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/40 p-6 space-y-6 shadow-sm dark:shadow-none">
                
                {/* Inputs block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Profile Headline</label>
                    <input
                      type="text"
                      value={profile.headline}
                      onChange={(e) => setProfile(prev => ({ ...prev, headline: e.target.value }))}
                      placeholder="e.g. Senior Fullstack Engineer"
                      className="mt-2 block w-full rounded-xl border-0 bg-white dark:bg-zinc-950 py-3 px-4 text-zinc-900 dark:text-white ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 placeholder:text-zinc-400 dark:placeholder:text-zinc-700 focus:ring-2 focus:ring-cyan-500 sm:text-sm outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Location</label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <MapPin className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
                      </div>
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g. San Francisco, CA"
                        className="block w-full rounded-xl border-0 bg-white dark:bg-zinc-950 py-3 pl-10 pr-4 text-zinc-900 dark:text-white ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 placeholder:text-zinc-400 dark:placeholder:text-zinc-700 focus:ring-2 focus:ring-cyan-500 sm:text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Contact Number</label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <Phone className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
                      </div>
                      <input
                        type="text"
                        value={profile.contactNumber || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, contactNumber: e.target.value }))}
                        placeholder="e.g. +1 (555) 019-2834"
                        className="block w-full rounded-xl border-0 bg-white dark:bg-zinc-950 py-3 pl-10 pr-4 text-zinc-900 dark:text-white ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 placeholder:text-zinc-400 dark:placeholder:text-zinc-700 focus:ring-2 focus:ring-cyan-500 sm:text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Custom Portfolio URL Slug</label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs text-zinc-500 font-semibold select-none">
                        /portfolio/
                      </div>
                      <input
                        type="text"
                        value={profile.portfolioSlug}
                        onChange={(e) => setProfile(prev => ({ ...prev, portfolioSlug: e.target.value }))}
                        placeholder="e.g. john-doe (letters, numbers, dashes)"
                        className="block w-full rounded-xl border-0 bg-white dark:bg-zinc-950 py-3 pl-20 pr-4 text-zinc-900 dark:text-white ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 placeholder:text-zinc-400 dark:placeholder:text-zinc-700 focus:ring-2 focus:ring-cyan-500 sm:text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Biography / About Me</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      placeholder="Share a brief overview of your developer experience, passions, and background..."
                      className="mt-2 block w-full rounded-xl border-0 bg-white dark:bg-zinc-950 py-3 px-4 text-zinc-900 dark:text-white ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 placeholder:text-zinc-400 dark:placeholder:text-zinc-700 focus:ring-2 focus:ring-cyan-500 sm:text-sm outline-none transition-all resize-none"
                    />
                  </div>
                </div>

              </div>

              {/* Social Links Manager card */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/40 p-6 space-y-6 shadow-sm dark:shadow-none">
                <h3 className="text-base font-bold text-zinc-800 dark:text-white flex items-center gap-1.5">
                  <Globe className="h-5 w-5 text-cyan-550 dark:text-cyan-400" />
                  Social Links Manager
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-zinc-100/50 dark:bg-zinc-950/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase">Platform</label>
                    <select
                      value={newSocialPlatform}
                      onChange={(e) => setNewSocialPlatform(e.target.value)}
                      className="mt-2 block w-full rounded-xl border-0 bg-white dark:bg-zinc-950 py-2.5 px-3 text-zinc-900 dark:text-white ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 focus:ring-2 focus:ring-cyan-500 sm:text-sm outline-none"
                    >
                      <option>GitHub</option>
                      <option>LinkedIn</option>
                      <option>Twitter</option>
                      <option>Personal Website</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 flex gap-3 items-center">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-zinc-500 uppercase">URL Link</label>
                      <input
                        type="url"
                        value={newSocialUrl}
                        onChange={(e) => setNewSocialUrl(e.target.value)}
                        placeholder="https://example.com/user"
                        className="mt-2 block w-full rounded-xl border-0 bg-white dark:bg-zinc-950 py-2.5 px-3 text-zinc-900 dark:text-white ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 focus:ring-2 focus:ring-cyan-500 sm:text-sm outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-700"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSocial}
                      className="h-10 rounded-xl bg-cyan-600/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-white px-4 transition-all flex items-center justify-center self-end"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Linked Items List */}
                <div className="space-y-2">
                  {socialLinks.length === 0 ? (
                    <p className="text-xs text-zinc-500">No social platforms linked. Add one above.</p>
                  ) : (
                    socialLinks.map((link) => (
                      <div
                        key={link.platform}
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-100/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-sm"
                      >
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">{link.platform}</span>
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-xs text-zinc-500 truncate max-w-[250px]">{link.url}</span>
                          <button
                            onClick={() => handleRemoveSocial(link.platform)}
                            className="text-rose-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGE SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-6 animate-slide-in">
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/40 p-6 space-y-6 shadow-sm dark:shadow-none">
                
                {/* Skill Add Input */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-zinc-100/50 dark:bg-zinc-950/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-855">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase">Skill Name</label>
                    <input
                      type="text"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="e.g. React, PostgreSQL"
                      className="mt-2 block w-full rounded-xl border-0 bg-white dark:bg-zinc-950 py-2.5 px-3 text-zinc-900 dark:text-white ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 focus:ring-2 focus:ring-cyan-500 sm:text-sm outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase flex justify-between">
                      <span>Proficiency Level</span>
                      <span className="text-cyan-600 dark:text-cyan-400">{newSkillLevel}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={newSkillLevel}
                      onChange={(e) => setNewSkillLevel(parseInt(e.target.value))}
                      className="mt-4 block w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="h-10 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-cyan-500 transition-all active:scale-[0.98] flex items-center justify-center gap-1"
                  >
                    <Plus className="h-4.5 w-4.5" />
                    Add Skill
                  </button>
                </div>

                {/* Skills listing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.length === 0 ? (
                    <p className="text-xs text-zinc-500 col-span-2">No skills registered yet. Add React, TypeScript, Node.js above!</p>
                  ) : (
                    skills.map((sk) => (
                      <div
                        key={sk.skillName}
                        className="flex items-center justify-between p-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850"
                      >
                        <div className="flex-1 pr-4">
                          <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-200">
                            <span className="text-zinc-700 dark:text-zinc-200">{sk.skillName}</span>
                            <span className="text-cyan-600 dark:text-cyan-400">{sk.skillLevel}%</span>
                          </div>
                          <div className="w-full bg-zinc-200 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-1.5">
                            <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${sk.skillLevel}%` }}></div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveSkill(sk.skillName)}
                          className="text-zinc-450 hover:text-rose-500 transition-colors p-1"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: RESUME & AVATAR UPLOADS */}
          {activeTab === 'resume' && (
            <div className="space-y-6 animate-slide-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Avatar Uploader */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/40 p-6 flex flex-col items-center gap-4 text-center shadow-sm dark:shadow-none">
                  <span className="text-sm font-bold text-zinc-805 dark:text-white uppercase tracking-wider">Profile Avatar Image</span>
                  
                  {/* Current image */}
                  <div className="relative h-28 w-28 rounded-full bg-zinc-100 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                    {profile.profileImage ? (
                      <img src={profile.profileImage} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-12 w-12" />
                    )}
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader className="h-6 w-6 animate-spin text-cyan-400" />
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={avatarInputRef}
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'avatar')}
                    className="hidden"
                  />

                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="flex items-center gap-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-250 dark:bg-zinc-855 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-white transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload Image
                  </button>

                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Supported: JPG, PNG, WEBP, GIF. Max Size: 2MB.
                  </p>
                </div>

                {/* 2. Resume Document Uploader */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/40 p-6 flex flex-col items-center gap-4 text-center shadow-sm dark:shadow-none">
                  <span className="text-sm font-bold text-zinc-805 dark:text-white uppercase tracking-wider">Resume PDF Document</span>
                  
                  <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-950 border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 text-center relative">
                    <FileText className={`h-12 w-12 ${profile.resumeUrl ? 'text-cyan-555 dark:text-cyan-400' : 'text-zinc-400 dark:text-zinc-700'}`} />
                    {uploadingResume && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl">
                        <Loader className="h-6 w-6 animate-spin text-cyan-400" />
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={resumeInputRef}
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, 'resume')}
                    className="hidden"
                  />

                  <button
                    onClick={() => resumeInputRef.current?.click()}
                    disabled={uploadingResume}
                    className="flex items-center gap-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-250 dark:bg-zinc-855 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-955 dark:hover:bg-zinc-800 dark:hover:text-white transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {profile.resumeUrl ? 'Replace Resume PDF' : 'Upload Resume PDF'}
                  </button>

                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Supported: PDF, DOC, DOCX. Max Size: 5MB.
                  </p>
                </div>

              </div>

              {/* PDF Preview panel */}
              {profile.resumeUrl && (
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/40 p-6 space-y-4 shadow-sm dark:shadow-none">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-4.5 w-4.5 text-cyan-555 dark:text-cyan-400" />
                      Uploaded Resume Preview
                    </h3>
                    <a
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-600 dark:text-cyan-400 font-bold hover:text-cyan-500 dark:hover:text-cyan-300 flex items-center gap-1"
                    >
                      Open in New Tab
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  
                  <div className="w-full bg-zinc-100 dark:bg-zinc-950 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-850 h-[400px]">
                    <iframe
                      src={`${profile.resumeUrl}#toolbar=0`}
                      className="w-full h-full border-none"
                      title="Resume PDF Viewer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: GITHUB ANALYTICS */}
          {activeTab === 'github' && (
            <GithubDashboard />
          )}

          {/* TAB 6: LEETCODE ANALYTICS */}
          {activeTab === 'leetcode' && (
            <LeetcodeDashboard />
          )}

          {/* TAB 7: LIVE CODING ACTIVITY */}
          {activeTab === 'live' && (
            <LiveActivityDashboard />
          )}

          {/* TAB 8: SERVICE HEALTH MONITORING */}
          {activeTab === 'monitoring' && (
            <DeploymentDashboard />
          )}

          {/* TAB 9: BLOG RSS SYNCHRONIZATION */}
          {activeTab === 'blog' && (
            <BlogDashboard />
          )}

          {/* TAB 10: LEARNING ROADMAP TRACKER */}
          {activeTab === 'learning' && (
            <LearningTracker />
          )}

          {/* TAB 11: ADMIN CONTROL CENTER */}
          {activeTab === 'admin' && (
            <AdminDashboard />
          )}

          {/* TAB 12: CERTIFICATIONS MANAGER */}
          {activeTab === 'certifications' && (
            <CertificationsManager />
          )}

          {/* TAB 13: EXPERIENCE MANAGER */}
          {activeTab === 'experience' && (
            <ExperienceManager />
          )}

        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
