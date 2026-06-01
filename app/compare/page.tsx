'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DeveloperCompare from '@/components/dashboard/DeveloperCompare';

export default function ComparePage() {
  return (
    <ProtectedRoute>
      <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white min-h-screen relative overflow-hidden flex flex-col transition-colors duration-300">
        {/* Background patterns */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f0f13_1px,transparent_1px),linear-gradient(to_bottom,#0f0f13_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 dark:opacity-100"></div>

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col w-full z-10">
          <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-black dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-cyan-400 dark:to-blue-500 capitalize">
                Developer Comparison Platform
              </h2>
              <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1">
                Analyze multiple developer profiles and generate AI insights
              </p>
            </div>
          </div>

          <main className="flex-1 min-w-0">
            <DeveloperCompare />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
