import { Router } from 'express';
import { createUser, getAllUsers, getUserByEmail, getUsersByRole } from '../controllers/userControllers';

const router = Router();

// Rutas para usuarios
router.post('/', createUser);                    // POST /api/users - Crear usuario
router.get('/', getAllUsers);                    // GET /api/users - Obtener todos los usuarios
router.get('/role/:role', getUsersByRole);      // GET /api/users/role/:role - Obtener usuarios por rol
router.get('/:email', getUserByEmail);          // GET /api/users/:email - Buscar usuario por email

export default router;