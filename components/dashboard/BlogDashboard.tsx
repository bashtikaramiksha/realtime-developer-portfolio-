'use client';

import React, { useState, useEffect } from 'react';
import { Loader, RefreshCw, BookOpen, ExternalLink, Rss, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface BlogPost {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
}

export default function BlogDashboard() {
  const { showToast } = useAuth();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [feedUrl, setFeedUrl] = useState('');

  const fetchBlogs = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await fetch('/api/blogs');
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setBlogs(data.blogs || []);
      } else {
        showToast(data.message || 'Failed to fetch blog feed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while retrieving blog posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedUrl.trim()) {
      showToast('Please provide a valid RSS URL', 'error');
      return;
    }

    try {
      new URL(feedUrl.trim());
    } catch (e) {
      showToast('Please enter a valid URL beginning with http:// or https://', 'error');
      return;
    }

    try {
      setSyncing(true);
      const res = await fetch('/api/blogs/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedUrl: feedUrl.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        showToast(data.message || 'RSS Feed Synced successfully!', 'success');
        setFeedUrl('');
        setBlogs(data.blogs || []);
      } else {
        showToast(data.message || 'Synchronization failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error during synchronization', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
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
      
      {/* 1. Feed Sync Setup Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
            <Rss className="h-6 w-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              RSS Feed Integrations
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Sync developer articles from Medium, Dev.to, or custom blog XMLs.
            </p>
          </div>
        </div>

        <form onSubmit={handleSync} className="flex gap-2 max-w-md w-full">
          <input
            type="url"
            value={feedUrl}
            onChange={(e) => setFeedUrl(e.target.value)}
            placeholder="RSS Feed URL (e.g., https://medium.com/feed/@username)"
            className="flex-1 rounded-xl border-0 bg-zinc-950 py-2.5 px-4 text-white ring-1 ring-inset ring-zinc-800 placeholder:text-zinc-700 focus:ring-2 focus:ring-cyan-500 text-sm outline-none"
            disabled={syncing}
          />
          <button
            type="submit"
            disabled={syncing}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition-all active:scale-[0.98] disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {syncing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Sync Feed
          </button>
        </form>
      </div>

      {/* 2. Blogs Cards Grid Deck */}
      {blogs.length > 0 ? (
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="h-4.5 w-4.5 text-cyan-500" />
            Synchronized Articles ({blogs.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm shadow-xl flex flex-col justify-between gap-4 group transition-all duration-300 hover:border-zinc-700 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="space-y-2 relative z-10">
                  <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                    <Calendar className="h-3.5 w-3.5 text-cyan-500/60" />
                    {formatDate(blog.publishedAt)}
                  </span>
                  
                  <h4 className="text-base font-bold text-white leading-snug group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {blog.title}
                  </h4>
                </div>

                <a
                  href={blog.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors self-start mt-2 relative z-10"
                >
                  Read Article
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty Feed block */
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="mx-auto h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
            <BookOpen className="h-6 w-6 text-zinc-600" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">No Blog Feed Integrated</h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
              Enter your Medium or Dev.to RSS feed URL above to automatically populate and keep your professional portfolios up to date.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
