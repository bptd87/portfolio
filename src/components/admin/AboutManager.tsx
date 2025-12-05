/**
 * ABOUT PAGE MANAGER
 * 
 * Manage About page content including bio, headshot, and personal information.
 * This extends the Site Settings bio/profile section with additional About page fields.
 */

import React, { useState, useEffect } from 'react';
import { User, Save, RotateCcw, AlertCircle, CheckCircle, Loader, Image as ImageIcon } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { PrimaryButton, SecondaryButton } from './AdminButtons';
import { ImageUploader } from './ImageUploader';
import { AdminTokens } from '../../styles/admin-tokens';

interface AboutContent {
  bioText: string;
  profileImageUrl: string;
  fullBio?: string;
  location?: string;
  education?: string;
  specialties?: string;
}

const defaultContent: AboutContent = {
  bioText: 'Scenic designer, educator, and creative technologist crafting immersive environments where story and space converge.',
  profileImageUrl: '',
  fullBio: '',
  location: 'Southern California',
  education: '',
  specialties: 'Scenic Design, Technical Direction, 3D Modeling, Experiential Design',
};

export function AboutManager() {
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const adminToken = sessionStorage.getItem('admin_token');

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/settings`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setContent({ ...defaultContent, ...data.settings });
        }
      }
    } catch (error) {
      showMessage('error', 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!adminToken) {
        alert('You are not logged in. Please log in to the admin panel first.');
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/settings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': adminToken,
          },
          body: JSON.stringify(content),
        }
      );

      if (response.ok) {
        showMessage('success', 'About page updated successfully!');
        setHasUnsavedChanges(false);
      } else {
        showMessage('error', 'Failed to save changes');
      }
    } catch (error) {
      showMessage('error', 'Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all changes?')) {
      loadContent();
      setHasUnsavedChanges(false);
    }
  };

  const updateField = (key: keyof AboutContent, value: string) => {
    setContent((prev: AboutContent) => ({
      ...prev,
      [key]: value,
    }));
    setHasUnsavedChanges(true);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl tracking-tight mb-2 text-white">About Page</h1>
        <p className="text-gray-400">Manage your bio, headshot, and personal information</p>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-3xl border flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Bio Section */}
      <div className="space-y-6">
        <div className={AdminTokens.card.base}>
          <h3 className="text-lg text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Biography
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                Short Bio (Hero Section)
              </label>
              <textarea
                value={content.bioText}
                onChange={(e: any) => updateField('bioText', (e.target as HTMLTextAreaElement).value)}
                rows={3}
                className={AdminTokens.input.base + ' resize-none'}
                placeholder="One-line description that appears on the homepage and about page hero"
              />
            </div>

            <div>
              <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                Full Biography (Optional)
              </label>
              <textarea
                value={content.fullBio || ''}
                onChange={(e: any) => updateField('fullBio', (e.target as HTMLTextAreaElement).value)}
                rows={8}
                className={AdminTokens.input.base + ' resize-none'}
                placeholder="Extended biography with more details about your background, experience, and philosophy"
              />
            </div>

            <div>
              <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                Location
              </label>
              <input
                type="text"
                value={content.location || ''}
                onChange={(e: any) => updateField('location', (e.target as HTMLInputElement).value)}
                className={AdminTokens.input.base}
                placeholder="Southern California"
              />
            </div>

            <div>
              <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                Specialties
              </label>
              <input
                type="text"
                value={content.specialties || ''}
                onChange={(e: any) => updateField('specialties', (e.target as HTMLInputElement).value)}
                className={AdminTokens.input.base}
                placeholder="Scenic Design, Technical Direction, 3D Modeling"
              />
            </div>
          </div>
        </div>

        {/* Headshot Section */}
        <div className={AdminTokens.card.base}>
          <h3 className="text-lg text-white mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-400" />
            Profile Image
          </h3>
          
          <div>
            <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
              Headshot / Portrait
            </label>
            <ImageUploader
              value={content.profileImageUrl}
              onChange={(url: string) => updateField('profileImageUrl', url)}
              label="Upload Profile Image"
            />
            <p className="text-xs text-gray-500 mt-2">
              This image appears on the About page and can be used throughout the site
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex items-center gap-4">
        <PrimaryButton onClick={handleSave} disabled={saving || !hasUnsavedChanges}>
          {saving ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </PrimaryButton>

        <SecondaryButton onClick={handleReset} disabled={saving}>
          <RotateCcw className="w-4 h-4" />
          Discard Changes
        </SecondaryButton>
      </div>
    </div>
  );
}
