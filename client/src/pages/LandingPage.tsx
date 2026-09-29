import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, ArrowRight, Shield, Heart, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { ThemeToggle } from '../components/layout/ThemeToggle.js';
import { useAuth } from '../context/AuthContext.js';

export const LandingPage: React.FC = () => {
  const { user, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleDemo = async () => {
    try {
      await demoLogin();
      navigate('/app');
    } catch {
      navigate('/auth/sign-in');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0c1017] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Quiet Top Navigation */}
      <header className="w-full border-b border-slate-100 dark:border-white/5 py-4 px-6 sm:px-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 shadow-sm">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-white">
              Decisionly
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/app')}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link
                  to="/auth/sign-in"
                  className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 transition-colors"
                >
                  Log In
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/auth/sign-up')}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Calm Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            A quiet place to think through what's on your mind.
          </h1>

          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-xl mx-auto">
            When a life choice feels tangled or overwhelming, talk it through here.
            No noisy dashboards, no robotic formulas—just honest, calm clarity to help you find your next step.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            {user ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/app')}
                icon={<ArrowRight className="w-4 h-4" />}
                className="px-6 py-3 text-sm font-medium rounded-xl"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/auth/sign-up')}
                  icon={<ArrowRight className="w-4 h-4" />}
                  className="px-6 py-3 text-sm font-medium rounded-xl w-full sm:w-auto"
                >
                  Start Thinking It Through
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleDemo}
                  className="px-5 py-3 text-sm font-medium rounded-xl w-full sm:w-auto"
                >
                  Explore Demo
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Example Prompt Showcase */}
        <div className="mt-14 max-w-xl w-full mx-auto p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/10 text-left space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            What people bring here
          </span>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
            "I'm thinking about taking admission in a private college, but most of the good ones are far from me. I'm not sure if travelling that far is worth it."
          </p>
        </div>
      </main>

      {/* Supporting Quiet Notes at Bottom */}
      <footer className="border-t border-slate-100 dark:border-white/5 py-10 px-6 sm:px-10">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left text-xs text-slate-500 dark:text-slate-400">
          <div className="space-y-1">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center sm:justify-start gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400" /> Private & Personal
            </h4>
            <p className="text-[11px] leading-relaxed">
              Your thoughts, memories, and dilemmas are strictly yours. Never sold or shared.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center sm:justify-start gap-1.5">
              <Heart className="w-3.5 h-3.5 text-slate-400" /> Like a Thoughtful Friend
            </h4>
            <p className="text-[11px] leading-relaxed">
              A gentle sounding board that listens to what actually matters to your everyday life.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center sm:justify-start gap-1.5">
              <Compass className="w-3.5 h-3.5 text-slate-400" /> Always Your Call
            </h4>
            <p className="text-[11px] leading-relaxed">
              No pressure and no automated orders. You stay in the driver's seat.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span>Decisionly</span>
          <span>A quiet space to think clearly.</span>
        </div>
      </footer>
    </div>
  );
};
