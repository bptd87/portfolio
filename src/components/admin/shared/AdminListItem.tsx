import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface AdminListItemProps {
  title: string;
  subtitle?: string;
  metadata?: Array<{ label: string; value: string | React.ReactNode }>;
  thumbnail?: string;
  thumbnailFallback?: React.ReactNode;
  status?: { label: string; variant: 'published' | 'draft' | 'archived' | 'custom'; color?: string };
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  actions?: React.ReactNode;
}

export function AdminListItem({
  title,
  subtitle,
  metadata = [],
  thumbnail,
  thumbnailFallback,
  status,
  onEdit,
  onDelete,
  onClick,
  actions
}: AdminListItemProps) {
  const statusColors = {
    published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    draft: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    archived: 'bg-zinc-800/50 text-zinc-500 border-zinc-800',
    custom: ''
  };

  return (
    <div 
      className="group flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all rounded-lg cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Thumbnail */}
        {thumbnail || thumbnailFallback ? (
          <div className="w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 group-hover:border-zinc-600 transition-colors flex-shrink-0">
            {thumbnail ? (
              <img src={thumbnail} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                {thumbnailFallback}
              </div>
            )}
          </div>
        ) : null}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-base text-zinc-100 group-hover:text-white transition-colors mb-1 truncate">
            {title}
          </h4>
          {subtitle && (
            <p className="text-sm text-zinc-400 mb-2 line-clamp-1">{subtitle}</p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            {status && (
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium border ${
                status.variant === 'custom' 
                  ? `bg-[${status.color || '#3f3f46'}]/10 text-[${status.color || '#a1a1aa'}] border-[${status.color || '#3f3f46'}]/20`
                  : statusColors[status.variant]
              }`}>
                {status.label}
              </span>
            )}
            {metadata.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-xs text-zinc-600">•</span>}
                <span className="text-xs text-zinc-500">{item.label ? `${item.label}: ` : ''}{item.value}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {actions}
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

