/**
 * Social Media Links Configuration
 * 
 * Centralized social media profiles for Brandon PT Davis
 * Used across the site for footer, contact, and SEO metadata
 */

export interface SocialLink {
  platform: string;
  url: string;
  label: string;
  icon: string; // Icon name for lucide-react
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: 'LinkedIn',
    url: 'https://www.linkedin.com/in/brandonptdavis/',
    label: 'Connect on LinkedIn',
    icon: 'Linkedin',
  },
  {
    platform: 'Instagram',
    url: 'https://www.instagram.com/brandonptdavis/',
    label: 'Follow on Instagram',
    icon: 'Instagram',
  },
  {
    platform: 'YouTube',
    url: 'https://www.youtube.com/@BrandonPTDavisDesign/featured',
    label: 'Subscribe on YouTube',
    icon: 'Youtube',
  },
];

// Export just the URLs for SEO schema
export const SOCIAL_PROFILE_URLS = SOCIAL_LINKS.map(link => link.url);
