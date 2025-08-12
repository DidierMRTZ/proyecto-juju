import { Request, Response } from 'express';
import Users, { IUser } from '../models/Users';

// Crear un nuevo usuario
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, age, phone, role } = req.body;

    // Validar campos requeridos
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Los campos name, email y password son requeridos'
      });
      return;
    }

    // Verificar si el usuario ya existe usando el método estático del modelo
    const existingUser = await Users.findByEmail(email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Ya existe un usuario con este email'
      });
      return;
    }

    // Crear el nuevo usuario con campos opcionales
    const newUser = new Users({
      name,
      email,
      password,
      age: age || undefined,
      phone: phone || undefined,
      role: role || 'user'
    });

    // Guardar el usuario en la base de datos
    const savedUser = await newUser.save();

    // Retornar el usuario creado (sin password) usando toJSON del modelo
    const userResponse = savedUser.toJSON();

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: userResponse
    });

  } catch (error: any) {
    console.error('❌ Error creando usuario:', error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: validationErrors
      });
      return;
    }

    // Error genérico
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener todos los usuarios
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Usar el método estático del modelo para obtener usuarios activos
    const users = await Users.findActiveUsers();
    
    res.status(200).json({
      success: true,
      message: 'Usuarios obtenidos exitosamente',
      count: users.length,
      data: users
    });

  } catch (error: any) {
    console.error('❌ Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Buscar usuario por email
export const getUserByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.params;

    // Validar que se proporcione el email
    if (!email) {
      res.status(400).json({
        success: false,
        message: 'El email es requerido'
      });
      return;
    }

    // Usar el método estático del modelo para buscar por email
    const user = await Users.findByEmail(email);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        email: email
      });
      return;
    }

    // Usar toJSON del modelo para excluir password automáticamente
    const userResponse = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Usuario encontrado exitosamente',
      data: userResponse
    });

  } catch (error: any) {
    console.error('❌ Error buscando usuario por email:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener usuarios por rol
export const getUsersByRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.params;

    // Validar que se proporcione el rol
    if (!role) {
      res.status(400).json({
        success: false,
        message: 'El rol es requerido'
      });
      return;
    }

    // Validar que el rol sea válido
    const validRoles = ['user', 'admin', 'moderator'];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Rol inválido. Roles válidos: user, admin, moderator'
      });
      return;
    }

    // Buscar usuarios por rol
    const users = await Users.find({ role, isActive: true }, '-password').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      message: `Usuarios con rol ${role} obtenidos exitosamente`,
      count: users.length,
      data: users
    });

  } catch (error: any) {
    console.error('❌ Error obteniendo usuarios por rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
