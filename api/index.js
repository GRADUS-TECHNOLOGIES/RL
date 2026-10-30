import 'dotenv/config';
//* IMPORTACIONES
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';

import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import postRoutes from './routes/post.route.js';
import commentRoutes from './routes/comment.route.js';
import bannerRoutes from './routes/banner.route.js';

//* CONFIGURACIÓN
dotenv.config(); // Cargar variables de entorno

const app = express();
const __dirname = path.resolve();

// Confiar únicamente en el proxy inmediato requiere que solo Traefik pueda
// acceder al contenedor y que Traefik descarte cabeceras no confiables.
app.set('trust proxy', process.env.TRUST_PROXY_HOPS === '1' ? 1 : 0);

app.get('/healthz', (_req, res) => res.status(200).json({ status: 'ok' }));
app.get('/readyz', (_req, res) => {
    const ready = mongoose.connection.readyState === 1;
    res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'unavailable' });
});

//* MIDDLEWARES
app.use(helmet({
    contentSecurityPolicy: false,      // Se gestiona por separado en producción con CDN/Firebase
    crossOriginEmbedderPolicy: false,  // Necesario para embeds de PDF
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }, // Permite que Firebase signInWithPopup funcione
}));
app.use(express.json());
app.use(cookieParser());

//* LOG DE RUTAS PARA DEBUG
app.use((req, res, next) => {
    console.log(`=> ${req.method} ${req.url}`);
    next();
});

//* RUTAS DE API
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/banner', bannerRoutes);

//* ARCHIVOS ESTÁTICOS DEL CLIENTE
app.use(express.static(path.join(__dirname, '/client/dist')));

//* RUTA CATCH-ALL PARA CLIENTE SPA (evita capturar /api/*)
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

//* MIDDLEWARE DE ERRORES
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Error interno del servidor';
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});

export { app };
