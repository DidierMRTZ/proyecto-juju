const mongosee = require('mongoose');
const MongoDB_URL = "mongodb://localhost:27017/mydatabase";

const connectDB = async () => {
  try {
    await mongosee.connect(MongoDB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }); 
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); 
  }
}