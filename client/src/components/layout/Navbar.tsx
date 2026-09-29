import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Compass, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { ThemeToggle } from './ThemeToggle.js';
import { Button } from '../ui/Button.js';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-brand-700 to-indigo-600 dark:from-white dark:via-brand-300 dark:to-cyan-400 bg-clip-text text-transparent">
              Decisionly
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 -mt-1 hidden sm:block">
              Your Life. Your Context.
            </span>
          </div>
        </Link>

        {/* Navigation links & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/app')}
                icon={<Sparkles className="w-4 h-4 text-brand-500" />}
              >
                Dashboard
              </Button>
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-white/10">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 hidden md:inline">
                  {user.display_name || user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth/sign-in')}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/auth/sign-up')}
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
