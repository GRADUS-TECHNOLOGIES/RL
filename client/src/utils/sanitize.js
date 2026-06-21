import DOMPurify from 'dompurify';

// Configuración alineada con las etiquetas que permite el servidor
const PURIFY_CONFIG = {
    ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'strong', 'em', 'u', 's', 'code', 'pre',
        'ul', 'ol', 'li',
        'a',
        'blockquote',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'span', 'div',
        'img',
    ],
    ALLOWED_ATTR: ['class', 'style', 'href', 'target', 'rel', 'src', 'alt', 'width', 'height', 'colspan', 'rowspan'],
    FORCE_BODY: true,
};

export const sanitizeHtml = (dirty) => {
    if (!dirty) return '';
    return DOMPurify.sanitize(dirty, PURIFY_CONFIG);
};
