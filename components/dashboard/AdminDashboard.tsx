'use client';

import React, { useState, useEffect } from 'react';
import { 
  Loader, Shield, Users, BarChart3, Terminal, Search, Filter, 
  Trash2, ShieldCheck, Download, RefreshCw, Ban, Database, 
  GitBranch, Trophy, Server
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
}

interface LogRecord {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

interface AnalyticsData {
  totalUsers: number;
  bannedUsers: number;
  adminUsers: number;
  githubRepos: number;
  leetcodeProfiles: number;
  totalDeployments: number;
  logsVolume: number;
  averageLearningProgress: number;
  logs: LogRecord[];
}

export default function AdminDashboard() {
  const { showToast, user: currentUser } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'users' | 'analytics' | 'logs'>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // States
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Search & Filter
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  
  const [logSearch, setLogSearch] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState('all');

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [banningId, setBanningId] = useState<string | null>(null);

  const fetchAdminData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const [usersRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/analytics')
      ]);

      const usersData = await usersRes.json();
      const analyticsData = await analyticsRes.json();

      if (usersRes.ok && usersData.status === 'success') {
        setUsers(usersData.users || []);
      } else {
        showToast(usersData.message || 'Failed to fetch users list', 'error');
      }

      if (analyticsRes.ok && analyticsData.status === 'success') {
        setAnalytics(analyticsData.analytics || null);
      } else {
        showToast(analyticsData.message || 'Failed to fetch system analytics', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error loading administration database', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?.id) {
      showToast('Conflict: You cannot delete your own profile.', 'error');
      return;
    }

    if (!confirm('Are you absolutely sure you want to permanently delete this user? All their profiles, skills, and logs will be lost.')) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/user/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        showToast(data.message || 'User permanently deleted.', 'success');
        setUsers(prev => prev.filter(u => u.id !== id));
        fetchAdminData(true);
      } else {
        showToast(data.message || 'Failed to delete user.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error during user deletion', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleBan = async (id: string, currentBanStatus: boolean) => {
    if (id === currentUser?.id) {
      showToast('Conflict: You cannot ban your own profile.', 'error');
      return;
    }

    try {
      setBanningId(id);
      const res = await fetch('/api/admin/user/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, isBanned: !currentBanStatus })
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        showToast(data.message || 'User status updated successfully!', 'success');
        setUsers(prev => prev.map(u => u.id === id ? { ...u, isBanned: !currentBanStatus } : u));
        fetchAdminData(true);
      } else {
        showToast(data.message || 'Failed to update user status.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while toggling ban status', 'error');
    } finally {
      setBanningId(null);
    }
  };

  const handleExportCSV = () => {
    if (users.length === 0) {
      showToast('No user data available to export', 'error');
      return;
    }

    try {
      // Build CSV content
      const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Registration Date'];
      const rows = users.map(u => [
        u.id,
        u.name,
        u.email,
        u.role,
        u.isBanned ? 'Banned' : 'Active',
        new Date(u.createdAt).toISOString()
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Create download trigger
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `devpulse-analytics-export-${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('System analytics exported successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to export CSV report', 'error');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Filtered Lists
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredLogs = (analytics?.logs || []).filter(l => {
    const matchesSearch = l.message.toLowerCase().includes(logSearch.toLowerCase()) ||
                          l.type.toLowerCase().includes(logSearch.toLowerCase());
    const matchesType = logTypeFilter === 'all' || l.type === logTypeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in font-sans">
      
      {/* 1. Sub-Tab Selector Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 backdrop-blur-sm shadow-xl flex flex-wrap justify-between items-center gap-4">
        
        {/* Navigation sub-tabs Buttons */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Shield className="h-4 w-4 animate-pulse" />
            System Overview
          </button>
          
          <button
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'users'
                ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Users className="h-4 w-4" />
            User Management
          </button>

          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'analytics'
                ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            System Analytics
          </button>

          <button
            onClick={() => setActiveSubTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'logs'
                ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Terminal className="h-4 w-4" />
            Error & Audit Logs
          </button>
        </div>

        {/* Refresh logs/metrics Action */}
        <button
          onClick={() => fetchAdminData(true)}
          disabled={refreshing}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Sync Diagnostics
        </button>

      </div>

      {/* Overview Tab Slot */}
      {activeSubTab === 'overview' && analytics && (
        <div className="space-y-8 animate-slide-in">
          
          {/* Key Metric cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Total Users */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold uppercase tracking-wider">Registered Developers</span>
                <Users className="h-4.5 w-4.5 text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold mt-2 text-white group-hover:text-cyan-400 transition-colors">
                {analytics.totalUsers}
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">Active on the DevPulse database</span>
            </div>

            {/* Average Skills Progress */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold uppercase tracking-wider">Avg Skill progress</span>
                <Server className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
              </div>
              <div className="text-3xl font-extrabold mt-2 text-white group-hover:text-emerald-400 transition-colors">
                {analytics.averageLearningProgress}%
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">Average of all learning trackers</span>
            </div>

            {/* Total System Logs */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold uppercase tracking-wider">Logs & Audits Vol</span>
                <Terminal className="h-4.5 w-4.5 text-yellow-400 animate-bounce" />
              </div>
              <div className="text-3xl font-extrabold mt-2 text-white group-hover:text-yellow-400 transition-colors">
                {analytics.logsVolume}
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">Database log lines recorded</span>
            </div>

            {/* Tracked Deployments */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold uppercase tracking-wider">Monitored Servers</span>
                <Server className="h-4.5 w-4.5 text-rose-400" />
              </div>
              <div className="text-3xl font-extrabold mt-2 text-white group-hover:text-rose-400 transition-colors">
                {analytics.totalDeployments}
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">Total HTTP pingers configured</span>
            </div>

          </div>

          {/* Database System breakdown & Recent warning logs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* System Breakdown Card */}
            <div className="lg:col-span-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-6">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-850 pb-3">
                <Database className="h-4.5 w-4.5 text-cyan-400" />
                Table Volumes breakdown
              </h4>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>GitHub Synchronizations</span>
                    <span className="font-bold text-zinc-200">{analytics.githubRepos} Repos</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-900">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${Math.min(100, (analytics.githubRepos / Math.max(1, analytics.totalUsers)) * 10)}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>LeetCode Profiles Linked</span>
                    <span className="font-bold text-zinc-200">{analytics.leetcodeProfiles} Handles</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-900">
                    <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${(analytics.leetcodeProfiles / Math.max(1, analytics.totalUsers)) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Suspended Developers</span>
                    <span className="font-bold text-zinc-200">{analytics.bannedUsers} Banned</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-900">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(analytics.bannedUsers / Math.max(1, analytics.totalUsers)) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent audit timeline logs */}
            <div className="lg:col-span-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-850 pb-3">
                <Terminal className="h-4.5 w-4.5 text-yellow-400" />
                Recent System Log Activity
              </h4>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {analytics.logs.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-6">No logs registered yet.</p>
                ) : (
                  analytics.logs.slice(0, 5).map(log => {
                    const isAudit = log.type.includes('audit');
                    const isWarning = log.type.includes('warning');
                    
                    const badgeClass = isAudit
                      ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25'
                      : isWarning
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/25'
                      : 'text-rose-400 bg-rose-500/10 border-rose-500/25';

                    return (
                      <div key={log.id} className="flex items-start justify-between gap-4 p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-900 text-xs">
                        <div className="space-y-1">
                          <span className={`px-2 py-0.5 border rounded-full text-[9px] font-bold uppercase ${badgeClass}`}>
                            {log.type}
                          </span>
                          <p className="text-zinc-300 font-medium leading-tight mt-1">{log.message}</p>
                        </div>
                        <span className="text-[9px] text-zinc-500 shrink-0 font-mono self-center">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* User Management tab slot */}
      {activeSubTab === 'users' && (
        <div className="space-y-6 animate-slide-in">
          
          {/* Filters card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center backdrop-blur-sm">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-600" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full rounded-xl border-0 bg-zinc-950/80 py-2.5 pl-10 pr-4 text-white ring-1 ring-inset ring-zinc-850 placeholder:text-zinc-700 focus:ring-2 focus:ring-cyan-500 text-sm outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-center">
              <Filter className="h-4 w-4 text-zinc-500" />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="rounded-xl border-0 bg-zinc-950 py-2 px-3 text-white ring-1 ring-inset ring-zinc-850 text-xs outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          {/* User Data Table */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-x-auto shadow-xl">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/80 text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-850">
                <tr>
                  <th className="px-6 py-4">Developer</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4">Registration Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 bg-zinc-900/10">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-zinc-500">
                      No user records match your active search filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => {
                    const isAdmin = u.role === 'admin';
                    const isSelf = u.id === currentUser?.id;
                    
                    return (
                      <tr key={u.id} className="hover:bg-zinc-950/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-white whitespace-nowrap">
                          {u.name} {isSelf && <span className="text-[9px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-bold ml-1.5 uppercase leading-none">you</span>}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                          {u.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border leading-none ${isAdmin ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25' : 'text-zinc-400 bg-zinc-500/5 border-zinc-800'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border leading-none ${u.isBanned ? 'text-rose-400 bg-rose-500/10 border-rose-500/25' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'}`}>
                            {u.isBanned ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-zinc-500 whitespace-nowrap">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2.5">
                            
                            {/* Ban / Unban Toggle Button */}
                            <button
                              onClick={() => handleToggleBan(u.id, u.isBanned)}
                              disabled={isSelf || banningId === u.id}
                              className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-95 disabled:opacity-30 ${
                                u.isBanned
                                  ? 'bg-emerald-500/5 border-emerald-800 hover:bg-emerald-500/15 text-emerald-400'
                                  : 'bg-rose-500/5 border-rose-800 hover:bg-rose-500/15 text-rose-400'
                              }`}
                              title={u.isBanned ? 'Restore active user access' : 'Suspend user account'}
                            >
                              {banningId === u.id ? (
                                <Loader className="h-4 w-4 animate-spin" />
                              ) : u.isBanned ? (
                                <ShieldCheck className="h-4 w-4" />
                              ) : (
                                <Ban className="h-4 w-4" />
                              )}
                            </button>

                            {/* Delete User Button */}
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={isSelf || deletingId === u.id}
                              className="p-2 rounded-xl bg-zinc-950 border border-zinc-850 hover:bg-rose-500/10 hover:border-rose-500/30 text-zinc-500 hover:text-rose-400 transition-all cursor-pointer active:scale-95 disabled:opacity-30"
                              title="Delete user permanently"
                            >
                              {deletingId === u.id ? (
                                <Loader className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Screen 3: System Analytics */}
      {activeSubTab === 'analytics' && analytics && (
        <div className="space-y-6 animate-slide-in">
          
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-6 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  System Diagnostics & Report
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  View aggregated counts, learning averages, and export data records.
                </p>
              </div>
              
              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2.5 text-xs font-bold text-white transition-all active:scale-[0.98] cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Export Analytics (CSV)
              </button>
            </div>

            {/* Performance metric aggregates layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              
              {/* Box A: Integration Ratios */}
              <div className="bg-zinc-950/40 p-6 rounded-2xl border border-zinc-900 space-y-4">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <GitBranch className="h-4 w-4 text-cyan-400 animate-pulse" />
                  GitHub Integration Rates
                </h4>
                
                <div className="flex items-end justify-between gap-6">
                  <div className="text-2xl font-black text-white">
                    {analytics.totalUsers > 0 
                      ? `${((analytics.githubRepos / analytics.totalUsers) * 10).toFixed(1)}%`
                      : '0%'
                    }
                  </div>
                  <span className="text-[10px] text-zinc-500 leading-normal text-right">
                    Ratio of repositories relative to total developers.
                  </span>
                </div>
              </div>

              {/* Box B: LeetCode Engagement */}
              <div className="bg-zinc-950/40 p-6 rounded-2xl border border-zinc-900 space-y-4">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-yellow-400 animate-pulse" />
                  LeetCode Sync Ratios
                </h4>
                
                <div className="flex items-end justify-between gap-6">
                  <div className="text-2xl font-black text-white">
                    {analytics.totalUsers > 0 
                      ? `${((analytics.leetcodeProfiles / analytics.totalUsers) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </div>
                  <span className="text-[10px] text-zinc-500 leading-normal text-right">
                    Percentage of developers who linked their LeetCode handles.
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Screen 4: Error Logs Page */}
      {activeSubTab === 'logs' && analytics && (
        <div className="space-y-6 animate-slide-in">
          
          {/* Logs Search filters */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center backdrop-blur-sm">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-600" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search logs by message or type keyword..."
                className="w-full rounded-xl border-0 bg-zinc-950/80 py-2.5 pl-10 pr-4 text-white ring-1 ring-inset ring-zinc-850 placeholder:text-zinc-700 focus:ring-2 focus:ring-cyan-500 text-sm outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-center">
              <Filter className="h-4 w-4 text-zinc-500" />
              <select
                value={logTypeFilter}
                onChange={(e) => setLogTypeFilter(e.target.value)}
                className="rounded-xl border-0 bg-zinc-950 py-2 px-3 text-white ring-1 ring-inset ring-zinc-850 text-xs outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="admin_audit">Admin Audits</option>
                <option value="admin_warning">Admin Warnings</option>
                <option value="admin_error">Admin Errors</option>
              </select>
            </div>
          </div>

          {/* Logs Data list */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-x-auto shadow-xl">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/80 text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-850">
                <tr>
                  <th className="px-6 py-4">Log Type</th>
                  <th className="px-6 py-4">Event Description / Log Message</th>
                  <th className="px-6 py-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 bg-zinc-900/10">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-xs text-zinc-500">
                      No matching database logs or audit records found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(l => {
                    const isAudit = l.type.includes('audit');
                    const isWarning = l.type.includes('warning');
                    
                    const badgeClass = isAudit
                      ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25'
                      : isWarning
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/25'
                      : 'text-rose-400 bg-rose-500/10 border-rose-500/25';

                    return (
                      <tr key={l.id} className="hover:bg-zinc-950/20 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-bold uppercase ${badgeClass}`}>
                            {l.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-zinc-300 leading-tight">
                          {l.message}
                        </td>
                        <td className="px-6 py-4 text-right text-xs font-mono text-zinc-500 whitespace-nowrap">
                          {formatDate(l.createdAt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}
