import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Input } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { ThemeToggle } from '../components/layout/ThemeToggle.js';

export const SignInPage: React.FC = () => {
  const { signIn, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
      navigate('/app');
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in. Please check your credentials.');
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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Bar with Logo and Theme Toggle */}
      <div className="w-full max-w-md flex items-center justify-between mb-8 z-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-brand-600 dark:from-white dark:to-cyan-400 bg-clip-text text-transparent">
            Decisionly
          </span>
        </Link>
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md p-6 sm:p-8 z-10 border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to access your personal decision space and analyses.
          </p>
        </div>

        {/* Demo Account Quick-Fill Button */}
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleDemoSignIn}
          isLoading={isDemoLoading}
          icon={<Sparkles className="w-4 h-4 text-brand-500" />}
        >
          Instant Access with Demo Account
        </Button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-white/10 w-full" />
          <span className="bg-white dark:bg-[#111827] px-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold absolute">
            Or sign in with email
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Password
              </label>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            variant="primary"
            type="submit"
            className="w-full"
            isLoading={isLoading}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link
            to="/auth/sign-up"
            className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  );
};
