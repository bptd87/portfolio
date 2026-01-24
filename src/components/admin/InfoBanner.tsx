/**
 * Admin Info Banner Component
 * Dark mode with excellent readability
 */

import React from 'react';

interface InfoBannerProps {
  title?: string;
  description?: string;
  tips?: string[];
  icon?: string;
  variant?: 'info' | 'warning' | 'success' | 'purple';
  children?: React.ReactNode;
}

export function InfoBanner({ 
  title, 
  description, 
  tips, 
  icon = 'ℹ️',
  variant = 'info',
  children
}: InfoBannerProps) {
  const variantStyles = {
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      title: 'text-blue-300',
      description: 'text-blue-200',
      tips: 'text-blue-100',
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      title: 'text-yellow-300',
      description: 'text-yellow-200',
      tips: 'text-yellow-100',
    },
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      title: 'text-green-300',
      description: 'text-green-200',
      tips: 'text-green-100',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      title: 'text-purple-300',
      description: 'text-purple-200',
      tips: 'text-purple-100',
    },
  };

  const styles = variantStyles[variant];

  // Support both children (new API) and title/description (old API)
  if (children) {
    return (
      <div className={`${styles.bg} border ${styles.border} p-4 rounded-3xl`}>
        <div className={styles.description}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.bg} border ${styles.border} p-4 rounded-3xl`}>
      <h3 className={`font-semibold ${styles.title} mb-2 flex items-center gap-2`}>
        <span className="text-lg">{icon}</span> {title}
      </h3>
      <p className={`text-sm ${styles.description} mb-2`}>
        {description}
      </p>
      {tips && tips.length > 0 && (
        <ul className={`text-xs ${styles.tips} space-y-1 list-disc list-inside`}>
          {tips.map((tip, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: tip }} />
          ))}
        </ul>
      )}
    </div>
  );
}