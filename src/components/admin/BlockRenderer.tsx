import { ContentBlock } from './BlockEditor';

/**
 * Converts content blocks to HTML for rendering on the frontend.
 * This is used to display block-based content from the admin panel.
 */
export function renderBlocksToHTML(blocks: ContentBlock[]): string {
  if (!blocks || blocks.length === 0) return '';

  return blocks.map(block => {
    switch (block.type) {
      case 'heading':
        const level = block.metadata?.level || 2;
        return `<h${level}>${escapeHTML(block.content)}</h${level}>`;

      case 'paragraph':
        // Already contains HTML from RichTextEditor
        return `<div class="prose-paragraph">${block.content}</div>`;

      case 'image':
        const alt = block.metadata?.alt || '';
        const caption = block.metadata?.caption || '';
        return `
          <figure class="my-8">
            <img src="${escapeHTML(block.content)}" alt="${escapeHTML(alt)}" class="w-full border border-border" />
            ${caption ? `<figcaption class="mt-3 text-sm text-center opacity-60">${escapeHTML(caption)}</figcaption>` : ''}
          </figure>
        `;

      case 'quote':
        return `
          <blockquote class="my-8 pl-6 border-l-4 border-accent-brand italic opacity-80">
            ${escapeHTML(block.content)}
          </blockquote>
        `;

      case 'list':
        const listType = block.metadata?.listType || 'bullet';
        const tag = listType === 'numbered' ? 'ol' : 'ul';
        const listItems = block.content.split('\n').filter(item => item.trim());
        return `
          <${tag} class="my-6 space-y-2 ${listType === 'numbered' ? 'list-decimal' : 'list-disc'} list-inside">
            ${listItems.map(item => `<li>${escapeHTML(item)}</li>`).join('')}
          </${tag}>
        `;

      case 'code':
        const language = block.metadata?.language || 'text';
        return `
          <div class="my-8">
            <div class="text-xs uppercase tracking-wider opacity-40 mb-2">${escapeHTML(language)}</div>
            <pre class="bg-secondary p-4 overflow-x-auto border border-border"><code>${escapeHTML(block.content)}</code></pre>
          </div>
        `;

      case 'gallery':
        const images = block.metadata?.images || [];
        if (images.length === 0) return '';
        return `
          <div class="my-8 grid grid-cols-2 md:grid-cols-3 gap-4">
            ${images.map(img => `
              <figure>
                <img src="${escapeHTML(img.url)}" alt="${escapeHTML(img.caption || '')}" class="w-full h-48 object-cover border border-border" />
                ${img.caption ? `<figcaption class="mt-2 text-xs opacity-60">${escapeHTML(img.caption)}</figcaption>` : ''}
              </figure>
            `).join('')}
          </div>
        `;

      case 'video':
        const videoType = block.metadata?.videoType || 'youtube';
        let embedUrl = '';

        if (videoType === 'youtube') {
          const youtubeId = extractYouTubeId(block.content);
          if (youtubeId) {
            embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
          }
        } else if (videoType === 'vimeo') {
          const vimeoId = extractVimeoId(block.content);
          if (vimeoId) {
            embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
          }
        }

        if (!embedUrl) return '';

        return `
          <div class="my-8 aspect-video bg-black border border-border">
            <iframe src="${escapeHTML(embedUrl)}" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        `;

      case 'spacer':
        const height = block.metadata?.height || 'medium';
        const heightClass = {
          small: 'h-8',
          medium: 'h-16',
          large: 'h-24'
        }[height] || 'h-16';
        return `<div class="${heightClass}"></div>`;

      case 'accordion':
        const items = block.metadata?.items || [];
        if (items.length === 0) return '';
        return `
          <div class="my-8 space-y-2">
            ${items.map((item, index) => `
              <details class="border border-border bg-secondary/20">
                <summary class="px-6 py-4 cursor-pointer hover:bg-secondary/50 transition-colors">
                  <span class="text-sm tracking-wider uppercase">${escapeHTML(item.question)}</span>
                </summary>
                <div class="px-6 py-4 border-t border-border">
                  ${escapeHTML(item.answer)}
                </div>
              </details>
            `).join('')}
          </div>
        `;

      case 'callout':
        const type = block.metadata?.calloutType || 'info';

        // Match the established design system from the removed hardcoded examples
        // Match the established design system from the removed hardcoded examples
        const styles: Record<string, { container: string, inlineStyle?: string, text: string, iconColor: string, iconStyle?: string, icon: string }> = {
          info: {
            // "Pro Tip" style - Gold Tint with inline fallback
            container: 'bg-accent-brand/5 border border-accent-brand/20 rounded-lg',
            inlineStyle: 'background-color: rgba(212, 175, 55, 0.1); border-color: rgba(212, 175, 55, 0.2);',
            text: 'text-muted-foreground',
            iconColor: 'text-accent-brand',
            iconStyle: 'color: #d4af37;',
            icon: '<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m0 16a1 1 0 1 1 1-1 0 0 1-1 1m1-5a1 1 0 0 1-2 0 1 1 0 0 1 2 0"/>' // Info/Lightbulb
          },
          warning: {
            container: 'bg-amber-400/10 border border-amber-400/20 rounded-lg',
            text: 'text-amber-400',
            iconColor: 'text-amber-400',
            icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
          },
          important: {
            // "Important" style - usually alert
            container: 'bg-destructive/10 border-l-4 border-destructive rounded-r',
            text: 'text-destructive',
            iconColor: 'text-destructive',
            icon: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
          },
          'key-concept': {
            // "Key Concept" style - Filled accent with inline fallback
            container: 'bg-accent-brand text-accent-brand-foreground rounded-lg shadow-lg',
            inlineStyle: 'background-color: #d4af37; color: white;',
            text: 'text-accent-brand-foreground',
            iconColor: 'text-accent-brand-foreground',
            iconStyle: 'color: white;',
            icon: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'
          },
          success: {
            container: 'bg-emerald-400/10 border border-emerald-400/20 rounded-lg',
            text: 'text-emerald-400',
            iconColor: 'text-emerald-400',
            icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
          },
          error: {
            container: 'bg-destructive/10 border border-destructive/20 rounded-lg',
            text: 'text-destructive',
            iconColor: 'text-destructive',
            icon: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
          }
        };

        const style = styles[type] || styles.info;

        return `
          <div class="my-8 p-6 ${style.container} flex gap-4" style="${style.inlineStyle || ''}">
            <div class="${style.iconColor} shrink-0 pt-1" style="${style.iconStyle || ''}">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
                ${style.icon}
              </svg>
            </div>
            <div>
              <div class="text-xs font-bold uppercase tracking-wider mb-2 ${style.text} opacity-80">${type.replace(/-/g, ' ')}</div>
              <div class="opacity-90 prose-p:my-0 ${type === 'key-concept' ? 'text-accent-brand-foreground' : ''}" style="${type === 'key-concept' ? 'color: white;' : ''}">${escapeHTML(block.content)}</div>
            </div>
          </div>
        `;

      default:
        return '';
    }
  }).join('\n');
}

function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function extractVimeoId(url: string): string | null {
  const regExp = /vimeo\.com\/([0-9]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}