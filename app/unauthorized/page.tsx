'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShieldAlert, ArrowLeft, RotateCcw } from 'lucide-react';

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get('error') || 'You are not authorized to access this resource.';

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f0f13_1px,transparent_1px),linear-gradient(to_bottom,#0f0f13_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 dark:opacity-100"></div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md backdrop-blur-md bg-white/80 dark:bg-zinc-900/40 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 dark:text-rose-400 mb-6">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-white bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
          Access Denied
        </h2>
        
        <p className="mt-4 text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
          {errorMsg}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-zinc-800 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-[0.98] border border-zinc-250 dark:border-zinc-700/55 transition-all shadow-sm dark:shadow-md"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Link>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 active:scale-[0.98] transition-all shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300">
        <ShieldAlert className="h-10 w-10 animate-spin text-rose-500" />
      </div>
    }>
      <UnauthorizedContent />
    </Suspense>
  );
}
