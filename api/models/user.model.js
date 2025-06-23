//* IMPORTS
import mongoose from 'mongoose'; // Import de mongoose para crear el modelo de usuario

//* SCHEMA
// Definición del esquema de usuario
const userSchema = new mongoose.Schema({
        // Definición de los campos del esquema
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        profilePicture: {
            type: String,
            default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png', // Imagen de perfil por defecto 
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true } // Se añade la opción de timestamps para crear los campos createdAt y updatedAt automáticamente
);

//* MODEL
// Creación del modelo de usuario a partir del esquema definido anteriormente
const User = mongoose.model('User', userSchema);

//* EXPORTS
// Exportación del modelo de usuario para poder utilizarlo en otras partes de la aplicación
export default User;