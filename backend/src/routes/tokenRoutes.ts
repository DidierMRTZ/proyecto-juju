import express from 'express';
import {
  createPasswordResetToken,
  resetPasswordWithToken,
  getUserTokens,
  cleanupExpiredTokens
} from '../controllers/tokenController';

const router = express.Router();

/**
 * @swagger
 * /api/tokens/reset-password:
 *   post:
 *     summary: Crear token de reset de contraseña
 *     tags: [Tokens]
 *     description: Genera un token único para resetear la contraseña de un usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario que solicita el reset
 *                 example: "usuario@example.com"
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Token de reset creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token de reset creado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     resetToken:
 *                       type: string
 *                       description: Token único para resetear contraseña
 *                       example: "adf36d6ef2ff8088dc024d682a9f896b71558d3119a5317c26661890a91dc3ca"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de expiración del token
 *                     attemptsLeft:
 *                       type: number
 *                       description: Número de intentos restantes
 *                       example: 3
 *       400:
 *         description: Email inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/reset-password', createPasswordResetToken);

/**
 * @swagger
 * /api/tokens/reset-password/confirm:
 *   post:
 *     summary: Confirmar reset de contraseña
 *     tags: [Tokens]
 *     description: Confirma el reset de contraseña usando el token generado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resetToken:
 *                 type: string
 *                 description: Token de reset recibido por email
 *                 example: "adf36d6ef2ff8088dc024d682a9f896b71558d3119a5317c26661890a91dc3ca"
 *               newPassword:
 *                 type: string
 *                 description: Nueva contraseña (debe comenzar con mayúscula, contener número y carácter especial)
 *                 example: "NuevaPass123!"
 *             required:
 *               - resetToken
 *               - newPassword
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Contraseña cambiada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: ID del usuario cuya contraseña fue cambiada
 *                     email:
 *                       type: string
 *                       description: Email del usuario
 *       400:
 *         description: Token inválido o contraseña no cumple requisitos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token expirado o ya usado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/reset-password/confirm', resetPasswordWithToken);

/**
 * @swagger
 * /api/tokens/user/{userId}:
 *   get:
 *     summary: Obtener tokens de un usuario
 *     tags: [Tokens]
 *     description: Retorna todos los tokens asociados a un usuario específico
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Tokens obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Tokens obtenidos exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                       description: Número de tokens encontrados
 *                     tokens:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Token'
 *       400:
 *         description: ID de usuario inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/user/:userId', getUserTokens);

/**
 * @swagger
 * /api/tokens/cleanup:
 *   post:
 *     summary: Limpiar tokens expirados
 *     tags: [Tokens]
 *     description: Elimina todos los tokens expirados del sistema
 *     responses:
 *       200:
 *         description: Limpieza completada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Limpieza de tokens completada"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: number
 *                       description: Número de tokens eliminados
 *                       example: 15
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/cleanup', cleanupExpiredTokens);

export default router;
