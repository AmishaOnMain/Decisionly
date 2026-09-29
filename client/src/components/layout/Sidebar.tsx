import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Plus,
  BookOpen,
  User,
  Settings,
  LogOut,
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
    { label: 'Overview', path: '/app', icon: Home, end: true },
    { label: 'New decision', path: '/app/decisions/new', icon: Plus, isPlus: true },
    { label: 'History', path: '/app/history', icon: BookOpen },
    { label: 'Personal space', path: '/app/personal-space', icon: User },
  ];

  return (
    <aside className="w-60 h-screen flex flex-col justify-between p-4 bg-[#10191C] text-stone-300 border-r border-white/5 transition-colors select-none">
      <div className="space-y-6">
        {/* Brand */}
        <div
          onClick={() => navigate('/app')}
          className="flex items-center gap-2.5 px-2 py-2 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-stone-900 font-bold text-sm shadow-sm group-hover:bg-amber-400 transition-colors">
            D
          </div>
          <span className="font-semibold text-base tracking-tight text-white">
            Decisionly
          </span>
        </div>

        {/* Section Header */}
        <div className="px-2">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-stone-400/80">
            YOUR WORKSPACE
          </p>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onItemClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#18262A] text-amber-400 font-semibold border border-amber-500/20 shadow-sm'
                      : 'text-stone-400 hover:text-stone-100 hover:bg-[#152125]'
                  }`
                }
              >
                {item.isPlus ? (
                  <span className="text-base leading-none font-bold text-amber-500/90 w-4 text-center">
                    +
                  </span>
                ) : (
                  <Icon className="w-4 h-4 opacity-80" />
                )}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom controls */}
      <div className="space-y-3 pt-4 border-t border-white/5">
        <NavLink
          to="/app/settings"
          onClick={onItemClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              isActive
                ? 'bg-[#18262A] text-amber-400'
                : 'text-stone-400 hover:text-stone-100 hover:bg-[#152125]'
            }`
          }
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </NavLink>

        <div className="flex items-center justify-between px-2 pt-1">
          <ThemeToggle />
          <button
            onClick={() => signOut()}
            title="Sign Out"
            className="p-1.5 text-stone-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
