# 🏉 Club Natación y Gimnasia - Backend API

Bienvenido al repositorio del **Backend** del Club Natación y Gimnasia. Esta API RESTful está construida con **Node.js, Express y MongoDB**, y se encarga de gestionar de manera centralizada toda la información del club: noticias, planteles, torneos, partidos, tabla de posiciones y autenticación de administradores.

---

## 🚀 Tecnologías Principales

- **Entorno:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/) (v5)
- **Base de Datos:** [MongoDB](https://www.mongodb.com/) con [Mongoose](https://mongoosejs.com/)
- **Autenticación:** JSON Web Tokens (JWT) con Refresh Tokens y Cookies Seguras
- **Almacenamiento de Imágenes:** [Cloudinary](https://cloudinary.com/) (Multer Storage)
- **Seguridad:** Helmet, CORS, Bcrypt.js

---

## 📁 Estructura del Proyecto

El proyecto sigue el patrón de arquitectura **MVC (Modelo-Vista-Controlador)** enfocado en la construcción de APIs. Todo el código fuente reside en la carpeta `src/`.

```text
Backend/
├── .env.example          # Plantilla de variables de entorno
├── package.json          # Dependencias y scripts del proyecto
└── src/
    ├── config/           # Configuraciones globales (Conexión a DB, Cloudinary)
    ├── controllers/      # Lógica de negocio y manejo de peticiones HTTP (auth, matches, news, teams, standings...)
    ├── middlewares/      # Interceptores de Express (Verificación de tokens, manejo de errores globales, subida de archivos)
    ├── models/           # Esquemas y modelos de MongoDB definidos con Mongoose (User, Match, Team, Tournament, News)
    ├── routes/           # Definición de endpoints de la API, vinculando URLs con controladores
    ├── utils/            # Funciones auxiliares y utilidades reutilizables (generadores de slugs, formateadores)
    ├── index.js          # Punto de entrada principal de la aplicación (Servidor Express)
    └── seeder.js         # Script para poblar la base de datos con información inicial (Administradores, reglas básicas)
```

### Detalle de cada módulo:

- **`models/`**: Define la estructura de datos. Tenemos modelos relacionales como `Tournament` que contiene referencias a `Team` y reglas de puntuación.
- **`controllers/`**: Contienen algoritmos complejos. Destaca `standingsController.js`, que posee un motor inteligente de cálculo de posiciones basado en los resultados de `Match`, considerando Puntos Bonus (Ofensivo/Defensivo) y reglas de desempate.
- **`middlewares/`**: Crucial para la seguridad. El middleware de autenticación valida los JWT enviados mediante cookies `httpOnly`, garantizando que solo los administradores puedan crear o modificar datos.
- **`config/`**: Aloja la configuración de _Cloudinary_, permitiendo la subida y optimización de imágenes (como portadas de noticias o escudos) directamente a la nube.

---

## ⚙️ Configuración e Instalación

### 1. Clonar e Instalar

Ubicado en la carpeta `Backend`, instala las dependencias de Node.js:

```bash
npm install
```

### 2. Variables de Entorno

Crea un archivo llamado `.env` en la raíz de la carpeta `Backend`. Copia el contenido de `.env.example` y rellena tus datos reales:

```env
NODE_ENV=development
PORT=5000

# Base de Datos
MONGODB_USERNAME=tu_usuario
MONGODB_PASSWORD=tu_contraseña
MONGODB_URI=mongodb+srv://...

# Cloudinary (Para imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Seguridad (Semillas aleatorias)
JWT_SECRET=secreto_seguro_para_access
JWT_REFRESH_SECRET=secreto_seguro_para_refresh
COOKIE_SECRET=secreto_seguro_para_cookies

# Frontend URL (Para configurar los CORS)
FRONTEND_URL=http://localhost:5173
```

---

## 🏃‍♂️ Ejecución del Servidor

### Modo Desarrollo

Ejecuta el servidor con `nodemon` para que se reinicie automáticamente al detectar cambios en el código:

```bash
npm run dev
```

### Modo Producción

Para desplegar el proyecto (como en Render), utiliza el comando estándar:

```bash
npm start
```

El servidor debería arrancar e indicar que está corriendo en el `PORT` especificado (ej. `http://localhost:5000`).

---

## 🔐 Seguridad y Autenticación

Este backend no utiliza el almacenamiento local (`localStorage`) en el Frontend para guardar tokens. En su lugar, emplea **Cookies httpOnly**.
Cuando un administrador inicia sesión en `/api/auth/login`, el backend envía el _Access Token_ y el _Refresh Token_ mediante cookies seguras que el navegador adjuntará automáticamente en cada petición posterior al panel de administración. Esto mitiga ataques XSS y hace el sistema extremadamente seguro.

---

## 🌐 API Endpoints Principales

- **Auth:** `/api/auth/login`, `/api/auth/logout`, `/api/auth/refresh`, `/api/auth/me`
- **Noticias:** `/api/news` (GET, POST, PUT, DELETE)
- **Equipos:** `/api/teams` (CRUD completo y subida de escudos)
- **Torneos:** `/api/tournaments` (Creación, asignación de equipos)
- **Partidos:** `/api/matches` (Programación, carga de resultados)
- **Posiciones:** `/api/standings/:tournamentId` (Motor de cálculo dinámico)

---

_Desarrollado para el Club Natación y Gimnasia. Construido con pasión y precisión técnica._ 🔴⚪🔵
