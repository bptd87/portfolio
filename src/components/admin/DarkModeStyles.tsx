/**
 * Dark Mode Style Constants for Admin Panel
 * Uses AdminTokens for consistent theming
 * @deprecated Prefer using AdminTokens directly from '../styles/admin-tokens'
 */

import { AdminTokens } from '../../styles/admin-tokens';

// Form input base classes (dark mode) - uses AdminTokens
export const inputClasses = AdminTokens.input.base;

// Textarea classes - uses AdminTokens input styling
export const textareaClasses = `${AdminTokens.input.base} resize-none`;

// Select dropdown classes - uses AdminTokens input styling
export const selectClasses = AdminTokens.input.base;

// Label classes - uses AdminTokens text styling
export const labelClasses = `block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`;

// Form container classes - uses AdminTokens card styling
export const formContainerClasses = `${AdminTokens.card.base} backdrop-blur`;

// Card/List item classes - uses AdminTokens
export const listItemClasses = `flex items-center justify-between p-4 ${AdminTokens.border.primary} border ${AdminTokens.border.accentHover} transition-colors ${AdminTokens.radius.md} ${AdminTokens.bg.secondary}/30`;

// Badge classes - uses AdminTokens badge styling
export const badgeClasses = AdminTokens.badge.primary;

// Section separator - uses AdminTokens border
export const sectionDividerClasses = `border-t ${AdminTokens.border.disabled} pt-6 mt-6`;

// Stats card - uses AdminTokens card styling
export const statsCardClasses = `bg-gradient-to-br ${AdminTokens.bg.secondary} ${AdminTokens.bg.tertiary} ${AdminTokens.border.primary} border p-6 ${AdminTokens.radius.lg}`;

// Empty state - uses AdminTokens text styling
export const emptyStateClasses = `text-center py-12 ${AdminTokens.text.tertiary}`;

// Checkbox wrapper - uses AdminTokens
export const checkboxLabelClasses = `flex items-center gap-2 cursor-pointer ${AdminTokens.text.secondary}`;

// Grid layouts
export const grid2Cols = AdminTokens.gridCols[2];
export const grid3Cols = AdminTokens.gridCols[3];

// Reusable dark mode input component
export function DarkInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`${AdminTokens.input.base} ${props.className || ''}`}
    />
  );
}

// Reusable dark mode textarea component
export function DarkTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${AdminTokens.input.base} resize-none ${props.className || ''}`}
    />
  );
}

// Reusable dark mode select component
export function DarkSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${AdminTokens.input.base} ${props.className || ''}`}
    />
  );
}

// Reusable dark mode label component
export function DarkLabel({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label {...props} className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2 ${props.className || ''}`}>
      {children}
    </label>
  );
}
