import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold' | 'green';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const buttonStyles = {
  base: 'inline-flex items-center justify-center gap-2.5 tracking-wider uppercase font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  
  variant: {
    primary: 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90 focus:ring-black dark:focus:ring-white',
    secondary: 'bg-secondary text-foreground hover:bg-accent border border-border',
    outline: 'border-2 border-current text-foreground hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
    ghost: 'text-foreground hover:bg-secondary',
    accent: 'bg-accent-brand text-accent-brand-foreground hover:opacity-90 focus:ring-accent-brand shadow-md',
  },
  
  size: {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-sm',
  },
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'right',
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const classes = `
    ${buttonStyles.base}
    ${buttonStyles.variant[variant]}
    ${buttonStyles.size[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <motion.button
      className={classes}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.015, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.985 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </motion.button>
  );
}
