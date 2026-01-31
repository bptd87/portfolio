import { ContentBlock, BlockType } from '../components/shared/BlockRenderer';

// Helper to extract Cloudinary URL from WordPress image HTML with data attributes
const extractCloudinaryUrl = (imgHtml: string): string | null => {
  const publicIdMatch = /data-public-id="([^"]+)"/.exec(imgHtml);
  const versionMatch = /data-version="([^"]+)"/.exec(imgHtml);
  const formatMatch = /data-format="([^"]+)"/.exec(imgHtml);
  
  if (publicIdMatch) {
    const publicId = publicIdMatch[1];
    const version = versionMatch ? versionMatch[1] : '';
    const format = formatMatch ? formatMatch[1] : 'jpg';
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dsq2xg1iw';
    
    // Construct Cloudinary URL with optimizations
    const versionPart = version ? `v${version}/` : '';
    return `https://res.cloudinary.com/${cloudName}/images/f_webp,q_auto/${versionPart}${publicId}`;
  }
  
  return null;
};

// Helper to decode HTML entities
const decodeHtmlEntities = (text: string): string => {
  // Server-side: decode common entities manually
  return text
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#160;/g, ' ');
};

// Helper to strip HTML tags but preserve text content
const stripHtmlTags = (html: string): string => {
  return html
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Combined cleaner for accordion content
const cleanAccordionContent = (html: string): string => {
  const withoutTags = stripHtmlTags(html);
  const decoded = decodeHtmlEntities(withoutTags);
  return decoded.trim();
};


// Helper to find balanced closing tag
const findBalancedTag = (str: string, startIndex: number, tagName: string): string | null => {
  let depth = 0;
  const tagRegex = new RegExp(`<\\/?${tagName}(\\s|[>/])`, 'gi');
  tagRegex.lastIndex = startIndex;

  let match;
  while ((match = tagRegex.exec(str)) !== null) {
    if (match[0].toLowerCase().startsWith(`<${tagName}`)) {
      depth++;
    } else {
      depth--;
    }

    if (depth === 0) {
      const closeTagEnd = str.indexOf('>', match.index) + 1;
      return str.substring(startIndex, closeTagEnd);
    }
  }
  return null;
};

export const parseWpContent = (html: string | any[] | null | undefined): ContentBlock[] => {
  if (!html) return [];
  if (Array.isArray(html)) {
      return html as ContentBlock[];
  }
  if (typeof html !== 'string') {
      console.warn('parseWpContent received non-string non-array:', typeof html);
      return [];
  }

  const blocks: ContentBlock[] = [];
  const cleanHtml = html.replace(/<p>&nbsp;<\/p>/g, '');
  let idCounter = 1;

  // 1. Split content by top-level blocks more robustly
  // We'll use a temporary placeholder strategy to preserve complex blocks
  const protectedBlocks: { id: string; content: string; type: string }[] = [];

  // Protect Accordions
  let processedHtml = cleanHtml.replace(
    /<div[^>]*class="[^"]*wp-block-accordion[\s\S]*?<\/div>\s*<\/div>/g,
    (match) => {
      const id = `__PROTECTED_ACCORDION_${idCounter++}__`;
      protectedBlocks.push({ id, content: match, type: 'accordion' });
      return id;
    }
  );

  // Protect Video/Embed Blocks (YouTube, Vimeo, etc.)
  processedHtml = processedHtml.replace(
    /<figure[^>]*class="[^"]*wp-block-embed[^"]*"[^>]*>[\s\S]*?<\/figure>/gi,
    (match) => {
      const id = `__PROTECTED_VIDEO_${idCounter++}__`;
      protectedBlocks.push({ id, content: match, type: 'video' });
      return id;
    }
  );

  // Protect WordPress Video Blocks
  processedHtml = processedHtml.replace(
    /<figure[^>]*class="[^"]*wp-block-video[^"]*"[^>]*>[\s\S]*?<\/figure>/gi,
    (match) => {
      const id = `__PROTECTED_VIDEO_${idCounter++}__`;
      protectedBlocks.push({ id, content: match, type: 'video' });
      return id;
    }
  );

  // Protect standalone WordPress Image Blocks
  processedHtml = processedHtml.replace(
    /<figure[^>]*class="[^"]*wp-block-image[^"]*"[^>]*>[\s\S]*?<\/figure>/gi,
    (match) => {
      const id = `__PROTECTED_IMAGE_${idCounter++}__`;
      protectedBlocks.push({ id, content: match, type: 'image' });
      return id;
    }
  );

  // Protect Galleries (robust balanced-tag detection)
  // We loop through finding the start, then find the matching end tag to handle nesting
  const galleryStartRegex = /<(figure|div)[^>]*class="[^"]*wp-block-gallery[^"]*"[^>]*>/gi;
  let galleryMatch;

  // Note: We restart the search after each replacement to avoid index issues
  while ((galleryMatch = galleryStartRegex.exec(processedHtml)) !== null) {
    const tagName = galleryMatch[1];
    const startIndex = galleryMatch.index;
    const fullContent = findBalancedTag(processedHtml, startIndex, tagName);

    if (fullContent) {
      const id = `__PROTECTED_GALLERY_${idCounter++}__`;
      protectedBlocks.push({ id, content: fullContent, type: 'gallery' });

      // Replace the content with ID
      const before = processedHtml.substring(0, startIndex);
      const after = processedHtml.substring(startIndex + fullContent.length);
      processedHtml = before + id + after;

      // Reset regex to restart search from the beginning (simplest way to handle shifting indices)
      galleryStartRegex.lastIndex = 0;
    } else {
      // Could not find balanced tag, skip this match to avoid infinite loop
      // Manually advance regex past this start tag
      galleryStartRegex.lastIndex = startIndex + 1;
    }
  }

  // Simple regex to find standard top-level tags in the remaining HTML
  // Added div to catch WordPress blocks that might be wrapped in divs
  const tagRegex = /<(p|h[1-6]|ul|ol|blockquote|figure|div)(.*?)>([\s\S]*?)<\/\1>/gi;
  let lastIndex = 0;
  let match;

  while ((match = tagRegex.exec(processedHtml)) !== null) {
    const [fullMatch, tag, attrs, content] = match;

    // Check for protected blocks in the match
    const preText = processedHtml.substring(lastIndex, match.index).trim();

    // Check for protected IDs in preText
    protectedBlocks.forEach(pb => {
      if (preText.includes(pb.id)) {
        // Parse the protected block
        if (pb.type === 'video') {
          // Extract video URL from WordPress embed block
          let videoUrl = '';
          let videoType: 'youtube' | 'vimeo' | 'custom' = 'youtube';

          // Try to find iframe src (most common for embeds)
          const iframeMatch = /<iframe[^>]*src="([^"]+)"[^>]*>/i.exec(pb.content);
          if (iframeMatch) {
            videoUrl = iframeMatch[1];
            
            // Determine video type from URL
            if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
              videoType = 'youtube';
            } else if (videoUrl.includes('vimeo.com')) {
              videoType = 'vimeo';
            } else {
              videoType = 'custom';
            }
          } else {
            // Try to find blockquote with link (WordPress embed fallback)
            const linkMatch = /<a[^>]*href="([^"]+)"[^>]*>/i.exec(pb.content);
            if (linkMatch) {
              videoUrl = linkMatch[1];
              
              if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                videoType = 'youtube';
              } else if (videoUrl.includes('vimeo.com')) {
                videoType = 'vimeo';
              }
            }
          }

          if (videoUrl) {
            blocks.push({
              id: pb.id,
              type: 'video',
              content: videoUrl,
              metadata: { videoType }
            });
          }
        } else if (pb.type === 'image') {
          // Extract image from WordPress image block
          // First try to extract Cloudinary URL from data attributes
          const cloudinaryUrl = extractCloudinaryUrl(pb.content);
          const imgMatch = /<img[\s\S]*?src="([^"]+)"[\s\S]*?>/i.exec(pb.content);
          const captionMatch = /<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i.exec(pb.content);
          const altMatch = /alt="([^"]*)"/i.exec(pb.content);


          // Use Cloudinary URL if available, otherwise fall back to src
          const imageUrl = cloudinaryUrl || (imgMatch ? imgMatch[1] : null);
          if (imageUrl) {
            blocks.push({
              id: pb.id,
              type: 'image',
              content: imageUrl,
              metadata: {
                caption: captionMatch ? captionMatch[1].replace(/<[^>]+>/g, '') : undefined,
                alt: altMatch ? altMatch[1] : undefined
              }
            });
          }
        } else if (pb.type === 'accordion') {
          // Extract items
          const itemRegex = /<div.*?class="wp-block-accordion-item.*?<button.*?class="wp-block-accordion-heading__toggle.*?<span.*?>(.*?)<\/span>.*?<div.*?class="wp-block-accordion-panel.*?>(.*?)<\/div>/gs;
          // Note: This regex is fragile. A better way for accordions:
          const accordionItems: { question: string; answer: string }[] = [];
          let itemMatch;
          while ((itemMatch = itemRegex.exec(pb.content)) !== null) {
            accordionItems.push({
              question: cleanAccordionContent(itemMatch[1]),
              answer: cleanAccordionContent(itemMatch[2])
            });
          }
          // If regex failed, try simpler split strategy
          if (accordionItems.length === 0) {
            const toggles = [...pb.content.matchAll(/class="wp-block-accordion-heading__toggle"[^>]*>[\s\S]*?<span[^>]*>(.*?)<\/span>/g)].map(m => m[1]);
            const panels = [...pb.content.matchAll(/class="wp-block-accordion-panel"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g)].map(m => m[1]);
            toggles.forEach((t, i) => {
              accordionItems.push({
                question: cleanAccordionContent(t),
                answer: cleanAccordionContent(panels[i] || '')
              });
            });
          }

          blocks.push({
            id: pb.id,
            type: 'accordion',
            content: '',
            metadata: { items: accordionItems }
          });
        } else if (pb.type === 'gallery') {


          // Robust multi-line image extraction
          // 1. Trim whitespace to ensure start/end anchors work
          const content = pb.content.trim();
          
          // 2. Strip the outer tag (figure or div) to avoid matching it as a nested figure
          // Using non-greedy replacement for first opening tag and last closing tag
          let innerContent = content.replace(/^<(figure|div)[^>]*>/i, '').replace(/<\/(figure|div)>$/i, '');

          // 3. Now match individual inner items (figure, div, or li)
          // We use a permissive regex that looks for container tags commonly used in WP galleries
          const itemRegex = /<(figure|div|li)[^>]*>([\s\S]*?)<\/\1>/gi;
          const itemMatches = [...innerContent.matchAll(itemRegex)];

          let images: { url: string; caption?: string; alt?: string }[] = [];

          if (itemMatches.length > 0) {
            images = itemMatches.map(m => {
              const itemHtml = m[0];
              // Try Cloudinary URL first, then fall back to src
              const cloudinaryUrl = extractCloudinaryUrl(itemHtml);
              const imgMatch = /<img[\s\S]*?src="([^"]+)"[\s\S]*?>/i.exec(itemHtml);
              // Greedy match for caption content inside figcaption or just caption class
              const captionMatch = /<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i.exec(itemHtml);
              const altMatch = /alt="([^"]*)"/i.exec(itemHtml);

              const imageUrl = cloudinaryUrl || (imgMatch ? imgMatch[1] : null);

              if (imageUrl) {
                return {
                  url: imageUrl,
                  caption: captionMatch ? captionMatch[1].replace(/<[^>]+>/g, '') : undefined,
                  alt: altMatch ? altMatch[1] : undefined
                };
              }
              return null;
            }).filter(img => img !== null) as any;
          } else {
            // Fallback: try to find img tags and adjacent figcaptions loosely if strict structure failed
            // This is risky but catches "flat" formats
             const imgMatches = [...content.matchAll(/<img[\s\S]*?src="([^"]+)"[\s\S]*?>/gi)];
             images = imgMatches.map(m => {
               // Try to peck for a caption after the image? No, safer to just return url.
               return { url: m[1] };
             });
          }

          blocks.push({
            id: pb.id,
            type: 'gallery',
            content: '',
            metadata: { images, galleryStyle: 'carousel' }
          });
        }
      }
    });

    // 2. Handle the current block (the one found by tagRegex)
    // Identify top-level headings, blockquotes, lists, images
    let type: BlockType = 'paragraph';
    let metadata: any = {};

    if (tag.startsWith('h')) {
      type = 'heading';
      metadata = { level: parseInt(tag[1]) };
    } else if (tag === 'blockquote') {
      type = 'quote';
    } else if (tag === 'ul' || tag === 'ol') {
      type = 'list';
      metadata = { ordered: tag === 'ol' };
      
      // Extract structured list items to avoid double bullets
      // We use findBalancedTag logic again for <li>
      const items: string[] = [];
      const liStartRegex = /<li(\s|[>])/gi;
      let liMatch;
      // We need to loop manually because we're consuming parts of string
      // But findBalancedTag needs original string and index.
      // So we iterate regex on 'content'
      while ((liMatch = liStartRegex.exec(content)) !== null) {
        const startIndex = liMatch.index;
        const fullLi = findBalancedTag(content, startIndex, 'li');
        
        if (fullLi) {
          // Remove outer <li> tags
          // Use regex to be safe about attributes
          let inner = fullLi.replace(/^<li[^>]*>/i, '');
          inner = inner.substring(0, inner.lastIndexOf('<')); // remove last tag
          // wait, removing last tag via substring is unsafe if no closing tag or weird
          // safer: replace last </li>
          inner = inner.replace(/<\/li>\s*$/i, '');
          
          items.push(inner.trim());
          
          // Move regex index past this item
          liStartRegex.lastIndex = startIndex + fullLi.length;
        }
      }
      
      if (items.length > 0) {
        metadata.items = items;
      }
    } else if (tag === 'figure') {
        if (content.includes('<img')) type = 'image';
        // Extract alt and caption
        const captionMatch = /<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i.exec(content);
        if (captionMatch) metadata.caption = captionMatch[1];
        
        const altMatch = /alt="([^"]*)"/.exec(content);
        if (altMatch) metadata.alt = altMatch[1];
    }

    // Skip if content is just a placeholder ID
    const isPlaceholder = protectedBlocks.some(pb => content.trim() === pb.id || content.includes('__PROTECTED_'));
    
    if (!isPlaceholder) {
      blocks.push({
        id: idCounter.toString(),
        type,
        content: (() => {
           const extracted = tag !== 'figure' ? content : (/src\s*=\s*["']([^"']+)["']/i.exec(content)?.[1]?.trim() || '');
           if (tag === 'figure' && !extracted) {
               console.log('DEBUG: Failed to extract src from figure:', content.substring(0, 100) + '...');
           }
           return extracted;
        })(),
        metadata
      });
    }

    idCounter++;
    lastIndex = match.index + fullMatch.length;
  }

  // Add any remaining text as simple paragraph (unless it's just whitespace)
  const remaining = processedHtml.substring(lastIndex).trim();
  if (remaining) {
    // Process any protected blocks that might be in the tail
    let processedRemaining = remaining;
    
    // Check for protected IDs in tail
    protectedBlocks.forEach(pb => {
      if (processedRemaining.includes(pb.id)) {
         if (pb.type === 'video') {
           // Extract video URL from WordPress embed block
           let videoUrl = '';
           let videoType: 'youtube' | 'vimeo' | 'custom' = 'youtube';

           // Try to find iframe src (most common for embeds)
           const iframeMatch = /<iframe[^>]*src=\"([^\"]+)\"[^>]*>/i.exec(pb.content);
           if (iframeMatch) {
             videoUrl = iframeMatch[1];
             
             // Determine video type from URL
             if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
               videoType = 'youtube';
             } else if (videoUrl.includes('vimeo.com')) {
               videoType = 'vimeo';
             } else {
               videoType = 'custom';
             }
           } else {
             // Try to find blockquote with link (WordPress embed fallback)
             const linkMatch = /<a[^>]*href=\"([^\"]+)\"[^>]*>/i.exec(pb.content);
             if (linkMatch) {
               videoUrl = linkMatch[1];
               
               if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                 videoType = 'youtube';
               } else if (videoUrl.includes('vimeo.com')) {
                 videoType = 'vimeo';
               }
             }
           }

           if (videoUrl) {
             blocks.push({
               id: pb.id,
               type: 'video',
               content: videoUrl,
               metadata: { videoType }
             });
           }
         } else if (pb.type === 'image') {
           // Extract image from WordPress image block
           // First try to extract Cloudinary URL from data attributes
           const cloudinaryUrl = extractCloudinaryUrl(pb.content);
           const imgMatch = /<img[\s\S]*?src=\"([^\"]+)\"[\s\S]*?>/i.exec(pb.content);
           const captionMatch = /<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i.exec(pb.content);
           const altMatch = /alt=\"([^\"]*)\"/i.exec(pb.content);


           // Use Cloudinary URL if available, otherwise fall back to src
           const imageUrl = cloudinaryUrl || (imgMatch ? imgMatch[1] : null);
           if (imageUrl) {
             blocks.push({
               id: pb.id,
               type: 'image',
               content: imageUrl,
               metadata: {
                 caption: captionMatch ? captionMatch[1].replace(/<[^>]+>/g, '') : undefined,
                 alt: altMatch ? altMatch[1] : undefined
               }
             });
           }
         } else if (pb.type === 'accordion') {
            // Extract items
            const itemRegex = /<div.*?class=\"wp-block-accordion-item.*?<button.*?class=\"wp-block-accordion-heading__toggle.*?<span.*?>(.*?)<\/span>.*?<div.*?class=\"wp-block-accordion-panel.*?>(.*?)<\/div>/gs;
            const accordionItems: { question: string; answer: string }[] = [];
            let itemMatch;
            while ((itemMatch = itemRegex.exec(pb.content)) !== null) {
              accordionItems.push({
                question: cleanAccordionContent(itemMatch[1]),
                answer: cleanAccordionContent(itemMatch[2])
              });
            }
            // If regex failed, try simpler split strategy
            if (accordionItems.length === 0) {
              const toggles = [...pb.content.matchAll(/class=\"wp-block-accordion-heading__toggle\"[^>]*>[\s\S]*?<span[^>]*>(.*?)<\/span>/g)].map(m => m[1]);
              const panels = [...pb.content.matchAll(/class=\"wp-block-accordion-panel\"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g)].map(m => m[1]);
              toggles.forEach((t, i) => {
                accordionItems.push({
                  question: cleanAccordionContent(t),
                  answer: cleanAccordionContent(panels[i] || '')
                });
              });
            }

            blocks.push({
              id: pb.id,
              type: 'accordion',
              content: '',
              metadata: { items: accordionItems }
            });
         } else if (pb.type === 'gallery') {
            // Same gallery logic
            const content = pb.content.trim();
            let innerContent = content.replace(/^<(figure|div)[^>]*>/i, '').replace(/<\/(figure|div)>$/i, '');
            const itemRegex = /<(figure|div|li)[^>]*>([\s\S]*?)<\/\1>/gi;
            const itemMatches = [...innerContent.matchAll(itemRegex)];

            let images: { url: string; caption?: string; alt?: string }[] = [];

            if (itemMatches.length > 0) {
              images = itemMatches.map(m => {
                const itemHtml = m[0];
                // Try Cloudinary URL first, then fall back to src
                const cloudinaryUrl = extractCloudinaryUrl(itemHtml);
                const imgMatch = /<img[\s\S]*?src=\"([^\"]+)\"[\s\S]*?>/i.exec(itemHtml);
                const captionMatch = /<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i.exec(itemHtml);
                const altMatch = /alt=\"([^\"]*)\"/i.exec(itemHtml);


                const imageUrl = cloudinaryUrl || (imgMatch ? imgMatch[1] : null);
                if (imgMatch) {
                  return {
                    url: imageUrl,
                    caption: captionMatch ? captionMatch[1].replace(/<[^>]+>/g, '') : undefined,
                    alt: altMatch ? altMatch[1] : undefined
                  };
                }
                return null;
              }).filter(img => img !== null) as any;
            } else {
              const imgMatches = [...content.matchAll(/<img[\s\S]*?src=\"([^\"]+)\"[\s\S]*?>/gi)];
              images = imgMatches.map(m => {
                return { url: m[1] };
              });
            }

            blocks.push({
              id: pb.id,
              type: 'gallery',
              content: '',
              metadata: { images, galleryStyle: 'carousel' }
            });
         }
      }
    });
    
    // If not protected, push as paragraph
    // But first, remove any placeholder IDs that might still be in the text
    let cleanedRemaining = processedRemaining;
    protectedBlocks.forEach(pb => {
      cleanedRemaining = cleanedRemaining.replace(pb.id, '');
    });
    
    cleanedRemaining = cleanedRemaining.trim();
    
    if (cleanedRemaining && !protectedBlocks.some(pb => processedRemaining.includes(pb.id))) {
        blocks.push({
        id: idCounter.toString(),
        type: 'paragraph',
        content: cleanedRemaining
        });
    }
  }

  if (blocks.length === 0 && html.trim().length > 0) {
    return [{
      id: '1',
      type: 'paragraph',
      content: html
    }];
  }

  return blocks;
};
