import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

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

  // About Page SEO
  aboutInfoTitle?: string;
  aboutInfoDescription?: string;
  aboutInfoKeywords?: string;
  aboutInfoOgImage?: string;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_configuration')
          .select('value')
          .eq('key', 'site_settings')
          .single();

        if (error) {
           // Ignore row not found error, just return empty/defaults
           if (error.code !== 'PGRST116') {
             console.error('Error fetching site settings:', error);
             setError('Failed to load site settings');
           }
        } else if (data && data.value) {
          setSettings(data.value);
        }
      } catch (err) {
        console.error('Unexpected error fetching settings:', err);
        setError('Failed to load site settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
}