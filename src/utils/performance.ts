/**
 * Optimizes Supabase image URLs with width and quality parameters
 * @param url - Original image URL
 * @param width - Target width in pixels
 * @param quality - Quality (1-100), default 85
 * @returns Optimized URL with query parameters
 */
import { buildOptimizedImageUrl } from "./image";

export function optimizeImageUrl(
    url: string | undefined,
    width?: number,
    quality: number = 85,
): string {
    if (!url) return "";

    const optimized = buildOptimizedImageUrl(url, { width, quality });
    return optimized || url;
}

/**
 * Debounce function to limit how often a function can be called
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
