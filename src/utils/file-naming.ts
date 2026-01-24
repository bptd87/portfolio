/**
 * Sanitizes a filename for SEO-friendly storage URLs.
 * 
 * Converts: "My Project Image (Final).jpg"
 * To: "my-project-image-final-1234567890.jpg"
 * 
 * @param originalName The original filename from the File object
 * @returns A sanitized, unique filename suitable for URLs
 */
export function sanitizeFileName(originalName: string): string {
  // 1. Separate extension
  const parts = originalName.split('.');
  const ext = parts.pop()?.toLowerCase() || '';
  const name = parts.join('.');

  // 2. Slugify the name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, '');   // Remove leading/trailing hyphens

  // 3. Append timestamp for uniqueness
  const timestamp = Date.now().toString();

  // 4. Return formatted name
  // Truncate slug to prevent overly long filenames (max 100 chars for slug part)
  const truncatedSlug = slug.substring(0, 100);
  
  return `${truncatedSlug || 'image'}-${timestamp}.${ext}`;
}
