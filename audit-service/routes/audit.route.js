import express from 'express';
import rateLimit from 'express-rate-limit';
import { requireWriteToken, requireReadToken } from '../middleware/serviceAuth.js';
import { createEvent, listEvents } from '../controllers/audit.controller.js';

const router = express.Router();

// Protege contra inundación del servicio incluso con el token de escritura
// comprometido — la app principal genera como mucho unos pocos eventos por
// request, así que este límite es generoso pero acotado.
const writeLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/events', writeLimiter, requireWriteToken, createEvent);
router.get('/events', requireReadToken, listEvents);

export default router;
