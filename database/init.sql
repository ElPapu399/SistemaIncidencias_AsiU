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
  `tipo_archivo` varchar(100) DEFAULT NULL,
  `tamanio_bytes` bigint DEFAULT NULL,
  `subido_por` int DEFAULT NULL,
  `fecha_subida` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_adjunto_incidencia` (`incidencia_id`),
  KEY `fk_adjunto_usuario` (`subido_por`),
  CONSTRAINT `fk_adjunto_incidencia` FOREIGN KEY (`incidencia_id`) REFERENCES `incidencias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_adjunto_usuario` FOREIGN KEY (`subido_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
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
INSERT INTO `categorias` VALUES (1,'Computadora no enciende',1,1),(2,'Problema con teclado o mouse',1,3),(3,'Problema con monitor',1,2),(4,'Problema con impresora',1,2),(5,'Sin conexiÃ³n a Internet',2,1),(6,'Problema con Wi-Fi',2,1),(7,'Problema de conexiÃ³n de red',2,2),(8,'ConexiÃ³n lenta',2,3),(9,'Error de aplicaciÃ³n',3,2),(10,'Problema con sistema operativo',3,1),(11,'Problema de instalaciÃ³n',3,2),(12,'Problema con licencia de software',3,3),(13,'Proyector sin seÃ±al HDMI',4,2),(14,'Ruido estÃ¡tico en altavoces',4,3),(15,'Teclado con teclas bloqueadas',1,3),(16,'Kernel de Python no inicia',3,2),(17,'Cable de red con conector roto',2,2),(18,'Base de datos local bloqueada',3,1);
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
  `tipo` varchar(50) NOT NULL,
  `marca` varchar(100) DEFAULT NULL,
  `modelo` varchar(100) DEFAULT NULL,
  `ubicacion_id` int DEFAULT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'Operativo',
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `fk_equipo_ubicacion` (`ubicacion_id`),
  CONSTRAINT `fk_equipo_ubicacion` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipos`
--

LOCK TABLES `equipos` WRITE;
/*!40000 ALTER TABLE `equipos` DISABLE KEYS */;
INSERT INTO `equipos` VALUES (1,'PC-LAB-A-01','PC','HP','ProDesk 400 G7',1,'Operativo'),(2,'PC-LAB-A-02','PC','HP','ProDesk 400 G7',1,'Operativo'),(3,'PC-LAB-A-03','PC','HP','ProDesk 400 G7',1,'Operativo'),(4,'PC-LAB-A-04','PC','HP','ProDesk 400 G7',1,'Operativo'),(5,'PC-LAB-A-05','PC','HP','ProDesk 400 G7',1,'En reparaciÃ³n'),(6,'PC-LAB-B-01','PC','Dell','OptiPlex 5090',2,'Operativo'),(7,'PC-LAB-B-02','PC','Dell','OptiPlex 5090',2,'Operativo'),(8,'PC-LAB-C-01','PC','Lenovo','ThinkCentre M70q',3,'Operativo'),(9,'PC-LAB-C-02','PC','Lenovo','ThinkCentre M70q',3,'Operativo'),(10,'PC-LAB-D-01','PC','HP','ProDesk 400 G7',4,'Operativo'),(11,'IMP-LAB-A-01','Impresora','HP','LaserJet Pro M404dn',1,'Operativo'),(12,'PROY-LAB-B-01','Proyector','Epson','PowerLite E20',2,'Operativo'),(13,'SW-LAB-A-01','Switch','Cisco','Catalyst 2960',1,'Operativo'),(14,'PC-LAB-E-01','PC','HP','ProDesk 400 G7',5,'Operativo'),(15,'PC-LAB-F-01','PC','Dell','OptiPlex 5090',6,'Operativo'),(16,'MON-LAB-A-05','Monitor','Samsung','S24R350',1,'Operativo'),(17,'TEC-LAB-A-18','Teclado','Logitech','K120',1,'Operativo'),(18,'PC-LAB-C-04','PC','Lenovo','ThinkCentre M70q',3,'Operativo'),(19,'PC-LAB-B-20','PC','Dell','OptiPlex 5090',2,'Operativo'),(20,'PC-LAB-D-15','PC','HP','ProDesk 400 G7',4,'Operativo');
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
INSERT INTO `especialidades` VALUES (1,'Hardware','Problemas fÃ­sicos: equipos, perifÃ©ricos, impresoras'),(2,'Redes','Conectividad, Wi-Fi, switches, puntos de acceso'),(3,'Software','Sistemas operativos, aplicaciones, licencias'),(4,'Audiovisual','Proyectores, pantallas, audio');
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
  `tipo_accion` varchar(30) NOT NULL DEFAULT 'CAMBIO_ESTADO',
  `usuario_id` int NOT NULL,
  `comentario` varchar(500) DEFAULT NULL,
  `tecnico_anterior_id` int DEFAULT NULL,
  `tecnico_nuevo_id` int DEFAULT NULL,
  `fecha_cambio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_historial_incidencia` (`incidencia_id`),
  KEY `fk_historial_usuario` (`usuario_id`),
  KEY `fk_historial_tecnico_anterior` (`tecnico_anterior_id`),
  KEY `fk_historial_tecnico_nuevo` (`tecnico_nuevo_id`),
  CONSTRAINT `fk_historial_incidencia` FOREIGN KEY (`incidencia_id`) REFERENCES `incidencias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_historial_tecnico_anterior` FOREIGN KEY (`tecnico_anterior_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_historial_tecnico_nuevo` FOREIGN KEY (`tecnico_nuevo_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_historial_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_estados`
--

LOCK TABLES `historial_estados` WRITE;
/*!40000 ALTER TABLE `historial_estados` DISABLE KEYS */;
INSERT INTO `historial_estados` VALUES (2,2,'Nuevo','Pendiente','CREACION',8,'Ticket registrado',NULL,NULL,'2026-10-21 10:46:06');
/*!40000 ALTER TABLE `historial_estados` ENABLE KEYS */;
UNLOCK TABLES;

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
  `equipo_id` int DEFAULT NULL,
  `solucion_tecnica` text,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_inicio_atencion` timestamp NULL DEFAULT NULL,
  `fecha_cierre` timestamp NULL DEFAULT NULL,
  `calificacion` int DEFAULT NULL,
  `comentario_calificacion` text,
  `motivo_calificacion` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_ticket` (`codigo_ticket`),
  KEY `fk_incidencia_estudiante` (`estudiante_id`),
  KEY `fk_incidencia_tecnico` (`tecnico_id`),
  KEY `fk_incidencia_categoria` (`categoria_id`),
  KEY `fk_incidencia_prioridad` (`prioridad_id`),
  KEY `fk_incidencia_ubicacion` (`ubicacion_id`),
  KEY `fk_incidencia_equipo` (`equipo_id`),
  CONSTRAINT `fk_incidencia_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_incidencia_equipo` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_incidencia_estudiante` FOREIGN KEY (`estudiante_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_incidencia_prioridad` FOREIGN KEY (`prioridad_id`) REFERENCES `prioridades` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_incidencia_tecnico` FOREIGN KEY (`tecnico_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_incidencia_ubicacion` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


LOCK TABLES `incidencias` WRITE;

UNLOCK TABLES;



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

CREATE TABLE `solicitudes_reasignacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `incidencia_id` int NOT NULL,
  `tecnico_solicitante_id` int NOT NULL,
  `motivo` text NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'PENDIENTE',
  `revisado_por_id` int DEFAULT NULL,
  `comentario_respuesta` varchar(500) DEFAULT NULL,
  `tecnico_nuevo_id` int DEFAULT NULL,
  `fecha_solicitud` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_respuesta` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_solicitud_incidencia` (`incidencia_id`),
  KEY `fk_solicitud_tecnico` (`tecnico_solicitante_id`),
  KEY `fk_solicitud_revisor` (`revisado_por_id`),
  KEY `fk_solicitud_tecnico_nuevo` (`tecnico_nuevo_id`),
  CONSTRAINT `fk_solicitud_incidencia` FOREIGN KEY (`incidencia_id`) REFERENCES `incidencias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_solicitud_revisor` FOREIGN KEY (`revisado_por_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_solicitud_tecnico` FOREIGN KEY (`tecnico_solicitante_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_solicitud_tecnico_nuevo` FOREIGN KEY (`tecnico_nuevo_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


LOCK TABLES `solicitudes_reasignacion` WRITE;

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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ubicaciones`
--

LOCK TABLES `ubicaciones` WRITE;
/*!40000 ALTER TABLE `ubicaciones` DISABLE KEYS */;
INSERT INTO `ubicaciones` VALUES (1,'PabellÃ³n A','Laboratorio A',1,'Laboratorio'),(2,'PabellÃ³n A','Laboratorio B',1,'Laboratorio'),(3,'PabellÃ³n B','Laboratorio C',1,'Laboratorio'),(4,'PabellÃ³n B','Laboratorio D',2,'Laboratorio'),(5,'PabellÃ³n C','Laboratorio E',1,'Laboratorio'),(6,'PabellÃ³n C','Laboratorio F',2,'Laboratorio'),(7,'PabellÃ³n D','Aula 301',3,'Aula'),(8,'PabellÃ³n D','Auditorio',1,'Auditorio'),(9,'Pabellón A','Laboratorio A',1,'Laboratorio'),(10,'Pabellón A','Laboratorio B',1,'Laboratorio'),(11,'Pabellón B','Laboratorio C',1,'Laboratorio'),(12,'Pabellón B','Laboratorio D',2,'Laboratorio'),(13,'Pabellón C','Laboratorio E',1,'Laboratorio'),(14,'Pabellón C','Laboratorio F',2,'Laboratorio'),(15,'Pabellón D','Aula 301',3,'Aula'),(16,'Pabellón D','Auditorio',1,'Auditorio');
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
  `telefono` varchar(20) DEFAULT NULL,
  `carrera` varchar(100) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'Activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`),
  KEY `fk_usuario_rol` (`rol_id`),
  KEY `fk_usuario_especialidad` (`especialidad_id`),
  CONSTRAINT `fk_usuario_especialidad` FOREIGN KEY (`especialidad_id`) REFERENCES `especialidades` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


LOCK TABLES `usuarios` WRITE;
INSERT INTO `usuarios` VALUES (1,'Ana','Rodríguez','admin@utp.edu.pe','$2a$10$H1LZolC1wBqDUZy3PioXwue62T6ZSgQTps3643922KnbkqG24CvMe',1,NULL,'987-000-000',NULL,'Activo','2026-10-21 10:31:51'),(2,'Rosa','Flores','r.flores@utp.edu.pe','$2a$10$3hi9AvPO8uqt1aMeXglCTe0WBUF5ikE.w6NA3FgOdTdScroz3cfXC',4,NULL,'987-666-321',NULL,'Activo','2026-10-21 10:31:51'),(3,'Jorge','Herrera','j.herrera@utp.edu.pe','$2a$10$5/HRgjS2.w6366EB1G9uke4ajFN3lA02t95nY6cifLjyZ131gLrqW',4,NULL,'987-777-888',NULL,'Activo','2026-10-21 10:31:51'),(4,'Carlos','Mendoza','c.mendoza@utp.edu.pe','$2a$10$yr1kknsxRdsZTAKXOpjXR.ucLwGp4TLhbnhZUN.jXOT8rehU7.Z2e',5,1,'987-111-222',NULL,'Activo','2026-10-21 10:31:51'),(5,'Pedro','Sánchez','p.sanchez@utp.edu.pe','$2a$10$ACuKqHgobmrMwj0cYmHML.onpcybUJQNgwP.IYN/DV9gSqoo0QjlC',5,2,'987-333-789',NULL,'Activo','2026-10-21 10:31:52'),(6,'Lucía','Ramos','l.ramos@utp.edu.pe','$2a$10$Q0qPhf7yW6OkQ/CfzKKpOuEbVUfh7ew3n709eqeg7/5Rmh.zmYTTS',5,3,'987-444-100',NULL,'Activo','2026-10-21 10:31:52'),(7,'Marcos','Vega','m.vega@utp.edu.pe','$2a$10$aqXKNRn/0xt2s0G1B0r6NOClWk5HCNWerWs2Z05QgT/BnfBD9paa.',5,4,'987-555-200',NULL,'Activo','2026-10-21 10:31:52'),(8,'María','García','m.garcia@utp.edu.pe','$2a$10$xkx6Yd.fXxSw8N0oHAFKXuDLbKei6G.pI/OPyplmUFoByuNNwjz5i',2,NULL,'987-654-321','Ingeniería de Sistemas','Activo','2026-10-21 10:31:52'),(9,'Luis','Torres','l.torres@utp.edu.pe','$2a$10$S.qpn81CLXhLeQHdlJiDTOZoHAuKxrQDOxe62hnpJdIGcXtBfqWqC',2,NULL,'987-555-123','Ciencias de la Computación','Activo','2026-10-21 10:31:52'),(10,'Sofía','Quispe','s.quispe@utp.edu.pe','$2a$10$gyGooO94x8pHMAFB/JcvWOexTSzI5oAa6C3zYXhLYl2m6yMidlKJu',2,NULL,'987-444-789','Ingeniería de Sistemas','Activo','2026-10-21 10:31:52'),(11,'Diego','Vargas','d.vargas@utp.edu.pe','$2a$10$8pT55GazaNxtCCsOyPk37uc6d3P723W051r6UTEC0wXZ9Ul5M8K9.',2,NULL,'987-222-456','Ing. de Software','Activo','2026-10-21 10:31:52'),(12,'Patricia','Luna','p.luna@utp.edu.pe','$2a$10$YbT.8pOP6G1Krr75W9RwZ.jeN7u972E5GkCE5LgZRADHOY.3VMBlS',2,NULL,'987-777-321','Ciencias de la Computación','Activo','2026-10-21 10:31:52'),(13,'Andrés','Huanca','a.huanca@utp.edu.pe','$2a$10$3ORWpIYqLQ9oouGQORkpCeIfJsy/3LtOart7khKgyLpEJAIsgiFTy',2,NULL,'987-888-112','Ing. de Software','Activo','2026-10-21 10:31:52'),(14,'Camila','Vásquez','c.vasquez@utp.edu.pe','$2a$10$qUCg2LhJnasbgdxEwlRey.bQbLXUjb8BUSPzZLdy/8R7GJF3kmacS',2,NULL,'987-121-313','Ingeniería de Sistemas','Activo','2026-10-21 10:31:52'),(15,'Mateo','Morales','m.morales@utp.edu.pe','$2a$10$tJFY8B.KMpW1B1MOtYs79OhYRPBrKZlR8Qd7dnQkZICjw3K3QG5e.',2,NULL,'987-333-214','Ing. de Software','Activo','2026-10-21 10:31:52'),(16,'Valeria','Rojas','v.rojas@utp.edu.pe','$2a$10$bMFsbWdAoosJilgLiOSrnO5hRgRTZaBbn5HgTLxFB15yW3kiIvOdm',2,NULL,'987-441-890','Ciencias de la Computación','Activo','2026-10-21 10:31:52'),(17,'Rodrigo','Castillo','r.castillo@utp.edu.pe','$2a$10$tkrVoaUoubELYA1BVnaK7.3Y6Bz6Hs4SKyW8rigfy301qBuAELZGW',2,NULL,'987-990-112','Ingeniería de Sistemas','Activo','2026-10-21 10:31:52');
UNLOCK TABLES;
