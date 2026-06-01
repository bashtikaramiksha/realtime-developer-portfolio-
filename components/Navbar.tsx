'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { Sun, Moon, LogOut, Shield, Menu, X, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout, theme, toggleTheme } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-zinc-200/50 bg-white/70 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/70 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 font-sans text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">LiveFolio</span>
              <span className="text-zinc-400 dark:text-zinc-600 font-light">Auth</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:gap-6 ml-8 mr-auto">
            <Link href="/" className="text-sm font-semibold text-zinc-500 hover:text-zinc-955 dark:text-zinc-455 dark:hover:text-white transition-colors">
              Home
            </Link>
            <a href="/#features" className="text-sm font-semibold text-zinc-500 hover:text-zinc-955 dark:text-zinc-455 dark:hover:text-white transition-colors">
              Features
            </a>
            <Link href="/compare" className="text-sm font-bold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors">
              Developer Compare
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white transition-all focus:outline-none"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                {/* User Info Badge */}
                <div className="flex items-center gap-2 rounded-2xl bg-zinc-100/80 px-3 py-1.5 dark:bg-zinc-800/30 border border-zinc-200/30 dark:border-zinc-800/30">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-500">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {user.name}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-cyan-400/10 px-1.5 py-0.5 text-xs font-medium text-cyan-400 ring-1 ring-inset ring-cyan-400/20">
                    {user.role}
                  </span>
                </div>

                <Link
                  href="/dashboard"
                  className="text-sm font-semibold text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white transition-colors"
                >
                  Dashboard
                </Link>

                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 shadow-md transition-all active:scale-[0.98]"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:bg-cyan-500 transition-all active:scale-[0.98]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white transition-all"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white transition-all"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-950 px-4 py-4 space-y-3 transition-all">
          {/* Navigation Links */}
          <div className="space-y-1 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-semibold text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              Home
            </Link>
            <a
              href="/#features"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-semibold text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              Features
            </a>
            <Link
              href="/compare"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-bold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              Developer Compare
            </Link>
          </div>

          {user ? (
            <div className="space-y-3 pt-1">
              <div className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900/50">
                <div className="text-sm font-semibold text-zinc-900 dark:text-white">{user.name}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{user.email}</div>
                <div className="mt-2 inline-flex items-center rounded-md bg-cyan-400/10 px-1.5 py-0.5 text-xs font-medium text-cyan-400 ring-1 ring-inset ring-cyan-400/20">
                  {user.role}
                </div>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2.5 text-base font-semibold text-white dark:bg-white dark:text-zinc-950"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex h-11 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="flex h-11 items-center justify-center rounded-xl bg-cyan-600 font-semibold text-white shadow-md hover:bg-cyan-500"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
