//* IMPORTS
import User from '../models/user.model.js'; // Import del modelo User para interactuar con la base de datos
import bcryptjs from 'bcryptjs'; // Import de bcrypt para el hash de contraseñas
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken'; // Import de jsonwebtoken para la creación de tokens JWT

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
            return next(errorHandler(404, 'Usuario no encontrado')); // Si no se encuentra el usuario, pasamos un error al siguiente middleware
        }

        // Comparar la contraseña proporcionada con la contraseña almacenada en la base de datos
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) {
            return next(errorHandler(401, 'Contraseña incorrecta')); // Si la contraseña no es válida, pasamos un error al siguiente middleware
        }

        // Crear un token JWT para el usuario autenticado
        const token = jwt.sign({ id: validUser._id, isAdmin: validUser.isAdmin }, process.env.JWT_SECRET);

        // Desestructuración para excluir la contraseña del objeto de usuario
        const { password: pass, ...rest } = validUser._doc;

        // Guardar el token en una cookie y enviar la respuesta al cliente
        res.status(200).cookie('access_token', token, {
            httpOnly: true, // La cookie solo es accesible a través de HTTP, no a través de JavaScript
        }).json(rest); // Responder con el usuario autenticado y el token

    } catch (error) {
        next(error); // Pasar el error al siguiente middleware de manejo de errores
    }
};

export const google = async (req, res, next) => {
    // Desestructuración de los datos del cuerpo de la solicitud
    const { name, email, googlePhotoUrl } = req.body; // Extraemos name, email y googlePhotoUrl del cuerpo de la solicitud

    try {
        const user = await User.findOne({ email }); // Buscar el usuario en la base de datos por su correo electrónico

        if (user) {
            const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET); // Crear un token JWT para el usuario existente
            const { password: pass, ...rest } = user._doc; // Desestructuración para excluir la contraseña del objeto de usuario
            res.status(200).cookie('access_token', token, {
                httpOnly: true, // La cookie solo es accesible a través de HTTP, no a través de JavaScript
            }).json(rest); // Responder con el usuario autenticado y el token
        } else {
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8); // Generar una contraseña aleatoria
            const hashedPassword = bcryptjs.hashSync(generatedPassword, 10); // Hashear la contraseña generada
            const newUser = new User({
                username: name.toLowerCase().split(' ').join('') + Math.random().toString(9).slice(-4), // Generar un nombre de usuario único
                email,
                password: hashedPassword, // Almacenar la contraseña hasheada en lugar de la contraseña en texto plano
                profilePicture: googlePhotoUrl
            });
            await newUser.save(); // Guardar el nuevo usuario en la base de datos
            const token = jwt.sign({ id: newUser._id, isAdmin: newUser.isAdmin }, process.env.JWT_SECRET); // Crear un token JWT para el nuevo usuario
            const { password: pass, ...rest } = newUser._doc; // Desestructuración para excluir la contraseña del objeto de usuario
            res.status(200).cookie('access_token', token, {
                httpOnly: true, // La cookie solo es accesible a través de HTTP, no a través de JavaScript
            }).json(rest); // Responder con el usuario autenticado y el token
        }
    } catch (error) {
        next(error); // Pasar el error al siguiente middleware de manejo de errores
    }
}