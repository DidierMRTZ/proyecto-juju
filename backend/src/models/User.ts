import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcrypt';

// Interfaz para el documento de usuario
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  age?: number;
  phone?: string;
  isActive: boolean;
  role: 'user' | 'admin' | 'moderator';
  createdAt: Date;
  updatedAt: Date;
  
  // Métodos de instancia
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Interfaz para el modelo 
export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findActiveUsers(): Promise<IUser[]>;
}

// Esquema del usuario
const userSchema = new Schema<IUser, IUserModel>({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede exceder 50 caracteres'],
    validate: {
      validator: function(v: string) {
        return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v);
      },
      message: 'El nombre solo puede contener letras y espacios'
    }
  },
  
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Por favor ingresa un email válido'
    }
  },
  
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    maxlength: [128, 'La contraseña no puede exceder 128 caracteres'],
    validate: {
      validator: function(v: string) {
        // Al menos una letra mayúscula, una minúscula, un número y un carácter especial
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(v);
      },
      message: 'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial'
    }
  },
  
  age: {
    type: Number,
    min: [13, 'Debes ser mayor de 13 años'],
    max: [120, 'La edad no puede exceder 120 años'],
    validate: {
      validator: Number.isInteger,
      message: 'La edad debe ser un número entero'
    }
  },
  
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Opcional
        return /^[\+]?[1-9][\d]{0,15}$/.test(v);
      },
      message: 'Por favor ingresa un número de teléfono válido'
    }
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  role: {
    type: String,
    enum: {
      values: ['user', 'admin', 'moderator'],
      message: 'El rol debe ser: user, admin o moderator'
    },
    default: 'user',
    index: true
  }
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
  versionKey: false, // Elimina completamente el campo __v
  collection: 'users', // Nombre explícito de la colección
  strict: true, // Solo permite campos definidos en el esquema
  strictQuery: true // Solo permite consultas con campos definidos
});

// Índices para mejorar el rendimiento
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ name: 'text', email: 'text' }); // Búsqueda de texto

// Métodos de instancia
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    // Comparar contraseña candidata con el hash almacenado
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Error comparando contraseñas:', error);
    return false;
  }
};

// Métodos estáticos
userSchema.statics.findByEmail = function(email: string): Promise<IUser | null> {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function(): Promise<IUser[]> {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

// Middleware pre-save para validaciones y transformaciones
userSchema.pre('save', async function(next) {
  try {
    // Capitalizar primera letra del nombre
    if (this.name) {
      this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
    }
    
    // Normalizar email
    if (this.email) {
      this.email = this.email.toLowerCase().trim();
    }
    
    // Hashear contraseña solo si se modificó o es nueva
    if (this.isModified('password')) {
      const saltRounds = 12; // Número de rondas de salt (más alto = más seguro pero más lento)
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
    
    next();
  } catch (error: any) {
    next(error);
  }
});

// Middleware pre-validate para validaciones personalizadas
userSchema.pre('validate', function(next) {
  // Validar que el email no esté duplicado (excepto en updates)
  if (this.isNew || this.isModified('email')) {
    const UserModel = this.constructor as IUserModel;
    UserModel.findOne({ email: this.email, _id: { $ne: this._id } })
      .then((existingUser: IUser | null) => {
        if (existingUser) {
          this.invalidate('email', 'Ya existe un usuario con este email');
        }
        next();
      })
      .catch(next);
  } else {
    next();
  }
});

// Middleware post-save para logging
userSchema.post('save', function(doc) {
  console.log(`Usuario ${doc.email} guardado exitosamente`);
});

// Middleware post-deleteOne para logging (reemplaza post-remove)
userSchema.post('deleteOne', function(doc) {
  if (doc) {
    console.log(`Usuario ${doc.email} eliminado`);
  }
});

// Transformar documento para excluir password automáticamente
userSchema.set('toJSON', {
  transform: function(doc, ret: any) {
    delete ret.password; // Eliminar password de todas las respuestas
    return ret;
  }
});

export default mongoose.model<IUser, IUserModel>('User', userSchema);
