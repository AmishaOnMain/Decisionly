import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, glow = false, ...props }) => {
  return (
    <div
      className={clsx(
        'rounded-2xl transition-all duration-200 border',
        'bg-white border-slate-200/80 shadow-sm shadow-slate-200/50',
        'dark:bg-[#111827]/80 dark:border-white/[0.08] dark:shadow-none dark:backdrop-blur-md',
        glow && 'glow-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
