// Extrae del request los campos que el Audit Service necesita, en un solo
// lugar. `req.ip` ya respeta la configuración de `trust proxy` de
// api/index.js — nunca se lee X-Forwarded-For manualmente aquí para evitar
// tener dos fuentes de verdad sobre la IP del cliente.
export const getRequestContext = (req) => ({
    ipAddress: req.ip || req.socket?.remoteAddress || null,
    userAgent: (req.headers['user-agent'] || '').slice(0, 500),
    referer: (req.headers['referer'] || req.headers['referrer'] || '').slice(0, 500) || null,
    acceptLanguage: (req.headers['accept-language'] || '').slice(0, 200) || null,
    endpoint: (req.originalUrl || req.url || '').slice(0, 300),
    httpMethod: req.method,
});
