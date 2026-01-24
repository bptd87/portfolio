import React from 'react';
import { motion } from 'motion/react';

export type CardVariant = 'default' | 'elevated' | 'glass' | 'bordered' | 'spotlight';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

type MotionDivProps = React.ComponentPropsWithoutRef<typeof motion.div>;

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  asMotion?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const cardStyles = {
  variant: {
    default: 'bg-card border border-border depth-sm',
    elevated: 'bg-card border border-border depth-md',
    glass: 'glass',
    bordered: 'border-2 border-border bg-transparent',
    spotlight: 'bg-card border border-border depth-sm spotlight-hover',
  },
  
  padding: {
    none: '',
    sm: 'p-4 md:p-5',
    md: 'p-6 md:p-8',
    lg: 'p-8 md:p-10',
    xl: 'p-10 md:p-14',
  },
  
  interactive: 'cursor-pointer lift-hover',
};

export function Card({
  variant = 'default',
  padding = 'md',
  interactive = false,
  asMotion = false,
  className = '',
  children,
  ...props
}: CardProps) {
  const classes = `
    ${cardStyles.variant[variant]}
    ${cardStyles.padding[padding]}
    ${interactive ? cardStyles.interactive : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  if (asMotion) {
    return (
      <motion.div
        className={classes}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        {...(props as unknown as MotionDivProps)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
