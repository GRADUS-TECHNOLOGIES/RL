//* IMPORTS
import express from 'express';                              // Import de express
import { google, signup, signin } from '../controllers/auth.controller.js'; // Import de la función signup del controlador de autenticación

// Crear un enrutador de Express
const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google', google);

// Exportar el enrutador para usarlo en otras partes de la aplicación
export default router;