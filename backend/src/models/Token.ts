import mongoose, { Document, Schema, Model } from 'mongoose';
import crypto from 'crypto';

// Interfaz para el token - básicamente lo que necesitamos para que funcione
export interface IToken extends Document {
  tokenId: string;
  userId: string;
  resetToken: string;
  createdAt: Date;
  expiresAt: Date;
  attemptsLeft: number;
  used: boolean;
  tokenType: 'password_reset' | 'email_verification' | 'account_activation';
  ipAddress?: string;
  userAgent?: string;
  
  // Métodos que vamos a usar
  isExpired(): boolean;
  canBeUsed(): boolean;
  decrementAttempts(): void;
}

// Interfaz para el modelo - para los métodos estáticos
export interface ITokenModel extends Model<IToken> {
  generateResetToken(): string;
  findByUserAndType(userId: string, tokenType: string): Promise<IToken | null>;
  cleanupExpiredTokens(): Promise<void>;
}

// Esquema del token - acá es donde está la magia
const tokenSchema = new Schema<IToken, ITokenModel>({
  tokenId: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(16).toString('hex') // Generamos un ID único automáticamente
  },
  
  userId: {
    type: String,
    ref: 'User',
    required: true,
    index: true // Para buscar rápido los tokens de un usuario
  },
  
  resetToken: {
    type: String,
    required: false, // No requerido inicialmente, se genera en pre-save
    unique: true,
    index: true // Para validar tokens rápidamente
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true // Para limpiar tokens viejos
  },
  
  expiresAt: {
    type: Date,
    required: false, // No requerido inicialmente, se calcula en pre-save
    index: true // Para saber cuáles ya expiraron
  },
  
  attemptsLeft: {
    type: Number,
    default: 3, // 3 intentos antes de bloquear
    min: [0, 'No pueden quedar intentos negativos'],
    max: [5, 'Máximo 5 intentos permitidos']
  },
  
  used: {
    type: Boolean,
    default: false,
    index: true // Para filtrar tokens no usados
  },
  
  tokenType: {
    type: String,
    enum: ['password_reset', 'email_verification', 'account_activation'],
    required: true,
    index: true // Para buscar por tipo
  },
  
  ipAddress: {
    type: String,
    trim: true
  },
  
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true, // createdAt y updatedAt automáticos
  versionKey: false, // Sin __v, como en User
  collection: 'tokens'
});

// Índices compuestos para las consultas que más hacemos
tokenSchema.index({ userId: 1, tokenType: 1, used: 1 });
tokenSchema.index({ expiresAt: 1, used: 1 }); // Para limpieza automática

// Métodos de instancia - estos los usamos en cada token individual
tokenSchema.methods.isExpired = function(): boolean {
  return new Date() > this.expiresAt;
};

tokenSchema.methods.canBeUsed = function(): boolean {
  return !this.used && this.attemptsLeft > 0 && !this.isExpired();
};

tokenSchema.methods.decrementAttempts = function(): void {
  if (this.attemptsLeft > 0) {
    this.attemptsLeft -= 1;
  }
};

// Métodos estáticos - estos los usamos en el modelo completo
tokenSchema.statics.generateResetToken = function(): string {
  // Generamos un token seguro de 32 bytes
  return crypto.randomBytes(32).toString('hex');
};

tokenSchema.statics.findByUserAndType = function(userId: string, tokenType: string): Promise<IToken | null> {
  return this.findOne({ 
    userId, 
    tokenType, 
    used: false,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 }); // El más reciente primero
};

tokenSchema.statics.cleanupExpiredTokens = async function(): Promise<void> {
  try {
    const result = await this.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { used: true, createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // Tokens usados de hace más de 7 días
      ]
    });
    
    if (result.deletedCount > 0) {
      console.log(`Limpiados ${result.deletedCount} tokens expirados/usados`);
    }
  } catch (error) {
    console.error('Error limpiando tokens:', error);
  }
};

// Middleware pre-save - validaciones antes de guardar
tokenSchema.pre('save', function(next) {
  const token = this as any;
  // Si no se especificó expiresAt, lo calculamos automáticamente
  if (!token.expiresAt) {
    const hours = token.tokenType === 'password_reset' ? 1 : 24; // Reset de password expira en 1h, otros en 24h
    token.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  }
  
  // Si no se especificó resetToken, lo generamos
  if (!token.resetToken) {
    token.resetToken = crypto.randomBytes(32).toString('hex');
  }
  
  next();
});

// Middleware post-save - logging después de guardar
tokenSchema.post('save', function(doc) {
  const token = doc as any;
  console.log(`🔑 Token ${token.tokenType} creado para usuario ${token.userId}`);
});

// Middleware post-deleteOne - logging después de eliminar
tokenSchema.post('deleteOne', function(doc) {
  if (doc) {
    const token = doc as any;
    console.log(`🗑️ Token ${token.tokenType} eliminado para usuario ${token.userId}`);
  }
});

// Transformar documento para JSON - sin campos sensibles
tokenSchema.set('toJSON', {
  transform: function(doc, ret: any) {
    // No mostramos el resetToken completo por seguridad
    if (ret.resetToken) {
      ret.resetToken = ret.resetToken.substring(0, 8) + '...';
    }
    return ret;
  }
});

export default mongoose.model<IToken, ITokenModel>('Token', tokenSchema);
