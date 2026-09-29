import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.js';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ showLabel = false, className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
        theme === 'dark'
          ? 'bg-slate-800/80 border-white/10 text-amber-300 hover:bg-slate-700 hover:text-amber-200 shadow-sm'
          : 'bg-white border-slate-300 text-brand-600 hover:bg-slate-50 hover:text-brand-700 shadow-sm'
      } ${className}`}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="text-xs text-slate-700 dark:text-slate-200 capitalize">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};
