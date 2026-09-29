import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, ArrowRight, ShieldCheck, CheckSquare, Heart } from 'lucide-react';
import { ThemeToggle } from '../components/layout/ThemeToggle.js';
import { useAuth } from '../context/AuthContext.js';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] dark:bg-[#0F171A] text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* Top Navigation */}
      <header className="w-full py-5 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-stone-900 font-bold text-sm shadow-sm">
              D
            </div>
            <span className="font-semibold text-base tracking-tight text-stone-900 dark:text-stone-100">
              Decisionly
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            {user ? (
              <button
                onClick={() => navigate('/app')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-stone-900 shadow-sm transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <Link
                  to="/auth/sign-in"
                  className="text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white px-3 py-1.5 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth/sign-up"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-stone-900 shadow-sm transition-all"
                >
                  <span>Create account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center px-6 sm:px-12 py-10 lg:py-16">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-[#265347] dark:text-[#5EAD9C]">
              A private place for the in-between
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-normal tracking-tight leading-[1.06] text-stone-900 dark:text-stone-100">
              Your life is not<br />
              a<br />
              <span className="text-[#265347] dark:text-[#5EAD9C]">spreadsheet.</span>
            </h1>

            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed max-w-lg">
              Decisionly gives complicated choices the time, context, and honesty they deserve. Compare what matters to you — without handing over the steering wheel.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => navigate(user ? '/app/decisions/new' : '/auth/sign-up')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-stone-900 shadow-sm transition-all cursor-pointer"
              >
                <span>Start a decision</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate(user ? '/app' : '/auth/sign-in')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border border-stone-300 dark:border-white/15 hover:bg-stone-200/50 dark:hover:bg-white/5 text-stone-700 dark:text-stone-300 transition-all cursor-pointer"
              >
                <span>See your space</span>
              </button>
            </div>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-stone-300/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] text-xs text-stone-600 dark:text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#265347] dark:text-[#5EAD9C]" />
                <span>Your choices stay in your browser, on this device.</span>
              </div>
            </div>
          </div>

          {/* Right Column (Floating Quote Card) */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            {/* Offset backdrop shadow card */}
            <div className="absolute inset-0 bg-[#F4DEB8]/70 dark:bg-amber-500/10 rounded-2xl translate-x-3 translate-y-3 pointer-events-none" />

            {/* Front Card */}
            <div className="relative rounded-2xl p-7 sm:p-9 bg-white dark:bg-[#152226] border border-stone-200/80 dark:border-white/10 shadow-sm space-y-4">
              <div className="text-amber-500 text-3xl font-serif leading-none select-none">
                “
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-medium text-stone-900 dark:text-stone-100 leading-snug">
                Decisionly helps you think it through.<br />
                You make the final choice.
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed pt-3 border-t border-stone-100 dark:border-white/5">
                There is no score telling you who to become.<br />
                Just a clearer view of what you already know.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Bottom Columns (Picture 4) */}
        <div className="max-w-6xl mx-auto w-full pt-16 sm:pt-24 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Col 1 */}
            <div className="border-t border-[#265347]/40 dark:border-[#5EAD9C]/40 pt-5 space-y-2.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[#265347] dark:text-[#5EAD9C]">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-serif font-semibold text-stone-900 dark:text-stone-100">
                Hold the whole picture
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Name the situation, the pull in each direction, and the outcome you hope to protect.
              </p>
            </div>

            {/* Col 2 */}
            <div className="border-t border-[#265347]/40 dark:border-[#5EAD9C]/40 pt-5 space-y-2.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[#265347] dark:text-[#5EAD9C]">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-serif font-semibold text-stone-900 dark:text-stone-100">
                Compare what matters
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Set your own criteria. Give them weight. Notice which option keeps showing up with quiet consistency.
              </p>
            </div>

            {/* Col 3 */}
            <div className="border-t border-[#265347]/40 dark:border-[#5EAD9C]/40 pt-5 space-y-2.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[#265347] dark:text-[#5EAD9C]">
                <Heart className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-serif font-semibold text-stone-900 dark:text-stone-100">
                Bring your context
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Your values, constraints, and rhythms belong in the room — not as an afterthought.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
