import React from 'react';
import { Plus } from 'lucide-react';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  onCreate?: () => void;
  createLabel?: string;
}

export function AdminPageHeader({ 
  title, 
  description, 
  actions, 
  onCreate, 
  createLabel = 'New' 
}: AdminPageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">{title}</h2>
          {description && (
            <p className="text-sm text-zinc-400">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {actions}
          {onCreate && (
            <button
              onClick={onCreate}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              {createLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

