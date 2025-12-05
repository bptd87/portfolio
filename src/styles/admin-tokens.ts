/**
 * Admin Design Token System
 * 
 * Centralized design tokens for admin panel components.
 * Ensures consistency, easier theming, and supports light/dark mode.
 * 
 * Usage:
 * import { AdminTokens } from '../styles/admin-tokens';
 * <div className={AdminTokens.card.base}>
 */

export const AdminTokens = {
  // Background colors
  bg: {
    primary: 'bg-gray-950 dark:bg-gray-950',    // Main admin background
    secondary: 'bg-gray-900 dark:bg-gray-900',  // Card/panel background
    tertiary: 'bg-gray-800 dark:bg-gray-800',   // Hover states
    hover: 'hover:bg-gray-800 dark:hover:bg-gray-800',
    accent: 'bg-blue-500/10 dark:bg-blue-500/10',
    accentHover: 'hover:bg-blue-500/20 dark:hover:bg-blue-500/20',
    disabled: 'bg-gray-900/30 dark:bg-gray-900/30',
  },

  // Border colors
  border: {
    primary: 'border-gray-700 dark:border-gray-700',
    secondary: 'border-gray-600 dark:border-gray-600',
    accent: 'border-blue-500/30 dark:border-blue-500/30',
    accentHover: 'hover:border-blue-500/50 dark:hover:border-blue-500/50',
    light: 'border-white/10 dark:border-white/10',
    disabled: 'border-gray-800 dark:border-gray-800',
  },

  // Text colors
  text: {
    primary: 'text-white dark:text-white',
    secondary: 'text-gray-400 dark:text-gray-400',
    tertiary: 'text-gray-600 dark:text-gray-600',
    accent: 'text-blue-400 dark:text-blue-400',
    accentHover: 'hover:text-blue-300 dark:hover:text-blue-300',
    disabled: 'text-gray-600 dark:text-gray-600',
    success: 'text-green-400 dark:text-green-400',
    error: 'text-red-400 dark:text-red-400',
    warning: 'text-yellow-400 dark:text-yellow-400',
  },

  // Border radius (standardized)
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
  },

  // Spacing
  spacing: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  },

  // Reusable component classes
  card: {
    base: 'bg-gray-900 dark:bg-gray-900 border border-gray-700 dark:border-gray-700 rounded-2xl p-6 transition-all',
    hover: 'bg-gray-900 dark:bg-gray-900 border border-gray-700 dark:border-gray-700 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:bg-gray-800 dark:hover:bg-gray-800 rounded-2xl p-6 transition-all',
    accent: 'bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/30 dark:border-blue-500/30 rounded-2xl p-6 transition-all',
  },

  button: {
    primary: 'px-4 py-2 bg-blue-600 dark:bg-blue-600 text-white dark:text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors font-medium',
    secondary: 'px-4 py-2 bg-gray-800 dark:bg-gray-800 text-white dark:text-white border border-gray-700 dark:border-gray-700 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors',
    danger: 'px-4 py-2 bg-red-600 dark:bg-red-600 text-white dark:text-white rounded-xl hover:bg-red-700 dark:hover:bg-red-700 transition-colors font-medium',
    disabled: 'px-4 py-2 bg-gray-900/30 dark:bg-gray-900/30 text-gray-600 dark:text-gray-600 rounded-xl cursor-not-allowed opacity-50',
  },

  input: {
    base: 'w-full px-4 py-2 bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-xl text-white dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors',
    error: 'w-full px-4 py-2 bg-gray-800 dark:bg-gray-800 border border-red-500/50 dark:border-red-500/50 rounded-xl text-white dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-red-500 dark:focus:border-red-500 transition-colors',
  },

  badge: {
    primary: 'px-3 py-1 bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/30 dark:border-blue-500/30 rounded-full text-blue-400 dark:text-blue-400 text-xs font-medium',
    secondary: 'px-3 py-1 bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-full text-gray-400 dark:text-gray-400 text-xs font-medium',
    success: 'px-3 py-1 bg-green-500/10 dark:bg-green-500/10 border border-green-500/30 dark:border-green-500/30 rounded-full text-green-400 dark:text-green-400 text-xs font-medium',
    error: 'px-3 py-1 bg-red-500/10 dark:bg-red-500/10 border border-red-500/30 dark:border-red-500/30 rounded-full text-red-400 dark:text-red-400 text-xs font-medium',
  },

  // Layout utilities
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  gridCols: {
    1: 'grid grid-cols-1',
    2: 'grid grid-cols-1 md:grid-cols-2',
    3: 'grid grid-cols-1 md:grid-cols-3',
  },

  // Transitions
  transition: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-300',
    slow: 'transition-all duration-500',
  },

  // Status indicators
  status: {
    success: 'flex items-center gap-2 text-green-400 dark:text-green-400',
    error: 'flex items-center gap-2 text-red-400 dark:text-red-400',
    warning: 'flex items-center gap-2 text-yellow-400 dark:text-yellow-400',
    info: 'flex items-center gap-2 text-blue-400 dark:text-blue-400',
  },
};

/**
 * Helper function to build class strings with tokens
 * Usage: buildClass(AdminTokens.card.base, AdminTokens.border.primary)
 */
export function buildAdminClass(...tokens: string[]): string {
  return tokens.filter(Boolean).join(' ');
}
