//* IMPORTACIONES
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';

import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import postRoutes from './routes/post.route.js';
import commentRoutes from './routes/comment.route.js';

//* CONFIGURACIÓN
dotenv.config(); // Cargar variables de entorno

const app = express();
const __dirname = path.resolve();

//* CONEXIÓN A MONGODB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch((error) => console.error('Error al conectar a MongoDB:', error));

//* MIDDLEWARES
app.use(express.json()); // Para leer JSON en requests
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
