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

INSERT IGNORE INTO ubicaciones (pabellon, aula_laboratorio, piso, tipo) VALUES
    ('Pabellón A', 'Aula 101', 1, 'Aula'),
    ('Pabellón A', 'Aula 201', 2, 'Aula'),
    ('Pabellón B', 'Aula 102', 1, 'Aula'),
    ('Pabellón B', 'Laboratorio 1', 1, 'Laboratorio'),
    ('Pabellón B', 'Laboratorio 2', 2, 'Laboratorio'),
    ('Pabellón C', 'Laboratorio 3', 1, 'Laboratorio'),
    ('Pabellón C', 'Auditorio', 1, 'Auditorio'),
    ('Pabellón D', 'Aula 301', 3, 'Aula');

INSERT IGNORE INTO categorias (nombre, especialidad_id, prioridad_defecto_id) VALUES
    ('Computadora no enciende', 1, 1),
    ('Problema con teclado o mouse', 1, 3),
    ('Problema con monitor', 1, 2),
    ('Problema con impresora', 1, 2),
    ('Sin conexión a Internet', 2, 1),
    ('Problema con Wi-Fi', 2, 1),
    ('Problema de conexión de red', 2, 2),
    ('Conexión lenta', 2, 3),
    ('Error de aplicación', 3, 2),
    ('Problema con sistema operativo', 3, 1),
    ('Problema de instalación', 3, 2),
    ('Problema con licencia de software', 3, 3);

INSERT IGNORE INTO incidencias
    (codigo_ticket, titulo, descripcion, estado, estudiante_id, tecnico_id,
     categoria_id, prioridad_id, ubicacion_id, solucion_tecnica)
VALUES
    ('INC-2026-0001', 'Computadora no enciende', 'La computadora del aula no enciende al presionar el botón de encendido.', 'Pendiente', 3, NULL,
        1, 1, 1, NULL),
    ('INC-2026-0002', 'Sin conexión a Internet', 'El equipo no tiene acceso a Internet desde el laboratorio.', 'En Proceso', 3, 2,
        5, 1, 4, NULL),
    ('INC-2026-0003', 'Problema con impresora', 'La impresora no imprime los documentos enviados desde el aula.', 'Resuelto', 3, 2,
        4, 2, 2, 'Se reinició la impresora y se reinstaló el controlador.'),
    ('INC-2026-0004', 'Problema con Wi-Fi', 'La conexión Wi-Fi presenta interrupciones frecuentes.', 'Pendiente', 3, NULL,
        6, 1, 5, NULL),
    ('INC-2026-0005', 'Problema con monitor', 'El monitor presenta una pantalla intermitente durante el uso.', 'En Proceso', 3, 2,
        3, 2, 3, NULL),
    ('INC-2026-0006', 'Error de aplicación', 'La aplicación utilizada en el laboratorio presenta errores al iniciar.', 'Resuelto', 3, 2,
        9, 2, 6, 'Se reinstaló la aplicación y se verificó su funcionamiento.'),
    ('INC-2026-0007', 'Problema con sistema operativo', 'El sistema operativo del equipo presenta errores durante el inicio.', 'Pendiente', 3, NULL,
        10, 1, 7, NULL),
    ('INC-2026-0008', 'Conexión lenta', 'La conexión a Internet presenta una velocidad inferior a la esperada.', 'Resuelto', 3, 2,
        8, 3, 8, 'Se verificó la conexión de red y se reinició el punto de acceso.');

INSERT IGNORE INTO historial_estados
    (incidencia_id, estado_anterior, estado_nuevo, usuario_id, comentario)
VALUES
    (2, 'Pendiente', 'En Proceso', 2, 'El técnico inició la atención de la incidencia.'),
    (3, 'Pendiente', 'En Proceso', 2, 'Se inició la revisión de la impresora.'),
    (3, 'En Proceso', 'Resuelto', 2, 'La impresora quedó operativa después de reinstalar el controlador.'),
    (5, 'Pendiente', 'En Proceso', 2, 'Se inició la revisión del monitor.'),
    (6, 'Pendiente', 'En Proceso', 2, 'Se inició la revisión del problema de software.'),
    (6, 'En Proceso', 'Resuelto', 2, 'La aplicación fue reinstalada correctamente.'),
    (8, 'Pendiente', 'En Proceso', 2, 'Se revisó la conectividad de red.'),
    (8, 'En Proceso', 'Resuelto', 2, 'Se solucionó el problema de conexión.');