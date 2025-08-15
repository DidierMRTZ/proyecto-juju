import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// crear usuario nuevo
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, age, phone, role } = req.body;

    // check required fields
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios: name, email, password'
      });
      return;
    }

    // ver si ya existe el usuario
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Este email ya está registrado'
      });
      return;
    }

    // crear el usuario
    const newUser = new User({
      name,
      email,
      password,
      age: age || undefined,
      phone: phone || undefined,
      role: role || 'user' // default role
    });

    // guardar en BD
    const savedUser = await newUser.save();

    // retornar respuesta sin password
    const userResponse = savedUser.toJSON();

    res.status(201).json({
      success: true,
      message: 'Usuario creado!',
      data: userResponse
    });

  } catch (error: any) {
    console.error('Error al crear usuario:', error);
    
    // validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: validationErrors
      });
      return;
    }

    // generic error
    res.status(500).json({
      success: false,
      message: 'Algo salió mal en el servidor'
    });
  }
};

// login de usuario
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // validar campos
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email y password son requeridos'
      });
      return;
    }

    // buscar usuario por email
    const user = await User.findByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
      return;
    }

    // verificar si el usuario está activo
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Cuenta desactivada'
      });
      return;
    }

    // verificar contraseña usando bcrypt
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
      return;
    }

    // generar JWT token
    const jwtSecret = process.env.JWT_SECRET || 'tu-secret-key-super-segura';
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      jwtSecret,
      { expiresIn: '24h' } // token expira en 24 horas
    );

    // login exitoso - retornar usuario sin password y token
    const userResponse = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: userResponse,
        token: token
      }
    });

  } catch (error: any) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// obtener todos los usuarios
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // usar el método del modelo
    const users = await User.findActiveUsers();
    
    res.status(200).json({
      success: true,
      message: 'Usuarios obtenidos',
      count: users.length,
      data: users
    });

  } catch (error: any) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// buscar por email
export const getUserByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.params;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email es requerido'
      });
      return;
    }

    // buscar usuario
    const user = await User.findByEmail(email);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        email: email
      });
      return;
    }

    const userResponse = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Usuario encontrado',
      data: userResponse
    });

  } catch (error: any) {
    console.error('Error buscando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno'
    });
  }
};

// obtener usuarios por rol
export const getUsersByRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.params;

    if (!role) {
      res.status(400).json({
        success: false,
        message: 'Rol es requerido'
      });
      return;
    }

    // validar rol
    const validRoles = ['user', 'admin', 'moderator'];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        success: false,
        message: `Rol inválido. Debe ser: ${validRoles.join(', ')}`
      });
      return;
    }

    // buscar por rol
    const users = await User.find({ role, isActive: true }, '-password').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      message: `Usuarios con rol ${role}`,
      count: users.length,
      data: users
    });

  } catch (error: any) {
    console.error('Error obteniendo usuarios por rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};
