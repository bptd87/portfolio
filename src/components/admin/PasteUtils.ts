
// Utility to process pasted content
export const processPaste = (html: string, text: string): any[] => {
    const tempDiv = document.createElement('div');
    // Prefer HTML, fallback to text wrapping
    tempDiv.innerHTML = html || text.split('\n').filter(l => l.trim()).map(l => `<p>${l}</p>`).join('');

    const newBlocks: any[] = [];
    const timestamp = Date.now();

    const cleanContent = (html: string) => {
        // Strip style, class, id, and other attributes
        // Keep only basic formatting if needed, but for "White on White" fix, we must kill styles.
        // Simple regex to strip attributes from tags
        return html.replace(/<([a-z][a-z0-9]*)[^>]*?(\/?)>/gi, '<$1$2>'); 
    };

    const processNode = (node: Node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const tag = el.tagName;
            
            // basic check for content
            if (!el.innerText.trim() && tag !== 'IMG') return;

            if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(tag)) {
                newBlocks.push({
                    id: `block-${timestamp}-${Math.random()}`,
                    type: 'heading',
                    content: cleanContent(el.innerHTML),
                    metadata: { level: Math.min(3, parseInt(tag.replace('H', ''))) }
                });
            } else if (tag === 'P' || tag === 'DIV' || tag === 'LI') {
                newBlocks.push({
                    id: `block-${timestamp}-${Math.random()}`,
                    type: 'paragraph',
                    content: cleanContent(el.innerHTML)
                });
            } else if (tag === 'UL' || tag === 'OL') {
                Array.from(el.children).forEach(processNode);
            } else {
                // If it's a wrapper like a span with style, usually we want its text?
                // Or if it has children block elements?
                if (el.querySelector('p, div, h1, h2, h3')) {
                    Array.from(el.children).forEach(processNode);
                } else {
                    newBlocks.push({
                        id: `block-${timestamp}-${Math.random()}`,
                        type: 'paragraph',
                        content: cleanContent(el.innerHTML)
                    });
                }
            }
        } else if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent?.trim()) {
                 newBlocks.push({
                    id: `block-${timestamp}-${Math.random()}`,
                    type: 'paragraph',
                    content: node.textContent.trim()
                });
            }
        }
    };

    Array.from(tempDiv.childNodes).forEach(processNode);
    return newBlocks;
};
