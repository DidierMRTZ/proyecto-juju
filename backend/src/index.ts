import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import connectDB from './config/bd';
import userRoutes from './routes/userRoutes';
import tokenRoutes from './routes/tokenRoutes';
import bookRoutes from './routes/bookRoutes';

// cargar variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API de Biblioteca - Proyecto Juju',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    showCommonExtensions: true,
    persistAuthorization: true
  }
}));

// ruta principal
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend de usuarios funcionando!',
    status: 'ok',
    timestamp: new Date().toISOString(),
    documentation: '/api-docs',
    endpoints: {
      users: {
        createUser: 'POST /api/users',
        login: 'POST /api/users/login',
        getAllUsers: 'GET /api/users',
        getUsersByRole: 'GET /api/users/role/:role',
        getUserByEmail: 'GET /api/users/:email'
      },
      tokens: {
        createResetToken: 'POST /api/tokens/reset-password',
        resetPassword: 'POST /api/tokens/reset-password/confirm',
        getUserTokens: 'GET /api/tokens/user/:userId',
        cleanupTokens: 'POST /api/tokens/cleanup',
      },
      books: {
        createBook: 'POST /api/books',
        getAllBooks: 'GET /api/books',
        getBookById: 'GET /api/books/:bookId',
        getBooksByTitle: 'GET /api/books/title/:title',
        getBooksByAuthor: 'GET /api/books/author/:author',
        getAvailableBooks: 'GET /api/books/available',
        getReservedBooks: 'GET /api/books/reserved',
        updateBook: 'PUT /api/books/:bookId',
        deleteBook: 'DELETE /api/books/:bookId'
      }
    }
  });
});

// health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    database: 'MongoDB',
    uptime: process.uptime(),
    documentation: '/api-docs'
  });
});

// rutas de la API
app.use('/api/users', userRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/books', bookRoutes);

// manejo de errores
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    documentation: '/api-docs',
    availableEndpoints: [
      'GET / - info del servidor',
      'GET /health - estado',
      'GET /api-docs - documentación Swagger',
      'POST /api/users - crear usuario',
      'POST /api/users/login - login',
      'GET /api/users - listar usuarios',
      'GET /api/users/role/:role - por rol',
      'GET /api/users/:email - por email',
      'POST /api/tokens/reset-password - crear token reset',
      'POST /api/tokens/reset-password/confirm - resetear password',
      'GET /api/tokens/user/:userId - tokens del usuario',
      'POST /api/tokens/cleanup - limpiar tokens',
      'POST /api/books - crear libro',
      'GET /api/books - listar libros',
      'GET /api/books/:bookId - libro por ID',
      'GET /api/books/title/:title - buscar por título',
      'GET /api/books/author/:author - buscar por autor',
      'GET /api/books/available - libros disponibles',
      'GET /api/books/reserved - libros reservados',
      'PUT /api/books/:bookId - actualizar libro',
      'DELETE /api/books/:bookId - eliminar libro'
    ]
  });
});

// iniciar servidor
const startServer = async () => {
  try {
    // conectar a mongo
    await connectDB();
    
    // arrancar servidor
    app.listen(port, () => {
      console.log('=====================================');
      console.log(`Servidor corriendo en puerto ${port}`);
      console.log(`Health: http://localhost:${port}/health`);
      console.log(`API Users: http://localhost:${port}/api/users`);
      console.log(`API Books: http://localhost:${port}/api/books`);
      console.log(`📖 Swagger: http://localhost:${port}/api-docs`);
      console.log('=====================================');
      console.log('Endpoints disponibles:');
      console.log(`  POST /api/users - crear usuario`);
      console.log(`  POST /api/users/login - login de usuario`);
      console.log(`  GET  /api/users - listar usuarios`);
      console.log(`  GET  /api/users/role/:role - usuarios por rol`);
      console.log(`  GET  /api/users/:email - buscar usuario por email`);
      console.log('  --- Tokens ---');
      console.log(`  POST /api/tokens/reset-password - crear token de reset`);
      console.log(`  POST /api/tokens/reset-password/confirm - confirmar reset de password`);
      console.log(`  GET  /api/tokens/user/:userId - tokens del usuario`);
      console.log(`  POST /api/tokens/cleanup - limpiar tokens expirados`);
      console.log('=====================================');
    });
  } catch (error) {
    console.error('Error iniciando servidor:', error);
    process.exit(1);
  }
};

// shutdown graceful
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido, cerrando...');
  process.exit(0);
});

// arrancar
startServer();