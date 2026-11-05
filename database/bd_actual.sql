-- ==============================================================
-- SISTEMA DE GESTIÓN DE INCIDENCIAS - ASIU
-- Base de Datos Actual - Datos Completos y Realistas
-- Compatible con MySQL local y Aiven for MySQL (Cloud)
-- Regla de Negocio: 
--  * 'Resuelta': Incidencia solucionada por técnico, SIN calificación (esperando confirmación del alumno).
--  * 'Cerrada': Incidencia cerrada por el alumno CON calificación y comentario.
-- ==============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. LIMPIEZA DE TABLAS
TRUNCATE TABLE solicitudes_reasignacion;
TRUNCATE TABLE historial_estados;
TRUNCATE TABLE historial_equipos;
TRUNCATE TABLE archivos_adjuntos;
TRUNCATE TABLE incidencias;
TRUNCATE TABLE equipos;
TRUNCATE TABLE categorias;
TRUNCATE TABLE especialidades;
TRUNCATE TABLE prioridades;
TRUNCATE TABLE ubicaciones;
TRUNCATE TABLE usuarios;
TRUNCATE TABLE roles;

-- 2. ROLES
INSERT INTO roles (id, nombre) VALUES
(1, 'ADMIN'),
(2, 'ESTUDIANTE'),
(3, 'TECNICO'),
(4, 'TECNICO_GENERAL'),
(5, 'TECNICO_ESPECIALISTA');

-- 3. ESPECIALIDADES
INSERT INTO especialidades (id, nombre, descripcion) VALUES
(1, 'Hardware', 'Reparación y diagnóstico de PCs, fuentes de poder, placas y periféricos'),
(2, 'Redes', 'Infraestructura de switches, routers, cableado estructurado y Wi-Fi'),
(3, 'Software', 'Sistemas operativos, software académico, licencias y compiladores'),
(4, 'Audiovisual', 'Proyectores multimedia, sistemas de sonido y microfonía de auditorios');

-- 4. PRIORIDADES
INSERT INTO prioridades (id, nivel, tiempo_maximo_horas, descripcion) VALUES
(1, 'Alta', 4, 'Afecta a múltiples usuarios o detiene clases y exámenes en laboratorios'),
(2, 'Media', 24, 'Afecta a un usuario individual o equipo con reemplazo temporal viable'),
(3, 'Baja', 72, 'Inconvenientes estéticos o periféricos secundarios sin bloqueo operativo');

-- 5. UBICACIONES (LABORATORIOS Y AULAS DEL CAMPUS)
INSERT INTO ubicaciones (id, pabellon, aula_laboratorio, piso, tipo, capacidad, estado, encargado_id) VALUES
(1, 'Pabellón A', 'Laboratorio A - Desarrollo de Software', 1, 'Laboratorio', 32, 'Operativo', 6),
(2, 'Pabellón A', 'Laboratorio B - Redes y Servidores', 1, 'Laboratorio', 28, 'Operativo', 8),
(3, 'Pabellón B', 'Laboratorio C - Inteligencia Artificial', 1, 'Laboratorio', 30, 'Operativo', 9),
(4, 'Pabellón B', 'Laboratorio D - Arquitectura y CAD', 2, 'Laboratorio', 26, 'Mantenimiento', 7),
(5, 'Pabellón C', 'Laboratorio E - Ciencias Básicas', 1, 'Laboratorio', 30, 'Operativo', 3),
(6, 'Pabellón D', 'Auditorio Central', 1, 'Auditorio', 180, 'Mantenimiento', 10),
(7, 'Pabellón D', 'Aula Magna 301', 3, 'Aula', 60, 'Operativo', 10);

-- 6. USUARIOS
-- Contraseñas BCrypt:
-- 'admin123'  -> $2a$10$PVGJftZrqDrApmw0xIecne6rYqYlqtpT65dgD47xPXAo.7UzPJv.a
-- 'tecnico123' -> $2a$10$8KFkNdkIcTrvjlYxvRai.eu7Yr7IlK3l8YlPg6iaqdVJugagqsbS2
-- 'alumno123'  -> $2a$10$7XHlyA9.HnooikMjuwQ4u.Wpud6OtxyFTZCIslrkKeGyQ27iTJ2ga
INSERT INTO usuarios (id, nombre, apellido, correo, password_hash, rol_id, telefono, carrera, estado, especialidad_id, fecha_creacion) VALUES
-- Administradores
(1, 'Jhosep', 'Loayza', 'loayzajhosep58@gmail.com', '$2a$10$PVGJftZrqDrApmw0xIecne6rYqYlqtpT65dgD47xPXAo.7UzPJv.a', 1, '987-999-001', NULL, 'Activo', NULL, '2026-08-01 08:00:00'),
(2, 'Ana', 'Rodríguez', 'admin@utp.edu.pe', '$2a$10$PVGJftZrqDrApmw0xIecne6rYqYlqtpT65dgD47xPXAo.7UzPJv.a', 1, '987-000-000', NULL, 'Activo', NULL, '2026-08-01 08:00:00'),

-- Técnicos Generales (Mesa de Ayuda / Triaje)
(3, 'Alex', 'Martínez', 'roal2109@hotmail.com', '$2a$10$8KFkNdkIcTrvjlYxvRai.eu7Yr7IlK3l8YlPg6iaqdVJugagqsbS2', 4, '987-999-002', NULL, 'Activo', NULL, '2026-08-01 08:30:00'),
(4, 'Rosa', 'Flores', 'r.flores@utp.edu.pe', '$2a$10$8KFkNdkIcTrvjlYxvRai.eu7Yr7IlK3l8YlPg6iaqdVJugagqsbS2', 4, '987-666-321', NULL, 'Activo', NULL, '2026-08-01 08:30:00'),
(5, 'Jorge', 'Herrera', 'j.herrera@utp.edu.pe', '$2a$10$8KFkNdkIcTrvjlYxvRai.eu7Yr7IlK3l8YlPg6iaqdVJugagqsbS2', 4, '987-777-888', NULL, 'Activo', NULL, '2026-08-01 08:30:00'),

-- Técnicos Especialistas
(6, 'Álvaro', 'Cabrera', 'ajcb0311@gmail.com', '$2a$10$8KFkNdkIcTrvjlYxvRai.eu7Yr7IlK3l8YlPg6iaqdVJugagqsbS2', 5, '987-999-003', NULL, 'Activo', 1, '2026-08-01 09:00:00'),
(7, 'Carlos', 'Mendoza', 'c.mendoza@utp.edu.pe', '$2a$10$8KFkNdkIcTrvjlYxvRai.eu7Yr7IlK3l8YlPg6iaqdVJugagqsbS2', 5, '987-111-222', NULL, 'Activo', 1, '2026-08-01 09:00:00'),
(8, 'Pedro', 'Sánchez', 'p.sanchez@utp.edu.pe', '$2a$10$8KFkNdkIcTrvjlYxvRai.eu7Yr7IlK3l8YlPg6iaqdVJugagqsbS2', 5, '987-333-789', NULL, 'Activo', 2, '2026-08-01 09:00:00'),
(9, 'Lucía', 'Ramos', 'l.ramos@utp.edu.pe', '$2a$10$8KFkNdkIcTrvjlYxvRai.eu7Yr7IlK3l8YlPg6iaqdVJugagqsbS2', 5, '987-444-100', NULL, 'Activo', 3, '2026-08-01 09:00:00'),
(10, 'Marcos', 'Vega', 'm.vega@utp.edu.pe', '$2a$10$8KFkNdkIcTrvjlYxvRai.eu7Yr7IlK3l8YlPg6iaqdVJugagqsbS2', 5, '987-555-200', NULL, 'Activo', 4, '2026-08-01 09:00:00'),

-- Estudiantes
(11, 'Maykel', 'Stefano', 'maykelstefano3@gmail.com', '$2a$10$7XHlyA9.HnooikMjuwQ4u.Wpud6OtxyFTZCIslrkKeGyQ27iTJ2ga', 2, '987-999-004', 'Ingeniería de Sistemas', 'Activo', NULL, '2026-08-02 10:00:00'),
(12, 'María', 'García', 'm.garcia@utp.edu.pe', '$2a$10$7XHlyA9.HnooikMjuwQ4u.Wpud6OtxyFTZCIslrkKeGyQ27iTJ2ga', 2, '987-654-321', 'Ingeniería de Sistemas', 'Activo', NULL, '2026-08-02 10:00:00'),
(13, 'Luis', 'Torres', 'l.torres@utp.edu.pe', '$2a$10$7XHlyA9.HnooikMjuwQ4u.Wpud6OtxyFTZCIslrkKeGyQ27iTJ2ga', 2, '987-555-123', 'Ciencias de la Computación', 'Activo', NULL, '2026-08-02 10:00:00'),
(14, 'Sofía', 'Quispe', 's.quispe@utp.edu.pe', '$2a$10$7XHlyA9.HnooikMjuwQ4u.Wpud6OtxyFTZCIslrkKeGyQ27iTJ2ga', 2, '987-444-789', 'Ingeniería de Software', 'Activo', NULL, '2026-08-02 10:00:00'),
(15, 'Diego', 'Vargas', 'd.vargas@utp.edu.pe', '$2a$10$7XHlyA9.HnooikMjuwQ4u.Wpud6OtxyFTZCIslrkKeGyQ27iTJ2ga', 2, '987-222-456', 'Ingeniería Industrial', 'Activo', NULL, '2026-08-02 10:00:00'),
(16, 'Camila', 'Vásquez', 'c.vasquez@utp.edu.pe', '$2a$10$7XHlyA9.HnooikMjuwQ4u.Wpud6OtxyFTZCIslrkKeGyQ27iTJ2ga', 2, '987-121-313', 'Ingeniería de Sistemas', 'Activo', NULL, '2026-08-02 10:00:00');

-- 7. CATEGORÍAS
INSERT INTO categorias (id, nombre, especialidad_id, prioridad_defecto_id) VALUES
(1, 'Computadora no enciende', 1, 1),
(2, 'Problema con teclado o mouse', 1, 3),
(3, 'Problema con monitor', 1, 2),
(4, 'Problema con impresora', 1, 2),
(5, 'Sin conexión a Internet', 2, 1),
(6, 'Problema con Wi-Fi', 2, 1),
(7, 'Problema de conexión de red', 2, 2),
(8, 'Conexión lenta', 2, 3),
(9, 'Error de aplicación', 3, 2),
(10, 'Problema con sistema operativo', 3, 1),
(11, 'Problema de instalación', 3, 2),
(12, 'Problema con licencia de software', 3, 3),
(13, 'Proyector sin señal HDMI', 4, 2),
(14, 'Ruido estático en altavoces', 4, 3),
(15, 'Teclado con teclas bloqueadas', 1, 3),
(16, 'Kernel de Python no inicia', 3, 2),
(17, 'Cable de red con conector roto', 2, 2),
(18, 'Base de datos local bloqueada', 3, 1);

-- 8. EQUIPOS DE LABORATORIOS Y AULAS
INSERT INTO equipos (id, codigo, tipo, marca, modelo, numero_serie, fecha_adquisicion, ubicacion_id, estado) VALUES
-- Laboratorio A (Desarrollo de Software - Ubicación 1)
(1, 'PC-LAB-A-01', 'PC', 'Dell', 'OptiPlex 7090', 'SN-DELL-A01', '2025-02-10', 1, 'Operativo'),
(2, 'PC-LAB-A-02', 'PC', 'Dell', 'OptiPlex 7090', 'SN-DELL-A02', '2025-02-10', 1, 'Operativo'),
(3, 'PC-LAB-A-03', 'PC', 'Dell', 'OptiPlex 7090', 'SN-DELL-A03', '2025-02-10', 1, 'Operativo'),
(4, 'PC-LAB-A-04', 'PC', 'Dell', 'OptiPlex 7090', 'SN-DELL-A04', '2025-02-10', 1, 'Operativo'),
(5, 'PC-LAB-A-05', 'PC', 'Dell', 'OptiPlex 7090', 'SN-DELL-A05', '2025-02-10', 1, 'En reparación'),
(10, 'SW-PAB-A-01', 'Switch', 'Cisco', 'Catalyst 2960X 48P', 'SN-CSCO-SW01', '2024-05-20', 1, 'Operativo'),
(13, 'PROY-LAB-A', 'Proyector', 'ViewSonic', 'PG706HD 4000L', 'SN-VS-PG706', '2024-03-18', 1, 'Operativo'),

-- Laboratorio B (Redes y Servidores - Ubicación 2)
(6, 'PC-LAB-B-01', 'PC', 'HP', 'ProDesk 400 G7', 'SN-HP-B01', '2024-11-15', 2, 'Operativo'),
(7, 'PC-LAB-B-02', 'PC', 'HP', 'ProDesk 400 G7', 'SN-HP-B02', '2024-11-15', 2, 'Operativo'),
(8, 'PC-LAB-B-03', 'PC', 'HP', 'ProDesk 400 G7', 'SN-HP-B03', '2024-11-15', 2, 'Operativo'),
(9, 'PC-LAB-B-04', 'PC', 'HP', 'ProDesk 400 G7', 'SN-HP-B04', '2024-11-15', 2, 'Operativo'),
(11, 'SW-PAB-B-01', 'Switch', 'Cisco', 'Catalyst 3850 PoE', 'SN-CSCO-SW02', '2024-05-20', 2, 'Operativo'),
(15, 'SRV-LAB-B', 'Servidor', 'Dell', 'PowerEdge R440 Xeon', 'SN-DELL-PE440', '2024-06-10', 2, 'Operativo'),
(16, 'AP-LAB-B-01', 'Access Point', 'Cisco', 'Aironet 2800 DualBand', 'SN-CSCO-AP01', '2024-08-14', 2, 'Operativo'),

-- Laboratorio C (Inteligencia Artificial - Ubicación 3)
(14, 'IMP-LAB-C-01', 'Impresora', 'HP', 'LaserJet Pro M404dn', 'SN-HP-LJ404', '2024-01-22', 3, 'En reparación'),
(17, 'PC-LAB-C-01', 'PC', 'Lenovo', 'ThinkStation P340 RTX', 'SN-LNV-C01', '2025-01-18', 3, 'Operativo'),
(18, 'PC-LAB-C-02', 'PC', 'Lenovo', 'ThinkStation P340 RTX', 'SN-LNV-C02', '2025-01-18', 3, 'Operativo'),
(19, 'PC-LAB-C-03', 'PC', 'Lenovo', 'ThinkStation P340 RTX', 'SN-LNV-C03', '2025-01-18', 3, 'Operativo'),
(20, 'SW-LAB-C-01', 'Switch', 'TP-Link', 'JetStream 24P Gigabit', 'SN-TPL-SW03', '2024-09-05', 3, 'Operativo'),

-- Laboratorio D (Arquitectura y CAD - Ubicación 4)
(21, 'PC-LAB-D-01', 'PC', 'Dell', 'Precision 3640 Quadro', 'SN-DELL-D01', '2024-10-10', 4, 'Operativo'),
(22, 'PC-LAB-D-02', 'PC', 'Dell', 'Precision 3640 Quadro', 'SN-DELL-D02', '2024-10-10', 4, 'En reparación'),
(23, 'PC-LAB-D-03', 'PC', 'Dell', 'Precision 3640 Quadro', 'SN-DELL-D03', '2024-10-10', 4, 'Operativo'),
(24, 'PLOT-LAB-D-01', 'Plotter', 'HP', 'DesignJet T650 36in', 'SN-HP-PLT01', '2024-02-15', 4, 'Operativo'),
(25, 'PROY-LAB-D-01', 'Proyector', 'Epson', 'EB-2250U 5000L', 'SN-EPS-D01', '2024-04-12', 4, 'Operativo'),

-- Laboratorio E (Ciencias Básicas - Ubicación 5)
(26, 'PC-LAB-E-01', 'PC', 'HP', '280 G4 Microtower', 'SN-HP-E01', '2024-07-20', 5, 'Operativo'),
(27, 'PC-LAB-E-02', 'PC', 'HP', '280 G4 Microtower', 'SN-HP-E02', '2024-07-20', 5, 'Operativo'),
(28, 'PC-LAB-E-03', 'PC', 'HP', '280 G4 Microtower', 'SN-HP-E03', '2024-07-20', 5, 'Operativo'),
(29, 'IMP-LAB-E-01', 'Impresora', 'Epson', 'EcoTank L6270 Wifi', 'SN-EPS-L627', '2024-06-18', 5, 'Operativo'),

-- Auditorio Central (Ubicación 6)
(12, 'PROY-AUD-01', 'Proyector', 'Epson', 'PowerLite L510U 5000L', 'SN-EPS-L510', '2023-09-12', 6, 'Averiado'),
(30, 'CON-AUD-01', 'Consola', 'Yamaha', 'MG16XU 16 Canales', 'SN-YAM-MG16', '2023-11-05', 6, 'Operativo'),

-- Aula Magna 301 (Ubicación 7)
(31, 'PROY-AULA-301', 'Proyector', 'BenQ', 'MH535FHD 3600L', 'SN-BNQ-301', '2024-03-25', 7, 'Operativo'),
(32, 'PC-DOC-301', 'PC', 'Dell', 'OptiPlex 3080 Micro', 'SN-DELL-301', '2024-04-01', 7, 'Operativo');

-- 9. INCIDENCIAS REALISTAS (23 INCIDENCIAS)
-- NOTA:
--   'Resuelta': calificacion = NULL (pendiente de cierre por estudiante)
--   'Cerrada': calificacion NOT NULL y fecha_cierre NOT NULL (calificado por estudiante)
INSERT INTO incidencias (id, codigo_ticket, titulo, descripcion, estado, estudiante_id, tecnico_id, categoria_id, prioridad_id, ubicacion_id, equipo_id, solucion_tecnica, calificacion, motivo_calificacion, comentario_calificacion, fecha_creacion, fecha_inicio_atencion, fecha_cierre) VALUES
-- 1. MAYKEL STEFANO (En Proceso con Álvaro Cabrera)
(1, 'INC-2026-0101', 'PC-LAB-A-03 se reinicia al compilar en Android Studio', 'La máquina se apaga inesperadamente cuando Gradle inicia la construcción de APKs pesados. Parece sobrecalentamiento.', 'En Proceso', 11, 6, 1, 1, 1, 3, NULL, NULL, NULL, NULL, '2026-11-04 09:15:00', '2026-11-04 09:40:00', NULL),

-- 2. MAYKEL STEFANO (Pendiente en triaje)
(2, 'INC-2026-0102', 'Fallo de señal Wi-Fi en Pabellón B piso 2', 'Los laptops de los estudiantes pierden constantemente conexión a la red institucional cerca al laboratorio D.', 'Pendiente', 11, NULL, 6, 1, 4, NULL, NULL, NULL, NULL, NULL, '2026-11-05 01:20:00', NULL, NULL),

-- 3. MAYKEL STEFANO (Cerrada y evaluada - Álvaro Cabrera)
(3, 'INC-2026-0103', 'Monitor parpadea y muestra artefactos en puesto 04', 'La pantalla tiene líneas verdes intermitentes cuando se abren ventanas en pantalla completa en el Lab A.', 'Cerrada', 11, 6, 3, 2, 1, 4, 'Se reemplazó cable DisplayPort defectuoso y se ajustó la frecuencia de actualización a 144Hz. Pruebas de video satisfactorias.', 5, 'Atención rápida y eficaz', 'Excelente soporte, resolvió el problema en minutos y pude continuar el laboratorio sin perder tiempo.', '2026-11-03 14:10:00', '2026-11-03 14:25:00', '2026-11-03 15:10:00'),

-- 4. MAYKEL STEFANO (Cerrada y evaluada - Lucía Ramos)
(4, 'INC-2026-0104', 'Kernel de Jupyter Notebook bloqueado con Docker', 'Al ejecutar celdas de Python el entorno muestra dead kernel en Lab B.', 'Cerrada', 11, 9, 16, 2, 2, 7, 'Se reinició el daemon de Docker Desktop en la estación y se recreó el contenedor de Anaconda local.', 5, 'Problema 100% resuelto', 'Muy atento y claro en la explicación, dejó el entorno funcional.', '2026-11-02 11:00:00', '2026-11-02 11:30:00', '2026-11-02 12:45:00'),

-- 5. ÁLVARO CABRERA (En atención - Hardware en taller)
(5, 'INC-2026-0105', 'PC-LAB-A-05 emite pitidos continuos al encender', 'La máquina no da POST ni señal de video. Al encender emite 3 beeps largos característicos de fallo en módulo de memoria RAM.', 'En Proceso', 12, 6, 1, 1, 1, 5, NULL, NULL, NULL, NULL, '2026-11-04 15:30:00', '2026-11-04 16:00:00', NULL),

-- 6. ÁLVARO CABRERA (Cerrada y evaluada por Luis Torres)
(6, 'INC-2026-0106', 'Teclado mecánico con teclas trabadas por derrame de bebida', 'Las teclas espacio, B y N se quedan pegadas tras incidente accidental de un alumno en la práctica libre.', 'Cerrada', 13, 6, 15, 3, 3, NULL, 'Desmontaje de keycaps, limpieza ultrasónica de contactos y lubricación con alcohol isopropílico. Operatividad al 100%.', 5, 'Excelente trato del técnico', 'El técnico fue muy amable y dejó el teclado como nuevo.', '2026-11-03 16:00:00', '2026-11-03 16:20:00', '2026-11-03 17:35:00'),

-- 7. ÁLVARO CABRERA (Cerrada y evaluada por Sofía Quispe)
(7, 'INC-2026-0107', 'Impresora LaserJet atascada con hojas de 75g', 'La bandeja de salida de la impresora HP no jala las hojas para imprimir los reportes de laboratorio.', 'Cerrada', 14, 6, 4, 2, 3, 14, 'Se desarmó el módulo de arrastre superior, se extrajo fragmento de papel atorado y se limpiaron los rodillos.', 4, 'Problema 100% resuelto', 'Atendió rápido aunque tardó un poco en llegar el repuesto del rodillo.', '2026-11-02 15:00:00', '2026-11-02 15:15:00', '2026-11-02 16:05:00'),

-- 8. ÁLVARO CABRERA (Cerrada y evaluada por Diego Vargas - Reasignada previamente)
(8, 'INC-2026-0108', 'Pantalla secundaria sin señal HDMI en puesto docente', 'El proyector secundario del aula no recibe señal del puerto HDMI de la mesa docente.', 'Cerrada', 15, 6, 13, 2, 2, 13, 'Se sustituyó el cable HDMI de 10 metros del ducto por un extensor HDMI sobre Ethernet CAT6. Señal 1080p estable.', 5, 'Atención rápida y eficaz', 'Solucionó la proyección antes de que iniciara la clase teórica.', '2026-11-01 08:30:00', '2026-11-01 08:45:00', '2026-11-01 09:40:00'),

-- 9. ALEX MARTÍNEZ (Cerrada y evaluada por Camila Vásquez)
(9, 'INC-2026-0109', 'Instalación de paquete de compiladores C++ para examen parcial', 'Varios puestos del Lab A no cuentan con la versión GCC 13 requerida para el parcial de programación avanzada.', 'Cerrada', 16, 3, 11, 2, 1, 1, 'Despliegue automatizado mediante script de PowerShell con Chocolatey instalando MinGW-w64 en los puestos 01 al 04.', 4, 'Problema 100% resuelto', 'Instaló todo a tiempo antes de la evaluación.', '2026-11-03 10:00:00', '2026-11-03 10:15:00', '2026-11-03 11:10:00'),

-- 10. ALEX MARTÍNEZ (En Proceso - Soporte General)
(10, 'INC-2026-0110', 'Revisión preventiva de periféricos en Pabellón C', 'Mouse ópticos con lentitud de respuesta en los puestos 10 al 15 del Laboratorio E.', 'En Proceso', 12, 3, 2, 3, 5, NULL, NULL, NULL, NULL, NULL, '2026-11-04 11:00:00', '2026-11-04 11:30:00', NULL),

-- 11. PEDRO SÁNCHEZ (En Proceso - Redes / Reasignación en curso)
(11, 'INC-2026-0111', 'Caída de enlace en switch central de Pabellón B', 'VLAN de laboratorios no obtiene IP por DHCP desde el router central. 40 puestos incomunicados.', 'En Proceso', 13, 8, 5, 1, 4, 11, NULL, NULL, NULL, NULL, '2026-11-04 14:00:00', '2026-11-04 14:10:00', NULL),

-- 12. PEDRO SÁNCHEZ (Cerrada y evaluada por Sofía Quispe)
(12, 'INC-2026-0112', 'Pérdida de paquetes en pruebas de socket UDP en Lab B', 'En la clase de redes los alumnos tienen 30% de packet loss en la red local.', 'Cerrada', 14, 8, 7, 2, 2, 10, 'Se detectó bucle de red generado por un cable puenteado en la mesa 3. Se habilitó Spanning-Tree PortFast BPDU Guard en el switch.', 5, 'Atención rápida y eficaz', 'Diagnóstico muy profesional y certero.', '2026-11-02 09:00:00', '2026-11-02 09:15:00', '2026-11-02 10:30:00'),

-- 13. LUCÍA RAMOS (En Proceso - Software)
(13, 'INC-2026-0113', 'Licencia de MATLAB 2026b expirada en Lab C', 'Aparece aviso License Checkout Failed: License Manager Error -96 al abrir el software.', 'En Proceso', 15, 9, 12, 3, 3, NULL, NULL, NULL, NULL, NULL, '2026-11-04 16:30:00', '2026-11-04 17:00:00', NULL),

-- 14. MARCOS VEGA (En Proceso - Audiovisual)
(14, 'INC-2026-0114', 'Proyector de Auditorio Central con aviso de cambio de lámpara', 'Luz roja parpadeante de advertencia y brillo extremadamente bajo durante ceremonia académica.', 'En Proceso', 16, 10, 13, 2, 6, 12, NULL, NULL, NULL, NULL, '2026-11-04 12:00:00', '2026-11-04 12:30:00', NULL),

-- 15. CARLOS MENDOZA (Cerrada y evaluada por María García)
(15, 'INC-2026-0115', 'PC-LAB-B-04 se congela con pantalla azul MEMORY_MANAGEMENT', 'Se cuelga durante renderizados en AutoCAD en Lab D.', 'Cerrada', 12, 7, 10, 1, 2, 9, 'Se identificó módulo de memoria RAM DDR4 dañado en el slot 2. Se reemplazó por repuesto Kingston Fury 8GB verificado con MemTest86.', 5, 'Problema 100% resuelto', 'La PC quedó 100% estable para las entregas de diseño.', '2026-11-01 10:00:00', '2026-11-01 10:20:00', '2026-11-01 11:45:00'),

-- 16. PENDIENTE (Sin asignar - Para triaje)
(16, 'INC-2026-0116', 'Ruido de zumbido eléctrico en altavoces de Aula Magna 301', 'Cuando se conecta el micrófono inalámbrico se escucha interferencia de 60Hz en los parlantes de pared.', 'Pendiente', 13, NULL, 14, 3, 7, NULL, NULL, NULL, NULL, NULL, '2026-11-05 02:00:00', NULL, NULL),

-- 17. PENDIENTE (Sin asignar - Para triaje)
(17, 'INC-2026-0117', 'Conector RJ-45 roto en puesto 08 de Laboratorio E', 'La pestaña plástica del cable de red se quebró y el cable se sale solo con el movimiento de la mesa.', 'Pendiente', 14, NULL, 17, 3, 5, NULL, NULL, NULL, NULL, NULL, '2026-11-05 02:15:00', NULL, NULL),

-- 18. ASIGNADA (Ticket asignado a técnico Alex Martínez, pendiente de iniciar atención)
(18, 'INC-2026-0118', 'Mouse óptico no responde en puesto 02 de Lab A', 'El alumno reportó que el puntero no se mueve en pantalla y el sensor óptico no emite luz.', 'Asignada', 15, 3, 2, 3, 1, 2, NULL, NULL, NULL, NULL, '2026-11-04 16:40:00', NULL, NULL),

-- ==================== 5 NUEVAS INCIDENCIAS ====================

-- 19. NUEVA INCIDENCIA 1: RESUELTA (Sin calificación - Esperando confirmación de estudiante Diego Vargas)
(19, 'INC-2026-0119', 'Cámara web de puesto docente no detectada en Microsoft Teams', 'La cámara USB del escritorio no responde al iniciar videollamada para clase híbrida en Lab B.', 'Resuelta', 15, 7, 2, 2, 2, NULL, 'Se reinstaló el controlador UVC genérico de Windows y se reubicó la conexión al puerto USB 3.0 posterior. Video verificado a 1080p 30fps.', NULL, NULL, NULL, '2026-11-04 10:00:00', '2026-11-04 10:15:00', NULL),

-- 20. NUEVA INCIDENCIA 2: CERRADA (Con calificación - Atendida por Lucía Ramos para Sofía Quispe)
(20, 'INC-2026-0120', 'Servidor local de base de datos MySQL bloqueado en Lab C', 'Error 2002 Can not connect to local MySQL server through socket al iniciar práctica de backend.', 'Cerrada', 14, 9, 18, 1, 3, 15, 'Se finalizó proceso huérfano que retenía el puerto 3306, se repararon permisos en /var/run/mysqld y se reinició el servicio.', 5, 'Problema 100% resuelto', 'Pudimos continuar el examen de bases de datos sin perder tiempo. Excelente atención.', '2026-11-03 08:30:00', '2026-11-03 08:40:00', '2026-11-03 09:25:00'),

-- 21. NUEVA INCIDENCIA 3: RESUELTA (Sin calificación - ¡Para que MAYKEL pueda probar el botón de Calificar!)
(21, 'INC-2026-0121', 'Cable de red con conector quebrado en puesto 12 de Lab A', 'La conexión parpadea entre 100Mbps y desconectado por daño físico en el conector modular del cable.', 'Resuelta', 11, 6, 17, 2, 1, 1, 'Crimpado de nuevo conector RJ-45 blindado Categoría 6 y prueba de continuidad y certificación a 1Gbps exitosa.', NULL, NULL, NULL, '2026-11-04 17:00:00', '2026-11-04 17:15:00', NULL),

-- 22. NUEVA INCIDENCIA 4: CERRADA (Con calificación - Atendida por Marcos Vega para Luis Torres)
(22, 'INC-2026-0122', 'Proyector con imagen desalineada y distorsión en Aula Magna', 'La proyección sobresale del marco de la pizarra y tiene deformación trapezoidal severa.', 'Cerrada', 13, 10, 13, 2, 7, 13, 'Ajuste físico del soporte telescópico de techo, corrección Keystone digital y calibración de foco óptico.', 4, 'Atención rápida y eficaz', 'La imagen quedó bien encuadrada para la presentación de tesis.', '2026-11-02 16:30:00', '2026-11-02 16:45:00', '2026-11-02 17:40:00'),

-- 23. NUEVA INCIDENCIA 5: EN PROCESO (Para balance de carga en Redes - Pedro Sánchez)
(23, 'INC-2026-0123', 'Microcortes en enlace Wi-Fi durante pruebas de laboratorio', 'Pérdida periódica de 2 a 3 paquetes cada 5 minutos en el access point Cisco AP-PAB-A.', 'En Proceso', 16, 8, 6, 2, 1, 10, NULL, NULL, NULL, NULL, '2026-11-05 02:30:00', '2026-11-05 02:45:00', NULL);

-- 10. SOLICITUDES DE REASIGNACIÓN (PARA DEMOSTRAR GESTIÓN Y WORKFLOW)
INSERT INTO solicitudes_reasignacion (id, incidencia_id, tecnico_solicitante_id, tecnico_nuevo_id, motivo, estado, fecha_solicitud, revisado_por_id, fecha_respuesta, comentario_respuesta) VALUES
-- Solicitud 1: PENDIENTE de revisión por Técnico General / Admin
(1, 11, 3, 8, 'La incidencia requiere recableado de fibra y configuración avanzada de switch PoE Cisco Catalyst; excede el alcance del técnico de soporte general de guardia.', 'PENDIENTE', '2026-11-04 14:05:00', NULL, NULL, NULL),

-- Solicitud 2: APROBADA en el historial
(2, 8, 7, 6, 'Sobrecarga de trabajo atendiendo mantenimiento mayor en Lab D; se solicita apoyo urgente a Álvaro Cabrera por coincidir con la apertura de clases del pabellón A.', 'APROBADA', '2026-11-01 08:35:00', 4, '2026-11-01 08:40:00', 'Reasignación autorizada por Rosa Flores. Técnico disponible.');

-- 11. HISTORIAL DE TALLER DE EQUIPOS (PARA VISTA DE TALLER Y AUDITORÍA)
INSERT INTO historial_equipos (id, equipo_id, usuario_id, estado_anterior, estado_nuevo, motivo, fecha) VALUES
(1, 5, 6, 'Operativo', 'En reparación', 'Ingreso a taller por pitidos continuos al arranque (3 beeps POST). Módulo RAM defectuoso en slot 1.', '2026-11-04 16:05:00'),
(2, 12, 10, 'Operativo', 'Averiado', 'Lámpara de proyector agotada tras sobrepasar 3600 horas. Retirado de soporte de techo en Auditorio para recambio.', '2026-11-04 12:40:00'),
(3, 14, 6, 'Operativo', 'En reparación', 'Atasco mecánico reiterado en rodillo de alimentación de papel. Ingresa a desarme y mantenimiento preventivo.', '2026-11-02 15:20:00'),
(4, 9, 7, 'En reparación', 'Operativo', 'Reemplazo de módulo DDR4 Kingston 8GB completado. Pruebas de estrés y MemTest86 aprobadas por 4 horas.', '2026-11-01 11:40:00');

-- 12. HISTORIAL DE AUDITORÍA Y TRAZABILIDAD COMPLETA (HISTORIAL_ESTADOS)
-- Cobertura 100% realista para cada una de las 23 incidencias desde su creación
INSERT INTO historial_estados (id, incidencia_id, estado_anterior, estado_nuevo, usuario_id, comentario, fecha_cambio, tipo_accion, tecnico_anterior_id, tecnico_nuevo_id) VALUES
-- ================= INC-0101 (ID 1 - En Proceso / Maykel -> Álvaro) =================
(1, 1, 'Creada', 'Pendiente', 11, 'Registro inicial de la incidencia desde el portal del estudiante', '2026-11-04 09:15:00', 'CREACION', NULL, NULL),
(2, 1, 'Pendiente', 'Asignada', 4, 'Asignación automática a técnico especialista de guardia en Hardware', '2026-11-04 09:30:00', 'ASIGNACION', NULL, 6),
(3, 1, 'Asignada', 'En Proceso', 6, 'Técnico Álvaro Cabrera inició diagnóstico térmico y prueba con HWMonitor en puesto 03', '2026-11-04 09:40:00', 'CAMBIO_ESTADO', NULL, NULL),

-- ================= INC-0102 (ID 2 - Pendiente / Maykel) =================
(4, 2, 'Creada', 'Pendiente', 11, 'Incidencia reportada por alumno. Pendiente de asignación en mesa de ayuda', '2026-11-05 01:20:00', 'CREACION', NULL, NULL),

-- ================= INC-0103 (ID 3 - Cerrada / Maykel -> Álvaro) =================
(5, 3, 'Creada', 'Pendiente', 11, 'Reporte de artefactos gráficos en pantalla', '2026-11-03 14:10:00', 'CREACION', NULL, NULL),
(6, 3, 'Pendiente', 'Asignada', 3, 'Asignado a Álvaro Cabrera por corresponder a falla de periférico/pantalla', '2026-11-03 14:15:00', 'ASIGNACION', NULL, 6),
(7, 3, 'Asignada', 'En Proceso', 6, 'Revisión física del cableado DisplayPort y tarjeta integrada', '2026-11-03 14:25:00', 'CAMBIO_ESTADO', NULL, NULL),
(8, 3, 'En Proceso', 'Resuelta', 6, 'Se reemplazó cable DisplayPort defectuoso y se ajustó la frecuencia a 144Hz. Pruebas de video satisfactorias.', '2026-11-03 15:00:00', 'CAMBIO_ESTADO', NULL, NULL),
(9, 3, 'Resuelta', 'Cerrada', 11, 'Calificación: 5/5. Motivo: Atención rápida y eficaz. Comentario: Excelente soporte, resolvió el problema en minutos y pude continuar el laboratorio sin perder tiempo.', '2026-11-03 15:10:00', 'CALIFICACION', NULL, NULL),

-- ================= INC-0104 (ID 4 - Cerrada / Maykel -> Lucía Ramos) =================
(10, 4, 'Creada', 'Pendiente', 11, 'Reporte de kernel de Jupyter bloqueado con Docker en Lab B', '2026-11-02 11:00:00', 'CREACION', NULL, NULL),
(11, 4, 'Pendiente', 'Asignada', 4, 'Asignado a la especialista de Software Lucía Ramos', '2026-11-02 11:15:00', 'ASIGNACION', NULL, 9),
(12, 4, 'Asignada', 'En Proceso', 9, 'Inspección de servicios y contenedores Docker en la estación', '2026-11-02 11:30:00', 'CAMBIO_ESTADO', NULL, NULL),
(13, 4, 'En Proceso', 'Resuelta', 9, 'Se reinició el daemon de Docker Desktop en la estación y se recreó el contenedor de Anaconda local.', '2026-11-02 12:30:00', 'CAMBIO_ESTADO', NULL, NULL),
(14, 4, 'Resuelta', 'Cerrada', 11, 'Calificación: 5/5. Motivo: Problema 100% resuelto. Comentario: Muy atento y claro en la explicación, dejó el entorno funcional.', '2026-11-02 12:45:00', 'CALIFICACION', NULL, NULL),

-- ================= INC-0105 (ID 5 - En Proceso / María García -> Álvaro) =================
(15, 5, 'Creada', 'Pendiente', 12, 'Reporte de fallo en encendido de PC en Lab A (pitidos continuos)', '2026-11-04 15:30:00', 'CREACION', NULL, NULL),
(16, 5, 'Pendiente', 'Asignada', 4, 'Asignado a especialista de Hardware Álvaro Cabrera', '2026-11-04 15:45:00', 'ASIGNACION', NULL, 6),
(17, 5, 'Asignada', 'En Proceso', 6, 'Equipo trasladado al taller para desmontaje y prueba de banco de memorias', '2026-11-04 16:00:00', 'CAMBIO_ESTADO', NULL, NULL),

-- ================= INC-0106 (ID 6 - Cerrada / Luis Torres -> Álvaro) =================
(18, 6, 'Creada', 'Pendiente', 13, 'Reporte de teclado mecánico con teclas trabadas por derrame de bebida', '2026-11-03 16:00:00', 'CREACION', NULL, NULL),
(19, 6, 'Pendiente', 'Asignada', 3, 'Asignado a Álvaro Cabrera por triaje de mesa de ayuda', '2026-11-03 16:10:00', 'ASIGNACION', NULL, 6),
(20, 6, 'Asignada', 'En Proceso', 6, 'Desmontaje de periférico y limpieza profunda de contactos con alcohol isopropílico', '2026-11-03 16:20:00', 'CAMBIO_ESTADO', NULL, NULL),
(21, 6, 'En Proceso', 'Resuelta', 6, 'Desmontaje de keycaps, limpieza ultrasónica de contactos y lubricación con alcohol isopropílico. Operatividad al 100%.', '2026-11-03 17:20:00', 'CAMBIO_ESTADO', NULL, NULL),
(22, 6, 'Resuelta', 'Cerrada', 13, 'Calificación: 5/5. Motivo: Excelente trato del técnico. Comentario: El técnico fue muy amable y dejó el teclado como nuevo.', '2026-11-03 17:35:00', 'CALIFICACION', NULL, NULL),

-- ================= INC-0107 (ID 7 - Cerrada / Sofía Quispe -> Álvaro) =================
(23, 7, 'Creada', 'Pendiente', 14, 'Reporte de atasco en impresora HP LaserJet del Lab C', '2026-11-02 15:00:00', 'CREACION', NULL, NULL),
(24, 7, 'Pendiente', 'Asignada', 4, 'Asignado a Álvaro Cabrera', '2026-11-02 15:05:00', 'ASIGNACION', NULL, 6),
(25, 7, 'Asignada', 'En Proceso', 6, 'Desarme de módulo de arrastre y revisión de rodillos de alimentación', '2026-11-02 15:15:00', 'CAMBIO_ESTADO', NULL, NULL),
(26, 7, 'En Proceso', 'Resuelta', 6, 'Se desarmó el módulo de arrastre superior, se extrajo fragmento de papel atorado y se limpiaron los rodillos.', '2026-11-02 15:55:00', 'CAMBIO_ESTADO', NULL, NULL),
(27, 7, 'Resuelta', 'Cerrada', 14, 'Calificación: 4/5. Motivo: Problema 100% resuelto. Comentario: Atendió rápido aunque tardó un poco en llegar el repuesto del rodillo.', '2026-11-02 16:05:00', 'CALIFICACION', NULL, NULL),

-- ================= INC-0108 (ID 8 - Cerrada / Reasignada Carlos -> Álvaro) =================
(28, 8, 'Creada', 'Pendiente', 15, 'Reporte de sin señal en proyector secundario', '2026-11-01 08:30:00', 'CREACION', NULL, NULL),
(29, 8, 'Pendiente', 'Asignada', 4, 'Asignada inicialmente a Carlos Mendoza', '2026-11-01 08:32:00', 'ASIGNACION', NULL, 7),
(30, 8, 'Asignada', 'Asignada', 4, 'Reasignación aprobada hacia Álvaro Cabrera por urgencia de horario docente', '2026-11-01 08:40:00', 'REASIGNACION', 7, 6),
(31, 8, 'Asignada', 'En Proceso', 6, 'Álvaro Cabrera procede con cambio de cable HDMI a extensor Ethernet', '2026-11-01 08:45:00', 'CAMBIO_ESTADO', NULL, NULL),
(32, 8, 'En Proceso', 'Resuelta', 6, 'Instalación de extensor finalizada. Proyección 1080p verificada.', '2026-11-01 09:30:00', 'CAMBIO_ESTADO', NULL, NULL),
(33, 8, 'Resuelta', 'Cerrada', 15, 'Calificación: 5/5. Motivo: Atención rápida y eficaz. Comentario: Solucionó la proyección antes de que iniciara la clase teórica.', '2026-11-01 09:40:00', 'CALIFICACION', NULL, NULL),

-- ================= INC-0109 (ID 9 - Cerrada / Camila Vásquez -> Alex Martínez) =================
(34, 9, 'Creada', 'Pendiente', 16, 'Reporte de falta de compilador GCC 13 para examen parcial en Lab A', '2026-11-03 10:00:00', 'CREACION', NULL, NULL),
(35, 9, 'Pendiente', 'Asignada', 4, 'Asignado a Alex Martínez (Soporte General)', '2026-11-03 10:05:00', 'ASIGNACION', NULL, 3),
(36, 9, 'Asignada', 'En Proceso', 3, 'Inicio de despliegue masivo por script de red en puestos 01 a 04', '2026-11-03 10:15:00', 'CAMBIO_ESTADO', NULL, NULL),
(37, 9, 'En Proceso', 'Resuelta', 3, 'Despliegue automatizado mediante script de PowerShell con Chocolatey instalando MinGW-w64 en los puestos 01 al 04.', '2026-11-03 11:00:00', 'CAMBIO_ESTADO', NULL, NULL),
(38, 9, 'Resuelta', 'Cerrada', 16, 'Calificación: 4/5. Motivo: Problema 100% resuelto. Comentario: Instaló todo a tiempo antes de la evaluación.', '2026-11-03 11:10:00', 'CALIFICACION', NULL, NULL),

-- ================= INC-0110 (ID 10 - En Proceso / María García -> Alex Martínez) =================
(39, 10, 'Creada', 'Pendiente', 12, 'Reporte de lentitud de respuesta en mouses ópticos de Lab E', '2026-11-04 11:00:00', 'CREACION', NULL, NULL),
(40, 10, 'Pendiente', 'Asignada', 5, 'Asignado a Alex Martínez para revisión técnica en sitio', '2026-11-04 11:15:00', 'ASIGNACION', NULL, 3),
(41, 10, 'Asignada', 'En Proceso', 3, 'Alex Martínez inició revisión física y limpieza de sensores ópticos', '2026-11-04 11:30:00', 'CAMBIO_ESTADO', NULL, NULL),

-- ================= INC-0111 (ID 11 - En Proceso / Reasignación Alex -> Pedro Sánchez) =================
(42, 11, 'Creada', 'Pendiente', 13, 'Reporte de pérdida total de red en switches de Pabellón B', '2026-11-04 14:00:00', 'CREACION', NULL, NULL),
(43, 11, 'Pendiente', 'Asignada', 3, 'Alex Martínez tomó el ticket de soporte', '2026-11-04 14:02:00', 'ASIGNACION', NULL, 3),
(44, 11, 'Asignada', 'En Proceso', 3, 'Alex Martínez identificó fallo en enlace troncal del switch central', '2026-11-04 14:05:00', 'CAMBIO_ESTADO', NULL, NULL),
(45, 11, 'En Proceso', 'En Proceso', 3, 'Alex Martínez solicitó reasignación hacia el especialista de Redes Pedro Sánchez', '2026-11-04 14:05:30', 'REASIGNACION', 3, 8),
(46, 11, 'En Proceso', 'En Proceso', 8, 'Pedro Sánchez asumió el ticket e inició diagnóstico de enlace de fibra en rack B', '2026-11-04 14:10:00', 'CAMBIO_ESTADO', NULL, NULL),

-- ================= INC-0112 (ID 12 - Cerrada / Sofía Quispe -> Pedro Sánchez) =================
(47, 12, 'Creada', 'Pendiente', 14, 'Reporte de 30% packet loss en pruebas UDP en Lab B', '2026-11-02 09:00:00', 'CREACION', NULL, NULL),
(48, 12, 'Pendiente', 'Asignada', 4, 'Asignado a Pedro Sánchez (Especialista en Redes)', '2026-11-02 09:05:00', 'ASIGNACION', NULL, 8),
(49, 12, 'Asignada', 'En Proceso', 8, 'Captura de tráfico con Wireshark y análisis de bucle STP', '2026-11-02 09:15:00', 'CAMBIO_ESTADO', NULL, NULL),
(50, 12, 'En Proceso', 'Resuelta', 8, 'Se detectó bucle de red generado por un cable puenteado en la mesa 3. Se habilitó Spanning-Tree PortFast BPDU Guard en el switch.', '2026-11-02 10:15:00', 'CAMBIO_ESTADO', NULL, NULL),
(51, 12, 'Resuelta', 'Cerrada', 14, 'Calificación: 5/5. Motivo: Atención rápida y eficaz. Comentario: Diagnóstico muy profesional y certero.', '2026-11-02 10:30:00', 'CALIFICACION', NULL, NULL),

-- ================= INC-0113 (ID 13 - En Proceso / Diego Vargas -> Lucía Ramos) =================
(52, 13, 'Creada', 'Pendiente', 15, 'Reporte de error de licencia en MATLAB 2026b en Lab C', '2026-11-04 16:30:00', 'CREACION', NULL, NULL),
(53, 13, 'Pendiente', 'Asignada', 4, 'Asignado a Lucía Ramos (Software)', '2026-11-04 16:45:00', 'ASIGNACION', NULL, 9),
(54, 13, 'Asignada', 'En Proceso', 9, 'Verificación del servidor de licencias flexlm institucional', '2026-11-04 17:00:00', 'CAMBIO_ESTADO', NULL, NULL),

-- ================= INC-0114 (ID 14 - En Proceso / Camila Vásquez -> Marcos Vega) =================
(55, 14, 'Creada', 'Pendiente', 16, 'Reporte de aviso de lámpara agotada en proyector de Auditorio Central', '2026-11-04 12:00:00', 'CREACION', NULL, NULL),
(56, 14, 'Pendiente', 'Asignada', 5, 'Asignado a Marcos Vega (Audiovisual)', '2026-11-04 12:15:00', 'ASIGNACION', NULL, 10),
(57, 14, 'Asignada', 'En Proceso', 10, 'Inspección de horas de lámpara y desmontaje para reemplazo', '2026-11-04 12:30:00', 'CAMBIO_ESTADO', NULL, NULL),

-- ================= INC-0115 (ID 15 - Cerrada / María García -> Carlos Mendoza) =================
(58, 15, 'Creada', 'Pendiente', 12, 'Reporte de BSOD recurrente en PC-LAB-B-04 durante renders', '2026-11-01 10:00:00', 'CREACION', NULL, NULL),
(59, 15, 'Pendiente', 'Asignada', 4, 'Asignado a Carlos Mendoza (Hardware)', '2026-11-01 10:10:00', 'ASIGNACION', NULL, 7),
(60, 15, 'Asignada', 'En Proceso', 7, 'Diagnóstico de memoria con MemTest86 en banco de pruebas', '2026-11-01 10:20:00', 'CAMBIO_ESTADO', NULL, NULL),
(61, 15, 'En Proceso', 'Resuelta', 7, 'Se identificó módulo de memoria RAM DDR4 dañado en el slot 2. Se reemplazó por repuesto Kingston Fury 8GB verificado con MemTest86.', '2026-11-01 11:30:00', 'CAMBIO_ESTADO', NULL, NULL),
(62, 15, 'Resuelta', 'Cerrada', 12, 'Calificación: 5/5. Motivo: Problema 100% resuelto. Comentario: La PC quedó 100% estable para las entregas de diseño.', '2026-11-01 11:45:00', 'CALIFICACION', NULL, NULL),

-- ================= INC-0116 (ID 16 - Pendiente / Luis Torres) =================
(63, 16, 'Creada', 'Pendiente', 13, 'Reporte de ruido de zumbido eléctrico en altavoces de Aula Magna 301', '2026-11-05 02:00:00', 'CREACION', NULL, NULL),

-- ================= INC-0117 (ID 17 - Pendiente / Sofía Quispe) =================
(64, 17, 'Creada', 'Pendiente', 14, 'Reporte de conector RJ-45 roto en puesto 08 de Laboratorio E', '2026-11-05 02:15:00', 'CREACION', NULL, NULL),

-- ================= INC-0118 (ID 18 - Asignada / Diego Vargas -> Alex Martínez) =================
(65, 18, 'Creada', 'Pendiente', 15, 'Reporte de mouse óptico no responde en puesto 02 de Lab A', '2026-11-04 16:40:00', 'CREACION', NULL, NULL),
(66, 18, 'Pendiente', 'Asignada', 4, 'Asignado a Alex Martínez para revisión de periférico en laboratorio', '2026-11-04 16:50:00', 'ASIGNACION', NULL, 3),

-- ================= INC-0119 (ID 19 - Resuelta / Diego Vargas -> Carlos Mendoza) =================
(67, 19, 'Creada', 'Pendiente', 15, 'Reporte de cámara docente no detectada en Microsoft Teams en Lab B', '2026-11-04 10:00:00', 'CREACION', NULL, NULL),
(68, 19, 'Pendiente', 'Asignada', 4, 'Asignado a Carlos Mendoza', '2026-11-04 10:05:00', 'ASIGNACION', NULL, 7),
(69, 19, 'Asignada', 'En Proceso', 7, 'Carlos Mendoza inició revisión de controladores USB y puertos', '2026-11-04 10:15:00', 'CAMBIO_ESTADO', NULL, NULL),
(70, 19, 'En Proceso', 'Resuelta', 7, 'Se reinstaló el controlador UVC genérico de Windows y se reubicó la conexión al puerto USB 3.0 posterior. Video verificado a 1080p 30fps.', '2026-11-04 10:45:00', 'CAMBIO_ESTADO', NULL, NULL),

-- ================= INC-0120 (ID 20 - Cerrada / Sofía Quispe -> Lucía Ramos) =================
(71, 20, 'Creada', 'Pendiente', 14, 'Reporte de MySQL local inaccesible en Lab C por socket bloqueado', '2026-11-03 08:30:00', 'CREACION', NULL, NULL),
(72, 20, 'Pendiente', 'Asignada', 4, 'Asignado a la especialista de Software Lucía Ramos', '2026-11-03 08:35:00', 'ASIGNACION', NULL, 9),
(73, 20, 'Asignada', 'En Proceso', 9, 'Lucía Ramos verifica procesos y socket en /var/run/mysqld', '2026-11-03 08:40:00', 'CAMBIO_ESTADO', NULL, NULL),
(74, 20, 'En Proceso', 'Resuelta', 9, 'Se finalizó proceso huérfano que retenía el puerto 3306, se repararon permisos en /var/run/mysqld y se reinició el servicio.', '2026-11-03 09:15:00', 'CAMBIO_ESTADO', NULL, NULL),
(75, 20, 'Resuelta', 'Cerrada', 14, 'Calificación: 5/5. Motivo: Problema 100% resuelto. Comentario: Pudimos continuar el examen de bases de datos sin perder tiempo. Excelente atención.', '2026-11-03 09:25:00', 'CALIFICACION', NULL, NULL),

-- ================= INC-0121 (ID 21 - Resuelta / Maykel Stefano -> Álvaro Cabrera) =================
(76, 21, 'Creada', 'Pendiente', 11, 'Reporte de conector de red quebrado en Lab A puesto 12', '2026-11-04 17:00:00', 'CREACION', NULL, NULL),
(77, 21, 'Pendiente', 'Asignada', 3, 'Asignado a Álvaro Cabrera por trabajo de cableado estructurado', '2026-11-04 17:05:00', 'ASIGNACION', NULL, 6),
(78, 21, 'Asignada', 'En Proceso', 6, 'Álvaro Cabrera procede a crimpar nuevo conector RJ-45 blindado', '2026-11-04 17:15:00', 'CAMBIO_ESTADO', NULL, NULL),
(79, 21, 'En Proceso', 'Resuelta', 6, 'Crimpado de nuevo conector RJ-45 blindado Cat6 finalizado con certificación 1Gbps. Esperando confirmación y calificación del estudiante.', '2026-11-04 17:45:00', 'CAMBIO_ESTADO', NULL, NULL),

-- ================= INC-0122 (ID 22 - Cerrada / Luis Torres -> Marcos Vega) =================
(80, 22, 'Creada', 'Pendiente', 13, 'Reporte de proyección distorsionada en Aula Magna', '2026-11-02 16:30:00', 'CREACION', NULL, NULL),
(81, 22, 'Pendiente', 'Asignada', 4, 'Asignado a Marcos Vega (Audiovisual)', '2026-11-02 16:35:00', 'ASIGNACION', NULL, 10),
(82, 22, 'Asignada', 'En Proceso', 10, 'Marcos Vega ajusta calibración óptica y corrección trapezoidal', '2026-11-02 16:45:00', 'CAMBIO_ESTADO', NULL, NULL),
(83, 22, 'En Proceso', 'Resuelta', 10, 'Alineación de proyector completada y foco óptico ajustado', '2026-11-02 17:20:00', 'CAMBIO_ESTADO', NULL, NULL),
(84, 22, 'Resuelta', 'Cerrada', 13, 'Calificación: 4/5. Motivo: Atención rápida y eficaz. Comentario: La imagen quedó bien encuadrada para la presentación de tesis.', '2026-11-02 17:40:00', 'CALIFICACION', NULL, NULL),

-- ================= INC-0123 (ID 23 - En Proceso / Camila Vásquez -> Pedro Sánchez) =================
(85, 23, 'Creada', 'Pendiente', 16, 'Reporte de microcortes en enlace Wi-Fi durante prácticas de laboratorio', '2026-11-05 02:30:00', 'CREACION', NULL, NULL),
(86, 23, 'Pendiente', 'Asignada', 4, 'Asignado a Pedro Sánchez (Especialista en Redes)', '2026-11-05 02:35:00', 'ASIGNACION', NULL, 8),
(87, 23, 'Asignada', 'En Proceso', 8, 'Pedro Sánchez realiza escaneo de espectro de canales RF y monitoreo de SNR', '2026-11-05 02:45:00', 'CAMBIO_ESTADO', NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
