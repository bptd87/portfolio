/**
 * ABOUT PAGE MANAGER
 * 
 * Manage About page content including bio, headshot, and personal information.
 * This extends the Site Settings bio/profile section with additional About page fields.
 */

import React, { useState, useEffect } from 'react';
import { User, Save, RotateCcw, AlertCircle, CheckCircle, Loader, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
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

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);

      // Fetch site settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('site_configuration')
        .select('value')
        .eq('key', 'site_settings')
        .single();

      if (settingsData?.value) {
        setContent({ ...defaultContent, ...settingsData.value });
      }

      // Fetch gallery photos
      const { data: galleryData, error: galleryError } = await supabase
        .from('about_gallery')
        .select('*')
        .order('display_order');

      if (galleryData) {
        setGalleryPhotos(galleryData);
      }

    } catch (error) {
      console.error('Error loading content:', error);
      showMessage('error', 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      console.log('💾 Starting About page save...', { hasPhotos: galleryPhotos.length });
      setSaving(true);

      // Save main about content
      console.log('📝 Saving about content to site_configuration...');
      const { error: settingsError } = await supabase
        .from('site_configuration')
        .upsert({ key: 'site_settings', value: content } as any);

      if (settingsError) {
        console.error('❌ Error saving settings:', settingsError);
        throw settingsError;
      }
      console.log('✅ About content saved');

      // Get existing photo IDs from database
      console.log('🔍 Fetching existing gallery photos from DB...');
      const { data: existingPhotos } = await supabase
        .from('about_gallery')
        .select('id');

      const existingIds = existingPhotos?.map((p: any) => p.id) || [];
      const currentIds = galleryPhotos.filter(p => p.id).map(p => p.id);

      console.log('📊 Photo comparison:', { existingIds, currentIds, toDelete: existingIds.length - currentIds.length });

      // Delete photos that were removed
      const idsToDelete = existingIds.filter(id => !currentIds.includes(id));

      if (idsToDelete.length > 0) {
        console.log('🗑️ Deleting removed photos:', idsToDelete);
        await supabase.from('about_gallery').delete().in('id', idsToDelete);
      }

      // Handle gallery photos: insert new ones, update existing ones
      if (galleryPhotos.length > 0) {
        // Separate new photos from existing ones
        const newPhotos = galleryPhotos.filter(p => !p.id);
        const existingPhotos = galleryPhotos.filter(p => p.id);

        console.log('📸 Photo breakdown:', { total: galleryPhotos.length, new: newPhotos.length, existing: existingPhotos.length });

        // Insert new photos (without ID - DB will auto-generate)
        if (newPhotos.length > 0) {
          console.log('➕ Inserting new photos:', newPhotos);
          const photosToInsert = newPhotos.map((p, index) => ({
            image_url: p.image_url,
            caption: p.caption,
            alt_text: p.alt_text,
            display_order: existingPhotos.length + index + 1
          }));

          const { error: insertError } = await supabase
            .from('about_gallery')
            .insert(photosToInsert);

          if (insertError) {
            console.error('❌ Insert error:', insertError);
            throw insertError;
          }
          console.log('✅ New photos inserted');
        }

        // Update existing photos
        if (existingPhotos.length > 0) {
          console.log('✏️ Updating existing photos:', existingPhotos.length);
          for (let i = 0; i < existingPhotos.length; i++) {
            const p = existingPhotos[i];
            const { error: updateError } = await supabase
              .from('about_gallery')
              .update({
                image_url: p.image_url,
                caption: p.caption,
                alt_text: p.alt_text,
                display_order: i + 1
              })
              .eq('id', p.id);

            if (updateError) {
              console.error('❌ Update error for photo:', p.id, updateError);
              throw updateError;
            }
          }
          console.log('✅ Existing photos updated');
        }
      }

      console.log('🎉 Save complete, reloading data...');
      showMessage('success', 'About page updated successfully!');
      setHasUnsavedChanges(false);
      // Reload to get new IDs
      loadContent();

    } catch (error: any) {
      console.error('💥 Fatal error saving changes:', error);
      showMessage('error', 'Error saving changes: ' + error.message);
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
                        // For new photos, don't set ID initially, let DB generate it on save (or if we save it here, undefined ID)
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

