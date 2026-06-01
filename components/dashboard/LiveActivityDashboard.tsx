'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader, RefreshCw, Activity, Radio, Play, Square, User, Clock, Terminal } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface ActiveUser {
  userId: string;
  name: string;
}

interface ActivityEvent {
  id: string;
  userId: string;
  userName: string;
  activityType: string;
  repoName: string;
  startedAt: string;
  endedAt?: string;
}

export default function LiveActivityDashboard() {
  const { user, showToast } = useAuth();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'offline'>('offline');
  
  // Forms local state
  const [activityType, setActivityType] = useState('');
  const [repoName, setRepoName] = useState('');
  const [isCoding, setIsCoding] = useState(false);
  const [activeSession, setActiveSession] = useState<ActivityEvent | null>(null);

  // Synchronized lists
  const [onlineUsers, setOnlineUsers] = useState<ActiveUser[]>([]);
  const [liveActivities, setLiveActivities] = useState<ActivityEvent[]>([]);
  const [timeline, setTimeline] = useState<ActivityEvent[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial REST data (live sessions + historic timeline)
  const fetchRESTData = async () => {
    try {
      const res = await fetch('/api/activity/live');
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setLiveActivities(data.live || []);
        setTimeline(data.timeline || []);
        
        // Find if current user has an ongoing open session in DB
        const currentOpenSession = data.live.find((a: any) => a.userId === user?.id);
        if (currentOpenSession) {
          setIsCoding(true);
          setActiveSession(currentOpenSession);
          setActivityType(currentOpenSession.activityType);
          setRepoName(currentOpenSession.repoName);
        }
      }
    } catch (error) {
      console.error('Error fetching live coding data:', error);
    }
  };

  // Connect to WebSocket Server
  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    setWsStatus('connecting');
    const wsUrl = 'ws://localhost:3001';
    console.log(`Connecting to WebSocket: ${wsUrl}`);
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket successfully connected!');
      setWsStatus('connected');
      
      // Join standard broadcast room
      socket.send(JSON.stringify({
        type: 'join',
        userId: user?.id,
        name: user?.name,
      }));

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'ping':
            // Reply with pong for heartbeat check
            socket.send(JSON.stringify({ type: 'pong' }));
            break;

          case 'presence_list':
            // Update active users grid list
            setOnlineUsers(data.users || []);
            break;

          case 'activity_update':
            // Trigger rapid refresh to pull fresh listings
            fetchRESTData();
            break;
        }
      } catch (err) {
        console.error('Error parsing inbound WS payload:', err);
      }
    };

    socket.onclose = () => {
      console.warn('WebSocket closed. Reconnecting in 5 seconds...');
      setWsStatus('offline');
      
      // Clear user list when WS goes down
      setOnlineUsers([]);

      // Retry connection in 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 5000);
    };

    socket.onerror = (err) => {
      console.warn('WebSocket connection offline or failed. Falling back to HTTP polling.');
      socket.close();
    };
  };

  const wsStatusRef = useRef(wsStatus);
  
  useEffect(() => {
    wsStatusRef.current = wsStatus;
  }, [wsStatus]);

  useEffect(() => {
    const initialize = async () => {
      await fetchRESTData();
      setLoading(false);
      connectWebSocket();
    };
    initialize();

    // Setup fallback high-frequency HTTP backup poller (every 5 seconds)
    const poller = setInterval(() => {
      if (wsStatusRef.current !== 'connected') {
        fetchRESTData();
      }
    }, 5000);

    return () => {
      clearInterval(poller);
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user?.id]);

  const handleStartCoding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityType.trim() || !repoName.trim()) {
      showToast('Please specify activity details and repo name', 'error');
      return;
    }

    try {
      setSyncing(true);
      const res = await fetch('/api/activity/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityType: activityType.trim(),
          repoName: repoName.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setIsCoding(true);
        setActiveSession(data.activity);
        showToast('Real-time coding presence activated!', 'success');
        
        // Send state change notification to WebSocket network
        if (wsRef.current && wsStatus === 'connected') {
          wsRef.current.send(JSON.stringify({
            type: 'activity_update',
            userId: user?.id,
            name: user?.name,
            action: 'start',
            activityType: activityType.trim(),
            repoName: repoName.trim(),
          }));
        }
        
        await fetchRESTData();
      } else {
        showToast(data.message || 'Start failed', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleStopCoding = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/activity/stop', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok && data.status === 'success') {
        setIsCoding(false);
        setActiveSession(null);
        setActivityType('');
        setRepoName('');
        showToast('Coding presence deactivated successfully.', 'info');

        // Broadcast stop signal
        if (wsRef.current && wsStatus === 'connected') {
          wsRef.current.send(JSON.stringify({
            type: 'activity_update',
            userId: user?.id,
            name: user?.name,
            action: 'stop',
          }));
        }

        await fetchRESTData();
      } else {
        showToast(data.message || 'Stop failed', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  // Format timestamps neatly
  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8 animate-slide-in">
      
      {/* 1. Header Info Bar */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white font-bold">
            <Activity className="h-6 w-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Real-Time Coding Presence
              
              {/* WS Status Badge */}
              <span className={`text-[10px] border px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 capitalize ${
                wsStatus === 'connected' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : wsStatus === 'connecting'
                  ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                <Radio className={`h-3 w-3 ${wsStatus === 'connected' ? 'animate-pulse' : ''}`} />
                WS: {wsStatus}
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Broadcast active coding states, edit timelines, and display live online presence cards.
            </p>
          </div>
        </div>

        <button 
          onClick={fetchRESTData}
          className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/20 text-xs font-bold text-zinc-300 hover:text-white transition-all active:scale-[0.98] cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Feed
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Control Card & Active List */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Presence Controller card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-md">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Terminal className="h-4.5 w-4.5 text-cyan-400" />
              Presence Controller
            </h4>

            {isCoding ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/10 space-y-2">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Broadcasting Live</span>
                  <div className="text-sm font-bold text-zinc-200">{activityType}</div>
                  <div className="text-xs text-zinc-400">Repository: <span className="font-mono text-cyan-500 font-bold">{repoName}</span></div>
                </div>

                <button
                  type="button"
                  onClick={handleStopCoding}
                  disabled={syncing}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-xs font-bold text-white hover:bg-rose-500 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <Square className="h-4 w-4 fill-white" />
                  Stop Coding Broadcast
                </button>
              </div>
            ) : (
              <form onSubmit={handleStartCoding} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase">Activity description</label>
                  <input
                    type="text"
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    placeholder="e.g. Refactoring user authentication"
                    className="mt-2 block w-full rounded-xl border-0 bg-zinc-950 py-2.5 px-4 text-white ring-1 ring-inset ring-zinc-800 placeholder:text-zinc-700 focus:ring-2 focus:ring-cyan-500 text-xs outline-none"
                    disabled={syncing}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase">Repository name</label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="e.g. devpulse-app"
                    className="mt-2 block w-full rounded-xl border-0 bg-zinc-950 py-2.5 px-4 text-white ring-1 ring-inset ring-zinc-800 placeholder:text-zinc-700 focus:ring-2 focus:ring-cyan-500 text-xs outline-none"
                    disabled={syncing}
                  />
                </div>

                <button
                  type="submit"
                  disabled={syncing}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-xs font-bold text-white hover:bg-cyan-500 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-white" />
                  Start Coding Broadcast
                </button>
              </form>
            )}
          </div>

          {/* Active online developers list */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-md">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <User className="h-4.5 w-4.5 text-cyan-400" />
              Connected presence ({wsStatus === 'connected' ? onlineUsers.length : 1})
            </h4>

            {wsStatus !== 'connected' ? (
              /* Fallback list when offline: display current user only */
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-zinc-950/40 rounded-xl border border-zinc-850">
                  <div className="relative h-8 w-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <User className="h-4 w-4" />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-zinc-950"></span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-300">{user?.name} (You)</div>
                    <span className="text-[9px] text-zinc-500 font-bold block mt-0.5">Polling Mode</span>
                  </div>
                </div>
              </div>
            ) : onlineUsers.length === 0 ? (
              <p className="text-xs text-zinc-500">No other developers are connected to WS room.</p>
            ) : (
              <div className="space-y-3">
                {onlineUsers.map((u, idx) => (
                  <div key={`${u.userId}-${idx}`} className="flex items-center gap-3 p-2 bg-zinc-950/40 rounded-xl border border-zinc-850">
                    <div className="relative h-8 w-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <User className="h-4 w-4" />
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-zinc-950"></span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-300">
                        {u.name} {u.userId === user?.id && '(You)'}
                      </div>
                      <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">Live Presence Connected</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Real-Time Feed Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active / Ongoing coding feeds */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Radio className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
              Live Coding Activities
            </h4>

            {liveActivities.length === 0 ? (
              <div className="p-8 text-center bg-zinc-950/20 rounded-xl border border-zinc-850/80">
                <p className="text-xs text-zinc-500">No active coding sessions reported currently.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {liveActivities.map((act) => (
                  <div 
                    key={act.id} 
                    className="flex justify-between items-center p-4 bg-zinc-950/50 border border-cyan-500/10 hover:border-cyan-500/30 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.03)] animate-pulse-slow"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-white">{act.userName}</span>
                        <span className="text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full uppercase">Coding</span>
                      </div>
                      <p className="text-sm text-zinc-300">{act.activityType}</p>
                      <div className="text-[10px] text-zinc-500">Repository: <span className="font-mono text-cyan-400 font-semibold">{act.repoName}</span></div>
                    </div>

                    <div className="text-right flex items-center gap-1 text-[10px] font-semibold text-zinc-500 shrink-0">
                      <Clock className="h-3.5 w-3.5 text-cyan-500" />
                      Started: {formatTime(act.startedAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical timeline logs */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-1.5">
              <Clock className="h-4.5 w-4.5 text-cyan-400" />
              Developer Activity Log
            </h4>

            {timeline.length === 0 ? (
              <p className="text-xs text-zinc-500">No completed coding session logs found in database.</p>
            ) : (
              <div className="relative border-l border-zinc-800 pl-6 ml-3 space-y-8">
                {timeline.map((event) => (
                  <div key={event.id} className="relative group">
                    {/* Circle icon marker */}
                    <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-950 border border-zinc-800 text-[8px] group-hover:border-cyan-500 transition-colors">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-700 group-hover:bg-cyan-500 transition-colors"></span>
                    </span>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-zinc-300">{event.userName}</span>
                        <span className="text-[9px] font-medium text-zinc-500">completed session</span>
                        <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1 shrink-0 ml-auto">
                          {formatTime(event.startedAt)} - {event.endedAt ? formatTime(event.endedAt) : ''}
                        </span>
                      </div>
                      
                      <p className="text-xs text-zinc-400">{event.activityType}</p>
                      
                      <div className="text-[9px] text-zinc-600 mt-1">
                        Repository: <span className="font-mono text-zinc-500">{event.repoName}</span>
                      </div>
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
