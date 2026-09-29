import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FolderLock,
  History,
  Settings,
  LogOut,
  Compass,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { ThemeToggle } from './ThemeToggle.js';

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/app', icon: LayoutDashboard, end: true },
    { label: 'Decision History', path: '/app/history', icon: History },
    { label: 'Personal Space', path: '/app/personal-space', icon: FolderLock },
    { label: 'Settings & Privacy', path: '/app/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-full flex flex-col justify-between p-4 bg-white dark:bg-[#090d16] border-r border-slate-200/80 dark:border-white/10 transition-colors duration-200">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-brand-500/20">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 to-brand-600 dark:from-white dark:to-cyan-400 bg-clip-text text-transparent">
              Decisionly
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5">
              Decision Intelligence
            </p>
          </div>
        </div>

        {/* Action: New Decision */}
        <button
          onClick={() => {
            navigate('/app/decisions/new');
            if (onItemClick) onItemClick();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md shadow-brand-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Decision</span>
        </button>

        {/* Navigation list */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onItemClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer controls: theme and account */}
      <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-white/10">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Appearance</span>
          <ThemeToggle />
        </div>

        {/* User Card */}
        {user && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
            <div className="truncate mr-2">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {user.display_name || 'My Account'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
