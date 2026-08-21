import { timingSafeEqual } from 'crypto';

// Comparación en tiempo constante para evitar timing attacks al validar el
// token de servicio.
const safeCompare = (a, b) => {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
};

const extractBearerToken = (req) => {
    const header = req.headers.authorization || '';
    return header.startsWith('Bearer ') ? header.slice(7) : null;
};

// Dos tokens separados e independientes: quien puede insertar eventos no
// puede necesariamente leerlos, y viceversa.
const requireToken = (expectedTokenEnvVar) => (req, res, next) => {
    const expected = process.env[expectedTokenEnvVar];
    const provided = extractBearerToken(req);

    if (!expected) {
        console.error(`[audit-service] ${expectedTokenEnvVar} no está configurado`);
        return res.status(500).json({ message: 'Servicio mal configurado' });
    }
    if (!provided || !safeCompare(provided, expected)) {
        return res.status(401).json({ message: 'No autorizado' });
    }
    next();
};

export const requireWriteToken = requireToken('AUDIT_WRITE_TOKEN');
export const requireReadToken = requireToken('AUDIT_READ_TOKEN');
