//* IMPORTS
import express from 'express';
import rateLimit from 'express-rate-limit';
import { google, signup, signin } from '../controllers/auth.controller.js';

// Crear un enrutador de Express
const router = express.Router();

// Limita intentos de email/contraseña (más estricto, previene fuerza bruta)
const credentialLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, statusCode: 429, message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// OAuth no requiere límite tan estricto (Google ya maneja sus propios límites)
const oauthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { success: false, statusCode: 429, message: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/signup', credentialLimiter, signup);
router.post('/signin', credentialLimiter, signin);
router.post('/google', oauthLimiter, google);

// Exportar el enrutador para usarlo en otras partes de la aplicación
export default router;