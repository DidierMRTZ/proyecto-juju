import mongoose, { Document, Schema, Model } from 'mongoose';

// Interfaz para el documento de libro
export interface IBook extends Document {
  title: string;
  author: string;
  publicationYear: number;
  status: 'available' | 'reserved';
  createdAt: Date;
  updatedAt: Date;
}

// Interfaz para el modelo de libro
export interface IBookModel extends Model<IBook> {
  findByTitle(title: string): Promise<IBook | null>;
  findByAuthor(author: string): Promise<IBook[]>;
  findAvailableBooks(): Promise<IBook[]>;
  findReservedBooks(): Promise<IBook[]>;
}

// Esquema del libro
const bookSchema = new Schema<IBook, IBookModel>({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    minlength: [1, 'El título debe tener al menos 1 carácter'],
    maxlength: [200, 'El título no puede exceder 200 caracteres'],
    validate: {
      validator: function(v: string) {
        return /^[a-zA-Z0-9\s\-_.,!?()&'":;]+$/.test(v);
      },
      message: 'El título contiene caracteres inválidos'
    }
  },
  
  author: {
    type: String,
    required: [true, 'El autor es requerido'],
    trim: true,
    minlength: [2, 'El nombre del autor debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre del autor no puede exceder 100 caracteres'],
    validate: {
      validator: function(v: string) {
        return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-'\.]+$/.test(v);
      },
      message: 'El nombre del autor solo puede contener letras, espacios, guiones, apóstrofes y puntos'
    }
  },
  
  publicationYear: {
    type: Number,
    required: [true, 'El año de publicación es requerido'],
    min: [1000, 'El año de publicación debe ser al menos 1000'],
    max: [new Date().getFullYear() + 1, 'El año de publicación no puede ser en el futuro'],
    validate: {
      validator: Number.isInteger,
      message: 'El año de publicación debe ser un número entero'
    }
  },
  
  status: {
    type: String,
    enum: {
      values: ['available', 'reserved'],
      message: 'El estado debe ser disponible o reservado'
    },
    default: 'available'
  }
}, {
  timestamps: true,
  versionKey: false,
  collection: 'books',
  strict: true,
  strictQuery: true
});

// Índices para mejorar el rendimiento
bookSchema.index({ title: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ publicationYear: -1 });
bookSchema.index({ status: 1 });
bookSchema.index({ title: 'text', author: 'text' }); // Búsqueda de texto

// Métodos estáticos
bookSchema.statics.findByTitle = function(title: string): Promise<IBook | null> {
  return this.findOne({ title: { $regex: title, $options: 'i' } });
};

bookSchema.statics.findByAuthor = function(author: string): Promise<IBook[]> {
  return this.find({ author: { $regex: author, $options: 'i' } }).sort({ title: 1 });
};

bookSchema.statics.findAvailableBooks = function(): Promise<IBook[]> {
  return this.find({ status: 'available' }).sort({ title: 1 });
};

bookSchema.statics.findReservedBooks = function(): Promise<IBook[]> {
  return this.find({ status: 'reserved' }).sort({ title: 1 });
};

// Middleware pre-save
bookSchema.pre('save', function(next) {
  try {
    // Capitalizar primera letra del título
    if (this.title) {
      this.title = this.title.charAt(0).toUpperCase() + this.title.slice(1);
    }
    
    // Capitalizar primera letra del autor
    if (this.author) {
      this.author = this.author.charAt(0).toUpperCase() + this.author.slice(1);
    }
    
    next();
  } catch (error: any) {
    next(error);
  }
});

// Middleware post-save para logging
bookSchema.post('save', function(doc) {
  console.log(`Libro "${doc.title}" de ${doc.author} guardado exitosamente`);
});

// Middleware post-deleteOne para logging
bookSchema.post('deleteOne', function(doc) {
  if (doc) {
    console.log(`Libro "${doc.title}" eliminado`);
  }
});

export default mongoose.model<IBook, IBookModel>('Book', bookSchema);
