import mongoose from 'mongoose';
import { AUDIT_SOURCES } from '../utils/sources.js';

const EVENT_TYPES = [
    'LOGIN_SUCCESS',
    'LOGIN_FAILED',
    'LOGOUT',
    'SESSION_EXPIRED',
    'PASSWORD_CHANGE',
    'ACCOUNT_CHANGE',
    'ACCOUNT_DELETED',
    'PERMISSION_CHANGE',
];

// Retención "caliente" por defecto (días). Ajustable por política
// institucional — no es una cifra legal verificada, ver propuesta.
const RETENTION_DAYS = parseInt(process.env.AUDIT_RETENTION_DAYS, 10) || 90;

const auditEventSchema = new mongoose.Schema(
    {
        timestamp: {
            type: Date,
            required: true,
            default: Date.now,
        },
        // Qué app institucional mandó el evento — lo fija el middleware de
        // auth según qué token coincidió (ver middleware/serviceAuth.js),
        // nunca un valor que el body del request pudiera falsificar.
        source: {
            type: String,
            required: true,
            enum: AUDIT_SOURCES,
        },
        eventType: {
            type: String,
            required: true,
            enum: EVENT_TYPES,
        },
        success: {
            type: Boolean,
            required: true,
        },
        // Siempre el actor autenticado que realizó la acción (no el "afectado"
        // cuando difieren — eso vive en metadata.targetUserId).
        userId: {
            type: String,
            default: null,
        },
        actorIsAdmin: {
            type: Boolean,
            default: null,
        },
        sessionId: {
            type: String,
            default: null,
        },
        ipAddress: {
            type: String,
            default: null,
        },
        userAgentRaw: {
            type: String,
            maxlength: 500,
            default: null,
        },
        deviceType: {
            type: String,
            default: 'unknown',
        },
        operatingSystem: {
            type: String,
            default: null,
        },
        browser: {
            type: String,
            default: null,
        },
        country: {
            type: String,
            default: null,
        },
        region: {
            type: String,
            default: null,
        },
        city: {
            type: String,
            default: null,
        },
        endpoint: {
            type: String,
            maxlength: 300,
            default: null,
        },
        httpMethod: {
            type: String,
            maxlength: 10,
            default: null,
        },
        statusCode: {
            type: Number,
            default: null,
        },
        referer: {
            type: String,
            maxlength: 500,
            default: null,
        },
        acceptLanguage: {
            type: String,
            maxlength: 200,
            default: null,
        },
        // Contexto estructurado mínimo (ej. { reason: 'invalid_password' }).
        // Nunca cuerpos de request completos ni secretos.
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: false } // `timestamp` ya es el campo de auditoría; no se necesita createdAt/updatedAt
);

// Retención automática: Mongo elimina el documento pasados RETENTION_DAYS
// desde `timestamp`, sin necesidad de cron jobs.
auditEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: RETENTION_DAYS * 24 * 60 * 60 });

// Soporta las consultas de revisión más frecuentes y la detección de patrones
// (ej. N LOGIN_FAILED de la misma IP en una ventana de tiempo).
auditEventSchema.index({ userId: 1, timestamp: -1 });
auditEventSchema.index({ eventType: 1, timestamp: -1 });
auditEventSchema.index({ ipAddress: 1, timestamp: -1 });
auditEventSchema.index({ source: 1, timestamp: -1 });

export const AUDIT_EVENT_TYPES = EVENT_TYPES;

const AuditEvent = mongoose.model('AuditEvent', auditEventSchema);

export default AuditEvent;
