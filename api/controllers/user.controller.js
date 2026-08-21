import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { errorHandler } from '../utils/error.js';
import User from '../models/user.model.js';
import { logAuditEvent } from '../utils/auditClient.js';

export const test = (req, res) => {
    // Respuesta de prueba para verificar que la ruta está funcionando
    res.json({ message: 'La API funciona :)' });
};

export const updateUser = async (req, res, next) => {
    if (req.user.id !== req.params.userId) {
        return next(errorHandler(403, 'You are not allowed to update this user'));
    }
    if (req.body.password) {
        if (req.body.password.length < 8) {
            return next(errorHandler(400, 'Password must be at least 8 characters'));
        }
        req.body.password = bcrypt.hashSync(req.body.password, 10);
    }
    if (req.body.username) {
        if (req.body.username.length < 7 || req.body.username.length > 20) {
            return next(errorHandler(400, 'Username must be between 7 and 20 characters'));
        }
        if (req.body.username.includes(' ')) {
            return next(errorHandler(400, 'Username cannot contain spaces'));
        }
        if (req.body.username !== req.body.username.toLowerCase()) {
            return next(errorHandler(400, 'Username must be lowercase'));
        }
        if (!req.body.username.match(/^[a-zA-z0-9]+$/)) {
            return next(errorHandler(400, 'Username can only contain letters and numbers'));
        }
    }
    try {
        const updateUser = await User.findByIdAndUpdate(req.params.userId, {
            $set: {
                username: req.body.username,
                email: req.body.email,
                profilePicture: req.body.profilePicture,
                password: req.body.password,
            },
        }, { new: true });
        const { password, ...rest } = updateUser._doc;

        // Un mismo envío puede incluir varios campos; la contraseña, por ser
        // el cambio más sensible, prevalece como tipo de evento si está presente.
        const changedFields = ['username', 'email', 'password', 'profilePicture']
            .filter((field) => req.body[field] !== undefined);
        logAuditEvent(req, {
            eventType: req.body.password ? 'PASSWORD_CHANGE' : 'ACCOUNT_CHANGE',
            success: true,
            userId: req.user.id,
            actorIsAdmin: req.user.isAdmin,
            sessionId: req.user.sid || null,
            statusCode: 200,
            metadata: { changedFields },
        });

        res.status(200).json(rest);
    } catch (error) {
        next(error)
    }
};

export const deleteUser = async (req, res, next) => {
    if (!req.user.isAdmin && req.user.id !== req.params.userId) {
        return next(errorHandler(403, 'You\'re not allowed to delete this user'));
    }
    try {
        await User.findByIdAndDelete(req.params.userId);

        logAuditEvent(req, {
            eventType: 'ACCOUNT_DELETED',
            success: true,
            userId: req.user.id,
            actorIsAdmin: req.user.isAdmin,
            sessionId: req.user.sid || null,
            statusCode: 200,
            metadata: {
                targetUserId: req.params.userId,
                selfDelete: req.user.id === req.params.userId,
            },
        });

        res.status(200).json('User has been deleted');
    } catch (error) {
        next(error);
    }
};

export const signout = (req, res, next) => {
    try {
        // signout no pasa por verifyToken (no requiere sesión válida para limpiar
        // la cookie), así que aquí solo se decodifica el token sin verificar —
        // únicamente para tener contexto informativo en el log, nunca como identidad confiable.
        const claimed = req.cookies?.access_token ? (jwt.decode(req.cookies.access_token) || {}) : {};
        logAuditEvent(req, {
            eventType: 'LOGOUT',
            success: true,
            userId: claimed.id || null,
            actorIsAdmin: claimed.isAdmin ?? null,
            sessionId: claimed.sid || null,
            statusCode: 200,
        });

        res.clearCookie('access_token').status(200).json('User has been signed out');
    } catch (error) {
        next(error);
    }
};

export const getUsers = async (req, res, next) => {
    if (!req.user.isAdmin) {
        return next(errorHandler(403, 'You are not allowed to get users'));
    }
    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.sort === 'asc' ? 1 : -1;

        const users = await User.find()
            .sort({ createdAt: sortDirection })
            .skip(startIndex)
            .limit(limit);

        const usersWithoutPassword = users.map((user) => {
            const { password, ...rest } = user._doc;
            return rest;
        });

        const totalUsers = await User.countDocuments();

        const now = new Date();

        const oneMonthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
        );
        const lastMonthUsers = await User.countDocuments({
            createdAt: { $gte: oneMonthAgo }
        });

        res.status(200).json({
            users: usersWithoutPassword,
            totalUsers,
            lastMonthUsers,
        });
    } catch (error) {
        next(error);
    }
};

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }
        const { password, ...rest } = user._doc;
        res.status(200).json(rest);
    } catch (error) {
        next(error);
    }
};

export const updateUserRole = async (req, res, next) => {
    try {
        // Verificar que el usuario que hace la acción es admin
        if (!req.user || !req.user.isAdmin) {
            return next(errorHandler(403, 'No tienes permiso para realizar esta acción'));
        }

        const { userId } = req.params;

        // Buscar el usuario a modificar
        const userToUpdate = await User.findById(userId);

        if (!userToUpdate) {
            return next(errorHandler(404, 'Usuario no encontrado'));
        }

        // Actualizar el rol
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { isAdmin: req.body.isAdmin },
            { new: true }
        );

        // Evento de mayor valor de seguridad del proyecto: un admin cambiando
        // privilegios de otra cuenta.
        logAuditEvent(req, {
            eventType: 'PERMISSION_CHANGE',
            success: true,
            userId: req.user.id,
            actorIsAdmin: req.user.isAdmin,
            sessionId: req.user.sid || null,
            statusCode: 200,
            metadata: {
                targetUserId: userId,
                previousIsAdmin: userToUpdate.isAdmin,
                newIsAdmin: updatedUser.isAdmin,
            },
        });

        // Devolver respuesta exitosa
        res.status(200).json({
            message: `Rol actualizado a ${updatedUser.isAdmin ? 'Admin' : 'User'}`,
            user: updatedUser,
        });

    } catch (error) {
        next(error);
    }
};