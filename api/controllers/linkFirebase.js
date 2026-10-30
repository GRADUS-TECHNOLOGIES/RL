export function createLinkFirebaseHandler({ User, verifyFirebaseToken, bcrypt, hasFirebaseUidIndex }) {
    return async (req, res, next) => {
        if (!req.user?.id) return res.status(401).json({ message: 'Autenticación requerida' });
        const { password, idToken } = req.body || {};
        if (typeof password !== 'string' || !password || password.length > 1024 || typeof idToken !== 'string' || !idToken || idToken.length > 16384)
            return res.status(400).json({ message: 'Credenciales requeridas' });
        try {
            const user = await User.findById(req.user.id).select('+firebaseUid');
            if (!user || !(await bcrypt.compare(password, user.password)))
                return res.status(401).json({ message: 'Credenciales inválidas' });
            let identity;
            try { identity = await verifyFirebaseToken(idToken); }
            catch { return res.status(401).json({ message: 'Credenciales inválidas' }); }
            const now = Math.floor(Date.now() / 1000);
            if (!identity.uid || identity.firebase?.sign_in_provider !== 'google.com' ||
                !Number.isInteger(identity.auth_time) || identity.auth_time > now + 30 || now - identity.auth_time > 300)
                return res.status(401).json({ message: 'Se requiere autenticación reciente con Google' });
            if (!(await hasFirebaseUidIndex(User))) return res.status(503).json({ message: 'Vinculación no disponible' });
            // The password hash condition closes a race with password changes; the UID
            // predicate prevents replacing or replaying an existing link.
            const updated = await User.findOneAndUpdate(
                { _id: user._id, password: user.password, firebaseUid: { $exists: false } },
                { $set: { firebaseUid: identity.uid } }, { new: true });
            if (!updated) return res.status(409).json({ message: 'La cuenta ya está vinculada o cambió; vuelve a iniciar sesión' });
            return res.status(200).json({ message: 'Cuenta vinculada' });
        } catch (error) {
            if (error?.code === 11000) return res.status(409).json({ message: 'La cuenta de Google ya está vinculada' });
            return next(error);
        }
    };
}
