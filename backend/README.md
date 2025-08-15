# 📚 API de Biblioteca - Proyecto Juju

API REST completa para gestión de libros, usuarios y autenticación con documentación Swagger integrada.

## 🚀 Características

- **Autenticación JWT** con tokens Bearer
- **Gestión de usuarios** (crear, login, listar, buscar)
- **Gestión de libros** (CRUD completo, búsqueda, filtros)
- **Sistema de tokens** para reset de contraseñas
- **Documentación automática** con Swagger/OpenAPI 3.0
- **Base de datos MongoDB** con Mongoose

## 🛠️ Tecnologías

- **Node.js** + **Express.js**
- **TypeScript**
- **MongoDB** + **Mongoose**
- **JWT** para autenticación
- **Swagger/OpenAPI 3.0** para documentación

## 📦 Instalación

### 1. Clonar y configurar
```bash
git clone <url-del-repositorio>
cd proyecto-juju-main/backend
```

### 2. MongoDB (Docker)
```bash
docker-compose up -d
```

### 3. Instalar y ejecutar
```bash
npm install
npm run build
npm run dev
```

## 🔧 Configuración

### Variables de entorno (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/biblioteca
JWT_SECRET=tu-secret-key-super-segura
NODE_ENV=development
```

## 📖 Documentación Swagger

Una vez iniciado el servidor:
```
http://localhost:3000/api-docs
```

## 🔐 Autenticación

### Obtener token
```bash
POST /api/users/login
{
  "email": "admin@test.com",
  "password": "Admin123!"
}
```

### Usar token
```bash
GET /api/books
Authorization: Bearer <tu-token-jwt>
```

## 📚 Endpoints principales

### Usuarios
- `POST /api/users` - Crear usuario
- `POST /api/users/login` - Login
- `GET /api/users` - Listar usuarios

### Libros
- `POST /api/books` - Crear libro
- `GET /api/books` - Listar todos los libros
- `GET /api/books/title/:title` - Buscar por título
- `PUT /api/books/:bookId` - Actualizar libro
- `DELETE /api/books/:bookId` - Eliminar libro

### Tokens
- `POST /api/tokens/reset-password` - Crear token de reset
- `POST /api/tokens/reset-password/confirm` - Confirmar reset

## 🧪 Probar la API

### 1. Swagger UI
1. Ve a `http://localhost:3000/api-docs`
2. Haz click en "Authorize" y agrega tu token JWT
3. Prueba cualquier endpoint

### 2. curl
```bash
# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}'

# Usar token
curl -X GET http://localhost:3000/api/books \
  -H "Authorization: Bearer <token-del-login>"
```

## 📊 Esquemas de datos

### Usuario
```json
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "role": "user | admin",
  "isActive": "boolean"
}
```

### Libro
```json
{
  "bookId": "string",
  "title": "string",
  "author": "string",
  "publicationYear": "number",
  "status": "available | reserved"
}
```

## 🔍 Búsqueda y filtros

- **Por título**: `GET /api/books/title/Señor`
- **Por estado**: `GET /api/books/available` o `/reserved`
- **Por autor**: `GET /api/books/author/Tolkien`

## 🚨 Códigos de respuesta

- `200` - Operación exitosa
- `201` - Recurso creado
- `400` - Datos inválidos
- `401` - No autorizado
- `404` - Recurso no encontrado
- `500` - Error interno del servidor

## 🔧 Scripts

```bash
npm run dev          # Desarrollo
npm run build        # Compilar
npm start            # Producción
```

## 📁 Estructura

```
src/
├── config/          # Configuraciones (DB, Swagger)
├── controllers/     # Lógica de negocio
├── middleware/      # Middlewares (auth, validación)
├── models/          # Modelos de Mongoose
├── routes/          # Definición de rutas
└── index.ts         # Punto de entrada
```

---

**¡Listo para usar!** Para más detalles, revisa el [README del frontend](../frontend/README.md).

