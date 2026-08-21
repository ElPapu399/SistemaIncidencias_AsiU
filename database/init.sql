-- =====================================================
-- Script de inicialización de la base de datos
-- SistemaIncidencias_AsiU
-- =====================================================

CREATE DATABASE IF NOT EXISTS campus_incidencias_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campus_incidencias_db;


-- 1. Tabla de Roles (ADMIN, ESTUDIANTE, TECNICO)
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 2. Tabla de Especialidades Técnicas (Hardware, Redes, Software)
CREATE TABLE IF NOT EXISTS especialidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(200) NULL
) ENGINE=InnoDB;

-- 3. Tabla de Usuarios del Campus
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    especialidad_id INT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id)
        REFERENCES roles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_usuario_especialidad FOREIGN KEY (especialidad_id)
        REFERENCES especialidades(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Tabla de Prioridades y Tiempos de Atención
CREATE TABLE IF NOT EXISTS prioridades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nivel VARCHAR(20) NOT NULL UNIQUE, -- 'Alta', 'Media', 'Baja'
    tiempo_maximo_horas INT NOT NULL,
    descripcion VARCHAR(150) NULL
) ENGINE=InnoDB;

-- 5. Tabla de Ubicaciones Físicas (Aulas y Laboratorios)
CREATE TABLE IF NOT EXISTS ubicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pabellon VARCHAR(50) NOT NULL,
    aula_laboratorio VARCHAR(50) NOT NULL,
    piso INT NOT NULL,
    tipo VARCHAR(30) NOT NULL -- 'Laboratorio', 'Aula', 'Auditorio'
) ENGINE=InnoDB;

-- 6. Tabla de Categorías de Incidencias
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especialidad_id INT NOT NULL,
    prioridad_defecto_id INT NOT NULL,
    CONSTRAINT fk_categoria_especialidad FOREIGN KEY (especialidad_id)
        REFERENCES especialidades(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_categoria_prioridad FOREIGN KEY (prioridad_defecto_id)
        REFERENCES prioridades(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 7. Tabla de Tickets / Incidencias
CREATE TABLE IF NOT EXISTS incidencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_ticket VARCHAR(20) NOT NULL UNIQUE, -- Ej: INC-2026-0001
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente', -- 'Pendiente', 'En Proceso', 'Resuelto', 'Cancelado'
    estudiante_id INT NOT NULL,
    tecnico_id INT NULL,
    categoria_id INT NOT NULL,
    prioridad_id INT NOT NULL,
    ubicacion_id INT NOT NULL,
    solucion_tecnica TEXT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_inicio_atencion TIMESTAMP NULL,
    fecha_cierre TIMESTAMP NULL,
    CONSTRAINT fk_incidencia_estudiante FOREIGN KEY (estudiante_id)
        REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_incidencia_tecnico FOREIGN KEY (tecnico_id)
        REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_incidencia_categoria FOREIGN KEY (categoria_id)
        REFERENCES categorias(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_incidencia_prioridad FOREIGN KEY (prioridad_id)
        REFERENCES prioridades(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_incidencia_ubicacion FOREIGN KEY (ubicacion_id)
        REFERENCES ubicaciones(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 8. Tabla de Fotos y Evidencias Adjuntas
CREATE TABLE IF NOT EXISTS archivos_adjuntos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incidencia_id INT NOT NULL,
    url_archivo VARCHAR(255) NOT NULL,
    nombre_original VARCHAR(150) NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_adjunto_incidencia FOREIGN KEY (incidencia_id)
        REFERENCES incidencias(id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Tabla de Auditoría e Historial de Estados
CREATE TABLE IF NOT EXISTS historial_estados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incidencia_id INT NOT NULL,
    estado_anterior VARCHAR(20) NOT NULL,
    estado_nuevo VARCHAR(20) NOT NULL,
    usuario_id INT NOT NULL,
    comentario VARCHAR(255) NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historial_incidencia FOREIGN KEY (incidencia_id)
        REFERENCES incidencias(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_historial_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;


-- =====================================================
-- DATOS INICIALES (seed data)
-- =====================================================

INSERT IGNORE INTO roles (nombre) VALUES
    ('ADMIN'),
    ('ESTUDIANTE'),
    ('TECNICO');

INSERT IGNORE INTO especialidades (nombre, descripcion) VALUES
    ('Hardware',  'Problemas físicos: equipos, periféricos, impresoras'),
    ('Redes',     'Conectividad, Wi-Fi, switches, puntos de acceso'),
    ('Software',  'Sistemas operativos, aplicaciones, licencias');

INSERT IGNORE INTO prioridades (nivel, tiempo_maximo_horas, descripcion) VALUES
    ('Alta',  4,  'Afecta a múltiples usuarios o servicios críticos'),
    ('Media', 24, 'Afecta a un usuario, tiene solución temporal'),
    ('Baja',  72, 'Inconveniente menor, no bloquea el trabajo');
