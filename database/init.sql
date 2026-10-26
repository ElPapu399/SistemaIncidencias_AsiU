-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: campus_incidencias_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `archivos_adjuntos`
--

DROP TABLE IF EXISTS `archivos_adjuntos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `archivos_adjuntos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `incidencia_id` int NOT NULL,
  `url_archivo` varchar(255) NOT NULL,
  `nombre_original` varchar(150) NOT NULL,
  `fecha_subida` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tamanio_bytes` bigint DEFAULT NULL,
  `tipo_archivo` varchar(100) DEFAULT NULL,
  `subido_por` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_adjunto_incidencia` (`incidencia_id`),
  KEY `FKe2q3y17bhs5uwa1mldhh25xwr` (`subido_por`),
  CONSTRAINT `fk_adjunto_incidencia` FOREIGN KEY (`incidencia_id`) REFERENCES `incidencias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FKe2q3y17bhs5uwa1mldhh25xwr` FOREIGN KEY (`subido_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `archivos_adjuntos`
--

LOCK TABLES `archivos_adjuntos` WRITE;
/*!40000 ALTER TABLE `archivos_adjuntos` DISABLE KEYS */;
/*!40000 ALTER TABLE `archivos_adjuntos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `especialidad_id` int NOT NULL,
  `prioridad_defecto_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_categoria_especialidad` (`especialidad_id`),
  KEY `fk_categoria_prioridad` (`prioridad_defecto_id`),
  CONSTRAINT `fk_categoria_especialidad` FOREIGN KEY (`especialidad_id`) REFERENCES `especialidades` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_categoria_prioridad` FOREIGN KEY (`prioridad_defecto_id`) REFERENCES `prioridades` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Computadora no enciende',1,1),(2,'Problema con teclado o mouse',1,3),(3,'Problema con monitor',1,2),(4,'Problema con impresora',1,2),(5,'Sin conexión a Internet',2,1),(6,'Problema con Wi-Fi',2,1),(7,'Problema de conexión de red',2,2),(8,'Conexión lenta',2,3),(9,'Error de aplicación',3,2),(10,'Problema con sistema operativo',3,1),(11,'Problema de instalación',3,2),(12,'Problema con licencia de software',3,3),(13,'Proyector sin señal HDMI',4,2),(14,'Ruido estático en altavoces',4,3),(15,'Teclado con teclas bloqueadas',1,3),(16,'Kernel de Python no inicia',3,2),(17,'Cable de red con conector roto',2,2),(18,'Base de datos local bloqueada',3,1);
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipos`
--

DROP TABLE IF EXISTS `equipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `estado` varchar(20) NOT NULL,
  `marca` varchar(100) DEFAULT NULL,
  `modelo` varchar(100) DEFAULT NULL,
  `tipo` varchar(50) NOT NULL,
  `ubicacion_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKorutdsib6gh64c5a0997cd1k0` (`codigo`),
  KEY `FK98pf2vfsffjiscb3k22npk0wa` (`ubicacion_id`),
  CONSTRAINT `FK98pf2vfsffjiscb3k22npk0wa` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipos`
--

LOCK TABLES `equipos` WRITE;
/*!40000 ALTER TABLE `equipos` DISABLE KEYS */;
INSERT INTO `equipos` VALUES (1,'PC-LAB-A-01','Operativo','HP','ProDesk 400 G7','PC',9),(2,'PC-LAB-A-02','Operativo','HP','ProDesk 400 G7','PC',9),(3,'PC-LAB-A-03','Operativo','HP','ProDesk 400 G7','PC',9),(4,'PC-LAB-A-04','Operativo','HP','ProDesk 400 G7','PC',9),(5,'PC-LAB-A-05','En reparación','HP','ProDesk 400 G7','PC',9),(6,'PC-LAB-B-01','Operativo','Dell','OptiPlex 5090','PC',10),(7,'PC-LAB-B-02','Operativo','Dell','OptiPlex 5090','PC',10),(8,'PC-LAB-C-01','Operativo','Lenovo','ThinkCentre M70q','PC',11),(9,'PC-LAB-C-02','Operativo','Lenovo','ThinkCentre M70q','PC',11),(10,'PC-LAB-D-01','Operativo','HP','ProDesk 400 G7','PC',12),(11,'IMP-LAB-A-01','Operativo','HP','LaserJet Pro M404dn','Impresora',9),(12,'PROY-LAB-B-01','Operativo','Epson','PowerLite E20','Proyector',10),(13,'SW-LAB-A-01','Operativo','Cisco','Catalyst 2960','Switch',9),(14,'PC-LAB-E-01','Operativo','HP','ProDesk 400 G7','PC',13),(15,'PC-LAB-F-01','Operativo','Dell','OptiPlex 5090','PC',14),(16,'MON-LAB-A-05','Operativo','Samsung','S24R350','Monitor',9),(17,'TEC-LAB-A-18','Operativo','Logitech','K120','Teclado',9),(18,'PC-LAB-C-04','Operativo','Lenovo','ThinkCentre M70q','PC',11),(19,'PC-LAB-B-20','Operativo','Dell','OptiPlex 5090','PC',10),(20,'PC-LAB-D-15','Operativo','HP','ProDesk 400 G7','PC',12);
/*!40000 ALTER TABLE `equipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `especialidades`
--

DROP TABLE IF EXISTS `especialidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `especialidades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `especialidades`
--

LOCK TABLES `especialidades` WRITE;
/*!40000 ALTER TABLE `especialidades` DISABLE KEYS */;
INSERT INTO `especialidades` VALUES (1,'Hardware','Problemas fÃ­sicos: equipos, perifÃ©ricos, impresoras'),(2,'Redes','Conectividad, Wi-Fi, switches, puntos de acceso'),(3,'Software','Sistemas operativos, aplicaciones, licencias'),(4,'Audiovisual','Proyectores, altavoces y equipos audiovisuales');
/*!40000 ALTER TABLE `especialidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_estados`
--

DROP TABLE IF EXISTS `historial_estados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_estados` (
  `id` int NOT NULL AUTO_INCREMENT,
  `incidencia_id` int NOT NULL,
  `estado_anterior` varchar(20) NOT NULL,
  `estado_nuevo` varchar(20) NOT NULL,
  `usuario_id` int NOT NULL,
  `comentario` varchar(500) DEFAULT NULL,
  `fecha_cambio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tipo_accion` varchar(30) NOT NULL,
  `tecnico_anterior_id` int DEFAULT NULL,
  `tecnico_nuevo_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_historial_incidencia` (`incidencia_id`),
  KEY `fk_historial_usuario` (`usuario_id`),
  KEY `FKeq23l6ojurkati1lu3au0udwc` (`tecnico_anterior_id`),
  KEY `FK7ycpeqkd9082rv42ba8ws4ypn` (`tecnico_nuevo_id`),
  CONSTRAINT `FK7ycpeqkd9082rv42ba8ws4ypn` FOREIGN KEY (`tecnico_nuevo_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_historial_incidencia` FOREIGN KEY (`incidencia_id`) REFERENCES `incidencias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_historial_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FKeq23l6ojurkati1lu3au0udwc` FOREIGN KEY (`tecnico_anterior_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_estados`
--

LOCK TABLES `historial_estados` WRITE;
/*!40000 ALTER TABLE `historial_estados` DISABLE KEYS */;
INSERT INTO `historial_estados` VALUES (1,2,'Pendiente','En Proceso',2,'El técnico inició la atención de la incidencia.','2026-08-27 06:32:59','',NULL,NULL),(2,3,'Pendiente','En Proceso',2,'Se inició la revisión de la impresora.','2026-08-27 06:32:59','',NULL,NULL),(3,3,'En Proceso','Resuelto',2,'La impresora quedó operativa después de reinstalar el controlador.','2026-08-27 06:32:59','',NULL,NULL),(4,5,'Pendiente','En Proceso',2,'Se inició la revisión del monitor.','2026-08-27 06:32:59','',NULL,NULL),(5,6,'Pendiente','En Proceso',2,'Se inició la revisión del problema de software.','2026-08-27 06:32:59','',NULL,NULL),(6,6,'En Proceso','Resuelto',2,'La aplicación fue reinstalada correctamente.','2026-08-27 06:32:59','',NULL,NULL),(7,8,'Pendiente','En Proceso',2,'Se revisó la conectividad de red.','2026-08-27 06:32:59','',NULL,NULL),(8,8,'En Proceso','Resuelto',2,'Se solucionó el problema de conexión.','2026-08-27 06:32:59','',NULL,NULL),(9,9,'Nuevo','Pendiente',21,'Ticket registrado','2026-10-21 18:25:17','CREACION',NULL,NULL),(10,9,'Pendiente','Asignada',4,NULL,'2026-10-21 18:29:34','CAMBIO_ESTADO',NULL,NULL),(11,9,'Asignada','Asignada',4,'Técnico asignado: Carlos Mendoza (asignado por Ana Rodríguez)','2026-10-21 18:31:20','ASIGNACION',NULL,7),(12,10,'Nuevo','Pendiente',20,'Ticket registrado','2026-10-21 19:12:36','CREACION',NULL,NULL),(13,10,'Pendiente','Asignada',4,'Técnico asignado: Marcos Vega (asignado por Ana Rodríguez)','2026-10-21 19:17:32','ASIGNACION',NULL,10),(14,11,'Nuevo','Pendiente',19,'Ticket registrado','2026-10-21 19:20:15','CREACION',NULL,NULL),(15,11,'Pendiente','Asignada',5,'Técnico asignado: Marcos Vega (asignado por Rosa Flores)','2026-10-21 19:23:54','ASIGNACION',NULL,10),(16,10,'Asignada','En atención',10,NULL,'2026-10-21 19:25:20','CAMBIO_ESTADO',NULL,NULL),(17,12,'Nuevo','Pendiente',18,'Ticket registrado','2026-10-21 19:26:48','CREACION',NULL,NULL),(18,9,'Asignada','Cerrada',5,NULL,'2026-10-21 19:29:04','CAMBIO_ESTADO',NULL,NULL),(19,12,'Pendiente','Asignada',5,'Técnico asignado: Carlos Mendoza (asignado por Rosa Flores)','2026-10-21 19:29:46','ASIGNACION',NULL,7),(20,13,'Nuevo','Pendiente',17,'Ticket registrado','2026-10-21 19:31:39','CREACION',NULL,NULL),(21,13,'Pendiente','Asignada',6,'Técnico asignado: Carlos Mendoza (asignado por Jorge Herrera)','2026-10-21 19:32:51','ASIGNACION',NULL,7),(22,13,'Asignada','En atención',7,NULL,'2026-10-21 19:33:44','CAMBIO_ESTADO',NULL,NULL),(23,14,'Nuevo','Pendiente',16,'Ticket registrado','2026-10-21 19:35:39','CREACION',NULL,NULL),(24,15,'Nuevo','Pendiente',15,'Ticket registrado','2026-10-21 19:37:16','CREACION',NULL,NULL),(25,15,'Pendiente','Asignada',6,'Técnico asignado: Pedro Sánchez (asignado por Jorge Herrera)','2026-10-21 19:37:51','ASIGNACION',NULL,8),(26,15,'Asignada','En atención',8,NULL,'2026-10-21 19:38:17','CAMBIO_ESTADO',NULL,NULL),(27,16,'Nuevo','Pendiente',14,'Ticket registrado','2026-10-21 19:39:52','CREACION',NULL,NULL),(28,1,'Pendiente','Cerrada',4,NULL,'2026-10-21 19:41:13','CAMBIO_ESTADO',NULL,NULL),(29,4,'Pendiente','Asignada',4,'Técnico asignado: Técnico Soporte (asignado por Ana Rodríguez)','2026-10-21 19:43:07','ASIGNACION',NULL,2),(30,4,'Asignada','Resuelta',4,NULL,'2026-10-21 19:43:52','CAMBIO_ESTADO',NULL,NULL),(31,17,'Nuevo','Pendiente',13,'Ticket registrado','2026-10-21 19:46:31','CREACION',NULL,NULL),(32,16,'Pendiente','En atención',4,NULL,'2026-10-21 19:47:42','CAMBIO_ESTADO',NULL,NULL),(33,15,'En atención','Resuelta',8,NULL,'2026-10-21 19:50:39','CAMBIO_ESTADO',NULL,NULL),(34,16,'En atención','Asignada',5,'Técnico asignado: Pedro Sánchez (asignado por Rosa Flores)','2026-10-21 19:52:14','ASIGNACION',NULL,8),(35,18,'Nuevo','Pendiente',12,'Ticket registrado','2026-10-21 19:54:48','CREACION',NULL,NULL),(36,18,'Pendiente','Asignada',6,'Técnico asignado: Lucía Ramos (asignado por Jorge Herrera)','2026-10-21 19:56:18','ASIGNACION',NULL,9),(37,19,'Nuevo','Pendiente',11,'Ticket registrado','2026-10-21 19:57:38','CREACION',NULL,NULL),(38,19,'Pendiente','Asignada',5,'Técnico asignado: Lucía Ramos (asignado por Rosa Flores)','2026-10-21 19:58:28','ASIGNACION',NULL,9),(39,19,'Asignada','En atención',9,NULL,'2026-10-21 19:58:50','CAMBIO_ESTADO',NULL,NULL),(40,20,'Nuevo','Pendiente',20,'Ticket registrado','2026-10-21 20:01:57','CREACION',NULL,NULL),(41,7,'Pendiente','Asignada',6,'Técnico asignado: Lucía Ramos (asignado por Jorge Herrera)','2026-10-21 20:02:56','ASIGNACION',NULL,9),(42,7,'Asignada','En atención',9,NULL,'2026-10-21 20:03:18','CAMBIO_ESTADO',NULL,NULL),(43,7,'En atención','Pendiente',9,NULL,'2026-10-21 20:04:43','CAMBIO_ESTADO',NULL,NULL),(44,7,'Pendiente','Cerrada',4,NULL,'2026-10-21 20:05:42','CAMBIO_ESTADO',NULL,NULL),(45,20,'Pendiente','Asignada',4,'Técnico asignado: Lucía Ramos (asignado por Ana Rodríguez)','2026-10-21 20:06:04','ASIGNACION',NULL,9),(46,20,'Asignada','En atención',9,NULL,'2026-10-21 20:06:27','CAMBIO_ESTADO',NULL,NULL),(47,20,'En atención','Resuelta',9,NULL,'2026-10-21 20:07:05','CAMBIO_ESTADO',NULL,NULL);
/*!40000 ALTER TABLE `historial_estados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `mensaje` varchar(500) NOT NULL,
  `incidencia_id` int DEFAULT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notif_usuario` (`usuario_id`),
  KEY `idx_notif_leida` (`usuario_id`,`leida`),
  KEY `fk_notif_incidencia` (`incidencia_id`),
  CONSTRAINT `fk_notif_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notif_incidencia` FOREIGN KEY (`incidencia_id`) REFERENCES `incidencias` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `incidencias`
--

DROP TABLE IF EXISTS `incidencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incidencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo_ticket` varchar(20) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` text NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'Pendiente',
  `estudiante_id` int NOT NULL,
  `tecnico_id` int DEFAULT NULL,
  `categoria_id` int NOT NULL,
  `prioridad_id` int NOT NULL,
  `ubicacion_id` int NOT NULL,
  `solucion_tecnica` text,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_inicio_atencion` timestamp NULL DEFAULT NULL,
  `fecha_cierre` timestamp NULL DEFAULT NULL,
  `calificacion` int DEFAULT NULL,
  `comentario_calificacion` text,
  `motivo_calificacion` varchar(100) DEFAULT NULL,
  `equipo_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_ticket` (`codigo_ticket`),
  KEY `fk_incidencia_estudiante` (`estudiante_id`),
  KEY `fk_incidencia_tecnico` (`tecnico_id`),
  KEY `fk_incidencia_categoria` (`categoria_id`),
  KEY `fk_incidencia_prioridad` (`prioridad_id`),
  KEY `fk_incidencia_ubicacion` (`ubicacion_id`),
  KEY `FK1tr6bivsqw1eutsq1gbt3g1dg` (`equipo_id`),
  CONSTRAINT `FK1tr6bivsqw1eutsq1gbt3g1dg` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`),
  CONSTRAINT `fk_incidencia_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_incidencia_estudiante` FOREIGN KEY (`estudiante_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_incidencia_prioridad` FOREIGN KEY (`prioridad_id`) REFERENCES `prioridades` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_incidencia_tecnico` FOREIGN KEY (`tecnico_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_incidencia_ubicacion` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incidencias`
--

LOCK TABLES `incidencias` WRITE;
/*!40000 ALTER TABLE `incidencias` DISABLE KEYS */;
INSERT INTO `incidencias` VALUES (1,'INC-2026-0001','Computadora no enciende-prueba','La computadora del aula no enciende al presionar el botón de encendido.','Cerrada',3,NULL,1,1,1,NULL,'2026-08-27 06:32:59',NULL,'2026-10-21 19:41:13',NULL,NULL,NULL,NULL),(2,'INC-2026-0002','Sin conexión a Internet','El equipo no tiene acceso a Internet desde el laboratorio.','En Proceso',3,2,5,1,4,NULL,'2026-08-27 06:32:59',NULL,NULL,NULL,NULL,NULL,NULL),(3,'INC-2026-0003','Problema con impresora','La impresora no imprime los documentos enviados desde el aula.','Resuelto',3,2,4,2,2,'Se reinició la impresora y se reinstaló el controlador.','2026-08-27 06:32:59',NULL,NULL,NULL,NULL,NULL,NULL),(4,'INC-2026-0004','Problema con Wi-Fi','La conexión Wi-Fi presenta interrupciones frecuentes.','Resuelta',3,2,6,1,5,'Reinicio de maquina','2026-08-27 06:32:59','2026-10-21 19:43:07','2026-10-21 19:43:52',NULL,NULL,NULL,NULL),(5,'INC-2026-0005','Problema con monitor','El monitor presenta una pantalla intermitente durante el uso.','En Proceso',3,2,3,2,3,NULL,'2026-08-27 06:32:59',NULL,NULL,NULL,NULL,NULL,NULL),(6,'INC-2026-0006','Error de aplicación','La aplicación utilizada en el laboratorio presenta errores al iniciar.','Resuelto',3,2,9,2,6,'Se reinstaló la aplicación y se verificó su funcionamiento.','2026-08-27 06:32:59',NULL,NULL,NULL,NULL,NULL,NULL),(7,'INC-2026-0007','Problema con sistema operativo','El sistema operativo del equipo presenta errores durante el inicio.','Cerrada',3,9,10,1,7,NULL,'2026-08-27 06:32:59','2026-10-21 20:02:56','2026-10-21 20:05:42',NULL,NULL,NULL,NULL),(8,'INC-2026-0008','Conexión lenta','La conexión a Internet presenta una velocidad inferior a la esperada.','Resuelto',3,2,8,3,8,'Se verificó la conexión de red y se reinició el punto de acceso.','2026-08-27 06:32:59',NULL,NULL,NULL,NULL,NULL,NULL),(9,'INC-2026-0009','Prueba de registro ASIU','prueba para verificar el registro y seguimiento de solicitudes en el sistema ASIU. El teclado del equipo de prueba presenta teclas que no responden correctamente.','Cerrada',21,7,2,3,9,NULL,'2026-10-21 18:25:17','2026-10-21 18:31:20','2026-10-21 19:29:04',NULL,NULL,NULL,NULL),(10,'INC-2026-0010','Proyector no detecta la conexión HDMI','Al conectar una laptop al proyector del aula, el equipo no reconoce la señal HDMI. Se probaron nuevamente las conexiones, pero la imagen no aparece. El problema dificulta la presentación de materiales durante las clases.','En atención',20,10,13,2,1,NULL,'2026-10-21 19:12:36','2026-10-21 19:17:32',NULL,NULL,NULL,NULL,NULL),(11,'INC-2026-0011','Altavoces emiten ruido estático','Al reproducir videos y materiales de clase, los altavoces del auditorio emiten un ruido estático que dificulta escuchar el audio. Se revisaron el volumen y las conexiones, pero el ruido continúa. Se solicita una revisión del equipo de sonido para recuperar la calidad del audio.','Asignada',19,10,14,3,15,NULL,'2026-10-21 19:20:15','2026-10-21 19:23:54',NULL,NULL,NULL,NULL,NULL),(12,'INC-2026-0012','Teclado presenta varias teclas bloqueadas','Durante una práctica en el laboratorio, varias teclas del teclado dejaron de responder correctamente. Se intentó desconectar y volver a conectar el dispositivo, pero el problema persiste. Esto dificulta la escritura de código y el desarrollo de las actividades académicas.','Asignada',18,7,15,3,4,NULL,'2026-10-21 19:26:48','2026-10-21 19:29:46',NULL,NULL,NULL,NULL,NULL),(13,'INC-2026-0013','Equipo se apaga inesperadamente durante una clase','Durante una clase, una computadora del laboratorio se apagó repentinamente mientras se utilizaba un programa académico. Al intentar encenderla nuevamente, el equipo no respondió de inmediato. Se solicita revisar la fuente de alimentación y los componentes del equipo para determinar la causa del problema.','En atención',17,7,1,1,9,NULL,'2026-10-21 19:31:39','2026-10-21 19:32:51',NULL,NULL,NULL,NULL,NULL),(14,'INC-2026-0014','Impresora presenta atascos de papel frecuentes','La impresora del laboratorio presenta atascos de papel durante la impresión de documentos. El problema se repite incluso después de retirar cuidadosamente el papel atascado, lo que retrasa la entrega de materiales para las actividades académicas. Se solicita revisar el mecanismo de alimentación y los rodillos.','Pendiente',16,NULL,4,2,5,NULL,'2026-10-21 19:35:39',NULL,NULL,NULL,NULL,NULL,NULL),(15,'INC-2026-0015','Laboratorio pierde conexión a Internet','Durante las actividades académicas, varias computadoras del laboratorio perdieron la conexión a Internet al mismo tiempo. Se intentó volver a cargar las páginas y comprobar la conexión, pero el problema continuó. Se solicita revisar la conectividad de la red del laboratorio para restablecer el acceso a los recursos académicos.','Resuelta',15,8,5,1,6,'Caida del servicio de internet resultante por problemas del proveedor, se recupero la capacidad despues de coordinaciones','2026-10-21 19:37:16','2026-10-21 19:37:51','2026-10-21 19:50:39',NULL,NULL,NULL,NULL),(16,'INC-2026-0016','Wi-Fi se desconecta al acceder al aula virtual','Al conectarse a la red Wi-Fi del laboratorio y acceder al aula virtual, la conexión se interrumpe de manera inesperada. Es necesario volver a conectarse para continuar con las actividades, lo que dificulta revisar materiales y entregar trabajos. Se solicita revisar la estabilidad de la red inalámbrica en el ambiente.','Asignada',14,8,6,1,11,NULL,'2026-10-21 19:39:52','2026-10-21 19:52:14',NULL,NULL,NULL,NULL,NULL),(17,'INC-2026-0017','Cable de red presenta un conector dañado','Una computadora del laboratorio presenta desconexiones frecuentes porque el conector del cable de red parece estar dañado y no se ajusta correctamente al puerto. Al mover el cable, la conexión se interrumpe. Se solicita revisar el cableado y reemplazar el conector o el cable para recuperar una conexión estable.','Pendiente',13,NULL,17,2,10,NULL,'2026-10-21 19:46:31',NULL,NULL,NULL,NULL,NULL,NULL),(18,'INC-2026-0018','Aplicación académica se cierra inesperadamente','Al utilizar una aplicación académica en una computadora del aula, el programa se cierra inesperadamente después de unos minutos de uso. El problema se repite al volver a abrirlo y dificulta completar las actividades de clase. Se solicita revisar los errores de la aplicación y verificar si requiere una actualización o corrección de configuración.','Asignada',12,9,9,2,2,NULL,'2026-10-21 19:54:48','2026-10-21 19:56:18',NULL,NULL,NULL,NULL,NULL),(19,'INC-2026-0019','Entorno de Python no inicia en el laboratorio','Al intentar iniciar el entorno de Python para desarrollar una práctica de programación, el kernel no termina de cargar y no permite ejecutar código. Se intentó cerrar y volver a abrir el entorno, pero el problema persiste. Se solicita revisar la instalación y las dependencias necesarias para ejecutar las prácticas.','En atención',11,9,16,2,13,NULL,'2026-10-21 19:57:38','2026-10-21 19:58:28',NULL,NULL,NULL,NULL,NULL),(20,'INC-2026-0020','Base de datos local no permite establecer conexión','Durante una práctica de desarrollo, una computadora del laboratorio no consigue establecer conexión con la base de datos local. La herramienta muestra un error al intentar conectarse, incluso después de verificar que los datos de conexión estén configurados. Se solicita revisar el servicio de base de datos, los parámetros de conexión y los permisos necesarios para continuar con la práctica.\r\n','Resuelta',20,9,18,1,12,'Reinstalacion de los servicios con formateo parcial en algunos archivos de la maquina','2026-10-21 20:01:57','2026-10-21 20:06:04','2026-10-21 20:07:05',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `incidencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prioridades`
--

DROP TABLE IF EXISTS `prioridades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prioridades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nivel` varchar(20) NOT NULL,
  `tiempo_maximo_horas` int NOT NULL,
  `descripcion` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nivel` (`nivel`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prioridades`
--

LOCK TABLES `prioridades` WRITE;
/*!40000 ALTER TABLE `prioridades` DISABLE KEYS */;
INSERT INTO `prioridades` VALUES (1,'Alta',4,'Afecta a mÃºltiples usuarios o servicios crÃ­ticos'),(2,'Media',24,'Afecta a un usuario, tiene soluciÃ³n temporal'),(3,'Baja',72,'Inconveniente menor, no bloquea el trabajo');
/*!40000 ALTER TABLE `prioridades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN'),(2,'ESTUDIANTE'),(3,'TECNICO'),(5,'TECNICO_ESPECIALISTA'),(4,'TECNICO_GENERAL');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitudes_reasignacion`
--

DROP TABLE IF EXISTS `solicitudes_reasignacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes_reasignacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `comentario_respuesta` varchar(500) DEFAULT NULL,
  `estado` varchar(20) NOT NULL,
  `fecha_respuesta` datetime(6) DEFAULT NULL,
  `fecha_solicitud` datetime(6) DEFAULT NULL,
  `motivo` text NOT NULL,
  `incidencia_id` int NOT NULL,
  `revisado_por_id` int DEFAULT NULL,
  `tecnico_nuevo_id` int DEFAULT NULL,
  `tecnico_solicitante_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK2uf3ey5l6rltwo1wn27ji3fop` (`incidencia_id`),
  KEY `FK9ui7o4q2u1bnvgigcx694bs43` (`revisado_por_id`),
  KEY `FKtlj85vjnjjyaid8fm6axerkf7` (`tecnico_nuevo_id`),
  KEY `FKjyjmswjh4rhhgjv8p6bn2ot0e` (`tecnico_solicitante_id`),
  CONSTRAINT `FK2uf3ey5l6rltwo1wn27ji3fop` FOREIGN KEY (`incidencia_id`) REFERENCES `incidencias` (`id`),
  CONSTRAINT `FK9ui7o4q2u1bnvgigcx694bs43` FOREIGN KEY (`revisado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `FKjyjmswjh4rhhgjv8p6bn2ot0e` FOREIGN KEY (`tecnico_solicitante_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `FKtlj85vjnjjyaid8fm6axerkf7` FOREIGN KEY (`tecnico_nuevo_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitudes_reasignacion`
--

LOCK TABLES `solicitudes_reasignacion` WRITE;
/*!40000 ALTER TABLE `solicitudes_reasignacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `solicitudes_reasignacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ubicaciones`
--

DROP TABLE IF EXISTS `ubicaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ubicaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pabellon` varchar(50) NOT NULL,
  `aula_laboratorio` varchar(50) NOT NULL,
  `piso` int NOT NULL,
  `tipo` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ubicaciones`
--

LOCK TABLES `ubicaciones` WRITE;
/*!40000 ALTER TABLE `ubicaciones` DISABLE KEYS */;
INSERT INTO `ubicaciones` VALUES (1,'Pabellón A','Aula 101',1,'Aula'),(2,'Pabellón A','Aula 201',2,'Aula'),(3,'Pabellón B','Aula 102',1,'Aula'),(4,'Pabellón B','Laboratorio 1',1,'Laboratorio'),(5,'Pabellón B','Laboratorio 2',2,'Laboratorio'),(6,'Pabellón C','Laboratorio 3',1,'Laboratorio'),(7,'Pabellón C','Auditorio',1,'Auditorio'),(8,'Pabellón D','Aula 301',3,'Aula'),(9,'Pabellón A','Laboratorio A',1,'Laboratorio'),(10,'Pabellón A','Laboratorio B',1,'Laboratorio'),(11,'Pabellón B','Laboratorio C',1,'Laboratorio'),(12,'Pabellón B','Laboratorio D',2,'Laboratorio'),(13,'Pabellón C','Laboratorio E',1,'Laboratorio'),(14,'Pabellón C','Laboratorio F',2,'Laboratorio'),(15,'Pabellón D','Auditorio',1,'Auditorio');
/*!40000 ALTER TABLE `ubicaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol_id` int NOT NULL,
  `especialidad_id` int DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `carrera` varchar(100) DEFAULT NULL,
  `estado` varchar(20) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`),
  KEY `fk_usuario_rol` (`rol_id`),
  KEY `fk_usuario_especialidad` (`especialidad_id`),
  CONSTRAINT `fk_usuario_especialidad` FOREIGN KEY (`especialidad_id`) REFERENCES `especialidades` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Admin','Sistema','admin@universidad.edu.pe','$2a$10$ltJUW9Lrv8BhpFm.K89xju22vO.BRnq5GmshNZs/IdkaQuj5w/t52',1,NULL,'2026-08-26 23:10:20',NULL,NULL,NULL),(2,'Técnico','Soporte','tecnico@universidad.edu.pe','$2a$10$ncwJTAueTfCS1rqb5EnO2.tljcEfTfY7lqOpI.dE6rtL5keZcbN0W',3,NULL,'2026-08-26 23:10:20',NULL,NULL,NULL),(3,'Alumno','Prueba','alumno@universidad.edu.pe','$2a$10$BekBgENzBtUi8WH2b.YB0OCQDrRXa1Ie.iHozMA57LLjw0pfacbwO',2,NULL,'2026-08-26 23:10:20',NULL,NULL,NULL),(4,'Ana','Rodríguez','admin@utp.edu.pe','$2a$10$PVGJftZrqDrApmw0xIecne6rYqYlqtpT65dgD47xPXAo.7UzPJv.a',1,NULL,'2026-10-21 17:06:57',NULL,'Activo','987-000-000'),(5,'Rosa','Flores','r.flores@utp.edu.pe','$2a$10$8KFkNdkIcTrvjlYxvRai.eu7Yr7IlK3l8YlPg6iaqdVJugagqsbS2',4,NULL,'2026-10-21 17:06:57',NULL,'Activo','987-666-321'),(6,'Jorge','Herrera','j.herrera@utp.edu.pe','$2a$10$Y1VY//rMVxH7MBZMifQpc.Xs2uI.gAZaPD3YhYpzKKZHyG8ZIckza',4,NULL,'2026-10-21 17:06:58',NULL,'Activo','987-777-888'),(7,'Carlos','Mendoza','c.mendoza@utp.edu.pe','$2a$10$aDOGrTEPapbMSpkeSzKqzOReCXW74hgUmvglP/hALLDJVvfrZxH0i',5,1,'2026-10-21 17:06:58',NULL,'Activo','987-111-222'),(8,'Pedro','Sánchez','p.sanchez@utp.edu.pe','$2a$10$7rkE2XTFnnOeSDdcFKslO.6kBQpLOXWVO0ifwSqPaHLAfbm7IAJAG',5,2,'2026-10-21 17:06:58',NULL,'Activo','987-333-789'),(9,'Lucía','Ramos','l.ramos@utp.edu.pe','$2a$10$g5hLnt8vClanK6/6Z2n4Yu07nMyxd9dtP1VPq27yd/xdm3XtSaxAu',5,3,'2026-10-21 17:06:58',NULL,'Activo','987-444-100'),(10,'Marcos','Vega','m.vega@utp.edu.pe','$2a$10$i5tgzGWkc9UgovKoewc0SOFVcFHztvyCosvbcOiWAp6dgVwAwQORK',5,4,'2026-10-21 17:54:25',NULL,'Activo','987-555-200'),(11,'María','García','m.garcia@utp.edu.pe','$2a$10$7XHlyA9.HnooikMjuwQ4u.Wpud6OtxyFTZCIslrkKeGyQ27iTJ2ga',2,NULL,'2026-10-21 17:54:25','Ingeniería de Sistemas','Activo','987-654-321'),(12,'Luis','Torres','l.torres@utp.edu.pe','$2a$10$aKYC6oES8ogk9d0sVhavLuza8QSrNA7vlO2FVCr9EbBcX.bJgPtgG',2,NULL,'2026-10-21 17:54:25','Ciencias de la Computación','Activo','987-555-123'),(13,'Sofía','Quispe','s.quispe@utp.edu.pe','$2a$10$uHSD99Oh6ZtRU63OJigLb.zUlqBzx6wZ2re3sQd4vgzkIxq3wA3kS',2,NULL,'2026-10-21 17:54:25','Ingeniería de Sistemas','Activo','987-444-789'),(14,'Diego','Vargas','d.vargas@utp.edu.pe','$2a$10$Rw4NDE2fuwg6YGcA0kBlvOvTv0JLG0edCpe5zjUYyheO0ioMj.fXC',2,NULL,'2026-10-21 17:54:26','Ing. de Software','Activo','987-222-456'),(15,'Patricia','Luna','p.luna@utp.edu.pe','$2a$10$lhu9FHr0T4uK5tXZukjPP.xM561xlybxsYyv9nYGvz4PP6KINfWI2',2,NULL,'2026-10-21 17:54:26','Ciencias de la Computación','Activo','987-777-321'),(16,'Andrés','Huanca','a.huanca@utp.edu.pe','$2a$10$cWqAxXof4POO4cUcXAL0auo6FOLIKJ/TunWl0ZyL6LMglo.3LkHf.',2,NULL,'2026-10-21 17:54:26','Ing. de Software','Activo','987-888-112'),(17,'Camila','Vásquez','c.vasquez@utp.edu.pe','$2a$10$rRayEZzpbH0lTSD1n77lz.g2trnawgko4V.nMUxx1xxmZsJIMYw2m',2,NULL,'2026-10-21 17:54:26','Ingeniería de Sistemas','Activo','987-121-313'),(18,'Mateo','Morales','m.morales@utp.edu.pe','$2a$10$36HNnHNjKoySiSJmh0rSaeCfLfn/.aE0AVa5KdwlZA7NJd4k.fTM2',2,NULL,'2026-10-21 17:54:26','Ing. de Software','Activo','987-333-214'),(19,'Valeria','Rojas','v.rojas@utp.edu.pe','$2a$10$SxpvSjzdCQDS0LqNLqiboe5TRliuKawGkawU5LrnGCDgRYAqIqHnK',2,NULL,'2026-10-21 17:54:26','Ciencias de la Computación','Activo','987-441-890'),(20,'Rodrigo','Castillo','r.castillo@utp.edu.pe','$2a$10$Wrmm5svMr2fGCRJX0FmeSer9TM5MONfEYT7j.GxmHKjntV.nYdkx.',2,NULL,'2026-10-21 17:54:26','Ingeniería de Sistemas','Activo','987-990-112'),(21,'Alex','Martínez','a.martinez@utp.edu.pe','$2a$10$T4X71mR19e2cOxhPOF2WbOKfib3CTXYsz4qWBxC7tshwl9/un1wY6',2,NULL,'2026-10-21 18:21:43','Ingeniería de sistemas','Inactivo',NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-22  2:17:02
