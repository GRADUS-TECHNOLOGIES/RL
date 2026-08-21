import { getRequestContext } from './requestContext.js';

const AUDIT_SERVICE_URL = process.env.AUDIT_SERVICE_URL;
const AUDIT_WRITE_TOKEN = process.env.AUDIT_WRITE_TOKEN;
const TIMEOUT_MS = 1500;

// Registra un evento de auditoría de forma NO bloqueante. El Audit Service
// corre en la VPS institucional (test-gradus.tech), detrás de HTTPS y
// autenticado por token — no en una VPN — y puede no estar disponible en
// algún momento: esta llamada nunca debe hacer fallar la petición de negocio
// (login, cambio de cuenta, etc.) que la originó — auditoría degradada,
// nunca indisponibilidad del producto.
export const logAuditEvent = (req, {
    eventType,
    success,
    userId = null,
    actorIsAdmin = null,
    sessionId = null,
    statusCode = null,
    metadata = {},
}) => {
    if (!AUDIT_SERVICE_URL || !AUDIT_WRITE_TOKEN) {
        console.error(`[audit] AUDIT_SERVICE_URL/AUDIT_WRITE_TOKEN no configurados; evento no enviado: ${eventType}`);
        return;
    }

    const event = {
        timestamp: new Date().toISOString(),
        eventType,
        success,
        userId,
        actorIsAdmin,
        sessionId,
        statusCode,
        metadata,
        ...getRequestContext(req),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    fetch(`${AUDIT_SERVICE_URL}/events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AUDIT_WRITE_TOKEN}`,
        },
        body: JSON.stringify(event),
        signal: controller.signal,
    })
        .then((res) => {
            if (!res.ok) {
                console.error(`[audit] Audit Service respondió ${res.status} para el evento ${eventType}`);
            }
        })
        .catch((err) => {
            console.error(`[audit] No se pudo registrar el evento ${eventType}:`, err.message);
        })
        .finally(() => clearTimeout(timeout));
};
