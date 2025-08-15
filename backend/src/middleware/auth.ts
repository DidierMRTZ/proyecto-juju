import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extender la interfaz Request para incluir el usuario decodificado
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

// Middleware de autenticación
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
        error: 'MISSING_TOKEN'
      });
      return;
    }

    // Verificar el token
    const jwtSecret = process.env.JWT_SECRET || 'tu-secret-key-super-segura';
    
    jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
      if (err) {
        console.error('Error verificando token:', err.message);
        
        if (err.name === 'TokenExpiredError') {
          res.status(401).json({
            success: false,
            message: 'Token expirado',
            error: 'TOKEN_EXPIRED'
          });
        } else if (err.name === 'JsonWebTokenError') {
          res.status(401).json({
            success: false,
            message: 'Token inválido',
            error: 'INVALID_TOKEN'
          });
        } else {
          res.status(401).json({
            success: false,
            message: 'Token no válido',
            error: 'TOKEN_VERIFICATION_FAILED'
          });
        }
        return;
      }

      // Token válido - agregar información del usuario a la request
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };

      console.log(`Usuario autenticado: ${decoded.email} (${decoded.role})`);
      next();
    });

  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'AUTH_MIDDLEWARE_ERROR'
    });
  }
};

// Middleware opcional para roles específicos
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'NOT_AUTHENTICATED'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción',
        error: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRole: req.user.role
      });
      return;
    }

    console.log(`Usuario ${req.user.email} tiene rol ${req.user.role} - Acceso permitido`);
    next();
  };
};

// Middleware para verificar si el usuario es propietario del recurso o admin
export const requireOwnershipOrAdmin = (resourceUserIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'NOT_AUTHENTICATED'
      });
      return;
    }

    // Los administradores pueden acceder a todo
    if (req.user.role === 'admin') {
      console.log(`Admin ${req.user.email} - Acceso permitido a todos los recursos`);
      return next();
    }

    // Verificar si el usuario es propietario del recurso
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (req.user.userId === resourceUserId) {
      console.log(`Usuario ${req.user.email} - Acceso permitido a su propio recurso`);
      return next();
    }

    res.status(403).json({
      success: false,
      message: 'No tienes permisos para acceder a este recurso',
      error: 'RESOURCE_ACCESS_DENIED',
      userRole: req.user.role,
      resourceUserId: resourceUserId
    });
  };
};
