import 'dotenv/config';
import '../utils/mongooseConfig.js';
import mongoose from 'mongoose';
import { randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import User from '../models/user.model.js';
import { recoveryHash } from '../controllers/passwordRecovery.js';

// Ejecutar solo para una cuenta expresamente autorizada y verificada fuera de banda.
if (!process.argv.includes('--issue') || !stdin.isTTY || !stdout.isTTY || !process.env.MONGODB_URI) {
    console.error('Se requiere una terminal interactiva, MONGODB_URI y la opción --issue. No se realizó ninguna operación.');
    process.exit(1);
}
const rl = createInterface({ input: stdin, output: stdout });
const timeout = setTimeout(() => { console.error('Tiempo agotado.'); process.exit(1); }, 120000);
try {
    console.log('Solo continuar con autorización para esta cuenta y verificación independiente de su identidad.');
    const id = (await rl.question('ID MongoDB de la cuenta verificada: ')).trim();
    if (!/^[a-fA-F0-9]{24}$/.test(id)) throw new Error('ID inválido');
    if ((await rl.question('Escribe AUTORIZO para emitir un código de 15 minutos: ')).trim() !== 'AUTORIZO') throw new Error('Cancelado');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    const code = randomBytes(32).toString('base64url');
    const now = new Date();
    const result = await User.updateOne(
        { _id: id, $or: [{ recoveryExpiresAt: { $exists: false } }, { recoveryExpiresAt: { $lte: now } }] },
        { $set: { recoveryTokenHash: recoveryHash(code), recoveryExpiresAt: new Date(now.getTime() + 15 * 60 * 1000) } },
    );
    if (result.matchedCount !== 1 || result.modifiedCount !== 1) throw new Error('Cuenta no encontrada o ya existe un código vigente');
    console.log('Código de un solo uso (no lo compartas por chat ni lo guardes en registros):');
    console.log(code);
    console.log('Entrégalo solo al titular por un canal privado verificado; vence en 15 minutos.');
} catch { console.error('No se emitió un código. Revisa las condiciones de forma privada; no reintentes automáticamente.'); process.exitCode = 1; }
finally { clearTimeout(timeout); rl.close(); await mongoose.disconnect().catch(() => {}); }
