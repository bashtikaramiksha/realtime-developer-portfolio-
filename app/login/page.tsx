'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, ShieldAlert, Loader } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

function LoginForm() {
  const { login, user, loading, showToast } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  // If already logged in, redirect away
  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  const validateField = (fieldName: 'email' | 'password', value: string) => {
    const fieldData = fieldName === 'email' ? { email: value, password: 'dummy' } : { email: 'dummy@test.com', password: value };
    const result = loginSchema.safeParse(fieldData);
    
    if (result.success) {
      setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    } else {
      const fieldErrors = result.error.format();
      setErrors((prev) => ({
        ...prev,
        [fieldName]: fieldErrors[fieldName]?._errors[0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors = validation.error.format();
      setErrors({
        email: fieldErrors.email?._errors[0],
        password: fieldErrors.password?._errors[0],
      });
      setIsSubmitting(false);
      showToast('Please correct validation errors', 'error');
      return;
    }

    try {
      const result = await login(email, password);
      if (result.success) {
        // Use replace so user can't go "back" to login form after logging in
        router.replace(redirectTo);
      } else {
        setLoginError(result.message);
      }
    } catch (err) {
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white relative overflow-hidden transition-colors duration-300">
      {/* Decorative Grid Gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f0f13_1px,transparent_1px),linear-gradient(to_bottom,#0f0f13_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 dark:opacity-100"></div>
      
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md backdrop-blur-md bg-white/80 dark:bg-zinc-900/40 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
          <h2 className="text-3xl font-bold tracking-tight text-black dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-cyan-400 dark:to-blue-500">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-zinc-650 dark:text-zinc-400">
            Sign in to access your secure developer account
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Global login error message */}
            {loginError && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-400">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}
            {/* Email field */}
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validateField('email', e.target.value);
                  }}
                  className={`block w-full rounded-xl border-0 bg-white dark:bg-zinc-950 py-3 pl-10 pr-4 text-zinc-900 dark:text-white ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 placeholder:text-zinc-400 dark:placeholder:text-zinc-650 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6 outline-none transition-all ${
                    errors.email ? 'focus:ring-rose-500 ring-rose-500/50' : ''
                  }`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-xs text-rose-400 flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
                <div className="text-sm">
                  <Link href="/forgot-password" className="font-semibold text-cyan-500 dark:text-cyan-400 hover:text-cyan-400 dark:hover:text-cyan-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validateField('password', e.target.value);
                  }}
                  className={`block w-full rounded-xl border-0 bg-white dark:bg-zinc-950 py-3 pl-10 pr-10 text-zinc-900 dark:text-white ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 placeholder:text-zinc-400 dark:placeholder:text-zinc-650 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6 outline-none transition-all ${
                    errors.password ? 'focus:ring-rose-500 ring-rose-500/50' : ''
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-450 hover:text-zinc-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-xs text-rose-400 flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center items-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:bg-cyan-500 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-550 dark:text-zinc-500">
            Not registered?{' '}
            <Link href="/signup" className="font-semibold leading-6 text-cyan-550 dark:text-cyan-400 hover:text-cyan-400 dark:hover:text-cyan-300 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300">
        <Loader className="h-10 w-10 animate-spin text-cyan-500" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
