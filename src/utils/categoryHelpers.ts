export interface Category {
  id: string;
  name: string;
  slug?: string;
  color?: string;
  type?: string;
}

// Helper to find category color from categories list
export function findCategoryColor(categoryName: string, categories: Category[]): string | undefined {
  if (!categoryName) return undefined;

  const normalizedName = categoryName.toLowerCase().trim();

  // 0. Manual Overrides (per user request & typos) - Run these BEFORE checking DB categories
  if (normalizedName.includes('musical') || normalizedName.includes('theate') || normalizedName.includes('opera')) return '#ef4444'; // Force Red for Musical Theatre & Opera
  if (normalizedName.includes('urinetown')) return '#22C55E'; // Force Green for Urinetown explicitly
  if (normalizedName.includes('scenic')) return '#3B82F6'; // Default Scenic to Blue if DB fails

  // If no manual override, require categories to be present
  if (!categories || !categories.length) return undefined;

  // 1. Exact match
  let match = categories.find(c => c.name?.toLowerCase().trim() === normalizedName);
  if (match?.color) return match.color;

  // 2. Starts with match (e.g., "Design Philosophy" matches "Design Philosophy & Scenic Insights")
  match = categories.find(c => c.name && normalizedName.startsWith(c.name.toLowerCase().trim()));
  if (match?.color) return match.color;

  // 3. First word match (Robust fallback for "Scenic Design" vs "Scenic Design Process")
  const firstWord = normalizedName.split(' ')[0];
  if (firstWord && firstWord.length > 3) {
      match = categories.find(c => c.name?.toLowerCase().startsWith(firstWord));
      if (match?.color) return match.color;
  }
  match = categories.find(c => c.name && normalizedName.includes(c.name.toLowerCase().trim()));
  if (match?.color) return match.color;

  // 4. Reverse contains (category name contains our search term)
  match = categories.find(c => c.name && c.name.toLowerCase().trim().includes(normalizedName));
  if (match?.color) return match.color;

  return undefined;
}
