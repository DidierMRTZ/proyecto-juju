import { Router } from 'express';
import { createUser, loginUser, getAllUsers, getUserByEmail, getUsersByRole } from '../controllers/userControllers';

const router = Router();

// rutas de usuarios
router.post('/', createUser);                    // crear usuario
router.post('/login', loginUser);               // login
router.get('/', getAllUsers);                    // listar todos
router.get('/role/:role', getUsersByRole);      // por rol
router.get('/:email', getUserByEmail);          // buscar por email

export default router;
