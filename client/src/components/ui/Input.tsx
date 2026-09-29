import React from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            'w-full rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 outline-none',
            'bg-slate-50 border border-slate-300/80 text-slate-900 placeholder:text-slate-400',
            'focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
            'dark:bg-[#090d16] dark:border-white/10 dark:text-slate-100 dark:placeholder:text-slate-500',
            'dark:focus:bg-[#0f172a] dark:focus:border-brand-500 dark:focus:ring-brand-500/30',
            error && 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {!error && helperText && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, rows = 3, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          className={clsx(
            'w-full rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 outline-none resize-y',
            'bg-slate-50 border border-slate-300/80 text-slate-900 placeholder:text-slate-400',
            'focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
            'dark:bg-[#090d16] dark:border-white/10 dark:text-slate-100 dark:placeholder:text-slate-500',
            'dark:focus:bg-[#0f172a] dark:focus:border-brand-500 dark:focus:ring-brand-500/30',
            error && 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {!error && helperText && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
