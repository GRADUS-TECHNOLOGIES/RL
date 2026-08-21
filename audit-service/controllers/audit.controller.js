import AuditEvent, { AUDIT_EVENT_TYPES } from '../models/auditEvent.model.js';
import { cleanString } from '../utils/sanitize.js';
import { parseUserAgent, lookupGeo } from '../utils/enrich.js';
import { AUDIT_SOURCES } from '../utils/sources.js';

const MAX_METADATA_JSON_LENGTH = 5000;

// Insert-only: no existe (ni existirá) un endpoint de update/delete. Es la
// garantía de resistencia a manipulación — quien solo tiene el token de
// escritura no puede alterar ni borrar eventos existentes, solo añadir nuevos.
export const createEvent = async (req, res, next) => {
    try {
        const { eventType, success, userId, actorIsAdmin, sessionId, statusCode, metadata } = req.body;

        if (!AUDIT_EVENT_TYPES.includes(eventType)) {
            return res.status(400).json({ message: 'eventType inválido' });
        }
        if (typeof success !== 'boolean') {
            return res.status(400).json({ message: 'success debe ser boolean' });
        }

        let safeMetadata = {};
        if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
            const json = JSON.stringify(metadata);
            if (json.length <= MAX_METADATA_JSON_LENGTH) {
                safeMetadata = metadata;
            }
        }

        const ipAddress = cleanString(req.body.ipAddress, 45); // IPv6 máx. 45 chars
        const userAgentRaw = cleanString(req.body.userAgent, 500);
        const { deviceType, operatingSystem, browser } = parseUserAgent(userAgentRaw);
        const { country, region, city } = lookupGeo(ipAddress);

        const event = await AuditEvent.create({
            timestamp: new Date(),
            source: req.auditSource,
            eventType,
            success,
            userId: typeof userId === 'string' ? userId.slice(0, 100) : null,
            actorIsAdmin: typeof actorIsAdmin === 'boolean' ? actorIsAdmin : null,
            sessionId: typeof sessionId === 'string' ? sessionId.slice(0, 100) : null,
            ipAddress,
            userAgentRaw,
            deviceType,
            operatingSystem,
            browser,
            country,
            region,
            city,
            endpoint: cleanString(req.body.endpoint, 300),
            httpMethod: cleanString(req.body.httpMethod, 10),
            statusCode: typeof statusCode === 'number' ? statusCode : null,
            referer: cleanString(req.body.referer, 500),
            acceptLanguage: cleanString(req.body.acceptLanguage, 200),
            metadata: safeMetadata,
        });

        res.status(201).json({ id: event._id });
    } catch (error) {
        next(error);
    }
};

const MAX_LIMIT = 100;

export const listEvents = async (req, res, next) => {
    try {
        const startIndex = Math.max(parseInt(req.query.startIndex, 10) || 0, 0);
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, MAX_LIMIT);

        // Filtro construido campo por campo — nunca se pasa req.query completo a Mongo.
        const filter = {};
        if (req.query.source && AUDIT_SOURCES.includes(req.query.source)) {
            filter.source = req.query.source;
        }
        if (req.query.eventType && AUDIT_EVENT_TYPES.includes(req.query.eventType)) {
            filter.eventType = req.query.eventType;
        }
        if (req.query.userId) {
            filter.userId = String(req.query.userId).slice(0, 100);
        }
        if (req.query.success === 'true' || req.query.success === 'false') {
            filter.success = req.query.success === 'true';
        }

        const events = await AuditEvent.find(filter)
            .sort({ timestamp: -1 })
            .skip(startIndex)
            .limit(limit);

        const totalEvents = await AuditEvent.countDocuments(filter);

        res.status(200).json({ events, totalEvents });
    } catch (error) {
        next(error);
    }
};
