import React from 'react';
import { Calendar, Clock, Archive, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { PersonalContextEntry } from '@shared/types/index.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';

interface ContextCardProps {
  entry: PersonalContextEntry;
  onEdit: (entry: PersonalContextEntry) => void;
  onArchive: (entry: PersonalContextEntry) => void;
  onDelete: (entry: PersonalContextEntry) => void;
}

export const ContextCard: React.FC<ContextCardProps> = ({
  entry,
  onEdit,
  onArchive,
  onDelete,
}) => {
  const isArchived = Boolean(entry.archived_at);
  const isTemporary = entry.duration_type === 'temporary';
  const isReviewDue = entry.review_at ? new Date(entry.review_at) <= new Date() : false;

  const typeLabels: Record<string, string> = {
    profile: 'Profile',
    goal: 'Goal',
    circumstance: 'Circumstance',
    preference: 'Preference',
    constraint: 'Constraint',
    responsibility: 'Responsibility',
    note: 'Note',
  };

  return (
    <Card className="p-5 flex flex-col justify-between hover:border-brand-500/30 transition-all group">
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="sm">
              {typeLabels[entry.entry_type] || entry.entry_type}
            </Badge>
            {isTemporary && (
              <Badge variant="warning" size="sm">
                <Clock className="w-3 h-3" /> Temporary
              </Badge>
            )}
            {isArchived && (
              <Badge variant="slate" size="sm">
                <Archive className="w-3 h-3" /> Archived
              </Badge>
            )}
          </div>

          {/* Review Due Indicator */}
          {isReviewDue && !isArchived && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
              <AlertCircle className="w-3 h-3" /> Review Due
            </span>
          )}
        </div>

        {/* Title and Content */}
        <div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
            {entry.title}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-3 leading-relaxed">
            {entry.content}
          </p>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3 text-[11px]">
          {entry.review_at && (
            <span className="flex items-center gap-1" title="Scheduled Review Date">
              <Calendar className="w-3 h-3 text-slate-400" />
              {new Date(entry.review_at).toLocaleDateString()}
            </span>
          )}
          <span>Updated {new Date(entry.updated_at).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(entry)}
            title="Edit"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onArchive(entry)}
            title={isArchived ? 'Restore' : 'Archive'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Archive className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(entry)}
            title="Delete"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
};
