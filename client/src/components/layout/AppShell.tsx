import React, { useState } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { Sidebar } from './Sidebar.js';
import { ThemeToggle } from './ThemeToggle.js';

export const AppShell: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5EF] dark:bg-[#0F171A]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-900 font-bold flex items-center justify-center shadow-sm animate-pulse text-sm">
            D
          </div>
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
            Decisionly...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  const displayName = user.display_name?.split(' ')[0] || user.email?.split('@')[0] || 'Amisha';

  return (
    <div className="min-h-screen flex bg-[#F8F5EF] dark:bg-[#0F171A] text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#10191C] z-10 shadow-2xl">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar onItemClick={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:pl-60 flex flex-col min-w-0">
        {/* Top Header Bar (matches Picture 2 & 3) */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 sm:px-10 py-3.5 bg-[#F8F5EF]/90 dark:bg-[#0F171A]/90 backdrop-blur-md border-b border-stone-200/60 dark:border-white/5 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#265347] dark:text-[#5EAD9C]">
                PRIVATE WORKSPACE
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block">
                A little more clarity, one question at a time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300">
              {displayName}
            </span>
            <button
              onClick={() => signOut()}
              className="text-xs sm:text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              Sign out
            </button>
            <ThemeToggle showLabel />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-10 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
