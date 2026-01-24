"use client";

/**
 * SEO Component (Client)
 * 
 * Dynamically manages all SEO meta tags for each page.
 * Handles: title, description, Open Graph, Twitter Cards, structured data
 * 
 * Usage:
 * <SEO metadata={PAGE_METADATA.home} />
 * or
 * <SEO metadata={generateArticleMetadata(article)} structuredData={articleSchema} />
 */

import type { ComponentType } from 'react';
import { Helmet } from 'react-helmet-async';
import { PageMetadata, DEFAULT_METADATA } from '../utils/seo/metadata';

const HelmetCompat = Helmet as unknown as ComponentType<any>;

export interface SEOProps {
  metadata?: PageMetadata;
  structuredData?: any | any[];
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
}

export function SEOClient({ metadata, structuredData, title, description, keywords, image }: SEOProps) {
  const siteUrl = DEFAULT_METADATA.siteUrl;

  // Merge direct props with metadata object, falling back to defaults
  // Note: DEFAULT_METADATA uses defaultDescription, not description
  const effectiveMetadata: PageMetadata = {
    ...DEFAULT_METADATA,
    // Cast to any to avoid strict type checks if PageMetadata structure varies slightly, 
    // but primarily we prioritize the direct props or the passed metadata
    ...metadata,
    title: title || metadata?.title || DEFAULT_METADATA.siteName,
    description: description || metadata?.description || DEFAULT_METADATA.defaultDescription,
    keywords: keywords || metadata?.keywords || ['Scenic Designer', 'Brandon PT Davis', 'Theatre Design'],
    ogImage: image || metadata?.ogImage || DEFAULT_METADATA.defaultOgImage,
  };

  // Construct title - append branding if not present
  const baseTitle = effectiveMetadata.title;
  const fullTitle = baseTitle.includes('Brandon PT Davis')
    ? baseTitle
    : `${baseTitle} | Brandon PT Davis - Scenic Designer`;

  const metaDescription = effectiveMetadata.description;
  const ogImage = effectiveMetadata.ogImage ? (effectiveMetadata.ogImage.startsWith('http') ? effectiveMetadata.ogImage : `${siteUrl}${effectiveMetadata.ogImage}`) : `${siteUrl}${DEFAULT_METADATA.defaultOgImage}`;
  const canonicalUrl = effectiveMetadata.canonicalPath
    ? (effectiveMetadata.canonicalPath.startsWith('http') ? effectiveMetadata.canonicalPath : `${siteUrl}${effectiveMetadata.canonicalPath}`)
    : (typeof window !== 'undefined' ? window.location.href : siteUrl);

  // Person Schema (Optimized for Knowledge Graph / Artist Profile)
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Brandon PT Davis",
    "alternateName": ["Brandon Davis", "Brandon P.T. Davis"],
    "url": siteUrl,
    "image": `${siteUrl}/profile-image.jpg`,
    "sameAs": [
      "https://www.linkedin.com/in/brandonptdavis",
      "https://www.usa829.org/Member-Profile/MemberID/15357",
      "https://www.instagram.com/brandonptdavis",
      "https://www.youtube.com/@BrandonPTDavis",
      "https://vimeo.com/brandonptdavis",
      ...DEFAULT_METADATA.socialProfiles
    ],
    "jobTitle": ["Scenic Designer", "Experiential Designer"],
    "description": "Scenic and experiential designer based in Southern California, specializing in theatre, immersive environments, and narrative-driven spatial design. Over fifteen years of professional experience designing for regional theatre, summer stock, and experiential installations.",
    "knowsAbout": [
      "Scenic Design",
      "Experiential Design",
      "Theatre Set Design",
      "Spatial Storytelling",
      "Production Design",
      "Vectorworks",
      "Twinmotion",
      "Cinema 4D",
      "3D Modeling",
      "Projection Design",
      "Immersive Environments",
      "Entertainment Design"
    ],
    "hasOccupation": {
      "@type": "Occupation",
      "name": "Scenic Designer",
      "occupationalCategory": "27-1027.00",
      "description": "Designs sets for theatre, film, television, and experiential events"
    },
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "CA",
      "addressCountry": "US",
      "addressLocality": "Southern California"
    },
    "worksFor": {
      "@type": "Organization",
      "name": "Brandon PT Davis Design LLC",
      "url": siteUrl
    },
    "memberOf": [
      {
        "@type": "Organization",
        "name": "United Scenic Artists Local USA 829",
        "url": "https://www.usa829.org/Member-Profile/MemberID/15357"
      }
    ],
    "alumniOf": [
      {
        "@type": "CollegeOrUniversity",
        "name": "Stephens College"
      },
      {
        "@type": "CollegeOrUniversity",
        "name": "University of California, Irvine"
      }
    ],
    "award": ["Bobby G Award (2 Wins, 4 Nominations)"],
    "seeks": "Scenic design projects, experiential design collaborations, teaching opportunities"
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": siteUrl
    }]
  };

  // Generate breadcrumbs from canonical path segments
  if (effectiveMetadata.canonicalPath && effectiveMetadata.canonicalPath !== '/') {
    const segments = effectiveMetadata.canonicalPath.split('/').filter(Boolean);
    let currentPath = siteUrl;

    segments.forEach((segment, index) => {
      // Clean up segment name (remove query params, capitalize, etc.)
      const cleanSegment = segment.split('?')[0];
      const name = cleanSegment.charAt(0).toUpperCase() + cleanSegment.slice(1).replace(/-/g, ' ');

      currentPath += `/${cleanSegment}`;

      breadcrumbSchema.itemListElement.push({
        "@type": "ListItem",
        "position": index + 2,
        "name": name,
        "item": currentPath
      });
    });
  }

  // Combine schemas
  const schemas = [personSchema, breadcrumbSchema];
  if (structuredData) {
    if (Array.isArray(structuredData)) {
      // Filter out invalid schemas (must have @context string)
      const validSchemas = structuredData.filter(schema => {
        // Safe check for object and @context property
        if (!schema || typeof schema !== 'object') return false;
        const context = (schema as any)['@context'];
        return typeof context === 'string';
      });
      schemas.push(...validSchemas);
    } else if (typeof structuredData === 'object') {
      // Safe check for object and @context property
      const context = (structuredData as any)['@context'];
      if (typeof context === 'string') {
        schemas.push(structuredData);
      }
    }
  }

  return (
    <HelmetCompat>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {effectiveMetadata.keywords && <meta name="keywords" content={effectiveMetadata.keywords.join(', ')} />}
      <meta name="author" content={effectiveMetadata.author || "Brandon PT Davis"} />
      {effectiveMetadata.noindex && <meta name="robots" content="noindex" />}
      <link rel="canonical" href={canonicalUrl} />
      {effectiveMetadata.googleSiteVerification && <meta name="google-site-verification" content={effectiveMetadata.googleSiteVerification} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={DEFAULT_METADATA.siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={effectiveMetadata.ogType || 'website'} />

      {/* Twitter */}
      <meta name="twitter:card" content={effectiveMetadata.twitterCard || 'summary_large_image'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:creator" content={DEFAULT_METADATA.twitterHandle} />

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
    </HelmetCompat>
  );
}
