'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Keep track of redirect path
      const loginUrl = `/login?redirectTo=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-zinc-950 font-sans text-white">
        <div className="relative flex flex-col items-center gap-6">
          {/* Neon spinning outer ring */}
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-zinc-800 border-t-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]"></div>
          
          {/* Modern glassmorphic loader title */}
          <div className="text-center">
            <h3 className="text-lg font-medium tracking-wide text-zinc-200">Authenticating</h3>
            <p className="text-xs text-zinc-500 mt-1">Verifying your secure session...</p>
          </div>
        </div>
      </div>
    );
  }

  // If not loading and no user, don't show children while redirect runs
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
