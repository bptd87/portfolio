import React, { useState } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2, Server } from 'lucide-react';

interface Endpoint {
  name: string;
  endpoint: string;
  method: 'POST' | 'GET';
  body?: any;
}

const aiEndpoints: Endpoint[] = [
  { name: 'Generate Description', endpoint: 'generate-description', method: 'POST', body: { title: 'Test', category: 'Test', venue: 'Test', year: 2024 } },
  { name: 'Generate Bulk Tags', endpoint: 'generate-bulk-tags', method: 'POST', body: { imageUrls: ['https://via.placeholder.com/150'], context: 'Test' } },
  { name: 'Select Thumbnail', endpoint: 'select-thumbnail', method: 'POST', body: { imageUrls: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'], context: 'Test' } },
  { name: 'Expand Notes', endpoint: 'expand-notes', method: 'POST', body: { notes: ['Test note'] } },
  { name: 'SEO Tags', endpoint: 'ai/seo-tags', method: 'POST', body: { title: 'Test', excerpt: 'Test' } },
  { name: 'SEO Description', endpoint: 'ai/seo-description', method: 'POST', body: { title: 'Test', excerpt: 'Test' } },
  { name: 'SEO Read Time', endpoint: 'ai/seo-read-time', method: 'POST', body: { title: 'Test', excerpt: 'Test' } },
];

export function ApiStatus() {
  const [results, setResults] = useState<Record<string, { status: number; data: any } | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const testEndpoint = async (endpoint: Endpoint) => {
    setLoading({ ...loading, [endpoint.endpoint]: true });
    setResults({ ...results, [endpoint.endpoint]: null });
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/${endpoint.endpoint}`, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}`, 'X-Admin-Token': token || '' },
        body: endpoint.body ? JSON.stringify(endpoint.body) : undefined,
      });
      const data = await response.json();
      setResults({ ...results, [endpoint.endpoint]: { status: response.status, data } });
    } catch (error) {
      setResults({ ...results, [endpoint.endpoint]: { status: 500, data: { error: (error as Error).message } } });
    } finally {
      setLoading({ ...loading, [endpoint.endpoint]: false });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl tracking-tight">AI Services API Status</h2>
      <div className="space-y-4">
        {aiEndpoints.map(endpoint => (
          <div key={endpoint.endpoint} className="border border-border p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{endpoint.name}</h3>
                <p className="text-xs text-gray-400">{`/api/admin/${endpoint.endpoint}`}</p>
              </div>
              <button
                onClick={() => testEndpoint(endpoint)}
                disabled={loading[endpoint.endpoint]}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {loading[endpoint.endpoint] ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Test'}
              </button>
            </div>
            {results[endpoint.endpoint] && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  {results[endpoint.endpoint]?.status === 200 ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                  <span className="font-semibold">Status: {results[endpoint.endpoint]?.status}</span>
                </div>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(results[endpoint.endpoint]?.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
