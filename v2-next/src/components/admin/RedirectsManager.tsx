import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ArrowRight, Download, AlertCircle, FileJson, Copy, Check } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { PrimaryButton, SecondaryButton, IconButton } from './AdminButtons';
import { toast } from 'sonner';

interface Redirect {
  id: string;
  source: string;
  destination: string;
  permanent: boolean;
}

export function RedirectsManager() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load redirects from settings (assuming they are stored there)
  useEffect(() => {
    loadRedirects();
  }, []);

  const loadRedirects = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/settings`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Check if redirects exist in settings, otherwise init empty
        if (data.settings && data.settings.redirects) {
          setRedirects(data.settings.redirects);
        } else {
          setRedirects([]);
        }
      }
    } catch (error) {
      toast.error('Failed to load redirects');
    } finally {
      setLoading(false);
    }
  };

  const saveRedirects = async () => {
    try {
      setSaving(true);
      const token = sessionStorage.getItem('admin_token');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      // We need to fetch current settings first to merge, or assume the API handles partial updates
      // For safety, let's fetch first
      const currentSettingsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/settings`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );

      let currentSettings = {};
      if (currentSettingsResponse.ok) {
        const data = await currentSettingsResponse.json();
        currentSettings = data.settings || {};
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/settings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': token || '',
          },
          body: JSON.stringify({
            ...currentSettings,
            redirects: redirects
          }),
        }
      );

      if (response.ok) {
        toast.success('Redirects saved successfully');
        setHasUnsavedChanges(false);
      } else {
        toast.error('Failed to save redirects');
      }
    } catch (error) {
      toast.error('Error saving redirects');
    } finally {
      setSaving(false);
    }
  };

  const addRedirect = () => {
    const newRedirect: Redirect = {
      id: Date.now().toString(),
      source: '/',
      destination: '/',
      permanent: true
    };
    setRedirects([...redirects, newRedirect]);
    setHasUnsavedChanges(true);
  };

  const updateRedirect = (id: string, updates: Partial<Redirect>) => {
    setRedirects(redirects.map(r => r.id === id ? { ...r, ...updates } : r));
    setHasUnsavedChanges(true);
  };

  const removeRedirect = (id: string) => {
    setRedirects(redirects.filter(r => r.id !== id));
    setHasUnsavedChanges(true);
  };

  const exportVercelConfig = () => {
    const config = {
      redirects: redirects.map(r => ({
        source: r.source,
        destination: r.destination,
        permanent: r.permanent
      }))
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vercel.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('vercel.json downloaded');
  };

  const copyToClipboard = () => {
    const config = {
      redirects: redirects.map(r => ({
        source: r.source,
        destination: r.destination,
        permanent: r.permanent
      }))
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    toast.success('Config copied to clipboard');
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading redirects...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display italic">Redirect Manager</h2>
          <p className="text-muted-foreground">Manage URL redirects for site migration and SEO</p>
        </div>
        <div className="flex items-center gap-3">
          <SecondaryButton onClick={exportVercelConfig} className="gap-2">
            <Download className="w-4 h-4" />
            Export Vercel Config
          </SecondaryButton>
          {hasUnsavedChanges && (
            <PrimaryButton onClick={saveRedirects} disabled={saving} className="gap-2">
              {saving ? <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" /> : <Save className="w-4 h-4" />}
              Save Changes
            </PrimaryButton>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 bg-secondary/30 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <AlertCircle className="w-4 h-4" />
            <span>Redirects are processed in order. Use relative paths (e.g., /old-page).</span>
          </div>
          <button type="button" onClick={copyToClipboard} className="text-xs flex items-center gap-1 hover:text-accent-brand transition-colors">
            <Copy className="w-3 h-3" /> Copy JSON
          </button>
        </div>

        <div className="divide-y divide-border">
          {redirects.length === 0 ? (
            <div className="p-12 text-center opacity-40">
              <FileJson className="w-12 h-12 mx-auto mb-4" />
              <p>No redirects configured</p>
              <button type="button" onClick={addRedirect} className="mt-4 text-accent-brand hover:underline">Add your first redirect</button>
            </div>
          ) : (
            redirects.map((redirect) => (
              <div key={redirect.id} className="p-4 flex items-center gap-4 group hover:bg-secondary/20 transition-colors">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider opacity-40">Source Path</label>
                    <input
                      type="text"
                      value={redirect.source}
                      onChange={(e) => updateRedirect(redirect.id, { source: e.target.value })}
                      className="w-full bg-background border border-border rounded px-3 py-2 font-mono text-sm focus:border-accent-brand focus:outline-none"
                      placeholder="/old-path"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <ArrowRight className="w-4 h-4 opacity-20 flex-shrink-0 hidden md:block" />
                    <div className="space-y-1 flex-1">
                      <label className="text-[10px] uppercase tracking-wider opacity-40">Destination Path</label>
                      <input
                        type="text"
                        value={redirect.destination}
                        onChange={(e) => updateRedirect(redirect.id, { destination: e.target.value })}
                        className="w-full bg-background border border-border rounded px-3 py-2 font-mono text-sm focus:border-accent-brand focus:outline-none"
                        placeholder="/new-path"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`perm-${redirect.id}`}
                      checked={redirect.permanent}
                      onChange={(e) => updateRedirect(redirect.id, { permanent: e.target.checked })}
                      className="accent-accent-brand"
                    />
                    <label htmlFor={`perm-${redirect.id}`} className="text-xs cursor-pointer select-none">
                      Permanent (301)
                    </label>
                  </div>

                  <IconButton onClick={() => removeRedirect(redirect.id)} variant="danger" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-secondary/10 border-t border-border">
          <button
            onClick={addRedirect}
            className="flex items-center gap-2 text-sm font-medium text-accent-brand hover:opacity-80 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Redirect Rule
          </button>
        </div>
      </div>
    </div>
  );
}

