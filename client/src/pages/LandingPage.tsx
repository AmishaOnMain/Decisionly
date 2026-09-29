import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Scale,
  Sliders,
  CheckCircle2,
  Lock,
  Compass,
  ArrowRight,
  Briefcase,
  DollarSign,
  HeartPulse,
  Plane,
  Target,
  Home,
  Users,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { Navbar } from '../components/layout/Navbar.js';
import { TARGET_CATEGORIES, CATEGORY_DETAILS } from '@shared/constants/categories.js';
import { useAuth } from '../context/AuthContext.js';

export const LandingPage: React.FC = () => {
  const { user, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleDemo = async () => {
    try {
      await demoLogin();
      navigate('/app');
    } catch (err: any) {
      navigate('/auth/sign-in');
    }
  };

  const categoryIcons: Record<string, any> = {
    Career: Briefcase,
    Finance: DollarSign,
    'Health and Fitness': HeartPulse,
    Travel: Plane,
    'Personal Development': Target,
    Lifestyle: Home,
    Relationships: Users,
    Education: GraduationCap,
    Custom: Layers,
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/20 via-indigo-500/20 to-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-semibold text-brand-600 dark:text-brand-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Personal Decision Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Your Life. Your Context.{' '}
            <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-cyan-500 dark:from-brand-400 dark:via-indigo-300 dark:to-cyan-300 bg-clip-text text-transparent">
              Your Decisions.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Turn complex personal and professional crossroads into transparent, grounded comparisons.
            Powered by deterministic weighted scoring, verified personal context, and AI language synthesis.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {user ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/app')}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Go to Your Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/auth/sign-up')}
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleDemo}
                  icon={<Sparkles className="w-4 h-4 text-brand-500" />}
                >
                  Try Interactive Demo
                </Button>
              </>
            )}
          </div>

          {/* Value Highlights */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Deterministic Math Engine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              <span>100% User-Controlled Context</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-cyan-500" />
              <span>Zero Model Training on Private Data</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9 Supported Domains Showcase */}
      <section className="py-16 bg-white/50 dark:bg-[#111827]/40 border-y border-slate-200/80 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Structured Guidance for Every Major Life Domain
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Select predefined domains with tailored safeguards or create your own custom framework.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TARGET_CATEGORIES.map((catKey) => {
              const details = CATEGORY_DETAILS[catKey];
              const IconComp = categoryIcons[catKey] || Layers;

              return (
                <Card
                  key={catKey}
                  className="p-5 border-slate-200 dark:border-white/10 hover:border-brand-500/30 transition-all glow-card"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {details.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {details.description}
                      </p>
                      {details.guidance && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400/90 pt-1">
                          🛡️ {details.guidance}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Principles Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Why Decisionly is Different
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              AI should inform your judgment—not replace it, manipulate it, or fabricate certainty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-slate-200 dark:border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Transparent Math Engine
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Scoring is never hallucinated by an LLM. We use deterministic Multi-Attribute Utility Theory (MAUT) with normalized weights and explicit missing-value handling.
              </p>
            </Card>

            <Card className="p-6 border-slate-200 dark:border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Explicit Context Consent
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                You maintain a private Personal Space of goals and constraints. For each decision, you inspect and explicitly approve which items may be processed.
              </p>
            </Card>

            <Card className="p-6 border-slate-200 dark:border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                What-If Scenario Sandbox
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Test how sensitive your choices are to changing priorities or cost factors. See instant recalculations without affecting your saved baseline.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#090d16] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-brand-600" />
            <span className="font-bold text-slate-900 dark:text-white">Decisionly</span>
            <span>— Your Life. Your Context. Your Decisions.</span>
          </div>
          <div>
            Built with privacy, deterministic transparency, and Groq Decision Intelligence.
          </div>
        </div>
      </footer>
    </div>
  );
};
