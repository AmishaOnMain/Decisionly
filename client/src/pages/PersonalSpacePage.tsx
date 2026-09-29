import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderLock,
  Plus,
  Search,
  Filter,
  AlertCircle,
  Archive,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { PersonalContextEntry, EntryType } from '@shared/types/index.js';
import { api } from '../lib/api.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { ContextCard } from '../components/personal-space/ContextCard.js';
import { Modal } from '../components/ui/Modal.js';
import { ContextForm } from '../components/personal-space/ContextForm.js';

export const PersonalSpacePage: React.FC = () => {
  const navigate = useNavigate();

  const [entries, setEntries] = useState<PersonalContextEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);

  // Modal for creating/editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PersonalContextEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ items: PersonalContextEntry[] }>(
        `/api/personal-context?includeArchived=${showArchived}`
      );
      setEntries(res.items || []);
    } catch (err) {
      console.error('Failed to load personal context:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [showArchived]);

  const handleCreateOrUpdate = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingEntry) {
        await api.patch(`/api/personal-context/${editingEntry.id}`, data);
      } else {
        await api.post('/api/personal-context', data);
      }
      setIsModalOpen(false);
      setEditingEntry(null);
      await loadEntries();
    } catch (err: any) {
      alert(err?.message || 'Failed to save entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveToggle = async (entry: PersonalContextEntry) => {
    const isArchived = Boolean(entry.archived_at);
    await api.post(`/api/personal-context/${entry.id}/archive`, {
      archive: !isArchived,
    });
    await loadEntries();
  };

  const handleDelete = async (entry: PersonalContextEntry) => {
    if (!confirm(`Are you sure you want to delete "${entry.title}"?`)) return;
    await api.delete(`/api/personal-context/${entry.id}`);
    await loadEntries();
  };

  // Filter items
  const filteredEntries = entries.filter((e) => {
    if (selectedType !== 'all' && e.entry_type !== selectedType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchContent = e.content.toLowerCase().includes(q);
      if (!matchTitle && !matchContent) return false;
    }
    return true;
  });

  const dueForReview = entries.filter(
    (e) => e.review_at && new Date(e.review_at) <= new Date() && !e.archived_at
  );

  const tabs = [
    { id: 'all', label: 'All Entries' },
    { id: 'goal', label: 'Goals' },
    { id: 'constraint', label: 'Constraints' },
    { id: 'preference', label: 'Preferences' },
    { id: 'circumstance', label: 'Circumstances' },
    { id: 'responsibility', label: 'Responsibilities' },
    { id: 'profile', label: 'Profile' },
    { id: 'note', label: 'Notes' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Personal Space
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            A private repository of your standing goals, constraints, preferences, and background. Decisions only use items you explicitly confirm.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setEditingEntry(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Context Entry
        </Button>
      </div>

      {/* Review Due Banner */}
      {dueForReview.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">
              {dueForReview.length} temporary context factor(s) are due for review
            </p>
            <p className="text-[11px] opacity-90">
              Ensure your life circumstances and goals are up to date so your decision models remain grounded.
            </p>
          </div>
        </div>
      )}

      {/* Search & Type Filter Tabs */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search context entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                showArchived
                  ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-white/10 text-slate-500'
              }`}
            >
              {showArchived ? 'Showing Archived' : 'Show Archived'}
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedType === tab.id
                  ? 'bg-brand-600 text-white font-bold shadow-sm'
                  : 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Entries Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">
          Loading your Personal Space...
        </div>
      ) : filteredEntries.length === 0 ? (
        <Card className="p-8 text-center space-y-3 border-dashed">
          <FolderLock className="w-8 h-8 mx-auto text-slate-400" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No context entries found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add goals, constraints, or background details to build your private decision intelligence context.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingEntry(null);
              setIsModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Add First Entry
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntries.map((entry) => (
            <ContextCard
              key={entry.id}
              entry={entry}
              onEdit={(e) => {
                setEditingEntry(e);
                setIsModalOpen(true);
              }}
              onArchive={handleArchiveToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Context Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
        }}
        title={editingEntry ? 'Edit Personal Context' : 'Add to Personal Space'}
        description="Save life parameters that will be available to suggest during future decision comparisons."
        maxWidth="lg"
      >
        <ContextForm
          initialData={editingEntry}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingEntry(null);
          }}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
};
