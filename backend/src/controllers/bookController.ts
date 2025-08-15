import { Request, Response } from 'express';
import Book, { IBook } from '../models/Book';

// Crear un nuevo libro
export const createBook = async (req: Request, res: Response) => {
  try {
    const { title, author, publicationYear, status } = req.body;

    // Verificar si se proporcionaron los campos requeridos
    if (!title || !author || !publicationYear) {
      return res.status(400).json({
        success: false,
        message: 'El título, autor y año de publicación son requeridos'
      });
    }

    // Verificar si ya existe un libro con el mismo título y autor
    const existingBook = await Book.findOne({ 
      title: { $regex: title, $options: 'i' }, 
      author: { $regex: author, $options: 'i' } 
    });

    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un libro con este título y autor'
      });
    }

    // Crear nuevo libro
    const book = new Book({
      title,
      author,
      publicationYear,
      status: status || 'available'
    });

    await book.save();

    res.status(201).json({
      success: true,
      message: 'Libro creado exitosamente',
      data: {
        bookId: book._id,
        title: book.title,
        author: book.author,
        publicationYear: book.publicationYear,
        status: book.status,
        createdAt: book.createdAt
      }
    });

  } catch (error) {
    console.error('Error creando libro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener todos los libros
export const getAllBooks = async (req: Request, res: Response) => {
  try {
    // Log de autenticación
    const userEmail = req.user?.email || 'Usuario no identificado';
    const userRole = req.user?.role || 'Rol no identificado';
    console.log(`Usuario ${userEmail} (${userRole}) solicitando todos los libros`);

    const books = await Book.find().sort({ title: 1 });

    console.log(`${books.length} libros encontrados para ${userEmail}`);

    res.json({
      success: true,
      message: 'Libros obtenidos exitosamente',
      data: {
        count: books.length,
        books: books.map(book => ({
          bookId: book._id,
          title: book.title,
          author: book.author,
          publicationYear: book.publicationYear,
          status: book.status,
          createdAt: book.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Error obteniendo libros:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener libro por ID
export const getBookById = async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'El ID del libro es requerido'
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Libro obtenido exitosamente',
      data: {
        bookId: book._id,
        title: book.title,
        author: book.author,
        publicationYear: book.publicationYear,
        status: book.status,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt
      }
    });

  } catch (error) {
    console.error('Error obteniendo libro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener libros por título
export const getBooksByTitle = async (req: Request, res: Response) => {
  try {
    const { title } = req.params;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'El título es requerido'
      });
    }

    const books = await Book.findByTitle(title);

    if (!books) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron libros con este título'
      });
    }

    res.json({
      success: true,
      message: 'Libros encontrados exitosamente',
      data: {
        count: Array.isArray(books) ? books.length : 1,
        books: Array.isArray(books) ? books : [books]
      }
    });

  } catch (error) {
    console.error('Error buscando libros por título:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener libros por autor
export const getBooksByAuthor = async (req: Request, res: Response) => {
  try {
    const { author } = req.params;

    if (!author) {
      return res.status(400).json({
        success: false,
        message: 'El autor es requerido'
      });
    }

    const books = await Book.findByAuthor(author);

    res.json({
      success: true,
      message: 'Libros encontrados exitosamente',
      data: {
        count: books.length,
        books: books.map(book => ({
          bookId: book._id,
          title: book.title,
          author: book.author,
          publicationYear: book.publicationYear,
          status: book.status,
          createdAt: book.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Error buscando libros por autor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener libros disponibles
export const getAvailableBooks = async (req: Request, res: Response) => {
  try {
    const books = await Book.findAvailableBooks();

    res.json({
      success: true,
      message: 'Libros disponibles obtenidos exitosamente',
      data: {
        count: books.length,
        books: books.map(book => ({
          bookId: book._id,
          title: book.title,
          author: book.author,
          publicationYear: book.publicationYear,
          createdAt: book.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Error obteniendo libros disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener libros reservados
export const getReservedBooks = async (req: Request, res: Response) => {
  try {
    const books = await Book.findReservedBooks();

    res.json({
      success: true,
      message: 'Libros reservados obtenidos exitosamente',
      data: {
        count: books.length,
        books: books.map(book => ({
          bookId: book._id,
          title: book.title,
          author: book.author,
          publicationYear: book.publicationYear,
          createdAt: book.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Error obteniendo libros reservados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar libro
export const updateBook = async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;
    const { title, author, publicationYear, status } = req.body;

    // Log de autenticación
    const userEmail = req.user?.email || 'Usuario no identificado';
    const userRole = req.user?.role || 'Rol no identificado';
    console.log(`Usuario ${userEmail} (${userRole}) actualizando libro ${bookId}`);

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'El ID del libro es requerido'
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      console.log(`Libro ${bookId} no encontrado para ${userEmail}`);
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    // Actualizar campos si se proporcionaron
    if (title) book.title = title;
    if (author) book.author = author;
    if (publicationYear) book.publicationYear = publicationYear;
    if (status) book.status = status;

    await book.save();

    console.log(`Libro "${book.title}" actualizado exitosamente por ${userEmail}`);

    res.json({
      success: true,
      message: 'Libro actualizado exitosamente',
      data: {
        bookId: book._id,
        title: book.title,
        author: book.author,
        publicationYear: book.publicationYear,
        status: book.status,
        updatedAt: book.updatedAt
      }
    });

  } catch (error) {
    console.error('Error actualizando libro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar libro
export const deleteBook = async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;

    // Log de autenticación
    const userEmail = req.user?.email || 'Usuario no identificado';
    const userRole = req.user?.role || 'Rol no identificado';
    console.log(`Usuario ${userEmail} (${userRole}) eliminando libro ${bookId}`);

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'El ID del libro es requerido'
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      console.log(`Libro ${bookId} no encontrado para ${userEmail}`);
      return res.status(400).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    await Book.findByIdAndDelete(bookId);

    console.log(`Libro "${book.title}" eliminado exitosamente por ${userEmail}`);

    res.json({
      success: true,
      message: 'Libro eliminado exitosamente',
      data: {
        bookId: book._id,
        title: book.title,
        author: book.author
      }
    });

  } catch (error) {
    console.error('Error eliminando libro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
