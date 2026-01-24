
import React, { useState, useEffect } from 'react';
import {
  Home,
  User,
  Mail,
  Globe,
  Search,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Loader,
  Image as ImageIcon,
  Type,
} from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { PrimaryButton, SecondaryButton } from './AdminButtons';
import { FileIcon } from 'lucide-react';
import { AdminTokens } from '../../styles/admin-tokens';
import { ImageUploader } from './ImageUploader';
import { FileUploader } from './FileUploader';

interface SiteSettings {
  // Homepage Hero
  heroTitle: string;
  heroSubtitle: string;

  // About/Bio
  bioText: string;
  profileImageUrl: string;
  resumeUrl: string;
  resumeFilename: string;

  // Contact Information
  contactEmail: string;
  contactPhone: string;
  contactLocation: string;
  availabilityStatus: string;

  // SEO Defaults
  siteTitle: string;
  siteDescription: string;
  defaultOgImage: string;

  // Footer
  footerCopyright: string;

  // About Page SEO
  aboutInfoTitle: string;
  aboutInfoDescription: string;
  aboutInfoKeywords: string;
  aboutInfoOgImage: string;
}

const defaultSettings: SiteSettings = {
  // Homepage
  heroTitle: 'Brandon PT Davis',
  heroSubtitle: 'ART × TECHNOLOGY × DESIGN',

  // About/Bio
  bioText: 'Scenic designer, educator, and creative technologist crafting immersive environments where story and space converge.',
  profileImageUrl: '',
  resumeUrl: '',
  resumeFilename: '',

  // Contact
  contactEmail: 'info@brandonptdavis.com',
  contactPhone: '',
  contactLocation: 'Southern California',
  availabilityStatus: 'Available for projects',

  // SEO Defaults
  siteTitle: 'Brandon PT Davis - Scenic Designer',
  siteDescription: 'Scenic designer, educator, and creative technologist crafting immersive environments where story and space converge.',
  defaultOgImage: '',

  // Footer
  footerCopyright: `© ${new Date().getFullYear()} Brandon PT Davis. All rights reserved.`,

  // About Page SEO
  aboutInfoTitle: 'About | Brandon PT Davis',
  aboutInfoDescription: 'About Brandon PT Davis - Scenic Designer based in Southern California.',
  aboutInfoKeywords: 'Scenic Design, Theatre, Brandon PT Davis, Bio, About',
  aboutInfoOgImage: '',
};

type SettingsTab = 'homepage' | 'about' | 'contact' | 'seo' | 'footer';

export function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<SettingsTab>('homepage');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Load settings from database
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('site_configuration')
        .select('value')
        .eq('key', 'site_settings')
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Ignore "Row not found" error
          console.error('Error loading settings:', error);
        }
      } else if (data && data.value) {
        setSettings({ ...defaultSettings, ...data.value });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('site_configuration')
        .upsert({
          key: 'site_settings',
          value: settings
        });

      if (error) throw error;

      showMessage('success', 'Settings saved successfully!');
      setHasUnsavedChanges(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      showMessage('error', `Failed to save settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all changes to default values?')) {
      setSettings(defaultSettings);
      setHasUnsavedChanges(false);
      showMessage('success', 'Reset to defaults');
    }
  };

  const updateSetting = (key: keyof SiteSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasUnsavedChanges(true);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'homepage', label: 'Homepage', icon: Home },
    { id: 'about', label: 'About', icon: User },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'footer', label: 'Footer', icon: Globe },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl tracking-tight mb-2 text-white">Site Settings</h1>
        <p className="text-gray-400">Manage global site configuration</p>
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

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-800">
        <div className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs tracking-wider uppercase border-b-2 transition-all ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Form */}
      <div className="space-y-6">
        {/* HOMEPAGE */}
        {activeTab === 'homepage' && (
          <div className="space-y-6">
            <div className={AdminTokens.card.base}>
              <h3 className="text-lg text-white mb-4 flex items-center gap-2">
                <Type className="w-5 h-5 text-blue-400" />
                Hero Section
              </h3>

              <div className="space-y-4">
                <div>
                  <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                    Hero Title
                  </label>
                  <input
                    type="text"
                    value={settings.heroTitle}
                    onChange={(e) => updateSetting('heroTitle', e.target.value)}
                    className={AdminTokens.input.base}
                    placeholder="Brandon PT Davis"
                  />
                </div>

                <div>
                  <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                    Hero Subtitle
                  </label>
                  <input
                    type="text"
                    value={settings.heroSubtitle}
                    onChange={(e) => updateSetting('heroSubtitle', e.target.value)}
                    className={AdminTokens.input.base}
                    placeholder="ART × TECHNOLOGY × DESIGN"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABOUT */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className={AdminTokens.card.base}>
              <h3 className="text-lg text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                About/Bio
              </h3>

              <div className="space-y-4">
                <div>
                  <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                    Bio Text
                  </label>
                  <textarea
                    value={settings.bioText}
                    onChange={(e) => updateSetting('bioText', e.target.value)}
                    rows={4}
                    className={AdminTokens.input.base + ' resize-none'}
                    placeholder="Enter your bio text here..."
                  />
                </div>

                <div>
                  <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                    Profile Image URL
                  </label>
                  <ImageUploader
                    value={settings.profileImageUrl}
                    onChange={(url: string) => updateSetting('profileImageUrl', url)}
                    label="Upload Profile Image"
                  />
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <FileIcon className="w-4 h-4 text-orange-400" />
                    Resume & CV
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                        Resume PDF
                      </label>
                      <FileUploader
                        value={settings.resumeUrl}
                        onChange={(url: string) => updateSetting('resumeUrl', url)}
                        label="Upload PDF"
                        bucketName="portfolio"
                        accept="application/pdf"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                        Button Label (Optional)
                      </label>
                      <input
                        type="text"
                        value={settings.resumeFilename || ''}
                        onChange={(e) => updateSetting('resumeFilename', e.target.value)}
                        className={AdminTokens.input.base}
                        placeholder="Download Resume"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">
                        Default is "Download Resume" if left blank.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTACT */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className={AdminTokens.card.base}>
              <h3 className="text-lg text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                Contact Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => updateSetting('contactEmail', e.target.value)}
                    className={AdminTokens.input.base}
                    placeholder="contact@example.com"
                  />
                </div>

                <div>
                  <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={settings.contactPhone}
                    onChange={(e) => updateSetting('contactPhone', e.target.value)}
                    className={AdminTokens.input.base}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={settings.contactLocation}
                    onChange={(e) => updateSetting('contactLocation', e.target.value)}
                    className={AdminTokens.input.base}
                    placeholder="New York, NY"
                  />
                </div>

                <div>
                  <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                    Availability Status
                  </label>
                  <input
                    type="text"
                    value={settings.availabilityStatus}
                    onChange={(e) => updateSetting('availabilityStatus', e.target.value)}
                    className={AdminTokens.input.base}
                    placeholder="Available for commissions"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div className={AdminTokens.card.base}>
              <h3 className="text-lg text-white mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-400" />
                SEO Defaults
              </h3>

              <div className="space-y-4">
                <div>
                  <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                    Site Title
                  </label>
                  <input
                    type="text"
                    value={settings.siteTitle}
                    onChange={(e) => updateSetting('siteTitle', e.target.value)}
                    className={AdminTokens.input.base}
                    placeholder="Brandon PT Davis | Scenic Designer"
                  />
                </div>

                <div>
                  <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                    Default Meta Description
                  </label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => updateSetting('siteDescription', e.target.value)}
                    rows={3}
                    className={AdminTokens.input.base + ' resize-none'}
                    placeholder="Default description for pages without custom meta..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {settings.siteDescription.length} / 160 characters
                  </p>
                </div>

                <div>
                  <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                    Default OG Image URL
                  </label>
                  <ImageUploader
                    value={settings.defaultOgImage}
                    onChange={(url: string) => updateSetting('defaultOgImage', url)}
                    label="Upload Default OG Image"
                  />
                </div>
              </div>

              <div className="border-t border-gray-800 pt-6 mt-6">
                <h4 className="text-sm font-semibold text-white mb-4">About Page SEO</h4>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={settings.aboutInfoTitle || ''}
                      onChange={(e) => updateSetting('aboutInfoTitle', e.target.value)}
                      className={AdminTokens.input.base}
                      placeholder="About | Brandon PT Davis"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                      Meta Description
                    </label>
                    <textarea
                      value={settings.aboutInfoDescription || ''}
                      onChange={(e) => updateSetting('aboutInfoDescription', e.target.value)}
                      rows={3}
                      className={AdminTokens.input.base + ' resize-none'}
                      placeholder="Description for the About page..."
                    />
                  </div>
                  <div>
                    <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                      Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      value={settings.aboutInfoKeywords || ''}
                      onChange={(e) => updateSetting('aboutInfoKeywords', e.target.value)}
                      className={AdminTokens.input.base}
                      placeholder="Scenic Design, Theatre, Bio"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                      OG Image URL
                    </label>
                    <ImageUploader
                      value={settings.aboutInfoOgImage || ''}
                      onChange={(url: string) => updateSetting('aboutInfoOgImage', url)}
                      label="Upload About Page Social Image"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        {activeTab === 'footer' && (
          <div className="space-y-6">
            <div className={AdminTokens.card.base}>
              <h3 className="text-lg text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Footer Content
              </h3>

              <div className="space-y-4">
                <div>
                  <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
                    Copyright Text
                  </label>
                  <input
                    type="text"
                    value={settings.footerCopyright}
                    onChange={(e) => updateSetting('footerCopyright', e.target.value)}
                    className={AdminTokens.input.base}
                    placeholder="© 2024 Brandon PT Davis. All rights reserved."
                  />
                </div>
              </div>
            </div>
          </div>
        )}
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
          Reset to Defaults
        </SecondaryButton>

        <button
          onClick={loadSettings}
          disabled={saving}
          className="text-xs tracking-wider uppercase text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          Discard Changes
        </button>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 px-4 py-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-3xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">Settings saved successfully!</span>
        </div>
      )}
    </div>
  );
}

