import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Biblioteca - Proyecto Juju',
      version: '1.0.0',
      description: 'API REST para gestión de libros, usuarios y autenticación',
      contact: {
        name: 'Desarrollador',
        email: 'dev@proyectojuju.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.proyectojuju.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticación'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único del usuario'
            },
            name: {
              type: 'string',
              description: 'Nombre completo del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email único del usuario'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'Rol del usuario'
            },
            isActive: {
              type: 'boolean',
              description: 'Estado activo del usuario'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          },
          required: ['name', 'email', 'password']
        },
        Book: {
          type: 'object',
          properties: {
            bookId: {
              type: 'string',
              description: 'ID único del libro'
            },
            title: {
              type: 'string',
              description: 'Título del libro'
            },
            author: {
              type: 'string',
              description: 'Autor del libro'
            },
            publicationYear: {
              type: 'number',
              description: 'Año de publicación'
            },
            status: {
              type: 'string',
              enum: ['available', 'reserved'],
              description: 'Estado del libro'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          },
          required: ['title', 'author', 'publicationYear']
        },
        Token: {
          type: 'object',
          properties: {
            tokenId: {
              type: 'string',
              description: 'ID único del token'
            },
            userId: {
              type: 'string',
              description: 'ID del usuario asociado'
            },
            resetToken: {
              type: 'string',
              description: 'Token de reset de contraseña'
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de expiración'
            },
            attemptsLeft: {
              type: 'number',
              description: 'Intentos restantes'
            },
            used: {
              type: 'boolean',
              description: 'Si el token ha sido usado'
            },
            tokenType: {
              type: 'string',
              description: 'Tipo de token'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario'
            },
            password: {
              type: 'string',
              description: 'Contraseña del usuario'
            }
          },
          required: ['email', 'password']
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica si el login fue exitoso'
            },
            message: {
              type: 'string',
              description: 'Mensaje descriptivo'
            },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  description: 'Token JWT de autenticación'
                },
                user: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica si la operación fue exitosa'
            },
            message: {
              type: 'string',
              description: 'Mensaje de error descriptivo'
            },
            error: {
              type: 'string',
              description: 'Código de error específico'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Autenticación',
        description: 'Endpoints para login y gestión de usuarios'
      },
      {
        name: 'Libros',
        description: 'Endpoints para gestión de libros'
      },
      {
        name: 'Tokens',
        description: 'Endpoints para gestión de tokens de reset'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts'
  ]
};

export const specs = swaggerJsdoc(options);
