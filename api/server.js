import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { app } from './index.js';

dotenv.config();
// No crear ni modificar índices durante el despliegue.
mongoose.set('autoIndex', false);
if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI es requerida');
mongoose.connect(process.env.MONGODB_URI).catch(() => console.error('MongoDB no disponible'));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor escuchando en ${port}`));
