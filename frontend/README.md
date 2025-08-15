# 📚 Frontend - Proyecto Juju Biblioteca

Frontend de Angular para la gestión de biblioteca con autenticación JWT y gestión de libros.

## 🚀 Características

- **Autenticación JWT** con login, signup y recuperar contraseña
- **Gestión de libros** (CRUD, búsqueda, filtros por estado)
- **Interfaz moderna** con modales interactivos
- **Búsqueda en tiempo real** por título, autor y año
- **Responsive design** para móviles y desktop

## 🛠️ Tecnologías

- **Angular 17** - Framework principal
- **TypeScript** - Tipado estático
- **CSS3** - Estilos modernos y responsive
- **HttpClient** - Comunicación con API REST

## 📋 Prerrequisitos

- **Node.js** 18+
- **Angular CLI**: `npm install -g @angular/cli`

## 🚀 Instalación

### 1. Clonar y configurar
```bash
git clone <url-del-repositorio>
cd proyecto-juju-main/frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar desarrollo
```bash
npm start
# Servidor en http://localhost:4200/
```

## 🔧 Comandos

```bash
npm start          # Desarrollo
npm run build      # Compilar
npm test           # Tests
```

## 📁 Estructura

```
frontend/
├── src/app/
│   ├── home/      # Página principal
│   ├── books/     # Gestión de libros
│   ├── login/     # Autenticación
│   └── app.*      # Configuración Angular
├── assets/        # Recursos estáticos
└── styles.css     # Estilos globales
```

## 🔐 Autenticación

1. **Registro** - `POST /api/users`
2. **Login** - `POST /api/users/login`
3. **Token JWT** almacenado en localStorage
4. **Redirección** automática a libros

## 📚 Gestión de Libros

- **CRUD completo** (crear, leer, actualizar, eliminar)
- **Búsqueda** por título, autor o año
- **Filtros** por estado (disponible/reservado)
- **Modales** para todas las operaciones

## 🌐 URLs

- **Frontend**: `http://localhost:4200`
- **Backend**: `http://localhost:3000`

## 🚨 Problemas Comunes

### Puerto ocupado
```bash
ng serve --port 4201
```

### Error de módulos
```bash
rm -rf node_modules package-lock.json
npm install
```

---

**¡Listo para usar!** Para más detalles, revisa el [README del backend](../backend/README.md).
