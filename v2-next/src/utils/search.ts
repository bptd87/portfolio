// Fuzzy search utilities with relevance scoring

export interface SearchMatch {
  score: number;
  matchedFields: string[];
  highlightedTitle?: string;
  highlightedDescription?: string;
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching and typo tolerance
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Check if query fuzzy matches text
 * Returns true if distance is within tolerance
 */
function fuzzyMatch(
  query: string,
  text: string,
  tolerance: number = 1,
): boolean {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  // Exact match
  if (textLower.includes(queryLower)) return true;

  // Check each word in text
  const words = textLower.split(/\s+/);
  for (const word of words) {
    if (word.length >= query.length - tolerance) {
      const distance = levenshteinDistance(queryLower, word);
      if (distance <= tolerance) return true;
    }
  }

  return false;
}

/**
 * Calculate relevance score for a search result
 * Higher score = more relevant
 */
export function calculateRelevance(
  query: string,
  title: string,
  description: string,
  keywords?: string,
  altText?: string,
): SearchMatch {
  const queryLower = query.toLowerCase();
  let score = 0;
  const matchedFields: string[] = [];

  // Title matches (highest weight)
  if (title.toLowerCase().includes(queryLower)) {
    score += 100;
    matchedFields.push("title");
  } else if (fuzzyMatch(query, title, 1)) {
    score += 50;
    matchedFields.push("title");
  }

  // Keywords matches (High priority - tags)
  if (keywords && keywords.toLowerCase().includes(queryLower)) {
    score += 80;
    matchedFields.push("keywords");
  } else if (keywords && fuzzyMatch(query, keywords, 1)) {
    score += 40;
    matchedFields.push("keywords");
  }

  // Description matches
  if (description.toLowerCase().includes(queryLower)) {
    score += 30;
    matchedFields.push("description");
  } else if (fuzzyMatch(query, description, 1)) {
    score += 15;
    matchedFields.push("description");
  }

  // Alt text matches (for images)
  if (altText && altText.toLowerCase().includes(queryLower)) {
    score += 25;
    matchedFields.push("altText");
  } else if (altText && fuzzyMatch(query, altText, 1)) {
    score += 12;
    matchedFields.push("altText");
  }

  // Boost for exact word matches
  const queryWords = queryLower.split(/\s+/);
  const allText = `${title} ${description} ${keywords || ""} ${altText || ""}`
    .toLowerCase();
  queryWords.forEach((word) => {
    if (allText.split(/\s+/).includes(word)) {
      score += 5;
    }
  });

  return { score, matchedFields };
}

/**
 * Highlight matched terms in text
 */
export function highlightMatches(text: string, query: string): string {
  if (!query.trim()) return text;

  const queryLower = query.toLowerCase();
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );

  return text.replace(
    regex,
    '<mark class="bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded">$1</mark>',
  );
}
