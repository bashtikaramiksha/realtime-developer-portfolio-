'use client';

import React from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useAuth();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        // Dynamic icons and colors based on status type
        let Icon = Info;
        let bgStyle = 'bg-zinc-900/90 border-zinc-800 text-zinc-100 shadow-[0_4px_30px_rgba(0,0,0,0.1)]';
        let iconColor = 'text-blue-400';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          bgStyle = 'bg-zinc-900/90 border-emerald-500/20 text-zinc-100 shadow-[0_8px_32px_rgba(16,185,129,0.15)]';
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          bgStyle = 'bg-zinc-900/90 border-rose-500/20 text-zinc-100 shadow-[0_8px_32px_rgba(244,63,94,0.15)]';
          iconColor = 'text-rose-400';
        }

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md pointer-events-auto transition-all duration-300 animate-slide-in ${bgStyle}`}
          >
            <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconColor}`} />
            
            <div className="flex-1 text-sm font-medium pr-2 leading-snug">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
