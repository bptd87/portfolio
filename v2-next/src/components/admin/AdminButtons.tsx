/**
 * Admin Panel Button Components
 * Uses AdminTokens design system for consistent styling
 */

import React from 'react';
import { AdminTokens } from '../../styles/admin-tokens';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ElementType;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  title?: string;
}

export function PrimaryButton({
  children,
  className = '',
  icon: Icon,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`flex items-center gap-2 px-6 py-3 ${AdminTokens.button.primary} ${AdminTokens.radius.lg} shadow-lg shadow-blue-500/20 text-xs tracking-wider uppercase font-medium flex-shrink-0 ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = '',
  icon: Icon,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`flex items-center gap-2 px-6 py-3 border ${AdminTokens.border.primary} ${AdminTokens.border.accentHover} ${AdminTokens.text.secondary} hover:text-white ${AdminTokens.radius.lg} transition-colors text-xs tracking-wider uppercase flex-shrink-0 ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export function DangerButton({
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`flex items-center gap-2 px-6 py-3 ${AdminTokens.button.danger} ${AdminTokens.radius.lg} shadow-lg shadow-red-500/20 text-xs tracking-wider uppercase font-medium flex-shrink-0 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({
  children,
  className = '',
  variant = 'default',
  ...props
}: ButtonProps & { variant?: 'default' | 'danger' }) {
  const variantClasses = {
    default: `${AdminTokens.text.accentHover} ${AdminTokens.bg.accentHover}`,
    danger: 'hover:text-red-400 hover:bg-red-500/10',
  };

  return (
    <button
      type="button"
      className={`p-2 ${AdminTokens.text.tertiary} hover:text-white transition-all ${AdminTokens.radius.sm} ${variantClasses[variant]} flex-shrink-0 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SaveButton({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`flex items-center gap-2 px-6 py-3 ${AdminTokens.button.primary} ${AdminTokens.radius.lg} shadow-lg shadow-blue-500/20 text-xs tracking-wider uppercase flex-shrink-0 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function CancelButton({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`px-6 py-3 border ${AdminTokens.border.primary} hover:border-gray-500 ${AdminTokens.text.secondary} hover:text-white ${AdminTokens.radius.lg} transition-colors text-xs tracking-wider uppercase flex-shrink-0 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Developer Tools specific buttons
export function DevToolButton({
  children,
  className = '',
  variant = 'default',
  ...props
}: ButtonProps & { variant?: 'default' | 'warning' | 'success' }) {
  const variantClasses = {
    default: 'bg-gray-700 hover:bg-gray-600 shadow-gray-700/20',
    warning: 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-600/20',
    success: 'bg-green-600 hover:bg-green-700 shadow-green-600/20',
  };

  return (
    <button
      type="button"
      className={`flex items-center gap-2 px-4 py-2 text-white rounded-3xl transition-colors text-xs tracking-wider uppercase disabled:opacity-50 shadow-lg ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function ActionButton({
  children,
  className = '',
  icon: Icon,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`flex items-center gap-2 px-3 py-1.5 border border-gray-700 hover:border-gray-500 hover:bg-gray-800 text-gray-300 hover:text-white rounded-md transition-all text-xs font-medium flex-shrink-0 ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </button>
  );
}
