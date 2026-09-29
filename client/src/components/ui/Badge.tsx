import React from 'react';
import { clsx } from 'clsx';
import { TargetCategory } from '@shared/constants/categories.js';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'slate' | 'info';
  category?: TargetCategory;
  size?: 'sm' | 'md';
  className?: string;
}

const CATEGORY_COLORS: Record<TargetCategory, string> = {
  Career: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  Finance: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  'Health and Fitness': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  Travel: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  'Personal Development': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  Lifestyle: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  Relationships: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
  Education: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  Custom: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  category,
  size = 'md',
  className,
}) => {
  const variantStyles = {
    brand: 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    slate: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-medium px-2.5 py-1',
  };

  const styleClass = category ? CATEGORY_COLORS[category] : variantStyles[variant];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border',
        sizeStyles[size],
        styleClass,
        className
      )}
    >
      {children}
    </span>
  );
};
