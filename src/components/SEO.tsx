/**
 * SEO Component
 * 
 * Dynamically manages all SEO meta tags for each page.
 * Handles: title, description, Open Graph, Twitter Cards, structured data
 * 
 * Usage:
 * <SEO metadata={PAGE_METADATA.home} />
 * or
 * <SEO metadata={generateArticleMetadata(article)} structuredData={articleSchema} />
 */

import { Helmet } from 'react-helmet-async';
import { PageMetadata, DEFAULT_METADATA } from '../utils/seo/metadata';

interface SEOProps {
  metadata?: PageMetadata;
  structuredData?: any | any[];
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
}

export function SEO({ metadata, structuredData, title, description, keywords, image }: SEOProps) {
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
  const canonicalUrl = effectiveMetadata.canonicalPath ? `${siteUrl}${effectiveMetadata.canonicalPath}` : siteUrl;

  // Person Schema (Optimized for Knowledge Graph / Artist Profile)
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Brandon PT Davis",
    "alternateName": "Brandon Davis",
    "url": siteUrl,
    "image": `${siteUrl}/profile-image.jpg`,
    "sameAs": [
      ...DEFAULT_METADATA.socialProfiles,
      "https://www.abouttheartists.com/artists/654981-brandon-pt-davis",
      "https://newswanshakespeare.com/company/",
      "https://www.scr.org/scr-blog/posts/meet-the-creative-team-of-million-dollar-quartet/"
    ],
    "jobTitle": "Scenic Designer",
    "description": "Award-winning scenic designer creating immersive theatrical experiences and educational resources.",
    "knowsAbout": ["Scenic Design", "Theatre Production", "Vectorworks", "3D Modeling", "Experiential Design"],
    "worksFor": [
      {
        "@type": "Organization",
        "name": "Live Experience Design"
      },
      {
        "@type": "Organization",
        "name": "New Swan Shakespeare Festival"
      },
      {
        "@type": "Organization",
        "name": "South Coast Repertory"
      }
    ],
    "memberOf": [
      {
        "@type": "Organization",
        "name": "United Scenic Artists 829"
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
    "award": ["Bobby G Award (2 Wins, 4 Nominations)"]
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
      schemas.push(...structuredData);
    } else {
      schemas.push(structuredData);
    }
  }

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {effectiveMetadata.keywords && <meta name="keywords" content={effectiveMetadata.keywords.join(', ')} />}
      <meta name="author" content={effectiveMetadata.author || "Brandon PT Davis"} />
      <link rel="canonical" href={canonicalUrl} />
      {effectiveMetadata.googleSiteVerification && <meta name="google-site-verification" content={effectiveMetadata.googleSiteVerification} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={DEFAULT_METADATA.siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={effectiveMetadata.ogType || 'website'} />

      {/* Twitter */}
      <meta name="twitter:card" content={effectiveMetadata.twitterCard || 'summary_large_image'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:creator" content={DEFAULT_METADATA.twitterHandle} />

      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(schemas)}
      </script>
    </Helmet>
  );
}

/**
 * Helper hook for generating dynamic SEO based on page state
 */
export function useSEO(metadata: PageMetadata, structuredData?: any | any[]) {
  return <SEO metadata={metadata} structuredData={structuredData} />;
}