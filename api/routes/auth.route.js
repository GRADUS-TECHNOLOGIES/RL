//* IMPORTS
import express from 'express';
import rateLimit from 'express-rate-limit';
import { google, signup, signin } from '../controllers/auth.controller.js';

// Crear un enrutador de Express
const router = express.Router();

// Limita a 10 intentos por IP cada 15 minutos en rutas de autenticación
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, statusCode: 429, message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/signup', authLimiter, signup);
router.post('/signin', authLimiter, signin);
router.post('/google', authLimiter, google);

// Exportar el enrutador para usarlo en otras partes de la aplicación
export default router;