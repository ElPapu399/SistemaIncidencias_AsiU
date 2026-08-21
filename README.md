# 🎓 SistemaIncidencias AsiU

Sistema web para la gestión y seguimiento de incidencias universitarias.

**Stack tecnológico:** React 19 + TypeScript + Tailwind CSS | Spring Boot 3 (Java 21) | MySQL 8 (Docker)

---

## 📦 Requisitos previos (instalar una sola vez)

### 🐧 En Linux (Arch / CachyOS / Ubuntu / Debian)
```bash
# Para distribuciones basadas en Arch (CachyOS, Manjaro):
sudo pacman -S jdk21-openjdk nodejs npm docker docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
# Cierra sesión y vuelve a entrar para que Docker funcione sin sudo
```

### 🪟 En Windows
Instalar en este orden:
1. **[Java JDK 21](https://adoptium.net)** → Descargar el instalador `.msi`
2. **[Node.js 18+](https://nodejs.org)** → Descargar la versión LTS `.msi`
3. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** → Instalar y asegurarse de abrirlo al menos una vez para que inicie el servicio

> 💡 **Nota para Windows:** Docker Desktop ya incluye MySQL y phpMyAdmin, por lo que **no** necesitas instalar MySQL por separado.

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
# Debes ver incidencias_db y incidencias_phpmyadmin en estado "running"
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

> ⏳ La primera ejecución descargará las librerías de Maven automáticamente.

Cuando el backend esté listo, verás en consola:
```
✅ Usuario creado: admin@universidad.edu.pe / admin123 [ADMIN]
✅ Usuario creado: tecnico@universidad.edu.pe / tecnico123 [TECNICO]
✅ Usuario creado: alumno@universidad.edu.pe / alumno123 [ESTUDIANTE]
Started IncidenciasbackApplication in X.X seconds
```

API REST disponible en: **http://localhost:8080**

---

### 4️⃣ Correr el frontend (React)

Abre una **tercera terminal** desde la **raíz del proyecto**:

```bash
npm install    # Solo la primera vez
npm run dev
```

Aplicación web disponible en: **http://localhost:5173**

---

## 🔑 Acceso inicial al sistema

Ingresa en tu navegador a **[http://localhost:5173](http://localhost:5173)** con cualquiera de estos usuarios creados automáticamente:

| Rol | Correo | Contraseña |
|---|---|---|
| **Admin** | `admin@universidad.edu.pe` | `admin123` |
| **Técnico** | `tecnico@universidad.edu.pe` | `tecnico123` |
| **Estudiante** | `alumno@universidad.edu.pe` | `alumno123` |

---

## 🗄️ Ver y administrar la Base de Datos (phpMyAdmin)

Abre en tu navegador **[http://localhost:8081](http://localhost:8081)**:

| Parámetro | Valor |
|---|---|
| **Servidor** | `db` |
| **Usuario** | `root` |
| **Contraseña** | `root` |

Podrás ver la base de datos `campus_incidencias_db` con todas sus tablas (`usuarios`, `roles`, `incidencias`, etc.).

---

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

---

## 🌿 Flujo de trabajo en equipo con Git

Para evitar conflictos de código, seguimos el flujo de ramas:

1. **Partir siempre desde la rama `develop` actualizada:**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Crear una rama para tu tarea específica:**
   ```bash
   git checkout -b feature/nombre-de-tu-tarea
   ```

3. **Guardar tus avances con mensajes claros:**
   ```bash
   git add .
   git commit -m "feat: agregar validación en formulario de incidencias"
   ```

4. **Publicar tu rama y crear Pull Request:**
   ```bash
   git push -u origin feature/nombre-de-tu-tarea
   ```
   *Luego ve a GitHub y abre un Pull Request hacia la rama `develop`.*

---

## ❓ Solución a problemas frecuentes

| Problema | Causa | Solución |
|---|---|---|
| `permission denied` al usar Docker en Linux | Tu usuario aún no tiene la sesión de grupo activa | Ejecuta `newgrp docker` o cierra e inicia sesión en el sistema. |
| El backend dice `Access denied for user` | Docker no está corriendo o los puertos cambiaron | Verifica con `docker compose ps` y levántalo con `docker compose up -d`. |
| `./mvnw: Permission denied` en Linux/Mac | Falta permiso de ejecución en el wrapper | Ejecuta `chmod +x backend/mvnw`. |
| Error `Port 3307 is already in use` | Otro proceso tiene tomado el puerto | Cambia el puerto del host en `docker-compose.yml` y en `backend/src/main/resources/application.yaml`. |
| El frontend no conecta con el backend | El backend no está corriendo en el puerto 8080 | Asegúrate de haber iniciado el backend con `./mvnw spring-boot:run`. |

---

## 👥 Equipo de desarrollo

<!-- Lista de integrantes del equipo -->
