import jwt from "jsonwebtoken";
import { errorHandler } from './error.js';
import { logAuditEvent } from './auditClient.js';

export const verifyToken = (req, res, next) => {
    let token;

    // Soporta tanto cookies como encabezado Authorization
    if (req.cookies?.access_token) {
        token = req.cookies.access_token;
    } else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(errorHandler(401, "Unauthorized - Token no proporcionado"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // Limpia la cookie para evitar sesiones atascadas cuando el token expira o es inválido
            res.clearCookie('access_token');

            // jwt.decode no verifica la firma — solo se usa aquí para tener contexto
            // en el log (qué cuenta reclamaba ser el token), nunca como identidad confiable.
            const claimed = jwt.decode(token) || {};
            logAuditEvent(req, {
                eventType: 'SESSION_EXPIRED',
                success: false,
                statusCode: 401,
                metadata: {
                    reason: err.name === 'TokenExpiredError' ? 'expired' : 'invalid_or_tampered',
                    claimedUserId: claimed.id || null,
                    claimedSessionId: claimed.sid || null,
                },
            });

            return next(errorHandler(401, "Sesión expirada. Vuelve a iniciar sesión"));
        }

        req.user = user;
        next();
    });
};
