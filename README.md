# 📚 Proyecto Juju - Sistema de Biblioteca

Sistema completo de gestión de biblioteca con frontend Angular y backend Node.js/Express.

## 🚀 Características

- **Frontend**: Angular 17 con autenticación JWT, gestión de libros, búsqueda y filtros
- **Backend**: API REST con Node.js/Express, MongoDB, autenticación JWT, Swagger
- **Funcionalidades**: CRUD de libros, usuarios, búsqueda, filtros por estado

## 🛠️ Tecnologías

- **Frontend**: Angular 17, TypeScript, CSS3
- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose, JWT
- **Documentación**: Swagger/OpenAPI 3.0

## 📋 Prerrequisitos

- **Node.js** 18+
- **npm** 
- **MongoDB** 5.0+
- **Angular CLI**: `npm install -g @angular/cli`

## 🚀 Instalación Rápida

### 1. Clonar y configurar
```bash
git clone https://github.com/DidierMRTZ/proyecto-juju.git
cd proyecto-juju
o (si se descarga local)
cd proyecto-juju-main
```

### 2. MongoDB (Docker Compose)
```bash
cd backend
docker-compose up -d
# Esperar a que MongoDB esté listo
```

**🔑 Acceso a Mongo Express:**
- **URL**: `http://localhost:8081`
- **Usuario**: `admin`
- **Contraseña**: `pass123`
- **Funcionalidades**: Gestión visual de la base de datos

### 3. Backend
```bash
# En la misma carpeta backend
npm install
npm run build
npm run dev
```

### 4. Frontend
```bash
cd frontend
npm install
npm start
```

## 🌐 URLs

- **Frontend**: `http://localhost:4200`
- **Backend**: `http://localhost:3000`
- **Swagger**: `http://localhost:3000/api-docs`
- **MongoDB**: `mongodb://localhost:27017`
- **Mongo Express**: `http://localhost:8081` (admin/pass123)

## 🔐 Usuarios de Prueba

```json
{
  "name": "Admin",
  "email": "admin@test.com",
  "password": "Admin123!"
}
```

## 📚 Endpoints Principales

- `POST /api/users` - Crear usuario
- `POST /api/users/login` - Login
- `GET /api/books` - Listar libros
- `POST /api/books` - Crear libro
- `GET /api/books/title/{title}` - Buscar por título

## 🔧 Comandos Útiles

```bash
# Backend
cd backend && npm run dev

# Frontend  
cd frontend && npm start

# Compilar
npm run build
```

## 🚨 Problemas Comunes

### MongoDB no conecta
```bash
mongod --version
sudo systemctl restart mongod
```

### Puerto ocupado
```bash
# Backend
PORT=3001 npm run dev

# Frontend
ng serve --port 4201
```

## 📁 Estructura

```
proyecto-juju-main/
├── backend/                    # API REST + MongoDB
│   ├── src/
│   │   ├── config/            # Configuración (DB, Swagger)
│   │   ├── controllers/       # Lógica de negocio
│   │   ├── middleware/        # Autenticación JWT
│   │   ├── models/            # Modelos Mongoose
│   │   ├── routes/            # Definición de endpoints
│   │   └── index.ts           # Servidor principal
│   ├── package.json           # Dependencias backend
│   ├── docker-compose.yml     # Configuración MongoDB
│   └── README.md              # Documentación backend
├── frontend/                   # Aplicación Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── home/          # Componente principal (página de inicio)
│   │   │   │   ├── home.ts    # Lógica del componente
│   │   │   │   ├── home.html  # Template HTML
│   │   │   │   └── home.css   # Estilos del componente
│   │   │   ├── books/         # Componente de libros
│   │   │   │   ├── books.ts   # Lógica del componente
│   │   │   │   ├── books.html # Template HTML
│   │   │   │   └── books.css  # Estilos del componente
│   │   │   ├── login/         # Componente de autenticación
│   │   │   │   ├── login.ts   # Lógica del componente
│   │   │   │   ├── login.html # Template HTML
│   │   │   │   └── login.css  # Estilos del componente
│   │   │   ├── app.component.ts
│   │   │   ├── app.routes.ts  # Rutas de la aplicación
│   │   │   └── app.config.ts  # Configuración Angular
│   │   ├── assets/            # Imágenes y recursos
│   │   ├── styles.css         # Estilos globales
│   │   └── main.ts            # Punto de entrada
│   ├── package.json           # Dependencias frontend
│   └── README.md              # Documentación frontend
├── package.json                # Scripts del proyecto raíz
└── README.md                   # Este archivo
```

## 🎯 Próximos Pasos

1. **Verificar MongoDB** corriendo
2. **Iniciar Backend** y probar Swagger
3. **Iniciar Frontend** y crear usuario
4. **Probar funcionalidades** de libros

---

**¡Listo para usar!** Para más detalles, revisa los READMEs de [backend](backend/README.md) y [frontend](frontend/README.md).

## 📖 Resumen de Documentación

### 🎯 **Frontend** - [Ver completo](frontend/README.md)
- **Angular 17** con TypeScript y CSS3
- **Autenticación JWT** (login, signup, recuperar contraseña)
- **Gestión de libros** (CRUD, búsqueda, filtros)
- **Interfaz moderna** con modales interactivos
- **Búsqueda en tiempo real** por título, autor y año
- **Responsive design** para móviles y desktop

### 🔧 **Backend** - [Ver completo](backend/README.md)
- **API REST** con Node.js/Express y TypeScript
- **MongoDB** con Mongoose ODM
- **Autenticación JWT** con middleware de seguridad
- **Swagger/OpenAPI 3.0** para documentación automática
- **Sistema de roles** (usuario, administrador)
- **Validación de datos** y manejo de errores
- **Endpoints** para usuarios, libros y tokens
