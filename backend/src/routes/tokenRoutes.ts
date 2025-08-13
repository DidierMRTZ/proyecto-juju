import express from 'express';
import {
  createPasswordResetToken,
  resetPasswordWithToken,
  getUserTokens,
  cleanupExpiredTokens
} from '../controllers/tokenController';

const router = express.Router();

// POST /api/tokens/reset-password - Crear token para reset de password
router.post('/reset-password', createPasswordResetToken);

// POST /api/tokens/reset-password/confirm - Confirmar reset de password con token
router.post('/reset-password/confirm', resetPasswordWithToken);

// GET /api/tokens/user/:userId - Obtener todos los tokens de un usuario
router.get('/user/:userId', getUserTokens);

// POST /api/tokens/cleanup - Limpiar tokens expirados (admin)
router.post('/cleanup', cleanupExpiredTokens);



export default router;
