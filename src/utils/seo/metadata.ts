/**
 * Centralized SEO Metadata Configuration
 * 
 * This file contains all SEO metadata for the site including:
 * - Page titles and descriptions
 * - Open Graph tags for social sharing
 * - Twitter Card data
 * - Canonical URLs
 * 
 * Update this file when adding new pages or changing content.
 */

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image';
  canonicalPath?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean; // Add noindex property
  googleSiteVerification?: string; // For GSC verification
}

// Import social links
import { SOCIAL_PROFILE_URLS } from '../../data/social-links';

// Site-wide defaults
export const DEFAULT_METADATA = {
  siteName: 'Brandon PT Davis',
  siteUrl: typeof window !== 'undefined' ? window.location.origin : '',
  author: 'Brandon PT Davis',
  twitterHandle: '@brandonptdavis', // Update if you create a Twitter/X account
  defaultOgImage: '/og-default.jpg', // TODO: Create and add default OG image
  defaultDescription: 'Award-winning scenic designer creating immersive theatrical experiences and educational resources for theatre designers and creative professionals.',
  socialProfiles: SOCIAL_PROFILE_URLS,
};

// Static page metadata
export const PAGE_METADATA: Record<string, PageMetadata> = {
  // HOME
  home: {
    title: 'Brandon PT Davis | Scenic Designer for Theatre & Opera',
    description: 'Award-winning scenic designer creating immersive theatrical experiences. Explore scenic design work, educational resources, and comprehensive design tools for theatre professionals.',
    keywords: ['scenic design', 'theatre design', 'set design', 'vectorworks', 'theatre resources', 'design education'],
    ogType: 'website',
    twitterCard: 'summary_large_image',
    canonicalPath: '/',
  },

  // PORTFOLIO
  portfolio: {
    title: 'Portfolio | Scenic Design & Experiential Work',
    description: 'Explore scenic design projects spanning theatre, opera, experiential design, and architectural visualization. From intimate black box productions to large-scale theatrical experiences.',
    keywords: ['scenic design portfolio', 'theatre portfolio', 'set design projects', 'experiential design'],
    ogType: 'website',
    twitterCard: 'summary_large_image',
    canonicalPath: '/portfolio',
  },

  'portfolio-scenic': {
    title: 'Scenic Design Portfolio | Theatre & Opera Productions',
    description: 'Scenic design work for theatre and opera productions. Explore detailed renderings, technical drawings, and production photos from professional theatrical work.',
    keywords: ['scenic design', 'theatre design', 'opera design', 'set design'],
    ogType: 'website',
    canonicalPath: '/portfolio?filter=scenic',
  },

  'portfolio-experiential': {
    title: 'Experiential Design Portfolio | Immersive Environments',
    description: 'Experiential design and immersive environment work blending theatrical design principles with interactive spaces.',
    keywords: ['experiential design', 'immersive design', 'environmental design'],
    ogType: 'website',
    canonicalPath: '/portfolio?filter=experiential',
  },

  'portfolio-rendering': {
    title: 'Rendering & Visualization Portfolio | 3D Design Work',
    description: 'Architectural visualization and 3D rendering work showcasing technical expertise in Vectorworks and digital design tools.',
    keywords: ['3D rendering', 'architectural visualization', 'vectorworks', 'design rendering'],
    ogType: 'website',
    canonicalPath: '/portfolio?filter=rendering',
  },

  'portfolio-documentation': {
    title: 'Design Documentation Portfolio | Technical Drawings',
    description: 'Technical design documentation, drafting packages, and construction drawings for theatrical productions.',
    keywords: ['technical drawings', 'design documentation', 'theatrical drafting', 'CAD drawings'],
    ogType: 'website',
    canonicalPath: '/portfolio?filter=documentation',
  },

  // ABOUT
  about: {
    title: 'About | Scenic Designer for Theatre & Opera',
    description: 'Learn about my journey as a scenic designer, combining theatrical artistry with technical innovation to create immersive experiences for theatre and opera.',
    keywords: ['scenic designer bio', 'theatre designer', 'design process'],
    ogType: 'profile',
    twitterCard: 'summary_large_image',
    canonicalPath: '/about',
  },

  news: {
    title: 'News | Latest Updates & Announcements',
    description: 'Latest news, project announcements, and updates from scenic design work.',
    keywords: ['theatre news', 'design news', 'project updates'],
    ogType: 'website',
    canonicalPath: '/news',
  },

  cv: {
    title: 'Curriculum Vitae | Professional Experience',
    description: 'Complete CV including education, professional experience, design credits, teaching history, and publications.',
    keywords: ['scenic designer cv', 'theatre resume', 'design credits'],
    ogType: 'profile',
    canonicalPath: '/cv',
  },

  collaborators: {
    title: 'Collaborators | Creative Partners & Directors',
    description: 'Talented directors, choreographers, and creative collaborators I\'ve had the privilege of working with throughout my career.',
    keywords: ['theatre collaborators', 'creative partners', 'directors'],
    ogType: 'website',
    canonicalPath: '/collaborators',
  },

  'teaching-philosophy': {
    title: 'Teaching Philosophy | Scenic Design Education',
    description: 'My approach to teaching scenic design: balancing traditional craft with emerging technologies, fostering collaboration, and preparing students for careers across theatre, film, and themed entertainment.',
    keywords: ['scenic design teaching', 'theatre education', 'design pedagogy', 'teaching philosophy'],
    ogType: 'article',
    canonicalPath: '/teaching-philosophy',
  },

  // RESOURCES
  resources: {
    title: 'Resources | Free Tools, Tutorials & Design Articles',
    description: 'Everything you need to elevate your scenic design practice. Free tools, video tutorials, 3D assets, and in-depth articles for theatre designers.',
    keywords: ['scenic design resources', 'theatre design tools', 'vectorworks tutorials', 'design articles'],
    ogType: 'website',
    twitterCard: 'summary_large_image',
    canonicalPath: '/resources',
  },

  'scenic-insights': {
    title: 'Articles | Design Philosophy & Tutorials',
    description: 'Deep dives into design philosophy, technology tutorials, hardware guides, and insights from the theatrical design field.',
    keywords: ['scenic design blog', 'design philosophy', 'theatre tutorials', 'design articles'],
    ogType: 'website',
    canonicalPath: '/scenic-insights',
  },

  'scenic-toolkit': {
    title: 'Scenic Toolkit | Designer\'s Resource Library',
    description: 'A curated resource library for scenic designers including software recommendations, materials resources, research tools, and hardware guides.',
    keywords: ['scenic design toolkit', 'design resources', 'theatre software', 'design tools'],
    ogType: 'website',
    canonicalPath: '/scenic-toolkit',
  },

  'studio': {
    title: 'Studio | Tutorials, Tools & Resources for Scenic Designers',
    description: 'Your one-stop destination for scenic design resources: video tutorials, web tools, model library, and curated industry links.',
    keywords: ['scenic design tutorials', 'theatre design tools', 'scenic design resources', 'vectorworks tutorials', '3D modeling'],
    ogType: 'website',
    canonicalPath: '/studio',
  },

  'scenic-studio': {
    title: 'Studio | Tutorials',
    description: 'Video tutorials on Vectorworks, 3D modeling, workflow optimization, and real-world project walkthroughs for scenic designers.',
    keywords: ['vectorworks tutorials', 'scenic design tutorials', '3D modeling', 'design workflow'],
    ogType: 'website',
    canonicalPath: '/studio',
  },

  'vectorworks-vault': {
    title: 'Vectorworks Vault | Free 3D Models & Venue Files',
    description: 'Download beautiful design assets, venue files, props, and architectural elements built entirely in Vectorworks. Production-ready 3D models for scenic designers.',
    keywords: ['vectorworks models', 'free 3D assets', 'theatre venue files', 'vectorworks downloads'],
    ogType: 'website',
    canonicalPath: '/vectorworks-vault',
  },

  'architecture-scale-converter': {
    title: '3D Print Scale Calculator | Theatrical Design to 3D Printing',
    description: 'Convert theatrical and architectural dimensions to 3D printable scale. Imperial to mm with printer compatibility check. Perfect for scenic model making.',
    keywords: ['3D printing scale', 'theatrical model scale', 'architectural scale converter', '3D print calculator', 'scenic design 3D printing'],
    ogType: 'website',
    canonicalPath: '/architecture-scale-converter',
  },

  'dimension-reference': {
    title: 'Dimension Reference Guide | Theatre, Architecture & Event Design',
    description: 'Comprehensive dimension database for scenic design. Standard sizes for furniture, flats, platforms, doors, event tables, and architectural elements.',
    keywords: ['scenic design dimensions', 'hollywood flat size', 'theatre platform dimensions', 'furniture dimensions', 'event table sizes', 'architectural standards'],
    ogType: 'website',
    canonicalPath: '/dimension-reference',
  },

  'model-reference-scaler': {
    title: 'Model Reference Scaler | Scale Photos for Model Making',
    description: 'Scale reference photos for architectural and scenic model making. Upload images, set scale using known dimensions, arrange on 8.5×11 or 11×17 sheets, export to PDF.',
    keywords: ['model making', 'scale reference', 'architectural model', 'scenic model', 'photo scaling', 'reference image scaling', 'model builder tool'],
    ogType: 'website',
    canonicalPath: '/model-reference-scaler',
  },

  'app-studio': {
    title: 'Studio | Design Tools',
    description: 'Free web-based tools for scenic designers and technical directors. 3D printing calculators, material estimators, and technical utilities.',
    keywords: ['scenic design tools', 'theatre design apps', 'technical theatre calculator', '3D printing theatre', 'scenic design software'],
    ogType: 'website',
    canonicalPath: '/studio',
  },

  // CONTACT
  contact: {
    title: 'Contact | Get In Touch',
    description: 'Get in touch to discuss scenic design projects, teaching opportunities, or speaking engagements.',
    keywords: ['contact scenic designer', 'hire designer', 'design inquiry'],
    ogType: 'website',
    canonicalPath: '/contact',
  },

  // SEARCH
  search: {
    title: 'Search | Find Projects, Articles & Resources',
    description: 'Search across all projects, articles, and resources to find exactly what you need.',
    keywords: ['search', 'find projects', 'search articles'],
    ogType: 'website',
    canonicalPath: '/search',
  },

  // ADMIN
  admin: {
    title: 'Admin Panel | Content Management',
    description: 'Administrative access for content management.',
    keywords: ['admin'],
    ogType: 'website',
    canonicalPath: '/admin',
    noindex: true, // Don't index admin page
  },

  // LEGAL PAGES
  faq: {
    title: 'FAQ | Frequently Asked Questions',
    description: 'Frequently asked questions about scenic design work, process, collaboration opportunities, and services.',
    keywords: ['FAQ', 'questions', 'scenic design help'],
    ogType: 'website',
    canonicalPath: '/faq',
  },

  'privacy-policy': {
    title: 'Privacy Policy | How We Protect Your Data',
    description: 'Our privacy policy outlining how we collect, use, and protect your personal information on brandonptdavis.com.',
    keywords: ['privacy policy', 'data protection', 'privacy'],
    ogType: 'website',
    canonicalPath: '/privacy-policy',
  },

  accessibility: {
    title: 'Accessibility Statement | Our Commitment to Inclusive Design',
    description: 'Our commitment to making brandonptdavis.com accessible to all users, including those with disabilities.',
    keywords: ['accessibility', 'WCAG', 'inclusive design'],
    ogType: 'website',
    canonicalPath: '/accessibility',
  },

  'terms-of-use': {
    title: 'Terms of Use | Website Terms & Conditions',
    description: 'Terms and conditions for using brandonptdavis.com, including copyright, usage rights, and legal disclaimers.',
    keywords: ['terms of use', 'terms and conditions', 'legal'],
    ogType: 'website',
    canonicalPath: '/terms-of-use',
  },

  '404': {
    title: '404 - Page Not Found',
    description: 'The page you\'re looking for doesn\'t exist or has been moved.',
    keywords: ['404', 'not found'],
    ogType: 'website',
    canonicalPath: '/404',
  },

  sitemap: {
    title: 'Sitemap | Complete Site Navigation',
    description: 'Complete sitemap of brandonptdavis.com including all pages, projects, articles, and resources.',
    keywords: ['sitemap', 'site navigation', 'site map'],
    ogType: 'website',
    canonicalPath: '/sitemap',
  },
};

/**
 * Generate metadata for a blog post/article
 */
export function generateArticleMetadata(article: {
  title: string;
  excerpt: string;
  coverImage?: string;
  category: string;
  date: string;
  author?: string;
  id: string;
  tags?: string[];
}): PageMetadata {
  // Use article tags for keywords, fallback to category-based keywords
  const keywords = article.tags && article.tags.length > 0
    ? [...article.tags.map(tag => tag.toLowerCase()), 'scenic design', 'theatre design']
    : [article.category.toLowerCase(), 'scenic design', 'theatre design', 'design article'];
  
  return {
    title: `${article.title} | Articles`,
    description: article.excerpt,
    keywords: keywords,
    ogImage: article.coverImage,
    ogType: 'article',
    twitterCard: 'summary_large_image',
    canonicalPath: `/scenic-insights/${article.id}`,
    author: article.author || DEFAULT_METADATA.author,
    publishedTime: article.date,
  };
}

/**
 * Generate metadata for a portfolio project
 */
export function generateProjectMetadata(project: {
  title: string;
  subtitle?: string;
  description?: string;
  heroImage?: string;
  cardImage?: string;
  year?: string | number;
  venue?: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  ogImage?: string;
}): PageMetadata {
  // Use custom SEO fields if provided, otherwise generate defaults
  const title = project.seoTitle || `${project.title} | Scenic Design Portfolio`;
  
  const description = project.seoDescription || 
    project.description?.substring(0, 160) ||
    `${project.title}${project.subtitle ? ': ' + project.subtitle : ''}. Scenic design for ${project.venue || 'theatrical production'}${project.year ? ' (' + project.year + ')' : ''}.`;

  const keywords = project.seoKeywords && project.seoKeywords.length > 0
    ? project.seoKeywords
    : ['scenic design', project.title.toLowerCase(), 'theatre production', 'set design'];

  const image = project.ogImage || project.heroImage || project.cardImage;

  return {
    title,
    description: description.substring(0, 160),
    keywords,
    ogImage: image,
    ogType: 'article',
    twitterCard: 'summary_large_image',
    canonicalPath: `/project/${project.slug}`,
  };
}

/**
 * Generate metadata for a tutorial/video
 */
export function generateTutorialMetadata(tutorial: {
  title: string;
  description: string;
  thumbnail?: string;
  category?: string;
  slug: string;
}): PageMetadata {
  return {
    title: `${tutorial.title} | Studio`,
    description: tutorial.description,
    keywords: ['vectorworks tutorial', 'scenic design tutorial', tutorial.category?.toLowerCase() || 'design tutorial'],
    ogImage: tutorial.thumbnail,
    ogType: 'article',
    twitterCard: 'summary_large_image',
    canonicalPath: `/studio/tutorial/${tutorial.slug}`,
  };
}

/**
 * Generate metadata for a vault item
 */
export function generateVaultItemMetadata(item: {
  title: string;
  description: string;
  previewImage?: string;
  category?: string;
  slug: string;
}): PageMetadata {
  return {
    title: `${item.title} | Vectorworks Vault`,
    description: item.description,
    keywords: ['vectorworks download', 'free 3D model', item.category?.toLowerCase() || 'design asset'],
    ogImage: item.previewImage,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    canonicalPath: `/vault/${item.slug}`,
  };
}

/**
 * Generate metadata for a news item
 */
export function generateNewsMetadata(newsItem: {
  title: string;
  excerpt: string;
  coverImage?: string;
  category: string;
  date: string;
  lastModified: string;
  id: string;
  tags?: string[];
}): PageMetadata {
  // Use news tags for keywords, fallback to category-based keywords
  const keywords = newsItem.tags && newsItem.tags.length > 0
    ? [...newsItem.tags.map(tag => tag.toLowerCase()), 'scenic design', 'theatre news']
    : [newsItem.category.toLowerCase(), 'scenic design', 'theatre news', 'design updates'];
  
  return {
    title: `${newsItem.title} | News`,
    description: newsItem.excerpt,
    keywords: keywords,
    ogImage: newsItem.coverImage,
    ogType: 'article',
    twitterCard: 'summary_large_image',
    canonicalPath: `/news/${newsItem.id}`,
    author: DEFAULT_METADATA.author,
    publishedTime: newsItem.date,
    modifiedTime: newsItem.lastModified,
  };
}