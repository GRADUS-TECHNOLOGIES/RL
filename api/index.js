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

//* CONFIANZA EN PROXY (para IP real vía X-Forwarded-For)
// Confirmado en vivo contra Render (logueando x-forwarded-for real): la
// cadena siempre trae exactamente 3 saltos entre el cliente y este proceso —
// "<IP real>, <borde Cloudflare de Render>, <balanceador interno de
// Render>" — más un hop local propio de Render que ni siquiera aparece en
// el header (con trust proxy=0, req.ip da "::1", ese hop invisible).
// TRUST_PROXY_HOPS=3 en el entorno de Render es el valor correcto — nunca
// `true`/`*`, o cualquiera podría falsificar su IP vía X-Forwarded-For.
app.set('trust proxy', parseInt(process.env.TRUST_PROXY_HOPS, 10) || 0);

//* CONEXIÓN A MONGODB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch((error) => console.error('Error al conectar a MongoDB:', error));

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

//* INICIAR SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});