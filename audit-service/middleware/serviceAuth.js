import { timingSafeEqual } from 'crypto';
import { AUDIT_SOURCES } from '../utils/sources.js';

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

// Cada app institucional (RL, Portal, SGI, Nuni, TraductivIA...) tiene su
// PROPIO token de escritura — nunca uno compartido. Si un token se filtra,
// se rota solo el de esa app; las demás nunca se ven afectadas. Una app sin
// variable configurada (todavía no se le dio de alta) simplemente no puede
// autenticar — no rompe nada, solo no está lista.
const WRITE_TOKENS_BY_SOURCE = Object.fromEntries(
    AUDIT_SOURCES.map((source) => [source, process.env[`AUDIT_WRITE_TOKEN_${source.toUpperCase()}`]])
);

// La identidad de quién mandó el evento la determina CUÁL token coincidió,
// nunca un campo "source" que la app mandara en el body — eso sería confiar
// en que el cliente no mienta sobre quién es.
export const requireWriteToken = (req, res, next) => {
    const provided = extractBearerToken(req);
    if (!provided) {
        return res.status(401).json({ message: 'No autorizado' });
    }

    for (const [source, expected] of Object.entries(WRITE_TOKENS_BY_SOURCE)) {
        if (expected && safeCompare(provided, expected)) {
            req.auditSource = source;
            return next();
        }
    }

    return res.status(401).json({ message: 'No autorizado' });
};

// Un solo token de lectura, institucional — quien lo tiene ve eventos de
// todas las apps (puede filtrar por `source` en la query si quiere acotar).
export const requireReadToken = (req, res, next) => {
    const expected = process.env.AUDIT_READ_TOKEN;
    const provided = extractBearerToken(req);

    if (!expected) {
        console.error('[audit-service] AUDIT_READ_TOKEN no está configurado');
        return res.status(500).json({ message: 'Servicio mal configurado' });
    }
    if (!provided || !safeCompare(provided, expected)) {
        return res.status(401).json({ message: 'No autorizado' });
    }
    next();
};
