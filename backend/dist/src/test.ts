// src/seed.ts
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

const MONGO_URI: string =
  process.env.MONGO_URI ||
  'mongodb://root:example@localhost:27017/mydatabase?authSource=admin';

interface UserSeed {
  name: string;
  email: string;
  role: 'admin' | 'user';
  plaintextPassword: string;
}

interface UserStored extends Omit<UserSeed, 'plaintextPassword'> {
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BookSeed {
  title: string;
  author: string;
  publicationYear: number;
  status: 'available' | 'reserved';
}

interface BookStored extends BookSeed {
  createdAt: Date;
  updatedAt: Date;
}

async function hashPassword(
  password: string,
  saltRounds = 12
): Promise<string> {
  if (!password) throw new Error('Password is required to hash');
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
}

async function seed(): Promise<void> {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db();
    const now = new Date();

    const usersSeed: UserSeed[] = [
      { name: 'Admin', email: 'admin@test.com', plaintextPassword: 'Admin123!', role: 'admin' },
      { name: 'User', email: 'user@test.com', plaintextPassword: 'User123!', role: 'user' },
      { name: 'Test', email: 'test@test.com', plaintextPassword: 'Test123!', role: 'user' },
    ];

    const users: UserStored[] = [];
    for (const u of usersSeed) {
      const passwordHash = await hashPassword(u.plaintextPassword);
      users.push({
        name: u.name,
        email: u.email,
        role: u.role,
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      });
    }

    const books: BookStored[] = [
      { title: 'Cien años de soledad', author: 'Gabriel García Márquez', publicationYear: 1967, status: 'available', createdAt: now, updatedAt: now },
      { title: 'El Principito', author: 'Antoine de Saint-Exupéry', publicationYear: 1943, status: 'available', createdAt: now, updatedAt: now },
      { title: 'Don Quijote de la Mancha', author: 'Miguel de Cervantes', publicationYear: 1605, status: 'reserved', createdAt: now, updatedAt: now },
      { title: 'Rayuela', author: 'Julio Cortázar', publicationYear: 1963, status: 'available', createdAt: now, updatedAt: now },
      { title: 'La sombra del viento', author: 'Carlos Ruiz Zafón', publicationYear: 2001, status: 'available', createdAt: now, updatedAt: now },
      { title: 'The Stranger', author: 'Albert Camus', publicationYear: 1942, status: 'reserved', createdAt: now, updatedAt: now },
      { title: 'The Trial', author: 'Franz Kafka', publicationYear: 1925, status: 'available', createdAt: now, updatedAt: now },
      { title: 'In Search of Lost Time', author: 'Marcel Proust', publicationYear: 1913, status: 'available', createdAt: now, updatedAt: now },
      { title: 'The Grapes of Wrath', author: 'John Steinbeck', publicationYear: 1939, status: 'reserved', createdAt: now, updatedAt: now },
    ];

    await db.collection('users').deleteMany({});
    await db.collection('books').deleteMany({});
    await db.collection('users').insertMany(users);
    await db.collection('books').insertMany(books);

    console.log('Usuarios y libros insertados correctamente');
  } catch (err) {
    console.error('Error al insertar:', err);
  } finally {
    await client.close();
  }
}

seed().catch((err) => {
  console.error('Seed falló:', err);
});
