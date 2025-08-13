import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/bd';
import userRoutes from './routes/userRoutes';
import tokenRoutes from './routes/tokenRoutes';

// cargar variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ruta principal
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend de usuarios funcionando!',
    status: 'ok',
    timestamp: new Date().toISOString(),
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

      }
    }
  });
});

// health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    database: 'MongoDB',
    uptime: process.uptime()
  });
});

// rutas de la API
app.use('/api/users', userRoutes);
app.use('/api/tokens', tokenRoutes);

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
    availableEndpoints: [
      'GET / - info del servidor',
      'GET /health - estado',
      'POST /api/users - crear usuario',
      'POST /api/users/login - login',
      'GET /api/users - listar usuarios',
      'GET /api/users/role/:role - por rol',
      'GET /api/users/:email - por email',
      'POST /api/tokens/reset-password - crear token reset',
      'POST /api/tokens/reset-password/confirm - resetear password',
      'GET /api/tokens/user/:userId - tokens del usuario',
      'POST /api/tokens/cleanup - limpiar tokens',

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
      console.log(`API: http://localhost:${port}/api/users`);
      console.log('=====================================');
          console.log('Endpoints:');
    console.log(`  POST /api/users - crear`);
    console.log(`  POST /api/users/login - login`);
    console.log(`  GET  /api/users - listar`);
    console.log(`  GET  /api/users/role/:role - por rol`);
    console.log(`  GET  /api/users/:email - buscar`);
    console.log('  --- Tokens ---');
    console.log(`  POST /api/tokens/reset-password - crear token reset`);
    console.log(`  POST /api/tokens/reset-password/confirm - resetear password`);
    console.log(`  GET  /api/tokens/user/:userId - tokens del usuario`);
    console.log(`  POST /api/tokens/cleanup - limpiar tokens`);
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