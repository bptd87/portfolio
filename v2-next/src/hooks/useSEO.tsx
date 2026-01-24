import { SEO } from '../components/SEO';
import { PageMetadata } from '../utils/seo/metadata';

/**
 * Helper hook for generating dynamic SEO based on page state
 */
export function useSEO(metadata: PageMetadata, structuredData?: any | any[]) {
    return <SEO metadata={metadata} structuredData={structuredData} />;
}
