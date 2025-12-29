import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff, ExternalLink, Building2, Code, Palette, BookOpen, FolderOpen, GripVertical, X } from 'lucide-react';
import { Reorder } from 'motion/react';
import { toast } from 'sonner';
import { createClient } from '../../utils/supabase/client';
import { PrimaryButton, SecondaryButton, SaveButton, CancelButton, IconButton } from './AdminButtons';
import {
  DarkInput,
  DarkTextarea,
  DarkSelect,
  DarkLabel,
  formContainerClasses,
  listItemClasses,
  badgeClasses
} from './DarkModeStyles';

const supabase = createClient();

interface DirectoryLink {
  id: string;
  title: string;
  url: string;
  description: string;
  category_slug: string;
  enabled: boolean;
  display_order: number;
}

interface DirectoryCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  building: Building2,
  code: Code,
  palette: Palette,
  book: BookOpen,
  folder: FolderOpen,
};

// Shared color mapping (matches Directory.tsx)
const ICON_COLORS: Record<string, string> = {
  building: 'text-green-400',
  code: 'text-blue-400',
  palette: 'text-red-400',
  book: 'text-yellow-400',
  folder: 'text-purple-400',
};

const ICON_OPTIONS = [
  { value: 'building', label: 'Building (Green - Organizations)' },
  { value: 'code', label: 'Code (Blue - Software)' },
  { value: 'palette', label: 'Palette (Red - Supplies)' },
  { value: 'book', label: 'Book (Yellow - Research)' },
  { value: 'folder', label: 'Folder (Purple - General)' },
];

const DEFAULT_CATEGORIES: Partial<DirectoryCategory>[] = [
  { name: 'Organizations', slug: 'organizations', description: 'Professional unions, societies, and industry groups', icon: 'building', display_order: 0 },
  { name: 'Software', slug: 'software', description: 'Essential design and drafting tools', icon: 'code', display_order: 1 },
  { name: 'Supplies & Materials', slug: 'supplies', description: 'Paint, fabric, hardware, and scenic materials', icon: 'palette', display_order: 2 },
  { name: 'Research & Inspiration', slug: 'research', description: 'Archives, publications, and design resources', icon: 'book', display_order: 3 },
];

export function DirectoryManager() {
// ... (keep existing state)

// ... (inside render loop)
            {categories.map(category => {
              const IconComponent = CATEGORY_ICONS[category.icon] || FolderOpen;
              const linkCount = links.filter(l => l.category_slug === category.slug).length;
              const iconColor = ICON_COLORS[category.icon] || 'text-purple-400';

              return (
                <div key={category.id} className={listItemClasses}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                      <IconComponent className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <div>
                      <div className="font-medium text-white">{category.name}</div>
                      <div className="text-sm text-gray-500">{category.description}</div>
                      <div className="text-xs text-gray-600">{linkCount} links</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <IconButton
                      onClick={() => startEditCategory(category)}
                      title="Edit"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteCategory(category.id, category.slug)}
                      title="Delete"
                      variant="danger"
                      disabled={linkCount > 0}
                    >
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

