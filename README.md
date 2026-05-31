# Tienda Virtual

## Descripción General

Tienda Virtual es un sistema de comercio electrónico completo desarrollado como proyecto de Diseño de Sistemas de Información. El sistema implementa una arquitectura cliente-servidor que permite a los usuarios navegar productos, gestionar un carrito de compras, realizar pedidos y administrar su cuenta de manera segura.

## Integrantes

- **Daniel Gil Mazo** - C.C. 1041630180

## Tecnologías Utilizadas

### Frontend (Cliente)
- **TypeScript** - Lenguaje de programación con tipado estático
- **Vanilla JavaScript** - Sin frameworks de UI para mayor control y rendimiento
- **CSS** - Estilos personalizados

### Backend (Servidor)
- **Sails.js** - Framework MVC para Node.js
- **Node.js** - Entorno de ejecución JavaScript (v22.13+)
- **MySQL** - Sistema de gestión de base de datos relacional
- **Redis** - Almacenamiento en caché y gestión de sesiones
- **JWT (JSON Web Tokens)** - Autenticación y autorización
- **bcryptjs** - Encriptación de contraseñas
- **Knex.js** - Constructor de consultas SQL y migraciones
- **Socket.io** - Comunicación en tiempo real
- **dotenv** - Gestión de variables de entorno

## Funcionalidades Implementadas

### Gestión de Usuarios
- Registro y autenticación de usuarios
- Gestión de sesiones con JWT
- Recuperación de contraseñas
- Perfiles de cliente

### Catálogo de Productos
- Gestión de categorías de productos
- Catálogo de productos con variantes
- Búsqueda y filtrado de productos

### Carrito de Compras
- Agregar productos al carrito
- Gestión de items del carrito
- Cálculo de totales

### Pedidos
- Creación de pedidos
- Gestión de detalles de pedido
- Seguimiento de estado de pedidos

### Inventario
- Gestión de inventario de productos
- Control de stock

### Notificaciones
- Sistema de notificaciones para usuarios
- Alertas de estado de pedidos

### Seguridad
- Autenticación basada en tokens
- Encriptación de contraseñas
- Políticas de acceso

## Requisitos de Instalación

### Prerrequisitos
- **Node.js** v22.13 o superior
- **npm** (gestor de paquetes de Node.js)
- **MySQL** - Servidor de base de datos
- **Redis** - Servidor de caché (opcional pero recomendado)

### Configuración de Base de Datos
1. Crear una base de datos MySQL para el proyecto
2. Configurar las credenciales en el archivo `.env` del servidor

## Pasos para Ejecutar el Proyecto

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Daniel12034/TiendaVirtual.git
cd tiendaVirtual
```

### 2. Instalar Dependencias del Servidor
```bash
cd server
npm install
```

### 3. Configurar Variables de Entorno
Crear o editar el archivo `.env` en la carpeta `server/` con las siguientes variables:
```
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=tu_usuario
DATABASE_PASSWORD=tu_password
DATABASE_NAME=tienda_virtual
JWT_SECRET=tu_secreto_jwt
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Inicializar la Base de Datos
```bash
cd server
npm run db:init
npm run db:migrate
npm run db:seed
```

### 5. Instalar Dependencias del Cliente
```bash
cd ../client
npm install
```

### 6. Ejecutar el Proyecto

**Iniciar el servidor (en una terminal):**
```bash
cd server
npm start
```

**Iniciar el cliente (en otra terminal):**
```bash
cd client
npm run dev
```

### 7. Acceder a la Aplicación
- **Frontend:** Abre tu navegador en `http://localhost:puerto-cliente`
- **API Backend:** `http://localhost:1337` (puerto por defecto de Sails.js)

## Estructura del Proyecto

```
tiiendaVirtual/
├── client/                 # Aplicación frontend (TypeScript)
│   ├── src/
│   │   ├── data/          # Capa de datos
│   │   ├── models/        # Modelos del dominio
│   │   ├── presentation/  # Componentes UI
│   │   ├── services/      # Servicios de API
│   │   └── types/         # Definiciones de tipos TypeScript
│   ├── dist/              # Código compilado
│   └── styles/            # Estilos CSS
├── server/                # Aplicación backend (Sails.js)
│   ├── api/
│   │   ├── controllers/   # Controladores de la API
│   │   ├── helpers/       # Funciones auxiliares
│   │   └── hooks/         # Hooks personalizados
│   ├── config/            # Configuración de Sails
│   ├── db/
│   │   ├── migrations/    # Migraciones de base de datos
│   │   └── seeds/         # Datos de prueba
│   └── assets/            # Archivos estáticos
└── README.md
```

## Licencia

Proyecto académico para el curso de Diseño de Sistemas de Información (580304012-8).
