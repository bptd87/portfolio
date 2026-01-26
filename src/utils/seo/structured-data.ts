/**
 * Structured Data (JSON-LD) Generators
 * 
 * Creates Schema.org structured data for rich snippets in search results.
 * This helps Google and other search engines understand your content better.
 * 
 * Types implemented:
 * - Person/Organization
 * - Article
 * - CreativeWork (for projects)
 * - BreadcrumbList
 * - WebSite (with search action)
 * - FAQPage
 * - ProfilePage
 * - HowTo
 */

import { DEFAULT_METADATA } from './metadata';

interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

/**
 * Person schema for About page
 */
export function generatePersonSchema(data: {
  name: string;
  jobTitle: string;
  description: string;
  image?: string;
  url?: string;
  sameAs?: string[]; // Social media profiles
  email?: string;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.name,
    jobTitle: data.jobTitle,
    description: data.description,
    image: data.image,
    url: data.url || DEFAULT_METADATA.siteUrl,
    sameAs: data.sameAs || [],
    email: data.email,
  };
}

/**
 * Organization schema (alternative to Person)
 */
export function generateOrganizationSchema(data: {
  name: string;
  description: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    description: data.description,
    url: data.url || DEFAULT_METADATA.siteUrl,
    logo: data.logo,
    sameAs: data.sameAs || [],
  };
}

/**
 * Article schema for blog posts
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  datePublished: string;
  dateModified?: string;
  author: string | { name: string; url?: string; image?: string };
  url: string;
  publisher?: {
    name: string;
    logo?: string;
  };
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: typeof article.author === 'string' 
      ? { '@type': 'Person', name: article.author }
      : {
          '@type': 'Person',
          name: article.author.name,
          url: article.author.url,
          image: article.author.image
        },
    publisher: article.publisher ? {
      '@type': 'Organization',
      name: article.publisher.name,
      logo: article.publisher.logo ? {
        '@type': 'ImageObject',
        url: article.publisher.logo,
      } : undefined,
    } : undefined,
    url: article.url,
  };
}

/**
 * CreativeWork schema for portfolio projects
 */
export function generateCreativeWorkSchema(project: {
  name: string;
  description: string;
  image?: string;
  dateCreated?: string;
  creator: string;
  url: string;
  genre?: string;
  keywords?: string[];
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.name,
    description: project.description,
    image: project.image,
    dateCreated: project.dateCreated,
    creator: {
      '@type': 'Person',
      name: project.creator,
    },
    url: project.url,
    genre: project.genre || 'Scenic Design',
    keywords: project.keywords?.join(', '),
  };
}

/**
 * VideoObject schema for tutorials
 */
export function generateVideoSchema(video: {
  name: string;
  description: string;
  thumbnailUrl?: string;
  uploadDate?: string;
  duration?: string; // ISO 8601 format, e.g., "PT10M30S" for 10 minutes 30 seconds
  contentUrl?: string;
  embedUrl?: string;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    duration: video.duration,
    contentUrl: video.contentUrl,
    embedUrl: video.embedUrl,
  };
}

/**
 * SoftwareApplication schema for software pages
 */
export function generateSoftwareSchema(software: {
  name: string;
  description: string;
  applicationCategory: string;
  operatingSystem: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
  image?: string;
  url?: string;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: software.name,
    description: software.description,
    applicationCategory: software.applicationCategory,
    operatingSystem: software.operatingSystem,
    offers: software.offers ? {
      '@type': 'Offer',
      price: software.offers.price,
      priceCurrency: software.offers.priceCurrency,
    } : undefined,
    image: software.image,
    url: software.url || DEFAULT_METADATA.siteUrl,
  };
}

/**
 * BreadcrumbList schema for navigation
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{
  name: string;
  url: string;
}>): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/**
 * FAQPage schema for FAQ content
 */
export function generateFaqSchema(items: Array<{ question: string; answer: string }>): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * ProfilePage schema for About page
 */
export function generateProfilePageSchema(data: {
  name: string;
  url: string;
  person: StructuredData;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: data.name,
    url: data.url,
    mainEntity: data.person,
  };
}

/**
 * HowTo schema for tutorial steps
 */
export function generateHowToSchema(data: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string }>;
  image?: string;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: data.name,
    description: data.description,
    image: data.image,
    step: data.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

/**
 * ItemList schema for collections of tools or resources
 */
export function generateItemListSchema(data: {
  name: string;
  description?: string;
  items: Array<{ name: string; url: string; description?: string }>;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: data.name,
    description: data.description,
    itemListElement: data.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
      item: {
        '@type': 'WebPage',
        name: item.name,
        url: item.url,
        description: item.description,
      },
    })),
  };
}

/**
 * WebSite schema with search action for homepage
 */
export function generateWebSiteSchema(data: {
  name: string;
  url: string;
  description: string;
  searchUrl?: string;
}): StructuredData {
  const schema: StructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: data.name,
    url: data.url,
    description: data.description,
  };

  // Add search action if search URL is provided
  if (data.searchUrl) {
    schema.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${data.searchUrl}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    };
  }

  return schema;
}

/**
 * Helper function to inject structured data into page
 */
export function injectStructuredData(data: StructuredData | StructuredData[]): string {
  const dataArray = Array.isArray(data) ? data : [data];
  return JSON.stringify(dataArray.length === 1 ? dataArray[0] : dataArray);
}
