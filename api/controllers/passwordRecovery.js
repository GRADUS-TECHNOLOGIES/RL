import { createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';

export const recoveryHash = token => createHash('sha256').update(token, 'utf8').digest('hex');

// El código de 256 bits solo se emite fuera de la aplicación tras una
// verificación independiente. La operación consume el código atómicamente.
export function createResetPasswordHandler({ UserModel = User, hashPassword = p => bcrypt.hash(p, 10), now = () => new Date() } = {}) {
    return async (req, res, next) => {
        const { code, password } = req.body || {};
        if (typeof code !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(code) ||
            typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
            return res.status(400).json({ message: 'Revisa el código y usa una contraseña de al menos 12 caracteres y hasta 72 bytes.' });
        }
        try {
            const passwordHash = await hashPassword(password);
            const user = await UserModel.findOneAndUpdate(
                { recoveryTokenHash: recoveryHash(code), recoveryExpiresAt: { $gt: now() } },
                { $set: { password: passwordHash }, $unset: { recoveryTokenHash: '', recoveryExpiresAt: '' } },
                { new: false, projection: { _id: 1 } },
            );
            if (!user) return res.status(400).json({ message: 'El código no es válido o ha vencido. Solicita uno nuevo.' });
            return res.status(200).json({ message: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
        } catch (error) { return next(error); }
    };
}

export const resetPassword = createResetPasswordHandler();
