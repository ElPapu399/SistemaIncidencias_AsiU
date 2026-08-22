# 🎓 SistemaIncidencias AsiU

Sistema web para la gestión y seguimiento de incidencias universitarias.

**Stack tecnológico:** React 19 + TypeScript + Tailwind CSS | Spring Boot 3 (Java 21) | MySQL 8 (Docker)

---

## 📦 Requisitos previos (instalar una sola vez)

### 🐧 En Linux (Arch / CachyOS / Ubuntu / Debian)
```bash
sudo pacman -S jdk21-openjdk nodejs npm docker docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

### 🪟 En Windows
Instalar en este orden:
1. **[Java JDK 21](https://adoptium.net)** → Descargar el instalador `.msi`
2. **[Node.js 18+](https://nodejs.org)** → Descargar la versión LTS `.msi`
3. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** → Instalar y asegurarse de abrirlo al menos una vez para que inicie el servicio

---

## 🚀 Pasos para correr el proyecto (primera vez)

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/ElPapu399/SistemaIncidencias_AsiU.git
cd SistemaIncidencias_AsiU
```

---

### 2️⃣ Levantar la base de datos con Docker

Desde la **raíz del proyecto**:
```bash
docker compose up -d
```

Esto inicia dos servicios en contenedores:
- **MySQL 8:** Puerto `3307`
- **phpMyAdmin (panel web):** Puerto `8081` → [http://localhost:8081](http://localhost:8081)

Para verificar que están activos:
```bash
docker compose ps
```

> 🐧 **Linux:** Si obtienes un error de permisos (`permission denied`), ejecuta `newgrp docker` en tu terminal antes de continuar.

---

### 3️⃣ Correr el backend (Spring Boot)

Abre una **segunda terminal**:

**🐧 En Linux / Mac:**
```bash
cd backend
./mvnw spring-boot:run
```

**🪟 En Windows (CMD o PowerShell):**
```bash
cd backend
mvnw.cmd spring-boot:run
```

API REST disponible en: **http://localhost:8080**

---

### 4️⃣ Correr el frontend (React)

Abre una **tercera terminal** desde la **raíz del proyecto/carpeta principal**:

```bash
npm install    # Solo la primera vez

npm run dev    
```

Se abrirá en: **http://localhost:5173**

---

## 🔑 Acceso inicial al sistema (solo login)

Ingresa en tu navegador a **[http://localhost:5173](http://localhost:5173)** con cualquiera de estos usuarios creados automáticamente:

| Rol | Correo | Contraseña|

| **Admin** | `admin@universidad.edu.pe` | `admin123` |
| **Técnico** | `tecnico@universidad.edu.pe` | `tecnico123` |
| **Estudiante** | `alumno@universidad.edu.pe` | `alumno123` |


## Ver y administrar la Base de Datos (phpMyAdmin)

Abre en tu navegador **[http://localhost:8081](http://localhost:8081)**:

| Parámetro | Valor |

| **Servidor** | `db` |
| **Usuario** | `root` |
| **Contraseña** | `root` |


## 📋 Resumen rápido de trabajo diario

Para trabajar en el proyecto necesitas 3 terminales abiertas:

| # | Servicio | Carpeta | Comando |
|---|---|---|---|
| 1️⃣ | **Base de Datos** | Raíz del proyecto | `docker compose up -d` |
| 2️⃣ | **Backend** | `backend/` | `./mvnw spring-boot:run` (o `mvnw.cmd spring-boot:run`) |
| 3️⃣ | **Frontend** | Raíz del proyecto | `npm run dev` |

Para apagar la base de datos al terminar:
```bash
docker compose down
```

---

## 🗂️ Estructura del repositorio

```
SistemaIncidencias_AsiU/
├── src/                        ← Frontend React (TypeScript + Tailwind)
│   ├── components/             ← Componentes reutilizables (Button, InputBox, etc.)
│   ├── pages/                  ← Vistas (Login, Dashboard, etc.)
│   ├── layouts/                ← Plantillas y navegación
│   └── types/                  ← Modelos e interfaces TypeScript
├── backend/                    ← Backend Spring Boot (Java 21)
│   ├── src/main/java/.../
│   │   ├── config/             ← Seguridad (CORS, BCrypt) y Carga Inicial de Datos
│   │   ├── controller/         ← Controladores REST (/api/auth, etc.)
│   │   ├── dto/                ← Objetos de transferencia de datos
│   │   ├── model/              ← Entidades JPA (Usuario, Rol, etc.)
│   │   ├── repository/         ← Repositorios Spring Data JPA
│   │   └── service/            ← Lógica de negocio (AuthService, etc.)
│   ├── src/main/resources/
│   │   └── application.yaml    ← Configuración del servidor y conexión a BD
│   ├── pom.xml                 ← Dependencias Maven
│   └── mvnw / mvnw.cmd         ← Maven Wrapper
├── database/
│   └── init.sql                ← Script DDL de tablas y datos semilla iniciales
├── docker-compose.yml          ← Configuración de contenedores MySQL y phpMyAdmin
└── README.md                   ← Guía del proyecto
```
