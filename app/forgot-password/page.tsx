'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { Mail, ArrowLeft, CheckCircle, Loader } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { showToast } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address', 'error');
      return;
    }

    setIsSubmitting(true);
    // Simulate API reset request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast('Reset link sent if email exists!', 'success');
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f0f13_1px,transparent_1px),linear-gradient(to_bottom,#0f0f13_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 dark:opacity-100"></div>
      
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md backdrop-blur-md bg-white/80 dark:bg-zinc-900/40 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        
        {!isSubmitted ? (
          <>
            <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Forgot Password?
              </h2>
              <p className="mt-2 text-sm text-zinc-650 dark:text-zinc-400">
                Enter your registered email address and we will send you password reset instructions.
              </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium leading-6 text-zinc-700 dark:text-zinc-300">
                    Email address
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <Mail className="h-4 w-4 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-xl border-0 bg-white dark:bg-zinc-950 py-3 pl-10 pr-4 text-zinc-900 dark:text-white ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 placeholder:text-zinc-400 dark:placeholder:text-zinc-650 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6 outline-none transition-all"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full justify-center items-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:bg-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-855 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Reset Link Sent</h3>
            <p className="mt-2 text-sm text-zinc-650 dark:text-zinc-400">
              We have sent password reset instructions to <span className="text-cyan-600 dark:text-cyan-400 font-medium">{email}</span>.
            </p>
            <div className="mt-8">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-zinc-800 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-[0.98] border border-zinc-250 dark:border-zinc-700/50 shadow-sm dark:shadow-md transition-all"
              >
                Return to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
