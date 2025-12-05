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