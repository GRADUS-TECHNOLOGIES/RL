//* IMPORTS
import User from '../models/user.model.js'; // Import del modelo User para interactuar con la base de datos
import bcryptjs from 'bcryptjs'; // Import de bcrypt para el hash de contraseñas
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken'; // Import de jsonwebtoken para la creación de tokens JWT
import { randomUUID } from 'crypto';
import { logAuditEvent } from '../utils/auditClient.js';
import { verifyFirebaseToken } from '../utils/firebaseAuth.js';
import { createGoogleHandler } from './googleAuth.js';
import { createLinkFirebaseHandler } from './linkFirebase.js';
import { hasFirebaseUidIndex } from '../utils/firebaseUidIndex.js';

export const signup = async (req, res, next) => {
    // Desestructuración de los datos del cuerpo de la solicitud
    const { username, email, password } = req.body; // Extraemos username, email y password del cuerpo de la solicitud

    // Verificar que todos los campos requeridos están presentes
    if (
        !username ||
        !email ||
        !password ||
        username === '' ||
        email === '' ||
        password === ''
    ) {
        next(errorHandler(400, 'Todos los campos son obligatorios')); // Si falta algún campo, pasamos un error al siguiente middleware
    }

    // Hash de la contraseña usando bcryptjs
    // Se utiliza bcryptjs para crear un hash de la contraseña con un costo de 10 (rounds)
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // Crear una nueva instancia del modelo User con los datos proporcionados
    const newUser = new User({
        username,
        email,
        password: hashedPassword, // Almacenar la contraseña hasheada en lugar de la contraseña en texto plano
    });

    try {
        // Guardar el nuevo usuario en la base de datos
        await newUser.save();
        // Responder con un mensaje de éxito
        res.json('Registro exitoso');
    } catch (error) {
        next(error); // Pasar el error al siguiente middleware de manejo de errores
    }
};

export const signin = async (req, res, next) => {
    // Desestructuración de los datos del cuerpo de la solicitud
    const { email, password } = req.body; // Extraemos usuario y password del cuerpo de la solicitud

    // Verificar que todos los campos requeridos están presentes
    if (!email || !password || email === '' || password === '') {
        next(errorHandler(400, 'Todos los campos son obligatorios')); // Si falta algún campo, pasamos un error al siguiente middleware
    }

    try {
        // Buscar el usuario en la base de datos por su correo electrónico
        const validUser = await User.findOne({ email });
        if (!validUser) {
            logAuditEvent(req, {
                eventType: 'LOGIN_FAILED',
                success: false,
                statusCode: 404,
                metadata: { reason: 'user_not_found' },
            });
            return next(errorHandler(404, 'Usuario no encontrado')); // Si no se encuentra el usuario, pasamos un error al siguiente middleware
        }

        // Comparar la contraseña proporcionada con la contraseña almacenada en la base de datos
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) {
            logAuditEvent(req, {
                eventType: 'LOGIN_FAILED',
                success: false,
                userId: validUser._id.toString(),
                statusCode: 401,
                metadata: { reason: 'invalid_password' },
            });
            return next(errorHandler(401, 'Contraseña incorrecta')); // Si la contraseña no es válida, pasamos un error al siguiente middleware
        }

        // sid: identificador de sesión embebido en el JWT, permite correlacionar
        // los eventos de auditoría de una misma sesión (login → acciones → logout)
        const sessionId = randomUUID();

        // Crear un token JWT para el usuario autenticado
        const token = jwt.sign(
            { id: validUser._id, isAdmin: validUser.isAdmin, sid: sessionId },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Desestructuración para excluir la contraseña del objeto de usuario
        const { password: pass, ...rest } = validUser._doc;

        logAuditEvent(req, {
            eventType: 'LOGIN_SUCCESS',
            success: true,
            userId: validUser._id.toString(),
            actorIsAdmin: validUser.isAdmin,
            sessionId,
            statusCode: 200,
            metadata: { method: 'password' },
        });

        // Guardar el token en una cookie y enviar la respuesta al cliente
        res.status(200).cookie('access_token', token, {
            httpOnly: true, // La cookie solo es accesible a través de HTTP, no a través de JavaScript
            secure: process.env.NODE_ENV === 'production', // Importante para HTTPS
            sameSite: 'lax', // Evita problemas de navegación cruzada manteniendo protección CSRF básica
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        }).json(rest); // Responder con el usuario autenticado y el token

    } catch (error) {
        next(error); // Pasar el error al siguiente middleware de manejo de errores
    }
};

// Las cuentas existentes solo se utilizan si ya tienen un UID vinculado de
// forma explícita. El correo no constituye prueba suficiente de vinculación.
export const google = createGoogleHandler({ User, verifyFirebaseToken, jwt, logAuditEvent, hasFirebaseUidIndex });

export const linkFirebase = createLinkFirebaseHandler({ User, verifyFirebaseToken, bcrypt: bcryptjs, hasFirebaseUidIndex });
