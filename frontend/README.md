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
GEMINI_API_KEY=TU_API_KEY
PORT=3000
```

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

## 📌 Roadmap

### Versión Actual

* Dashboard funcional
* Generación de campañas
* Generación de copys
* Generación de hashtags
* Calendario de contenidos

### Próximas Versiones

* Historial persistente
* Integración con MongoDB
* Autenticación de usuarios
* Exportación PDF
* Integración con Meta API
* Programación automática de publicaciones
* Análisis de tendencias en tiempo real
* Métricas y reportes avanzados

---

## 👨‍💻 Autor

Desarrollado por Sergio Mendoza como proyecto de automatización de marketing impulsado por Inteligencia Artificial.

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia MIT.
