//* IMPORTS
import express from 'express';                              // Import de express
import { verifyToken } from '../utils/verifyUser.js';
import { create, getposts, deletepost, updatepost } from '../controllers/post.controller.js';

const router = express.Router();

router.post('/create', verifyToken, create);                // Ruta para crear un post, requiere verificación de token
router.get('/getposts', getposts);                          // Ruta para obtener un post, no requiere verificacion de token
router.delete('/deletepost/:postId/:userId', verifyToken, deletepost);  // Ruta para eliminar un post, requiere verificación de token
router.put('/updatepost/:postId/:userId', verifyToken, updatepost);

// Exportar el enrutador para usarlo en otras partes de la aplicación
export default router;