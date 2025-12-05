import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Eye, EyeOff, ExternalLink, Save, X, ChevronUp, ChevronDown } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { ImageUploaderWithFocalPoint } from './ImageUploaderWithFocalPoint';
import { PrimaryButton, SecondaryButton, SaveButton, CancelButton, IconButton } from './AdminButtons';
import { 
  DarkInput, 
  DarkTextarea, 
  DarkSelect, 
  DarkLabel,
  formContainerClasses,
  listItemClasses,
  badgeClasses,
  checkboxLabelClasses
} from './DarkModeStyles';

interface SocialLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  enabled: boolean;
  order: number;
  description?: string;
  type?: 'link' | 'social';
}

interface BioData {
  name: string;
  tagline: string;
  profileImage: string;
}

const ICON_OPTIONS = [
  { value: 'external', label: 'External Link' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'mail', label: 'Email' },
  { value: 'github', label: 'GitHub' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'article', label: 'Article' },
  { value: 'blog', label: 'Blog' },
  { value: 'video', label: 'Video' },
];

const LINK_TYPE_OPTIONS = [
  { value: 'link', label: 'Main Link', description: 'Large button link in main section' },
  { value: 'social', label: 'Social Icon', description: 'Small circular icon at top' },
];

export function LinksManager() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [bioData, setBioData] = useState<BioData>({
    name: 'BRANDON PT DAVIS',
    tagline: 'Scenic Designer',
    profileImage: '',
  });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<SocialLink>>({
    title: '',
    url: '',
    icon: 'external',
    description: '',
    type: 'link',
    enabled: true,
  });
  const [saving, setSaving] = useState(false);
  const [savingBio, setSavingBio] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch links
      const linksResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/links`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (linksResponse.ok) {
        const data = await linksResponse.json();
        setLinks(Array.isArray(data) ? data : []);
      }

      // Fetch bio data
      const bioResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/links/bio`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (bioResponse.ok) {
        const data = await bioResponse.json();
        if (data) {
          setBioData(data);
        }
      }
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/links/bio`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bioData),
        }
      );

      if (response.ok) {
        alert('✅ Bio updated successfully!');
      } else {
        alert('❌ Failed to update bio');
      }
    } catch (error) {
      alert('❌ Error saving bio');
    } finally {
      setSavingBio(false);
    }
  };

  const handleAddLink = async () => {
    if (!formData.title || !formData.url) {
      alert('Please fill in title and URL');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/links`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            order: links.length + 1,
          }),
        }
      );

      if (response.ok) {
        const newLink = await response.json();
        setLinks([...links, newLink]);
        setShowAddForm(false);
        setFormData({
          title: '',
          url: '',
          icon: 'external',
          description: '',
          type: 'link',
          enabled: true,
        });
        alert('✅ Link added successfully!');
      } else {
        alert('❌ Failed to add link');
      }
    } catch (error) {
      alert('❌ Error adding link');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLink = async (id: string, updates: Partial<SocialLink>) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/links/${id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      if (response.ok) {
        const updatedLink = await response.json();
        setLinks(links.map(link => link.id === id ? updatedLink : link));
      }
    } catch (error) {
      }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Delete this link?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/links/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        setLinks(links.filter(link => link.id !== id));
        alert('✅ Link deleted');
      }
    } catch (error) {
      alert('❌ Error deleting link');
    }
  };

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    await handleUpdateLink(id, { enabled });
  };

  const moveLink = async (id: string, direction: 'up' | 'down') => {
    const index = links.findIndex(link => link.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === links.length - 1)
    ) {
      return;
    }

    const newLinks = [...links];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];

    // Update orders
    newLinks.forEach((link, i) => {
      link.order = i + 1;
      handleUpdateLink(link.id, { order: i + 1 });
    });

    setLinks(newLinks);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-foreground/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Bio Section */}
      <div className="backdrop-blur-xl bg-neutral-500/10 border border-neutral-500/20 rounded-3xl p-6">
        <h2 className="text-xl mb-6 flex items-center gap-2">
          Bio Settings
        </h2>

        <div className="space-y-4">
          <div>
            <ImageUploaderWithFocalPoint
              value={bioData.profileImage}
              onChange={(url) => setBioData({ ...bioData, profileImage: url })}
              label="PROFILE IMAGE"
            />
            <p className="text-xs text-foreground/40 mt-2 font-pixel tracking-wider">
              Optional profile photo (appears at top of page)
            </p>
          </div>

          <div>
            <DarkLabel>NAME</DarkLabel>
            <DarkInput
              type="text"
              value={bioData.name}
              onChange={(e) => setBioData({ ...bioData, name: e.target.value })}
            />
          </div>

          <div>
            <DarkLabel>TAGLINE</DarkLabel>
            <DarkInput
              type="text"
              value={bioData.tagline}
              onChange={(e) => setBioData({ ...bioData, tagline: e.target.value })}
              className="font-display italic"
            />
          </div>

          <SaveButton
            onClick={handleSaveBio}
            disabled={savingBio}
          >
            {savingBio ? 'SAVING...' : 'SAVE BIO'}
          </SaveButton>
        </div>
      </div>

      {/* Links Section */}
      <div className="backdrop-blur-xl bg-neutral-500/10 border border-neutral-500/20 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl">Links</h2>
          <SecondaryButton
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAddForm ? 'CANCEL' : 'ADD LINK'}
          </SecondaryButton>
        </div>

        {/* Add Link Form */}
        {showAddForm && (
          <div className="mb-6 p-5 bg-background/30 border border-neutral-500/20 rounded-2xl">
            <div className="space-y-4">
              <div>
                <DarkLabel>TYPE *</DarkLabel>
                <DarkSelect
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  {LINK_TYPE_OPTIONS.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </DarkSelect>
              </div>

              <div>
                <DarkLabel>TITLE *</DarkLabel>
                <DarkInput
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={formData.type === 'social' ? 'e.g., Instagram' : 'e.g., Portfolio Website'}
                />
              </div>

              <div>
                <DarkLabel>URL *</DarkLabel>
                <DarkInput
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <DarkLabel>ICON</DarkLabel>
                  <DarkSelect
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  >
                    {ICON_OPTIONS.map(icon => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label}
                      </option>
                    ))}
                  </DarkSelect>
                </div>

                <div>
                  <DarkLabel>
                    DESCRIPTION {formData.type === 'social' ? '(N/A for social)' : '(Optional)'}
                  </DarkLabel>
                  <DarkInput
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={formData.type === 'social' ? 'Not shown' : 'Optional subtitle'}
                    disabled={formData.type === 'social'}
                  />
                </div>
              </div>

              <SaveButton
                onClick={handleAddLink}
                disabled={saving || !formData.title || !formData.url}
              >
                {saving ? 'ADDING...' : 'ADD LINK'}
              </SaveButton>
            </div>
          </div>
        )}

        {/* Links List */}
        <div className="space-y-2">
          {links.length === 0 ? (
            <div className="text-center py-12 text-foreground/40">
              <ExternalLink className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-pixel text-xs tracking-[0.3em]">NO LINKS YET</p>
            </div>
          ) : (
            links
              .sort((a, b) => a.order - b.order)
              .map((link, index) => (
                <div
                  key={link.id}
                  className={`flex items-center gap-3 p-4 bg-background/30 border border-neutral-500/20 rounded-2xl ${
                    !link.enabled ? 'opacity-50' : ''
                  }`}
                >
                  {/* Move Buttons */}
                  <div className="flex flex-col gap-0.5">
                    <IconButton
                      onClick={() => moveLink(link.id, 'up')}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </IconButton>
                    <IconButton
                      onClick={() => moveLink(link.id, 'down')}
                      disabled={index === links.length - 1}
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </IconButton>
                  </div>

                  {/* Link Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-pixel text-[9px] px-2 py-0.5 rounded tracking-wider ${
                        link.type === 'social' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-foreground/10 text-foreground/60'
                      }`}>
                        {link.type === 'social' ? 'SOCIAL ICON' : 'MAIN LINK'}
                      </span>
                    </div>
                    <h3 className="font-display italic truncate mb-0.5">{link.title}</h3>
                    <p className="font-pixel text-[10px] text-foreground/40 truncate tracking-wider">{link.url}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <IconButton
                      onClick={() => handleToggleEnabled(link.id, !link.enabled)}
                      title={link.enabled ? 'Disable' : 'Enable'}
                    >
                      {link.enabled ? (
                        <Eye className="w-4 h-4 text-foreground/60" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-foreground/40" />
                      )}
                    </IconButton>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
                      title="Open link"
                    >
                      <ExternalLink className="w-4 h-4 text-foreground/60" />
                    </a>

                    <IconButton
                      onClick={() => handleDeleteLink(link.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500/60 hover:text-red-500" />
                    </IconButton>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Preview Link */}
        <div className="mt-6 pt-6 border-t border-neutral-500/20">
          <a
            href="/links"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-3 border border-neutral-500/20 rounded-2xl hover:bg-foreground/5 transition-colors font-pixel text-xs tracking-[0.2em]"
          >
            <ExternalLink className="w-4 h-4" />
            PREVIEW PAGE
          </a>
        </div>
      </div>
    </div>
  );
}