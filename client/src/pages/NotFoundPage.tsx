import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button.js';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400">
        <Compass className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">404 — Page Not Found</h1>
        <p className="text-xs text-slate-500 max-w-sm">
          The decision path you're looking for doesn't exist or may have been moved.
        </p>
      </div>
      <Link to="/app">
        <Button variant="primary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};
