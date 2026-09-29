import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.js';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ showLabel = false, className = '' }) => {
  const { theme, setTheme } = useTheme();

  if (showLabel) {
    return (
      <div className={`inline-flex items-center p-1 rounded-xl bg-stone-200/80 dark:bg-stone-800/80 border border-stone-300/60 dark:border-white/10 text-xs font-medium ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
            theme === 'light'
              ? 'bg-white text-stone-900 shadow-sm font-semibold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
            theme === 'dark'
              ? 'bg-[#152226] text-white shadow-sm font-semibold border border-white/10'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-stone-300" />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center p-1 rounded-xl bg-stone-200/80 dark:bg-stone-800/80 border border-stone-300/60 dark:border-white/10 ${className}`}>
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-lg transition-all ${
          theme === 'light'
            ? 'bg-white text-amber-600 shadow-sm'
            : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
        }`}
        title="Light Mode"
      >
        <Sun className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-lg transition-all ${
          theme === 'dark'
            ? 'bg-[#152226] text-amber-400 shadow-sm'
            : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
        }`}
        title="Dark Mode"
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
