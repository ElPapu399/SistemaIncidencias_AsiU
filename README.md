# APP AsiU

Sistema web para la gestión y seguimiento de incidencias universitarias.

**Stack:** React 19 + TypeScript + Tailwind CSS | Spring Boot 3 (Java 21) | MySQL 8 (Docker)

---

## Prerrequisitos para correr el programa la primera vez

### 🐧 En Linux 
```bash
sudo pacman -S jdk21-openjdk nodejs npm docker docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

### 🪟 En Windows
Instalar:
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

Abre una **la primera terminal**:

Desde la **raíz del proyecto**:
```bash
docker compose up -d
```

Esto inicia dos servicios en contenedores:
- **MySQL 8:** Puerto `3307`
- **phpMyAdmin (panel web):** Puerto `8081` → [http://localhost:8081](http://localhost:8081)

> 🐧 **Linux:** Si hay error a veces  es necesario `newgrp docker`.

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
npm install    # Solo la primera vez para las dependencias

npm run dev    
```

Se abrirá en: **http://localhost:5173**

---

## 🔑 Acceso inicial al sistema (solo login)

Ingresa en tu navegador a **[http://localhost:5173](http://localhost:5173)** con cualquiera de estos usuarios creados automáticamente (revisen DataLoader.java):

| Rol | Nombre | Correo | Contraseña | Detalle |
|---|---|---|---|---|
| **Admin** | Ana Rodríguez | `admin@universidad.edu.pe` | `admin123` | Gestión total y métricas |
| **Soporte General** | Rosa Flores | `r.flores@utp.edu.pe` | `tecnico123` | Mesa de ayuda / Triaje y asignación |
| **Soporte General** | Jorge Herrera | `j.herrera@utp.edu.pe` | `tecnico123` | Mesa de ayuda / Triaje y asignación |
| **Soporte Especialista** | Carlos Mendoza | `c.mendoza@utp.edu.pe` | `tecnico123` | Especialidad: Hardware (resolutor) |
| **Soporte Especialista** | Pedro Sánchez | `p.sanchez@utp.edu.pe` | `tecnico123` | Especialidad: Redes (resolutor) |
| **Soporte Especialista** | Lucía Ramos | `l.ramos@utp.edu.pe` | `tecnico123` | Especialidad: Software (resolutor) |
| **Soporte Especialista** | Marcos Vega | `m.vega@utp.edu.pe` | `tecnico123` | Especialidad: Audiovisual (resolutor) |
| **Estudiante** | María García | `m.garcia@utp.edu.pe` | `alumno123` | Reporte de incidencias |


## Ver y administrar la Base de Datos (phpMyAdmin)

Abre en tu navegador **[http://localhost:8081](http://localhost:8081)**:

**Servidor** : `db`
**Usuario** : `root`
**Contraseña** : `root` 


## Después del primer arranque solo necesitas 3 comandos

En 3 terminales abiertas:

| # | Servicio | Carpeta | Comando |
|---|---|---|---|
| 1️⃣ | **Base de Datos** | En la raíz del proyecto | `docker compose up -d` |
| 2️⃣ | **Backend** | desde la carpeta `backend/` | `./mvnw spring-boot:run` (o `mvnw.cmd spring-boot:run`) |
| 3️⃣ | **Frontend** | en la raíz del proyecto | `npm run dev` |

Para apagar la base de datos al terminar:
```bash
docker compose down
```

---

## 🗂️ Estructura del repositorio

```
SistemaIncidencias_AsiU/
├── src/                             ← Frontend React 19 (TypeScript + Tailwind)
│   ├── assets/                      ← Imágenes y recursos estáticos
│   ├── components/                  ← Componentes reutilizables
│   │   ├── dashboard/               ← Componentes del panel principal
│   │   │   ├── AssignTechnicianModal.tsx ← Modal para asignar especialista
│   │   │   ├── CategoryBreakdown.tsx ← Gráfico/Distribución por categorías
│   │   │   ├── ChangeStatusModal.tsx ← Modal para cambiar estado de ticket
│   │   │   ├── Header.tsx           ← Barra superior con badge de rol
│   │   │   ├── IncidentBadges.tsx   ← Badges de estado y prioridad
│   │   │   ├── IncidentForm.tsx     ← Formulario de creación de incidencias
│   │   │   ├── IncidentsTable.tsx   ← Tabla principal de incidencias
│   │   │   ├── RecentIncidentsTable.tsx ← Resumen reciente en Dashboard
│   │   │   ├── SearchBar.tsx        ← Barra de búsqueda
│   │   │   ├── Sidebar.tsx          ← Navegación lateral según rol
│   │   │   ├── StatCard.tsx         ← Tarjetas de KPIs del dashboard
│   │   │   └── UserForm.tsx         ← Modal contextualizado de usuarios/técnicos
│   │   ├── Button.tsx
│   │   ├── InputBox.tsx
│   │   ├── StudentTable.tsx         ← Tabla de estudiantes
│   │   └── TechnTable.tsx           ← Tabla de técnicos (General y Especialista)
│   ├── layouts/
│   │   └── DashboardLayout.tsx      ← Layout general del panel
│   ├── pages/                       ← Vistas principales
│   │   ├── Dashboard.tsx            ← Panel general con KPIs
│   │   ├── EstudiantesPage.tsx      ← Gestión de alumnos
│   │   ├── IncidenciasPage.tsx      ← Gestión y filtrado de incidencias
│   │   ├── Login.tsx                ← Pantalla de autenticación
│   │   ├── PlaceholderPage.tsx      ← Páginas en desarrollo (Reportes/Ajustes)
│   │   └── TecnicosPage.tsx         ← Gestión de técnicos por tipo
│   ├── services/
│   │   └── incidenciasService.ts    ← Consumo de endpoints de tickets
│   ├── types/                       ← Interfaces TypeScript
│   │   ├── incident.ts
│   │   └── user.ts
│   ├── utils/
│   │   ├── auth.ts                  ← Almacenamiento y decodificación de JWT
│   │   └── fetchWithAuth.ts         ← Fetch wrapper con cabecera Bearer y manejo 401
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── backend/                         ← Backend Spring Boot 3 (Java 21)
│   └── src/main/java/.../
│       ├── config/                  ← Seguridad, CORS, BCrypt y Seeder inicial
│       │   ├── DataLoader.java
│       │   ├── JwtConfig.java
│       │   └── SecurityConfig.java
│       ├── controller/              ← Controladores REST
│       │   ├── ArchivoAdjuntoController.java
│       │   ├── AuthController.java
│       │   ├── CatalogoController.java
│       │   ├── EquipoController.java
│       │   ├── IncidenciaController.java
│       │   └── UsuarioController.java
│       ├── dto/                     ← DTOs de petición y respuesta
│       ├── model/                   ← Entidades JPA (Usuario, Incidencia, Rol, etc.)
│       ├── repository/              ← Repositorios JPA con EntityGraph
│       ├── security/                ← Filtro y utilitarios JWT
│       └── service/                 ← Lógica de negocio (Auth, Incidencia, Usuario)
│   └── src/main/resources/
│       └── application.yaml         ← Configuración del servidor y base de datos
│   ├── pom.xml                      ← Dependencias Maven
│   └── mvnw / mvnw.cmd              ← Maven Wrapper
├── database/
│   └── init.sql                     ← Script DDL inicial con roles y catálogos
├── public/
├── docker-compose.yml               ← Contenedores MySQL 8 y phpMyAdmin
├── package.json
└── README.md
```
