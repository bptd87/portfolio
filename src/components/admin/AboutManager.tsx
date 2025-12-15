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
  introText?: string;
  aboutText?: string;
  philosophyText?: string;
}

interface GalleryPhoto {
  id?: string;
  image_url: string;
  caption: string;
  alt_text: string;
  display_order: number;
}

const defaultContent: AboutContent = {
  bioText: 'Scenic designer, educator, and creative technologist crafting immersive environments where story and space converge.',
  profileImageUrl: '',
  fullBio: '',
  location: 'Southern California',
  education: '',
  specialties: 'Scenic Design, Technical Direction, 3D Modeling, Experiential Design',
  introText: '',
  aboutText: '',
  philosophyText: `My passion for scenic design falls somewhere between a love of architecture, history, and narrative storytelling. I'm drawn to projects that have meaning and impact for the communities they serve. I'm especially interested in productions where the design does more than illustrate a setting and becomes part of how the story resonates.

I value every collaborator involved in bringing a production to life. That starts with the hidden collaborator, the playwright, and extends to the director, the creative team, and the production teams. I also enjoy working closely with company managers, carpenters, and artisans to realize the best version of the creative team's vision within each unique venue.

My process often begins with a lot of ideas that pull in different directions. Early conversations with the director focus on the text: What do they see, and how can we shape a shared vision? From that point forward, I build digital models to explore and sculpt the world. I'm never afraid to start over, no matter where we are in the process.

I love the energy of collaborative design conversations, when ideas start bouncing between departments and the production finds its rhythm. Technically, I thrive in the transition from rendering to drafting, translating concepts into fully buildable spaces. I'm drawn to designs where structure and detail work together, and where every choice supports both the narrative and the performers onstage.

Whether I'm working on a classic or a new play, my goal is to create environments that feel inevitable once they're revealed. Ideally, the design feels like it couldn't have been any other way, even if it took many revisions and collaborative breakthroughs to get there.`,
};

export function AboutManager() {
  const [content, setContent] = useState(defaultContent);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
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

      // Fetch site settings
      const settingsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/settings`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (settingsResponse.ok) {
        const data = await settingsResponse.json();
        if (data.settings) {
          setContent({ ...defaultContent, ...data.settings });
        }
      }

      // Fetch gallery photos
      const galleryResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/about-gallery`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (galleryResponse.ok) {
        const galleryData = await galleryResponse.json();
        if (galleryData.photos) {
          setGalleryPhotos(galleryData.photos);
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

      // Save site settings
      const settingsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/settings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
          },
          body: JSON.stringify(content),
        }
      );

      if (!settingsResponse.ok) {
        showMessage('error', 'Failed to save settings');
        return;
      }

      // Save gallery photos
      const galleryResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/about-gallery`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ photos: galleryPhotos }),
        }
      );

      if (galleryResponse.ok) {
        showMessage('success', 'About page updated successfully!');
        setHasUnsavedChanges(false);
      } else {
        showMessage('error', 'Failed to save gallery photos');
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
          className={`mb-6 px-4 py-3 rounded-3xl border flex items-center gap-3 ${message.type === 'success'
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
                Introduction Section
              </label>
              <textarea
                value={content.introText || ''}
                onChange={(e: any) => updateField('introText', (e.target as HTMLTextAreaElement).value)}
                rows={6}
                className={AdminTokens.input.base + ' resize-none'}
                placeholder="Introduction text that appears in the first section of the About page"
              />
            </div>

            <div>
              <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                About Brandon Section
              </label>
              <textarea
                value={content.aboutText || ''}
                onChange={(e: any) => updateField('aboutText', (e.target as HTMLTextAreaElement).value)}
                rows={10}
                className={AdminTokens.input.base + ' resize-none'}
                placeholder="Main biography text for the 'About Brandon' section"
              />
            </div>

            <div>
              <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                Philosophy/Additional Section (Optional)
              </label>
              <textarea
                value={content.philosophyText || ''}
                onChange={(e: any) => updateField('philosophyText', (e.target as HTMLTextAreaElement).value)}
                rows={6}
                className={AdminTokens.input.base + ' resize-none'}
                placeholder="Additional text for philosophy or teaching approach section"
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

        {/* Photo Gallery Section */}
        <div className={AdminTokens.card.base}>
          <h3 className="text-lg text-white mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-400" />
            Photo Gallery (6 Photos)
          </h3>

          <p className="text-xs text-gray-400 mb-6">
            Manage the 6 photos that appear in the "Behind the Scenes" section of your Bio page.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const photo = galleryPhotos[index];
              return (
                <div key={index} className="space-y-3">
                  <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative group">
                    {photo?.image_url ? (
                      <>
                        <img
                          src={photo.image_url}
                          alt={photo.alt_text}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => {
                            const newPhotos = [...galleryPhotos];
                            newPhotos.splice(index, 1);
                            setGalleryPhotos(newPhotos);
                            setHasUnsavedChanges(true);
                          }}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <ImageUploader
                    value={photo?.image_url || ''}
                    onChange={(url: string) => {
                      const newPhotos = [...galleryPhotos];
                      if (newPhotos[index]) {
                        newPhotos[index].image_url = url;
                      } else {
                        newPhotos[index] = {
                          image_url: url,
                          caption: '',
                          alt_text: `Gallery photo ${index + 1}`,
                          display_order: index + 1
                        };
                      }
                      setGalleryPhotos(newPhotos);
                      setHasUnsavedChanges(true);
                    }}
                    label={`Photo ${index + 1}`}
                  />

                  {photo && (
                    <>
                      <input
                        type="text"
                        value={photo.caption || ''}
                        onChange={(e) => {
                          const newPhotos = [...galleryPhotos];
                          newPhotos[index].caption = e.target.value;
                          setGalleryPhotos(newPhotos);
                          setHasUnsavedChanges(true);
                        }}
                        className={AdminTokens.input.base}
                        placeholder="Caption"
                      />
                      <input
                        type="text"
                        value={photo.alt_text || ''}
                        onChange={(e) => {
                          const newPhotos = [...galleryPhotos];
                          newPhotos[index].alt_text = e.target.value;
                          setGalleryPhotos(newPhotos);
                          setHasUnsavedChanges(true);
                        }}
                        className={AdminTokens.input.base}
                        placeholder="Alt text (for accessibility)"
                      />
                    </>
                  )}
                </div>
              );
            })}
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

