import sanitizeHtml from 'sanitize-html';

// Etiquetas y atributos que el editor Tiptap puede generar legítimamente
const ALLOWED_TAGS = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'strong', 'em', 'u', 's', 'code', 'pre',
    'ul', 'ol', 'li',
    'a',
    'blockquote',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'span', 'div',
    'img',
];

const ALLOWED_ATTRIBUTES = {
    '*': ['class', 'style'],
    'a': ['href', 'target', 'rel'],
    'img': ['src', 'alt', 'width', 'height'],
    'td': ['colspan', 'rowspan'],
    'th': ['colspan', 'rowspan'],
};

// Solo permite propiedades CSS seguras (color y alineación del editor)
const ALLOWED_STYLES = {
    '*': {
        'color': [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(\d+,\s*\d+,\s*\d+\)$/],
        'text-align': [/^(left|right|center|justify)$/],
        'background-color': [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(\d+,\s*\d+,\s*\d+\)$/],
    },
};

export const sanitizeContent = (dirty) => {
    if (!dirty) return '';
    return sanitizeHtml(dirty, {
        allowedTags: ALLOWED_TAGS,
        allowedAttributes: ALLOWED_ATTRIBUTES,
        allowedStyles: ALLOWED_STYLES,
        allowedSchemes: ['http', 'https', 'mailto'],
        // Fuerza rel="noopener noreferrer" en todos los enlaces externos
        transformTags: {
            'a': (tagName, attribs) => ({
                tagName,
                attribs: {
                    ...attribs,
                    rel: 'noopener noreferrer',
                    ...(attribs.href?.startsWith('http') && { target: '_blank' }),
                },
            }),
        },
    });
};
