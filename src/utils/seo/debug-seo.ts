/**
 * SEO Debug Utility
 * 
 * Run this in the browser console to check current page SEO.
 * Useful for troubleshooting and verifying SEO implementation.
 * 
 * Usage in browser console:
 * > checkSEO()
 */

export function checkSEO() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SEO DEBUG REPORT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Page Title
  console.log('📝 TITLE:');
  console.log(`   ${document.title}`);
  console.log(`   Length: ${document.title.length} characters ${document.title.length > 60 ? '⚠️  (too long, should be < 60)' : '✅'}`);
  console.log('');

  // Meta Description
  const description = document.querySelector('meta[name="description"]');
  console.log('📄 DESCRIPTION:');
  if (description) {
    const content = description.getAttribute('content') || '';
    console.log(`   ${content}`);
    console.log(`   Length: ${content.length} characters ${content.length < 150 ? '⚠️  (too short, should be 150-160)' : content.length > 160 ? '⚠️  (too long, should be 150-160)' : '✅'}`);
  } else {
    console.log('   ❌ MISSING - No meta description found!');
  }
  console.log('');

  // Keywords
  const keywords = document.querySelector('meta[name="keywords"]');
  console.log('🏷️  KEYWORDS:');
  if (keywords) {
    const content = keywords.getAttribute('content') || '';
    const keywordArray = content.split(',').map(k => k.trim());
    console.log(`   ${keywordArray.join(', ')}`);
    console.log(`   Count: ${keywordArray.length} keywords ${keywordArray.length < 3 ? '⚠️  (too few, aim for 3-7)' : keywordArray.length > 10 ? '⚠️  (too many, aim for 3-7)' : '✅'}`);
  } else {
    console.log('   ⚠️  No keywords found');
  }
  console.log('');

  // Canonical URL
  const canonical = document.querySelector('link[rel="canonical"]');
  console.log('🔗 CANONICAL URL:');
  if (canonical) {
    console.log(`   ${canonical.getAttribute('href')} ✅`);
  } else {
    console.log('   ❌ MISSING - No canonical URL found!');
  }
  console.log('');

  // Open Graph Tags
  console.log('📱 OPEN GRAPH TAGS:');
  const ogTags = {
    'og:title': document.querySelector('meta[property="og:title"]'),
    'og:description': document.querySelector('meta[property="og:description"]'),
    'og:image': document.querySelector('meta[property="og:image"]'),
    'og:url': document.querySelector('meta[property="og:url"]'),
    'og:type': document.querySelector('meta[property="og:type"]'),
    'og:site_name': document.querySelector('meta[property="og:site_name"]'),
  };

  Object.entries(ogTags).forEach(([tag, element]) => {
    if (element) {
      const content = element.getAttribute('content') || '';
      console.log(`   ${tag}: ${content.substring(0, 80)}${content.length > 80 ? '...' : ''} ✅`);
    } else {
      console.log(`   ${tag}: ❌ MISSING`);
    }
  });
  console.log('');

  // Twitter Card Tags
  console.log('🐦 TWITTER CARD TAGS:');
  const twitterTags = {
    'twitter:card': document.querySelector('meta[name="twitter:card"]'),
    'twitter:title': document.querySelector('meta[name="twitter:title"]'),
    'twitter:description': document.querySelector('meta[name="twitter:description"]'),
    'twitter:image': document.querySelector('meta[name="twitter:image"]'),
  };

  Object.entries(twitterTags).forEach(([tag, element]) => {
    if (element) {
      const content = element.getAttribute('content') || '';
      console.log(`   ${tag}: ${content.substring(0, 80)}${content.length > 80 ? '...' : ''} ✅`);
    } else {
      console.log(`   ${tag}: ❌ MISSING`);
    }
  });
  console.log('');

  // Structured Data
  const structuredDataScripts = document.querySelectorAll('script[type="application/ld+json"]');
  console.log('📊 STRUCTURED DATA (JSON-LD):');
  if (structuredDataScripts.length > 0) {
    structuredDataScripts.forEach((script, index) => {
      try {
        const data = JSON.parse(script.textContent || '{}');
        console.log(`   Schema ${index + 1}: ${data['@type']} ✅`);
        console.log(`   Data:`, data);
      } catch (e) {
        console.log(`   Schema ${index + 1}: ❌ INVALID JSON`);
      }
    });
  } else {
    console.log('   ⚠️  No structured data found');
  }
  console.log('');

  // Images Alt Text Check
  const images = document.querySelectorAll('img');
  const imagesWithoutAlt = Array.from(images).filter(img => !img.getAttribute('alt'));
  console.log('🖼️  IMAGE ALT TEXT:');
  console.log(`   Total images: ${images.length}`);
  console.log(`   Images without alt: ${imagesWithoutAlt.length} ${imagesWithoutAlt.length === 0 ? '✅' : '⚠️'}`);
  if (imagesWithoutAlt.length > 0 && imagesWithoutAlt.length <= 5) {
    imagesWithoutAlt.forEach(img => {
      console.log(`   Missing alt: ${img.src.substring(0, 80)}...`);
    });
  }
  console.log('');

  // Page Performance
  console.log('⚡ QUICK PERFORMANCE CHECK:');
  if (window.performance && window.performance.timing) {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const connectTime = perfData.responseEnd - perfData.requestStart;
    console.log(`   Page load time: ${pageLoadTime}ms ${pageLoadTime < 3000 ? '✅' : pageLoadTime < 5000 ? '⚠️  (slow)' : '❌ (very slow)'}`);
    console.log(`   Server response: ${connectTime}ms ${connectTime < 200 ? '✅' : connectTime < 500 ? '⚠️  (slow)' : '❌ (very slow)'}`);
  }
  console.log('');

  // Recommendations
  console.log('💡 RECOMMENDATIONS:');
  const recommendations = [];
  
  if (document.title.length > 60) {
    recommendations.push('Shorten page title to under 60 characters');
  }
  if (!description || (description.getAttribute('content')?.length || 0) < 150) {
    recommendations.push('Add or extend meta description to 150-160 characters');
  }
  if (imagesWithoutAlt.length > 0) {
    recommendations.push(`Add alt text to ${imagesWithoutAlt.length} image(s)`);
  }
  if (!canonical) {
    recommendations.push('Add canonical URL');
  }
  if (structuredDataScripts.length === 0) {
    recommendations.push('Add structured data (JSON-LD) for better search results');
  }

  if (recommendations.length > 0) {
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  } else {
    console.log('   ✅ Everything looks good!');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📖 For more info, see /docs/SEO-SYSTEM.md');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

/**
 * Check if a specific meta tag exists
 */
export function checkMeta(name: string) {
  const meta = document.querySelector(`meta[name="${name}"]`) || 
                document.querySelector(`meta[property="${name}"]`);
  if (meta) {
    console.log(`${name}:`, meta.getAttribute('content'));
  } else {
    console.log(`${name}: Not found`);
  }
}

/**
 * List all meta tags
 */
export function listAllMeta() {
  const allMeta = document.querySelectorAll('meta');
  console.log('\n📋 ALL META TAGS:\n');
  allMeta.forEach(meta => {
    const name = meta.getAttribute('name') || meta.getAttribute('property') || 'unknown';
    const content = meta.getAttribute('content') || '';
    console.log(`${name}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
  });
  console.log('');
}

// Make functions available in browser console
if (typeof window !== 'undefined') {
  (window as any).checkSEO = checkSEO;
  (window as any).checkMeta = checkMeta;
  (window as any).listAllMeta = listAllMeta;
  
  console.log('🔍 SEO Debug Tools Loaded');
  console.log('Run: checkSEO() - Full SEO report');
  console.log('Run: checkMeta("og:title") - Check specific tag');
  console.log('Run: listAllMeta() - List all meta tags');
}
