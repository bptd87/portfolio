/**
 * BACK TO DASHBOARD BUTTON
 * 
 * Reusable button for navigating back to admin dashboard from managers
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackToDashboardProps {
  onClick: () => void;
}

export function BackToDashboard({ onClick }: BackToDashboardProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-gray-900/50 border border-gray-700 hover:border-blue-500/50 rounded-2xl transition-colors group"
    >
      <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
      <span className="text-xs tracking-wider uppercase text-gray-400 group-hover:text-blue-400 transition-colors">
        Back to Dashboard
      </span>
    </button>
  );
}
