import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ServiceErrorNoticeProps {
  onRetry?: () => void;
  message?: string;
}

export function ServiceErrorNotice({ onRetry, message }: ServiceErrorNoticeProps) {
  return (
    <div className="border-2 border-orange-500 bg-orange-50 dark:bg-orange-900/10 p-6 space-y-4">
      <div className="flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="font-semibold text-orange-900 dark:text-orange-200 mb-2">
            Database Service Temporarily Unavailable
          </h3>
          <p className="text-sm text-orange-800 dark:text-orange-300 mb-4">
            {message || "The Supabase database is experiencing a temporary service issue (Cloudflare Error 1105). This is an infrastructure issue, not a code problem."}
          </p>
          <div className="space-y-2 text-sm text-orange-800 dark:text-orange-300">
            <p><strong>What this means:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Your data is safe and not lost</li>
              <li>This is a temporary connectivity issue with the hosting service</li>
              <li>The service should be restored automatically</li>
            </ul>
            <p className="mt-3"><strong>What you can do:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Wait 30-60 seconds and try again</li>
              <li>Check <a href="https://status.supabase.com" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Supabase Status Page</a> for service updates</li>
              <li>If the issue persists, contact Supabase support</li>
            </ul>
          </div>
        </div>
      </div>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 transition-colors w-full justify-center"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-xs tracking-wider uppercase">Retry Connection</span>
        </button>
      )}
    </div>
  );
}
