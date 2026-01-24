export interface VaultItem {
  id: string;
  title: string;
  category: 'Venue File' | 'Prop Library' | 'Architectural Element' | 'Set Piece' | 'Furniture' | 'Scenic Element';
  description: string;
  dropboxLink: string;
  fileSize?: string;
  lastUpdated: string;
  tags: string[];
  thumbnail?: string;
}

export const vaultItems: VaultItem[] = [
  {
    id: 'stephens-warehouse',
    title: 'Stephens College — Warehouse Theatre',
    category: 'Venue File',
    description: 'Complete venue file with seating, lighting positions, and architectural details.',
    dropboxLink: 'https://www.dropbox.com/placeholder',
    fileSize: '24.5 MB',
    lastUpdated: '2024-03-15',
    tags: ['theatre', 'venue', 'black box', 'flexible seating'],
    thumbnail: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
  },
  {
    id: 'stephens-makclanburg',
    title: 'Stephens College — Makclanburg Playhouse',
    category: 'Venue File',
    description: 'Proscenium theatre with detailed rigging, fly system, and stage machinery.',
    dropboxLink: 'https://www.dropbox.com/placeholder',
    fileSize: '31.2 MB',
    lastUpdated: '2024-02-28',
    tags: ['theatre', 'venue', 'proscenium', 'fly system'],
    thumbnail: 'https://images.unsplash.com/photo-1503095396549-807759245b35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
  },
  {
    id: 'mizzou-rhynsburger',
    title: 'University of Missouri — Rhynsburger Theatre',
    category: 'Venue File',
    description: 'Thrust configuration with detailed architectural measurements and sightlines.',
    dropboxLink: 'https://www.dropbox.com/placeholder',
    fileSize: '28.7 MB',
    lastUpdated: '2024-01-20',
    tags: ['theatre', 'venue', 'thrust', 'university'],
    thumbnail: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
  }
];

export const vaultCategories = [
  'All',
  'Venue File',
  'Prop Library',
  'Architectural Element',
  'Set Piece',
  'Furniture',
  'Scenic Element'
] as const;

export function getVaultItemsByCategory(category: string): VaultItem[] {
  if (category === 'All') return vaultItems;
  return vaultItems.filter(item => item.category === category);
}

export function searchVaultItems(query: string): VaultItem[] {
  const searchLower = query.toLowerCase();
  return vaultItems.filter(item => 
    item.title.toLowerCase().includes(searchLower) ||
    item.description.toLowerCase().includes(searchLower) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchLower))
  );
}
