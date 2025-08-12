import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/bd';
import userRoutes from './routes/userRoutes';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ruta principal
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Proyecto Juju Backend - API de Usuarios',
    status: 'success',
    timestamp: new Date().toISOString(),
    endpoints: {
      createUser: 'POST /api/users',
      getAllUsers: 'GET /api/users',
      getUsersByRole: 'GET /api/users/role/:role',
      getUserByEmail: 'GET /api/users/:email',
      description: 'API para crear, obtener y buscar usuarios en MongoDB'
    }
  });
});

// API Routes - Endpoints de usuario
app.use('/api/users', userRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    availableEndpoints: [
      'POST /api/users - Crear usuario',
      'GET /api/users - Obtener todos los usuarios',
      'GET /api/users/role/:role - Obtener usuarios por rol',
      'GET /api/users/:email - Buscar usuario por email'
    ]
  });
});

// Start server
const startServer = async () => {
  try {
    // Conectar a MongoDB
    await connectDB();
    
    // Iniciar servidor
    app.listen(port, () => {
      console.log('🚀 ========================================');
      console.log(`🚀 Servidor iniciado en http://localhost:${port}`);
      console.log(`👤 API Usuarios: http://localhost:${port}/api/users`);
      console.log('🚀 ========================================');
      console.log('💡 Endpoints disponibles:');
      console.log(`   POST http://localhost:${port}/api/users - Crear usuario`);
      console.log(`   GET  http://localhost:${port}/api/users - Obtener usuarios`);
      console.log(`   GET  http://localhost:${port}/api/users/role/:role - Por rol`);
      console.log(`   GET  http://localhost:${port}/api/users/:email - Por email`);
      console.log('🚀 ========================================');
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer();
