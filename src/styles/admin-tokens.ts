/**
 * Admin Design Token System
 * 
 * Centralized design tokens for admin panel components.
 * Theme: Premium Neutral (Zinc/Slate/White)
 * 
 * Usage:
 * import { AdminTokens } from '../styles/admin-tokens';
 * <div className={AdminTokens.card.base}>
 */

export const AdminTokens = {
  // Background colors
  bg: {
    primary: 'bg-black',    
    secondary: 'bg-[#18181b]',  // zinc-900
    tertiary: 'bg-[#27272a]',   // zinc-800
    hover: 'hover:bg-[#27272a] transition-colors duration-200',
    accent: 'bg-white text-black', 
    accentHover: 'hover:bg-[#e4e4e7]', // zinc-200
    disabled: 'bg-[#18181b]/50',
  },

  // Border colors
  border: {
    primary: 'border-[#3f3f46]', // zinc-700
    secondary: 'border-[#52525b]', // zinc-600
    accent: 'border-white/20',
    accentHover: 'hover:border-white/40',
    light: 'border-white/20', 
    disabled: 'border-[#27272a]', // zinc-800
    focus: 'focus:border-white',
  },

  // Text colors
  text: {
    primary: 'text-[#f4f4f5]', // zinc-100
    secondary: 'text-[#a1a1aa]', // zinc-400
    tertiary: 'text-[#71717a]', // zinc-500
    accent: 'text-white', 
    inverse: 'text-black', 
    accentHover: 'hover:text-white',
    disabled: 'text-[#52525b]', // zinc-600
    success: 'text-emerald-400',
    error: 'text-red-400',
    warning: 'text-amber-400',
  },

  // Border radius (standardized)
  radius: {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
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
    base: 'bg-zinc-900 border border-zinc-800 rounded-xl p-6 transition-all',
    hover: 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-6 transition-all',
    accent: 'bg-zinc-900 border border-white/20 rounded-xl p-6 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]',
  },

  button: {
    primary: 'px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors font-medium text-sm tracking-wide',
    secondary: 'px-4 py-2 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors text-sm',
    danger: 'px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors text-sm',
    disabled: 'px-4 py-2 bg-zinc-900 text-zinc-600 border border-zinc-800 rounded-lg cursor-not-allowed text-sm',
  },

  input: {
    base: 'w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20 transition-all',
    error: 'w-full px-4 py-2.5 bg-zinc-950 border border-red-900/50 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-all',
  },

  badge: {
    primary: 'px-2.5 py-0.5 bg-white/10 border border-white/10 rounded-full text-white text-xs font-medium',
    secondary: 'px-2.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-400 text-xs font-medium',
    success: 'px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-medium',
    error: 'px-2.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs font-medium',
    warning: 'px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-medium',
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
    success: 'flex items-center gap-2 text-emerald-400',
    error: 'flex items-center gap-2 text-red-400',
    warning: 'flex items-center gap-2 text-amber-400',
    info: 'flex items-center gap-2 text-zinc-400',
  },
};

/**
 * Helper function to build class strings with tokens
 * Usage: buildClass(AdminTokens.card.base, AdminTokens.border.primary)
 */
export function buildAdminClass(...tokens: string[]): string {
  return tokens.filter(Boolean).join(' ');
}
