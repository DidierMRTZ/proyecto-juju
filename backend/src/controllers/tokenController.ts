import { Request, Response } from 'express';
import Token, { IToken } from '../models/Token';
import User from '../models/User';
import bcrypt from 'bcrypt';

// Crear token de reset de password
export const createPasswordResetToken = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El email es requerido'
      });
    }

    // Buscar si el usuario existe
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Invalidar tokens anteriores del mismo tipo
    await Token.updateMany(
      { userId: user._id, tokenType: 'password_reset', used: false },
      { used: true }
    );

    // Crear nuevo token
    const token = new Token({
      userId: user._id,
      tokenType: 'password_reset',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await token.save();

    // En un caso real, acá enviarías el email con el resetToken
    // Por ahora solo lo devolvemos para testing
    console.log('TOKEN GENERADO PARA TESTING:', {
      tokenId: token.tokenId,
      resetToken: token.resetToken,
      userId: token.userId,
      expiresAt: token.expiresAt,
      tokenType: token.tokenType
    });
    
    res.status(201).json({
      success: true,
      message: 'Token de reset creado exitosamente',
      data: {
        tokenId: token.tokenId,
        resetToken: token.resetToken, // Solo para testing - en producción no se devuelve
        expiresAt: token.expiresAt,
        message: 'Revisa tu email para continuar con el reset de password'
      }
    });

  } catch (error) {
    console.error('Error creando token de reset:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Validar y usar token para reset de password
export const resetPasswordWithToken = async (req: Request, res: Response) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token y nueva contraseña son requeridos'
      });
    }

    // Buscar el token
    const token = await Token.findOne({ 
      resetToken, 
      tokenType: 'password_reset',
      used: false 
    });

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o ya usado'
      });
    }

    // Verificar si el token puede ser usado
    if (!token.canBeUsed()) {
      if (token.isExpired()) {
        return res.status(400).json({
          success: false,
          message: 'El token ha expirado'
        });
      }
      
      if (token.attemptsLeft <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Se agotaron los intentos para usar este token'
        });
      }
    }

    // Validar nueva contraseña usando exactamente la misma validación del modelo User
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    }
    
    if (newPassword.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña no puede exceder 128 caracteres'
      });
    }
    
    // Usar exactamente el mismo validador del modelo User
    const passwordValidator = function(v: string) {
      // Al menos una letra mayúscula, una minúscula, un número y un carácter especial
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(v);
    };
    
    if (!passwordValidator(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial'
      });
    }

    // Buscar el usuario
    const user = await User.findById(token.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar password del usuario
    user.password = newPassword;
    await user.save();

    // Marcar token como usado
    token.used = true;
    await token.save();

    res.json({
      success: true,
      message: 'Password actualizado exitosamente',
      data: {
        userId: user._id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error reseteando password:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener tokens de un usuario
export const getUserTokens = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario es requerido'
      });
    }

    const tokens = await Token.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Tokens obtenidos exitosamente',
      data: {
        tokens: tokens.map(token => ({
          tokenId: token.tokenId,
          tokenType: token.tokenType,
          createdAt: token.createdAt,
          expiresAt: token.expiresAt,
          attemptsLeft: token.attemptsLeft,
          used: token.used,
          ipAddress: token.ipAddress
        }))
      }
    });

  } catch (error) {
    console.error('Error obteniendo tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Limpiar tokens expirados (endpoint administrativo)
export const cleanupExpiredTokens = async (req: Request, res: Response) => {
  try {
    await Token.cleanupExpiredTokens();

    res.json({
      success: true,
      message: 'Limpieza de tokens completada'
    });

  } catch (error) {
    console.error('Error limpiando tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};


