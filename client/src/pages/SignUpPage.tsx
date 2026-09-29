import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { ThemeToggle } from '../components/layout/ThemeToggle.js';

export const SignUpPage: React.FC = () => {
  const { signUp, demoLogin, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signUp(email, password, displayName);
      navigate('/app');
    } catch (err: any) {
      setError(err?.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    setIsDemoLoading(true);
    try {
      await demoLogin();
      navigate('/app');
    } catch (err: any) {
      setError(err?.message || 'Demo login failed.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await googleLogin();
      navigate('/app');
    } catch (err: any) {
      setError(err?.message || 'Google sign-up failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-[#F8F5EF] dark:bg-[#0F171A] text-stone-900 dark:text-stone-100 transition-colors duration-200">
      <div className="w-full max-w-md flex items-center justify-between mb-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-stone-900 font-bold text-sm shadow-sm">
            D
          </div>
          <span className="font-semibold text-lg tracking-tight text-stone-900 dark:text-stone-100">
            Decisionly
          </span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md p-7 sm:p-9 rounded-2xl bg-white dark:bg-[#152226] border border-stone-200/80 dark:border-white/5 shadow-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-stone-900 dark:text-stone-100">
            Create your space.
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            A quiet place to think through what matters to you.
          </p>
        </div>

        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isDemoLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-transparent hover:bg-stone-50 dark:hover:bg-white/[0.03] text-stone-800 dark:text-stone-200 font-medium text-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          {isGoogleLoading ? (
            <div className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Sign up with Google</span>
        </button>

        {/* Quick Demo */}
        <button
          type="button"
          onClick={handleDemoSignIn}
          disabled={isDemoLoading || isGoogleLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/[0.02] hover:bg-stone-100 dark:hover:bg-white/[0.05] text-stone-700 dark:text-stone-300 font-medium text-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          <span>Use Instant Demo Space</span>
          <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-stone-200 dark:border-white/10 w-full" />
          <span className="bg-white dark:bg-[#152226] px-3 text-[11px] text-stone-400 uppercase tracking-wider absolute">
            or email
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Your Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Amisha"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl font-semibold text-sm bg-amber-500 hover:bg-amber-600 text-stone-900 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-stone-500 dark:text-stone-400">
          Already have an account?{' '}
          <Link
            to="/auth/sign-in"
            className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
