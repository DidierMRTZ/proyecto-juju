import mongoose from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://root:example@localhost:27017/mydatabase?authSource=admin";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URL);
    
    
    // Verificar que la conexión esté establecida
    if (mongoose.connection.db) {
      console.log('✅ Conectado a MongoDB exitosamente');
    }
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    // En modo local, no salir del proceso
    process.exit(1);
  }
};

export default connectDB;