# 🎓 SistemaIncidencias AsiU

Sistema web para la gestión y seguimiento de incidencias universitarias.

**Stack:** React 19 + TypeScript + Vite | Spring Boot 3 + Java 21 | MySQL 8

---

## 📋 Requisitos previos

Asegúrate de tener instalado:

| Herramienta | Versión mínima | Descripción |
|---|---|---|
| [Node.js](https://nodejs.org/) | 18+ | Para el frontend |
| [pnpm](https://pnpm.io/) | 8+ | Gestor de paquetes (`npm i -g pnpm`) |
| [Java JDK](https://adoptium.net/) | 21 | Para el backend |
| [Docker](https://www.docker.com/) | 20+ | Para levantar MySQL |
| [Docker Compose](https://docs.docker.com/compose/) | 2+ | Viene incluido con Docker Desktop |

---

## 🚀 Configuración inicial (primera vez)

### 1. Clonar el repositorio

```bash
git clone https://github.com/ElPapu399/SistemaIncidencias_AsiU.git
cd SistemaIncidencias_AsiU
```

### 2. Levantar la base de datos MySQL con Docker

```bash
docker compose up -d
```

Esto levanta MySQL en el puerto `3306`. Puedes verificarlo con:

```bash
docker compose ps
```

### 3. Correr el backend (Spring Boot)

```bash
cd backend/incidenciasback
./mvnw spring-boot:run
```

> En Windows usa `mvnw.cmd spring-boot:run`

El backend estará disponible en: **http://localhost:8080**

### 4. Correr el frontend (React)

En otra terminal, desde la raíz del proyecto:

```bash
pnpm install
pnpm dev
```

El frontend estará disponible en: **http://localhost:5173**

---

## 🗂️ Estructura del proyecto

```
SistemaIncidencias_AsiU/
├── src/                    ← Frontend React (TypeScript + Vite + Tailwind)
│   ├── components/         ← Componentes reutilizables
│   ├── pages/              ← Páginas (Login, Dashboard, etc.)
│   ├── layouts/            ← Layouts compartidos
│   └── types/              ← Tipos TypeScript
├── backend/
│   └── incidenciasback/    ← Backend Spring Boot (Java 21 + JPA + MySQL)
│       └── src/main/
│           ├── java/       ← Código Java
│           └── resources/  ← application.yaml
├── database/
│   └── init.sql            ← Script inicial de la base de datos
├── docker-compose.yml      ← Levanta MySQL con Docker
└── README.md
```

---

## 🔧 Variables de entorno del backend

El `application.yaml` usa valores por defecto que funcionan con el `docker-compose.yml` sin configuración adicional.

Si necesitas cambiarlos, crea un archivo `.env` en `backend/incidenciasback/` (ya está en `.gitignore`):

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=incidencias_db
DB_USER=incidencias_user
DB_PASSWORD=incidencias_pass
```

---

## 🌿 Flujo de trabajo con Git

1. **Nunca trabajar directo en `main`**
2. Crear tu rama desde `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/nombre-de-tu-feature
   ```
3. Hacer commits descriptivos:
   ```bash
   git commit -m "feat: agregar formulario de nueva incidencia"
   ```
4. Abrir un Pull Request hacia `develop` cuando termines

---

## 👥 Equipo

<!-- Agrega aquí a los integrantes del equipo -->

---

## 📡 API Endpoints

*En construcción — se documentará con Swagger en `/swagger-ui.html`*
