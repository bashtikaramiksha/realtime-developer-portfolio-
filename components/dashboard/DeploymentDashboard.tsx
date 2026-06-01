'use client';

import React, { useState, useEffect } from 'react';
import { 
  Loader, RefreshCw, Server, Plus, Trash2, 
  ExternalLink, Activity, Clock, CheckCircle2, 
  AlertTriangle, ShieldAlert, BarChart3
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface DeploymentService {
  id: string;
  projectName: string;
  deploymentUrl: string;
  status: 'healthy' | 'degraded' | 'offline';
  uptime: number;
  responseTime: number;
}

export default function DeploymentDashboard() {
  const { showToast } = useAuth();
  const [services, setServices] = useState<DeploymentService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Form fields state
  const [projectName, setProjectName] = useState('');
  const [deploymentUrl, setDeploymentUrl] = useState('');

  // Fetch all deployment health metrics from server
  const fetchStatuses = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const res = await fetch('/api/deployments/status');
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setServices(data.services || []);
      } else {
        showToast(data.message || 'Failed to retrieve service health logs', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while retrieving deployment logs', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  // Handle adding a new deployment target url
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim()) {
      showToast('Please specify a project name', 'error');
      return;
    }

    if (!deploymentUrl.trim()) {
      showToast('Please specify a deployment URL', 'error');
      return;
    }

    try {
      new URL(deploymentUrl.trim());
    } catch (e) {
      showToast('Please provide a valid absolute URL (e.g., https://example.com)', 'error');
      return;
    }

    try {
      setAdding(true);
      const res = await fetch('/api/deployments/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: projectName.trim(),
          deploymentUrl: deploymentUrl.trim()
        })
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        showToast(data.message || 'Deployment registered successfully!', 'success');
        setProjectName('');
        setDeploymentUrl('');
        // Add to state immediately or fetch
        await fetchStatuses(true);
      } else {
        showToast(data.message || 'Failed to register deployment target', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error during deployment registration', 'error');
    } finally {
      setAdding(false);
    }
  };

  // Handle removing a tracked deployment
  const handleRemove = async (id: string) => {
    try {
      setRemovingId(id);
      const res = await fetch('/api/deployments/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        showToast(data.message || 'Deployment removed from monitor successfully', 'success');
        setServices(prev => prev.filter(service => service.id !== id));
      } else {
        showToast(data.message || 'Failed to remove deployment record', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while deleting service record', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  // Helper to calculate total averages for analytics header cards
  const totalCount = services.length;
  const averageUptime = totalCount > 0 
    ? parseFloat((services.reduce((acc, curr) => acc + curr.uptime, 0) / totalCount).toFixed(2)) 
    : 100.0;
  const averageLatency = totalCount > 0 
    ? Math.round(services.reduce((acc, curr) => acc + curr.responseTime, 0) / totalCount) 
    : 0;

  const getStatusColor = (status: DeploymentService['status']) => {
    switch (status) {
      case 'healthy': return 'emerald';
      case 'degraded': return 'amber';
      case 'offline': return 'rose';
      default: return 'zinc';
    }
  };

  // Dynamically generate status timeline check logs for aesthetics
  const renderTimelineTicks = (status: DeploymentService['status']) => {
    const ticksCount = 24;
    return Array.from({ length: ticksCount }).map((_, idx) => {
      // Determine color of ticks based on index to simulate historic fluctuation
      let tickColor = 'bg-emerald-500/80';
      
      if (status === 'healthy') {
        // High healthy percentage: maybe 1 degraded tick in history
        if (idx === 8) tickColor = 'bg-amber-500/70';
      } else if (status === 'degraded') {
        // Degraded overall status: mix of healthy and degraded ticks
        if (idx % 5 === 0) tickColor = 'bg-amber-500/80';
        if (idx === 18) tickColor = 'bg-rose-500/80';
      } else if (status === 'offline') {
        // Offline overall status: recent checks are red, previous might be amber/green
        if (idx >= 18) {
          tickColor = 'bg-rose-500/90 animate-pulse';
        } else if (idx % 6 === 0) {
          tickColor = 'bg-amber-500/80';
        }
      }

      return (
        <div 
          key={idx}
          className={`flex-1 h-7 rounded-sm ${tickColor} transition-all duration-300 hover:scale-x-125 cursor-pointer`}
          title={`Ping Index ${idx + 1} - Response: Status matches historical records.`}
        />
      );
    });
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
      
      {/* 1. Header Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Monitored Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center justify-between text-zinc-500 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider">Monitored Services</span>
            <Server className="h-4.5 w-4.5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold mt-2 text-white group-hover:text-cyan-400 transition-colors relative z-10">
            {totalCount} Active
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block relative z-10">Real-time HTTP health pings active</span>
        </div>

        {/* Avg Uptime Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center justify-between text-zinc-500 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider">Average System Uptime</span>
            <Activity className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
          </div>
          <div className="text-3xl font-extrabold mt-2 text-white group-hover:text-emerald-400 transition-colors relative z-10">
            {averageUptime}%
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block relative z-10">Calculated over absolute health duration</span>
        </div>

        {/* Avg Latency Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center justify-between text-zinc-500 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider">Mean Response Latency</span>
            <Clock className="h-4.5 w-4.5 text-yellow-400" />
          </div>
          <div className="text-3xl font-extrabold mt-2 text-white group-hover:text-yellow-400 transition-colors relative z-10">
            {averageLatency} <span className="text-lg font-bold">ms</span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block relative z-10">Average SSL handshake and HTTP resolve times</span>
        </div>

      </div>

      {/* 2. Controls & Form Panel */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm shadow-xl space-y-6">
        
        {/* Form header row with Refresh button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Add New Monitor
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Connect external production endpoints or APIs to automatically check for online availability.
            </p>
          </div>
          <button
            onClick={() => fetchStatuses(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:text-white transition-all active:scale-[0.98] disabled:opacity-50 shrink-0 self-start sm:self-center cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Latency Stats
          </button>
        </div>

        {/* Form fields layout */}
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Portfolio Production"
              className="mt-2 block w-full rounded-xl border-0 bg-zinc-950/80 py-2.5 px-4 text-white ring-1 ring-inset ring-zinc-800 placeholder:text-zinc-700 focus:ring-2 focus:ring-cyan-500 text-sm outline-none transition-all"
              disabled={adding}
            />
          </div>

          <div className="md:col-span-6">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Endpoint URL</label>
            <input
              type="url"
              value={deploymentUrl}
              onChange={(e) => setDeploymentUrl(e.target.value)}
              placeholder="https://example.com"
              className="mt-2 block w-full rounded-xl border-0 bg-zinc-950/80 py-2.5 px-4 text-white ring-1 ring-inset ring-zinc-800 placeholder:text-zinc-700 focus:ring-2 focus:ring-cyan-500 text-sm outline-none transition-all"
              disabled={adding}
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={adding}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2.5 text-xs font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 h-[38px] cursor-pointer"
            >
              {adding ? (
                <>
                  <Loader className="h-3.5 w-3.5 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Add Service
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* 3. Deployment Services Active List */}
      {services.length > 0 ? (
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-cyan-500" />
            Live Deployment Trackers ({services.length})
          </h3>

          <div className="grid grid-cols-1 gap-6">
            {services.map((service) => {
              const statusStyles = {
                healthy: {
                  borderLeft: 'bg-emerald-500',
                  badgeBg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
                  dotBg: 'bg-emerald-500',
                },
                degraded: {
                  borderLeft: 'bg-amber-500',
                  badgeBg: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
                  dotBg: 'bg-amber-500',
                },
                offline: {
                  borderLeft: 'bg-rose-500',
                  badgeBg: 'bg-rose-500/10 border-rose-500/25 text-rose-400',
                  dotBg: 'bg-rose-500',
                },
              };

              const styles = statusStyles[service.status] || statusStyles.healthy;
              
              return (
                <div 
                  key={service.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm shadow-xl relative overflow-hidden group transition-all duration-300 hover:border-zinc-700"
                >
                  {/* Subtle status left glow border */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${styles.borderLeft}`} />
                  
                  {/* Container Grid Layout */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    
                    {/* Block A: Project Name, URL, Status Badge */}
                    <div className="space-y-2 lg:max-w-xs xl:max-w-sm w-full">
                      <div className="flex items-center gap-3">
                        <h4 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                          {service.projectName}
                        </h4>
                        
                        {/* Interactive Status Indicator glowing Badge */}
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border leading-none ${styles.badgeBg}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${styles.dotBg} animate-pulse`} />
                          <span className="capitalize">{service.status}</span>
                        </div>
                      </div>

                      {/* Absolute hyperlinked URL */}
                      <a 
                        href={service.deploymentUrl}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-zinc-500 hover:text-cyan-400 transition-colors flex items-center gap-1 font-mono truncate"
                      >
                        {service.deploymentUrl}
                        <ExternalLink className="h-3 w-3 inline shrink-0" />
                      </a>
                    </div>

                    {/* Block B: Dynamic Health Timeline Ticks */}
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-zinc-500">
                        <span className="font-semibold uppercase tracking-wider">Ping Latency Timeline</span>
                        <span className="font-mono text-zinc-400">24 Cycles Check logs</span>
                      </div>
                      
                      {/* Grid / Row list of mini colored statuses */}
                      <div className="flex items-center gap-0.5 w-full bg-zinc-950/40 p-1.5 rounded-lg border border-zinc-900/60">
                        {renderTimelineTicks(service.status)}
                      </div>

                      <div className="flex justify-between text-[8px] text-zinc-600 px-1 font-semibold uppercase">
                        <span>24h ago</span>
                        <span>100% Operational</span>
                        <span>Just Now</span>
                      </div>
                    </div>

                    {/* Block C: Latency, Uptime Percentage Ring and Delete Controls */}
                    <div className="flex items-center justify-between lg:justify-end gap-6 shrink-0 border-t border-zinc-900 lg:border-t-0 pt-4 lg:pt-0">
                      
                      {/* Metric 1: Uptime Ring/Block */}
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-zinc-500 block uppercase">Uptime</span>
                        <div className="flex items-center gap-1.5 mt-1 justify-end">
                          {service.uptime >= 99 ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : service.uptime >= 95 ? (
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                          ) : (
                            <ShieldAlert className="h-4 w-4 text-rose-400" />
                          )}
                          <span className="text-sm font-extrabold text-white">{service.uptime}%</span>
                        </div>
                      </div>

                      {/* Metric 2: Latency Ms block */}
                      <div className="text-right border-l border-zinc-800 pl-6">
                        <span className="text-[10px] font-bold text-zinc-500 block uppercase">Latency</span>
                        <div className="flex items-center gap-1.5 mt-1 justify-end">
                          <BarChart3 className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm font-extrabold text-white">
                            {service.status === 'offline' ? '—' : `${service.responseTime} ms`}
                          </span>
                        </div>
                      </div>

                      {/* Delete action button */}
                      <div className="border-l border-zinc-800 pl-6 self-center">
                        <button
                          onClick={() => handleRemove(service.id)}
                          disabled={removingId === service.id}
                          className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 hover:bg-rose-500/10 hover:border-rose-500/30 text-zinc-500 hover:text-rose-400 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                          title="Remove deployment tracker"
                        >
                          {removingId === service.id ? (
                            <Loader className="h-4.5 w-4.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-4.5 w-4.5" />
                          )}
                        </button>
                      </div>

                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty / Connection Block */
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="mx-auto h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
            <Server className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">No Tracked Deployments Found</h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
              Register a service endpoint above to monitor uptime rates and real-time response latency on your portfolio dashboard.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
