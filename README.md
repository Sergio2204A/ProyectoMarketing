# 🚀 Marketing AI Workspace

Marketing AI Workspace es una plataforma web diseñada para ayudar a equipos de marketing, emprendedores y creadores de contenido a generar campañas publicitarias, copys persuasivos, hashtags estratégicos y calendarios de contenido utilizando Inteligencia Artificial.

El proyecto integra un frontend moderno desarrollado con React y un backend basado en Node.js y Express, conectado con Gemini AI para la generación de contenido inteligente.

---

## ✨ Características Principales

### 📢 Generador de Campañas

Genera campañas completas a partir de:

* Producto o servicio
* Objetivo comercial
* Público objetivo
* Canal de comunicación

La IA devuelve propuestas estructuradas listas para utilizar en estrategias digitales.

---

### ✍️ Generador de Copys

Crea textos publicitarios optimizados para:

* Redes sociales
* Campañas promocionales
* Anuncios digitales
* Marketing de contenidos

---

### #️⃣ Generador de Hashtags

Obtén hashtags relevantes basados en:

* Producto
* Nicho de mercado
* Objetivo de la campaña

Diseñado para aumentar el alcance y la visibilidad del contenido.

---

### 📅 Generador de Calendario de Contenidos

Genera automáticamente un plan semanal de publicaciones para redes sociales.

Incluye:

* Día de publicación
* Idea de contenido
* Copy recomendado
* Horario sugerido

---

### 📈 Dashboard Inteligente

Visualización centralizada de:

* Estadísticas de uso
* Actividad reciente
* Herramientas disponibles
* Accesos rápidos

---

## 🏗️ Arquitectura del Proyecto

```text
MarketingAI/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.js
│   │
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🛠️ Tecnologías Utilizadas

### Frontend

* React
* Vite
* JavaScript ES6+
* CSS3
* Fetch API

### Backend

* Node.js
* Express.js
* CORS
* Dotenv

### Inteligencia Artificial

* Google Gemini API

---

## ⚙️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/marketing-ai-workspace.git
```

```bash
cd marketing-ai-workspace
```

---

### 2. Instalar dependencias Backend

```bash
cd backend
npm install
```

---

### 3. Configurar Variables de Entorno

Crear archivo:

```env
.env
```

Contenido:

```env
PORT=3001
GROQ_API_KEY=
MONGO_URI=
JWT_SECRET=
RUNWAY_API_KEY=
OPENAI_API_KEY=
EMAIL_USER=
EMAIL_APP_PASSWORD=
FRONTEND_URL=http://localhost:5173

# Conexión OAuth con Meta (Facebook + Instagram)
META_APP_ID=
META_APP_SECRET=
META_REDIRECT_URI=http://localhost:3001/social/meta/callback

# Conexión OAuth con TikTok
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=http://localhost:3001/social/tiktok/callback

# Clave para cifrar los tokens de redes sociales en MongoDB (generar una sola vez)
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SOCIAL_TOKEN_ENCRYPTION_KEY=
```

---

## 🔐 Checklist para que el equipo conecte Facebook/Instagram/TikTok sin fricción

La conexión de cuentas ya no pide tokens manuales: hay un botón "Conectar con Meta" y otro "Conectar con TikTok" en la sección **Redes Sociales**. Para que **cualquier persona del equipo** (no solo el desarrollador) pueda usarlo, falta completar estos trámites — son gestiones de negocio en los paneles de Meta/TikTok, no requieren tocar código:

**Meta (Facebook + Instagram)**
1. En [developers.facebook.com](https://developers.facebook.com), la app debe estar en modo **Live**, no en Desarrollo. Mientras esté en Desarrollo, solo los usuarios agregados manualmente como *Testers* pueden conectar su cuenta.
2. Para pasar a Live hay que solicitar **App Review** de los permisos: `pages_manage_posts`, `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`, `business_management`. Meta pide una política de privacidad pública y un video mostrando el uso real de cada permiso.
3. Registrar `META_REDIRECT_URI` (el dominio final, no localhost) como "Valid OAuth Redirect URI" en el dashboard de la app.

**TikTok**
1. En [developers.tiktok.com](https://developers.tiktok.com), solicitar acceso auditado al scope `video.publish` de la **Content Posting API**. Mientras no esté auditada, los videos publicados vía la app quedan como **borrador privado** en la app de TikTok (hay que abrirla y darle "Publicar" a mano) — la app ya lo detecta y avisa cuando esto pasa.
2. Registrar `TIKTOK_REDIRECT_URI` (dominio final) en el portal de desarrolladores.

**Antes de que el equipo use esto a diario**, además:
- Desplegar el backend en un hosting con URL estable (Railway, Render, etc. — `npm start` ya está listo) y el frontend en Vercel/Netlify, y actualizar `META_REDIRECT_URI`/`TIKTOK_REDIRECT_URI`/`FRONTEND_URL` al dominio real.
- Rotar `JWT_SECRET` y la contraseña de `MONGO_URI` si vienen de una prueba local, antes de manejar cuentas reales de la empresa.

---

### 4. Iniciar Backend

```bash
npm run dev
```

Servidor disponible en:

```text
http://localhost:3000
```

---

### 5. Instalar dependencias Frontend

```bash
cd ../frontend
npm install
```

---

### 6. Ejecutar Frontend

```bash
npm run dev
```

Aplicación disponible en:

```text
http://localhost:5173
```

---

## 🚀 Despliegue en producción (para que el equipo lo use, no solo localhost)

Recomendado por simplicidad y costo: **Railway** para el backend, **Mongo Atlas** (ya en uso) para la base de datos, y **Vercel** para el frontend. El repo ya está listo para esto (`npm start` en el backend, `npm run build` en el frontend) — solo falta hacer los siguientes clics:

### 1. Backend en Railway
1. Entra a [railway.app](https://railway.app) y crea una cuenta con GitHub.
2. **New Project → Deploy from GitHub repo** → elige `ProyectoMarketing`.
3. En **Settings** del servicio, pon **Root Directory** = `backend`.
4. En **Variables**, pega todas las variables de tu `backend/.env` (con los valores reales, no los placeholders).
5. Railway hace el deploy solo y te da una URL pública, algo como `https://tuapp.up.railway.app`.

### 2. Frontend en Vercel
1. Entra a [vercel.com](https://vercel.com) y crea una cuenta con GitHub.
2. **Add New Project** → mismo repo `ProyectoMarketing`.
3. En la configuración del proyecto, **Root Directory** = `frontend` (Vercel detecta que es Vite automáticamente).
4. Agrega una sola variable de entorno: `VITE_API_URL` = la URL de Railway del paso anterior (sin `/` al final).
5. Dale **Deploy** — Vercel te da su propia URL pública, algo como `https://tuapp.vercel.app`.

### 3. Cerrar el círculo
1. Vuelve a Railway → Variables → actualiza `FRONTEND_URL` con la URL real de Vercel del paso 2.
2. Actualiza también `META_REDIRECT_URI` y `TIKTOK_REDIRECT_URI` cambiando `localhost:3001` por tu dominio de Railway (ej. `https://tuapp.up.railway.app/social/meta/callback`).
3. Registra esas mismas URLs (las de Railway) como "Valid OAuth Redirect URI" en los dashboards de Meta y TikTok, reemplazando las de `localhost` que usabas en desarrollo.

Con esto, cualquiera del equipo entra a la URL de Vercel, se registra y ya puede usar la herramienta — sin depender de tu laptop.

---

## 🔌 API Endpoints

### Campañas

```http
POST /campaign
```

---

### Copys

```http
POST /copy
```

---

### Hashtags

```http
POST /hashtag
```

---

### Calendario de Contenidos

```http
POST /calendar
```

---

### Conexión OAuth de redes sociales

```http
GET  /social/meta/connect        # devuelve la URL de login de Facebook
GET  /social/meta/callback       # callback que llama Facebook
POST /social/meta/select-page    # cuando el usuario administra varias Páginas
GET  /social/tiktok/connect      # devuelve la URL de login de TikTok
GET  /social/tiktok/callback     # callback que llama TikTok
```

---

## 📌 Roadmap

### Versión Actual

* Dashboard funcional
* Generación de campañas, copys, hashtags, calendario, imágenes y video
* Autenticación de usuarios e historial persistente en MongoDB
* Publicación real en Facebook, Instagram, TikTok (OAuth), Twitter/X y LinkedIn (manual)
* Tokens de redes sociales cifrados en reposo

### Próximas Versiones

* App Review de Meta y auditoría de TikTok (ver checklist arriba) para uso sin restricciones por todo el equipo
* OAuth real para Twitter/X y LinkedIn (hoy conexión manual)
* Despliegue en producción (Railway/Render + Vercel)
* Análisis de tendencias en tiempo real
* Métricas y reportes avanzados

---

## 👨‍💻 Autor

Desarrollado por Sergio Mendoza como proyecto de automatización de marketing impulsado por Inteligencia Artificial.

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia MIT.
