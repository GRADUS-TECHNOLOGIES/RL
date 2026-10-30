import bcrypt from 'bcryptjs';
import { randomBytes, randomUUID } from 'node:crypto';

export function createGoogleHandler({ User, verifyFirebaseToken, jwt, logAuditEvent }) {
    return async (req, res, next) => {
        try {
            if (typeof req.body?.idToken !== 'string' || !req.body.idToken) return res.status(401).json({ message: 'Autenticación inválida' });
            let identity;
            try { identity = await verifyFirebaseToken(req.body.idToken); }
            catch { return res.status(401).json({ message: 'Autenticación inválida' }); }
            if (!identity.uid || !identity.email || identity.email_verified !== true || identity.firebase?.sign_in_provider !== 'google.com') {
                return res.status(401).json({ message: 'Autenticación inválida' });
            }
            let user = await User.findOne({ firebaseUid: identity.uid });
            if (!user) {
                // Nunca asociar una cuenta preexistente por correo, en particular administradores.
                if (await User.findOne({ email: identity.email })) return res.status(403).json({ message: 'La cuenta requiere vinculación segura; inicia sesión con contraseña o contacta al administrador.' });
                const username = `google${randomBytes(8).toString('hex')}`;
                user = await User.create({ username, email: identity.email, firebaseUid: identity.uid,
                    password: await bcrypt.hash(randomBytes(32).toString('hex'), 10),
                    ...(identity.picture ? { profilePicture: identity.picture } : {}) });
            }
            const sessionId = randomUUID();
            const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin, sid: sessionId }, process.env.JWT_SECRET, { expiresIn: '7d' });
            const { password, firebaseUid, ...safeUser } = user.toObject();
            logAuditEvent(req, { eventType: 'LOGIN_SUCCESS', success: true, userId: String(user._id), actorIsAdmin: user.isAdmin, sessionId, statusCode: 200, metadata: { method: 'google' } });
            return res.status(200).cookie('access_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 }).json(safeUser);
        } catch (error) { return next(error); }
    };
}
