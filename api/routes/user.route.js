//* IMPORTS
import express from 'express';
import { test, updateUser, deleteUser, signout, getUsers, getUser, updateUserRole } from '../controllers/user.controller.js'; // Import de la función de prueba del controlador de usuario
import { verifyToken } from '../utils/verifyUser.js';

// Crear un enrutador de Express
const router = express.Router();

router.get('/test', test);
router.put('/update/:userId', verifyToken, updateUser);
router.delete('/delete/:userId', verifyToken, deleteUser);
router.post('/signout', signout);
router.get('/getusers', verifyToken, getUsers);
router.get('/:userId', getUser);
router.put('/updateUserRole/:userId', verifyToken, updateUserRole);

// Exportar el enrutador para usarlo en otras partes de la aplicación
export default router;