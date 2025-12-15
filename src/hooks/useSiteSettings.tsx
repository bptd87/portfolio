/**
 * SITE SETTINGS HOOK
 * 
 * React hook for fetching global site settings.
 * Use this in public-facing components that need site configuration.
 */

import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface SiteSettings {
  // Homepage Hero
  heroTitle?: string;
  heroSubtitle?: string;

  // About/Bio
  bioText?: string;
  profileImageUrl?: string;
  introText?: string;
  aboutText?: string;
  philosophyText?: string;

  // Contact Information
  contactEmail?: string;
  contactPhone?: string;
  contactLocation?: string;
  availabilityStatus?: string;

  // CV/Resume
  phone?: string;
  email?: string;
  location?: string;
  website?: string;
  upcomingProductions?: Array<{ production: string; director?: string; designer?: string; company: string; year: string }>;
  recentProductions?: Array<{ production: string; director?: string; designer?: string; company: string; year: string }>;
  assistantDesignProductions?: Array<{ production: string; director?: string; designer?: string; company: string; year: string }>;
  resumeUrl?: string;
  resumeFilename?: string;
  resumeLastUpdated?: string;

  // SEO Defaults
  siteTitle?: string;
  siteDescription?: string;
  defaultOgImage?: string;

  // Footer
  footerCopyright?: string;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
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
          setSettings(data.settings || {});
        } else {
          setError('Failed to load site settings');
        }
      } catch (err) {
        setError('Failed to load site settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
}