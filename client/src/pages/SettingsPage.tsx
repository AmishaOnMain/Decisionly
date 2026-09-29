import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Download,
  Trash2,
  ShieldCheck,
  Moon,
  Sun,
  User,
  Sparkles,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { api } from '../lib/api.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Modal } from '../components/ui/Modal.js';

export const SettingsPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [isExporting, setIsExporting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await api.get<any>('/api/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `decisionly_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err?.message || 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.delete('/api/account');
      await signOut();
      navigate('/');
    } catch (err: any) {
      alert(err?.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Settings & Privacy Controls
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your account profile, visual appearance, data exports, and AI disclosures.
        </p>
      </div>

      {/* 1. Account Profile */}
      <Card className="p-6 border-slate-200 dark:border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-brand-500" /> User Profile
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400">Display Name</span>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">
              {user?.display_name || 'Not set'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400">Email Address</span>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">
              {user?.email}
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Visual Theme Switcher */}
      <Card className="p-6 border-slate-200 dark:border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-500" /> Appearance & Theme
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Choose between Dark Mode for deep contrast or clean Light Mode.
        </p>

        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-semibold transition-all ${
              theme === 'dark'
                ? 'bg-slate-900 text-white border-brand-500 shadow-md shadow-brand-500/20'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-500'
            }`}
          >
            <Moon className="w-4 h-4 text-amber-300" />
            <span>Dark Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-semibold transition-all ${
              theme === 'light'
                ? 'bg-white text-slate-900 border-brand-500 shadow-md'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-500'
            }`}
          >
            <Sun className="w-4 h-4 text-brand-600" />
            <span>Light Mode</span>
          </button>
        </div>
      </Card>

      {/* 3. AI Processing & Privacy Disclosures */}
      <Card className="p-6 border-slate-200 dark:border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-500" /> AI Processing Disclosures & Ethics
        </h3>

        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white">Deterministic Scoring Independence</h4>
            <p>
              Alternative rankings and mathematical scores are strictly calculated via deterministic Multi-Attribute Utility Theory (MAUT) on your server/client runtime. Scores are never hallucinated or randomly assigned by an AI provider.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white">Minimum Approved Context Policy</h4>
            <p>
              When you trigger an AI analysis, Decisionly transmits ONLY the context entries you explicitly approved for that specific run, alongside your alternatives and criteria. Your remaining Personal Space notes are never accessed or transmitted.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white">Groq API Execution</h4>
            <p>
              AI language synthesis is executed backend-to-backend via the official Groq SDK with server-side API keys. Zero user tokens or personal data are exposed to client-side scripts.
            </p>
          </div>
        </div>
      </Card>

      {/* 4. Data Portability (Export JSON) */}
      <Card className="p-6 border-slate-200 dark:border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-brand-500" /> Export Your Personal Data
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg">
              Download a complete JSON export of your profile, Personal Space memories, decisions, evaluation criteria, and analysis history.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleExportData}
            isLoading={isExporting}
            icon={<Download className="w-4 h-4" />}
          >
            Export All Data (JSON)
          </Button>
        </div>
      </Card>

      {/* 5. Account Deletion (Danger Zone) */}
      <Card className="p-6 border-red-500/20 bg-red-500/5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete Account & Wipe Data
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg">
              Permanently delete your user profile, all Personal Space entries, decisions, snapshots, and AI analyses. This action cannot be undone.
            </p>
          </div>
          <Button
            variant="danger"
            onClick={() => setIsDeleteDialogOpen(true)}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Account Deletion Confirmation Modal */}
      <Modal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Confirm Permanent Account Deletion"
        description="Are you absolutely sure? All your private decision history and Personal Space entries will be irreversibly erased."
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              This cascades through all database records associated with your user ID and destroys active sessions immediately.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              type="button"
              onClick={handleDeleteAccount}
              isLoading={isDeleting}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Yes, Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
