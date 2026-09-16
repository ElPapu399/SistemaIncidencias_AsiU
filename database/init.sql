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
    telefono VARCHAR(20) NULL,
    carrera VARCHAR(100) NULL,
    estado VARCHAR(20) DEFAULT 'Activo',
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

-- 7. Tabla de Equipos (catálogo de equipos físicos)
CREATE TABLE IF NOT EXISTS equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,  -- Ej: PC-LAB-A-05
    tipo VARCHAR(50) NOT NULL,           -- 'PC', 'Impresora', 'Proyector', 'Switch', etc.
    marca VARCHAR(100) NULL,
    modelo VARCHAR(100) NULL,
    ubicacion_id INT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Operativo', -- 'Operativo', 'En reparación', 'Dado de baja'
    CONSTRAINT fk_equipo_ubicacion FOREIGN KEY (ubicacion_id)
        REFERENCES ubicaciones(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 8. Tabla de Tickets / Incidencias
-- ESTADOS: 'Pendiente', 'Asignada', 'En atención', 'Resuelta', 'Cerrada'
CREATE TABLE IF NOT EXISTS incidencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_ticket VARCHAR(20) NOT NULL UNIQUE, -- Ej: INC-2026-0001
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    estudiante_id INT NOT NULL,
    tecnico_id INT NULL,
    categoria_id INT NOT NULL,
    prioridad_id INT NOT NULL,
    ubicacion_id INT NOT NULL,
    equipo_id INT NULL,
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
        REFERENCES ubicaciones(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_incidencia_equipo FOREIGN KEY (equipo_id)
        REFERENCES equipos(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 9. Tabla de Fotos y Evidencias Adjuntas
CREATE TABLE IF NOT EXISTS archivos_adjuntos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incidencia_id INT NOT NULL,
    url_archivo VARCHAR(255) NOT NULL,
    nombre_original VARCHAR(150) NOT NULL,
    tipo_archivo VARCHAR(100) NULL,
    tamanio_bytes BIGINT NULL,
    subido_por INT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_adjunto_incidencia FOREIGN KEY (incidencia_id)
        REFERENCES incidencias(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_adjunto_usuario FOREIGN KEY (subido_por)
        REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 10. Tabla de Auditoría e Historial de Estados
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
    ('Software',  'Sistemas operativos, aplicaciones, licencias'),
    ('Audiovisual', 'Proyectores, pantallas, audio');

INSERT IGNORE INTO prioridades (nivel, tiempo_maximo_horas, descripcion) VALUES
    ('Alta',  4,  'Afecta a múltiples usuarios o servicios críticos'),
    ('Media', 24, 'Afecta a un usuario, tiene solución temporal'),
    ('Baja',  72, 'Inconveniente menor, no bloquea el trabajo');

INSERT IGNORE INTO ubicaciones (pabellon, aula_laboratorio, piso, tipo) VALUES
    ('Pabellón A', 'Laboratorio A', 1, 'Laboratorio'),
    ('Pabellón A', 'Laboratorio B', 1, 'Laboratorio'),
    ('Pabellón B', 'Laboratorio C', 1, 'Laboratorio'),
    ('Pabellón B', 'Laboratorio D', 2, 'Laboratorio'),
    ('Pabellón C', 'Laboratorio E', 1, 'Laboratorio'),
    ('Pabellón C', 'Laboratorio F', 2, 'Laboratorio'),
    ('Pabellón D', 'Aula 301', 3, 'Aula'),
    ('Pabellón D', 'Auditorio', 1, 'Auditorio');

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
    ('Problema con licencia de software', 3, 3),
    ('Proyector sin señal HDMI', 4, 2),
    ('Ruido estático en altavoces', 4, 3),
    ('Teclado con teclas bloqueadas', 1, 3),
    ('Kernel de Python no inicia', 3, 2),
    ('Cable de red con conector roto', 2, 2),
    ('Base de datos local bloqueada', 3, 1);

-- Equipos de ejemplo (catálogo)
INSERT IGNORE INTO equipos (codigo, tipo, marca, modelo, ubicacion_id, estado) VALUES
    ('PC-LAB-A-01', 'PC', 'HP', 'ProDesk 400 G7', 1, 'Operativo'),
    ('PC-LAB-A-02', 'PC', 'HP', 'ProDesk 400 G7', 1, 'Operativo'),
    ('PC-LAB-A-03', 'PC', 'HP', 'ProDesk 400 G7', 1, 'Operativo'),
    ('PC-LAB-A-04', 'PC', 'HP', 'ProDesk 400 G7', 1, 'Operativo'),
    ('PC-LAB-A-05', 'PC', 'HP', 'ProDesk 400 G7', 1, 'En reparación'),
    ('PC-LAB-B-01', 'PC', 'Dell', 'OptiPlex 5090', 2, 'Operativo'),
    ('PC-LAB-B-02', 'PC', 'Dell', 'OptiPlex 5090', 2, 'Operativo'),
    ('PC-LAB-C-01', 'PC', 'Lenovo', 'ThinkCentre M70q', 3, 'Operativo'),
    ('PC-LAB-C-02', 'PC', 'Lenovo', 'ThinkCentre M70q', 3, 'Operativo'),
    ('PC-LAB-D-01', 'PC', 'HP', 'ProDesk 400 G7', 4, 'Operativo'),
    ('IMP-LAB-A-01', 'Impresora', 'HP', 'LaserJet Pro M404dn', 1, 'Operativo'),
    ('PROY-LAB-B-01', 'Proyector', 'Epson', 'PowerLite E20', 2, 'Operativo'),
    ('SW-LAB-A-01', 'Switch', 'Cisco', 'Catalyst 2960', 1, 'Operativo'),
    ('PC-LAB-E-01', 'PC', 'HP', 'ProDesk 400 G7', 5, 'Operativo'),
    ('PC-LAB-F-01', 'PC', 'Dell', 'OptiPlex 5090', 6, 'Operativo'),
    ('MON-LAB-A-05', 'Monitor', 'Samsung', 'S24R350', 1, 'Operativo'),
    ('TEC-LAB-A-18', 'Teclado', 'Logitech', 'K120', 1, 'Operativo'),
    ('PC-LAB-C-04', 'PC', 'Lenovo', 'ThinkCentre M70q', 3, 'Operativo'),
    ('PC-LAB-B-20', 'PC', 'Dell', 'OptiPlex 5090', 2, 'Operativo'),
    ('PC-LAB-D-15', 'PC', 'HP', 'ProDesk 400 G7', 4, 'Operativo');

-- Incidencias de ejemplo con nuevos estados y equipos
INSERT IGNORE INTO incidencias
    (codigo_ticket, titulo, descripcion, estado, estudiante_id, tecnico_id,
     categoria_id, prioridad_id, ubicacion_id, equipo_id, solucion_tecnica)
VALUES
    ('INC-001', 'Computadora no enciende – Puesto #5', 'La computadora en el puesto #5 no responde al intentar encenderla. Se escucha un pitido corto al presionar el botón de encendido. El monitor muestra señal pero la PC no arranca.', 'En atención', 3, 2,
        1, 1, 1, 5, NULL),
    ('INC-002', 'Proyector sin señal HDMI – Lab B', 'El proyector del laboratorio B no recibe señal HDMI desde ninguna computadora. Se probó con diferentes cables.', 'Pendiente', 3, NULL,
        13, 2, 2, 12, NULL),
    ('INC-003', 'Sin salida a internet local – Puesto #12', 'El equipo no tiene acceso a Internet desde el laboratorio. Otros equipos funcionan correctamente.', 'Resuelta', 3, 2,
        5, 1, 1, NULL, 'Se reconfiguró la dirección IP estática y se reinició el punto de acceso.'),
    ('INC-004', 'Monitor parpadea al compilar – Puesto #02', 'El monitor presenta parpadeo intermitente cuando se ejecutan compilaciones pesadas.', 'Cerrada', 3, 2,
        3, 3, 4, 10, 'Se reemplazó el cable HDMI defectuoso y se actualizó el firmware del monitor.'),
    ('INC-005', 'Error de licencia en IDE IntelliJ – Lab C', 'IntelliJ IDEA muestra error de licencia expirada. No se puede activar con la cuenta institucional.', 'Asignada', 3, 4,
        12, 2, 3, 8, NULL),
    ('INC-006', 'Teclado con teclas bloqueadas – Puesto #18', 'Las teclas F1-F5 del teclado no responden. Se limpió con aire comprimido pero no mejoró.', 'Cerrada', 3, 2,
        15, 3, 1, 17, 'Se reemplazó el teclado por uno nuevo del inventario.'),
    ('INC-007', 'Kernel de Python no inicia – Puesto #04', 'Jupyter Notebook no puede iniciar el kernel de Python. Muestra error de conexión.', 'En atención', 3, 4,
        16, 2, 6, 15, NULL),
    ('INC-008', 'Cable de red con conector roto – Puesto #20', 'El cable de red del puesto #20 tiene el conector RJ-45 roto. No se puede conectar al switch.', 'Asignada', 3, 2,
        17, 2, 2, NULL, NULL),
    ('INC-009', 'Base de datos local bloqueada – Puesto #15', 'MySQL Workbench no puede conectarse a la instancia local. Muestra error "too many connections".', 'Pendiente', 3, NULL,
        18, 1, 4, 10, NULL),
    ('INC-010', 'Ruido estático en altavoces – Puesto #11', 'Los altavoces del aula producen ruido estático constante incluso sin entrada de audio.', 'Resuelta', 3, 2,
        14, 3, 3, NULL, 'Se reemplazó el cable de audio y se actualizó el driver de sonido.');

INSERT IGNORE INTO historial_estados
    (incidencia_id, estado_anterior, estado_nuevo, usuario_id, comentario)
VALUES
    -- INC-001: Pendiente → Asignada → En atención
    (1, 'Nuevo', 'Pendiente', 3, 'Ticket registrado'),
    (1, 'Pendiente', 'Asignada', 1, 'Técnico asignado: Carlos Mendoza'),
    (1, 'Asignada', 'En atención', 2, 'Carlos Mendoza inició atención en Laboratorio A'),
    -- INC-002: Pendiente
    (2, 'Nuevo', 'Pendiente', 3, 'Ticket registrado'),
    -- INC-003: Pendiente → Asignada → En atención → Resuelta
    (3, 'Nuevo', 'Pendiente', 3, 'Ticket registrado'),
    (3, 'Pendiente', 'Asignada', 1, 'Técnico asignado: Carlos Mendoza'),
    (3, 'Asignada', 'En atención', 2, 'Se inició revisión de la conectividad'),
    (3, 'En atención', 'Resuelta', 2, 'Se reconfiguró IP y se reinició el punto de acceso'),
    -- INC-004: Completa hasta Cerrada
    (4, 'Nuevo', 'Pendiente', 3, 'Ticket registrado'),
    (4, 'Pendiente', 'Asignada', 1, 'Técnico asignado: Carlos Mendoza'),
    (4, 'Asignada', 'En atención', 2, 'Se inició revisión del monitor'),
    (4, 'En atención', 'Resuelta', 2, 'Cable HDMI reemplazado, firmware actualizado'),
    (4, 'Resuelta', 'Cerrada', 1, 'Incidencia cerrada por el administrador'),
    -- INC-005: Pendiente → Asignada
    (5, 'Nuevo', 'Pendiente', 3, 'Ticket registrado'),
    (5, 'Pendiente', 'Asignada', 1, 'Técnico asignado: Diego Vargas'),
    -- INC-006: Completa hasta Cerrada
    (6, 'Nuevo', 'Pendiente', 3, 'Ticket registrado'),
    (6, 'Pendiente', 'Asignada', 1, 'Técnico asignado: Carlos Mendoza'),
    (6, 'Asignada', 'En atención', 2, 'Se revisó el teclado'),
    (6, 'En atención', 'Resuelta', 2, 'Teclado reemplazado'),
    (6, 'Resuelta', 'Cerrada', 1, 'Incidencia cerrada'),
    -- INC-007: Pendiente → Asignada → En atención
    (7, 'Nuevo', 'Pendiente', 3, 'Ticket registrado'),
    (7, 'Pendiente', 'Asignada', 1, 'Técnico asignado: Diego Vargas'),
    (7, 'Asignada', 'En atención', 4, 'Diego Vargas inició revisión del kernel'),
    -- INC-008: Pendiente → Asignada
    (8, 'Nuevo', 'Pendiente', 3, 'Ticket registrado'),
    (8, 'Pendiente', 'Asignada', 1, 'Técnico asignado: Carlos Mendoza'),
    -- INC-009: Pendiente
    (9, 'Nuevo', 'Pendiente', 3, 'Ticket registrado'),
    -- INC-010: Completa hasta Resuelta
    (10, 'Nuevo', 'Pendiente', 3, 'Ticket registrado'),
    (10, 'Pendiente', 'Asignada', 1, 'Técnico asignado: Carlos Mendoza'),
    (10, 'Asignada', 'En atención', 2, 'Se revisó el sistema de audio'),
    (10, 'En atención', 'Resuelta', 2, 'Cable de audio reemplazado, driver actualizado');