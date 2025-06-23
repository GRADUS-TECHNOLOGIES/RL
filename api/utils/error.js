export const errorHandler = (statusCode, message) => {
    const error = new Error(); // Crear un nuevo objeto de error
    error.statusCode = statusCode; // Asignar el código de estado al error
    error.message = message; // Asignar el mensaje al error
    return error; // Retornar el objeto de error
};