import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';

import auditRoutes from './routes/audit.route.js';

dotenv.config();

const app = express();

mongoose
    .connect(process.env.AUDIT_MONGODB_URI)
    .then(() => console.log('[audit-service] Conectado a MongoDB de auditoría'))
    .catch((error) => console.error('[audit-service] Error al conectar a MongoDB:', error));

app.use(helmet());
app.use(express.json({ limit: '100kb' })); // los eventos son pequeños; límite bajo por defensa en profundidad

app.use('/', auditRoutes);

app.use((err, req, res, next) => {
    console.error('[audit-service] Error:', err.message);
    res.status(err.statusCode || 500).json({ message: 'Error interno del servicio de auditoría' });
});

const PORT = process.env.PORT || 4001;

// Este servicio corre en la misma VPS (2.24.205.175, test-gradus.tech) que
// ya aloja Portal/SGI/Nuni/TraductivIA — vía Docker + Traefik, no nginx
// nativo. Fuera de un contenedor, AUDIT_BIND_HOST=127.0.0.1 (el default de
// abajo) sigue siendo lo correcto para correr esto suelto en cualquier otra
// máquina. Dentro del contenedor Docker, el compose de despliegue fija
// AUDIT_BIND_HOST=0.0.0.0 explícitamente — es seguro porque el contenedor no
// publica ningún puerto al host ni a internet; solo Traefik, en la misma red
// Docker interna, puede alcanzarlo. Traefik es quien termina TLS (Let's
// Encrypt automático) y hace de reverse proxy — no hace falta nginx ni
// certbot manual aquí. Ver audit-service/deploy/DEPLOY.md.
const HOST = process.env.AUDIT_BIND_HOST || '127.0.0.1';

app.listen(PORT, HOST, () => {
    console.log(`[audit-service] Escuchando en ${HOST}:${PORT}`);
});
