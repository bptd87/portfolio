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

import React, { useEffect } from 'react';
import { PageMetadata, DEFAULT_METADATA } from '../utils/seo/metadata';

interface SEOProps {
  metadata: PageMetadata;
  structuredData?: any | any[];
}

export function SEO({ metadata, structuredData }: SEOProps) {
  useEffect(() => {
    // Set document title
    document.title = metadata.title;

    // Force body to have no margin or padding
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';

    // Ensure viewport meta tag exists
    let viewportElement = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (!viewportElement) {
      viewportElement = document.createElement('meta');
      viewportElement.setAttribute('name', 'viewport');
      document.head.appendChild(viewportElement);
    }
    viewportElement.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');

    // Get or create meta tags
    const setMetaTag = (name: string, content: string, useProperty = false) => {
      const attribute = useProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Basic meta tags
    setMetaTag('description', metadata.description);
    
    if (metadata.keywords && metadata.keywords.length > 0) {
      setMetaTag('keywords', metadata.keywords.join(', '));
    }

    if (metadata.author) {
      setMetaTag('author', metadata.author);
    }

    // Open Graph tags
    const ogType = metadata.ogType || 'website';
    const ogImage = metadata.ogImage || DEFAULT_METADATA.defaultOgImage;
    const ogUrl = metadata.canonicalPath 
      ? `${DEFAULT_METADATA.siteUrl}${metadata.canonicalPath}`
      : DEFAULT_METADATA.siteUrl;

    setMetaTag('og:title', metadata.title, true);
    setMetaTag('og:description', metadata.description, true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:url', ogUrl, true);
    setMetaTag('og:site_name', DEFAULT_METADATA.siteName, true);
    
    if (ogImage) {
      setMetaTag('og:image', ogImage.startsWith('http') ? ogImage : `${DEFAULT_METADATA.siteUrl}${ogImage}`, true);
      setMetaTag('og:image:alt', metadata.title, true);
    }

    // Article-specific Open Graph tags
    if (ogType === 'article') {
      if (metadata.publishedTime) {
        setMetaTag('article:published_time', metadata.publishedTime, true);
      }
      if (metadata.modifiedTime) {
        setMetaTag('article:modified_time', metadata.modifiedTime, true);
      }
      if (metadata.author) {
        setMetaTag('article:author', metadata.author, true);
      }
    }

    // Twitter Card tags
    const twitterCard = metadata.twitterCard || 'summary';
    setMetaTag('twitter:card', twitterCard);
    setMetaTag('twitter:title', metadata.title);
    setMetaTag('twitter:description', metadata.description);
    setMetaTag('twitter:site', DEFAULT_METADATA.twitterHandle);
    setMetaTag('twitter:creator', DEFAULT_METADATA.twitterHandle);
    
    if (ogImage) {
      setMetaTag('twitter:image', ogImage.startsWith('http') ? ogImage : `${DEFAULT_METADATA.siteUrl}${ogImage}`);
      setMetaTag('twitter:image:alt', metadata.title);
    }

    // Canonical URL
    let canonicalElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.href = ogUrl;

    // Structured Data (JSON-LD)
    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    // Add new structured data
    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      const dataArray = Array.isArray(structuredData) ? structuredData : [structuredData];
      script.text = JSON.stringify(dataArray.length === 1 ? dataArray[0] : dataArray);
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      // Note: We don't remove meta tags on unmount because the new page will update them
    };
  }, [metadata, structuredData]);

  // This component doesn't render anything
  return null;
}

/**
 * Helper hook for generating dynamic SEO based on page state
 */
export function useSEO(metadata: PageMetadata, structuredData?: any | any[]) {
  return <SEO metadata={metadata} structuredData={structuredData} />;
}