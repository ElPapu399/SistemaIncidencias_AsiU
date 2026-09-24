package com.proyecto.incidenciasback.config;

import com.proyecto.incidenciasback.model.*;
import com.proyecto.incidenciasback.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataLoader implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final EspecialidadRepository especialidadRepository;
    private final PrioridadRepository prioridadRepository;
    private final UbicacionRepository ubicacionRepository;
    private final CategoriaRepository categoriaRepository;
    private final EquipoRepository equipoRepository;
    private final IncidenciaRepository incidenciaRepository;
    private final HistorialEstadoRepository historialEstadoRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataLoader(UsuarioRepository usuarioRepository,
                      RolRepository rolRepository,
                      EspecialidadRepository especialidadRepository,
                      PrioridadRepository prioridadRepository,
                      UbicacionRepository ubicacionRepository,
                      CategoriaRepository categoriaRepository,
                      EquipoRepository equipoRepository,
                      IncidenciaRepository incidenciaRepository,
                      HistorialEstadoRepository historialEstadoRepository,
                      BCryptPasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.especialidadRepository = especialidadRepository;
        this.prioridadRepository = prioridadRepository;
        this.ubicacionRepository = ubicacionRepository;
        this.categoriaRepository = categoriaRepository;
        this.equipoRepository = equipoRepository;
        this.incidenciaRepository = incidenciaRepository;
        this.historialEstadoRepository = historialEstadoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // === 1. Roles ===
        obtenerOCrearRol("ADMIN");
        obtenerOCrearRol("ESTUDIANTE");
        obtenerOCrearRol("TECNICO");
        obtenerOCrearRol("TECNICO_GENERAL");
        obtenerOCrearRol("TECNICO_ESPECIALISTA");

        // === 2. Especialidades ===
        crearEspecialidadSiNoExiste("Hardware", "Problemas físicos: equipos, periféricos, impresoras");
        crearEspecialidadSiNoExiste("Redes", "Conectividad, Wi-Fi, switches, puntos de acceso");
        crearEspecialidadSiNoExiste("Software", "Sistemas operativos, aplicaciones, licencias");
        crearEspecialidadSiNoExiste("Audiovisual", "Proyectores, pantallas, audio");

        // === 3. Prioridades ===
        crearPrioridadSiNoExiste("Alta", 4, "Afecta a múltiples usuarios o servicios críticos");
        crearPrioridadSiNoExiste("Media", 24, "Afecta a un usuario, tiene solución temporal");
        crearPrioridadSiNoExiste("Baja", 72, "Inconveniente menor, no bloquea el trabajo");

        // === 4. Ubicaciones ===
        crearUbicacionSiNoExiste("Pabellón A", "Laboratorio A", 1, "Laboratorio");
        crearUbicacionSiNoExiste("Pabellón A", "Laboratorio B", 1, "Laboratorio");
        crearUbicacionSiNoExiste("Pabellón B", "Laboratorio C", 1, "Laboratorio");
        crearUbicacionSiNoExiste("Pabellón B", "Laboratorio D", 2, "Laboratorio");
        crearUbicacionSiNoExiste("Pabellón C", "Laboratorio E", 1, "Laboratorio");
        crearUbicacionSiNoExiste("Pabellón C", "Laboratorio F", 2, "Laboratorio");
        crearUbicacionSiNoExiste("Pabellón D", "Aula 301", 3, "Aula");
        crearUbicacionSiNoExiste("Pabellón D", "Auditorio", 1, "Auditorio");

        // === 5. Categorías ===
        crearCategoriaSiNoExiste("Computadora no enciende", "Hardware", "Alta");
        crearCategoriaSiNoExiste("Problema con teclado o mouse", "Hardware", "Baja");
        crearCategoriaSiNoExiste("Problema con monitor", "Hardware", "Media");
        crearCategoriaSiNoExiste("Problema con impresora", "Hardware", "Media");
        crearCategoriaSiNoExiste("Sin conexión a Internet", "Redes", "Alta");
        crearCategoriaSiNoExiste("Problema con Wi-Fi", "Redes", "Alta");
        crearCategoriaSiNoExiste("Problema de conexión de red", "Redes", "Media");
        crearCategoriaSiNoExiste("Conexión lenta", "Redes", "Baja");
        crearCategoriaSiNoExiste("Error de aplicación", "Software", "Media");
        crearCategoriaSiNoExiste("Problema con sistema operativo", "Software", "Alta");
        crearCategoriaSiNoExiste("Problema de instalación", "Software", "Media");
        crearCategoriaSiNoExiste("Problema con licencia de software", "Software", "Baja");
        crearCategoriaSiNoExiste("Proyector sin señal HDMI", "Audiovisual", "Media");
        crearCategoriaSiNoExiste("Ruido estático en altavoces", "Audiovisual", "Baja");
        crearCategoriaSiNoExiste("Teclado con teclas bloqueadas", "Hardware", "Baja");
        crearCategoriaSiNoExiste("Kernel de Python no inicia", "Software", "Media");
        crearCategoriaSiNoExiste("Cable de red con conector roto", "Redes", "Media");
        crearCategoriaSiNoExiste("Base de datos local bloqueada", "Software", "Alta");

        // === 6. Usuarios ===
        // Admin
        crearUsuarioSiNoExiste("Ana", "Rodríguez", "admin@universidad.edu.pe", "admin123", "ADMIN", null, "987-000-000", null, "Activo");

        // Técnicos de Soporte General (Mesa de ayuda / Asignadores)
        crearUsuarioSiNoExiste("Rosa", "Flores", "r.flores@utp.edu.pe", "tecnico123", "TECNICO_GENERAL", null, "987-666-321", null, "Activo");
        crearUsuarioSiNoExiste("Jorge", "Herrera", "j.herrera@utp.edu.pe", "tecnico123", "TECNICO_GENERAL", null, "987-777-888", null, "Activo");

        // Técnicos de Soporte Especializado (Resolutores de campo)
        crearUsuarioSiNoExiste("Carlos", "Mendoza", "c.mendoza@utp.edu.pe", "tecnico123", "TECNICO_ESPECIALISTA", "Hardware", "987-111-222", null, "Activo");
        crearUsuarioSiNoExiste("Pedro", "Sánchez", "p.sanchez@utp.edu.pe", "tecnico123", "TECNICO_ESPECIALISTA", "Redes", "987-333-789", null, "Activo");
        crearUsuarioSiNoExiste("Lucía", "Ramos", "l.ramos@utp.edu.pe", "tecnico123", "TECNICO_ESPECIALISTA", "Software", "987-444-100", null, "Activo");
        crearUsuarioSiNoExiste("Marcos", "Vega", "m.vega@utp.edu.pe", "tecnico123", "TECNICO_ESPECIALISTA", "Audiovisual", "987-555-200", null, "Activo");

        // Estudiantes
        crearUsuarioSiNoExiste("María", "García", "m.garcia@utp.edu.pe", "alumno123", "ESTUDIANTE", null, "987-654-321", "Ingeniería de Sistemas", "Activo");
        crearUsuarioSiNoExiste("Luis", "Torres", "l.torres@utp.edu.pe", "alumno123", "ESTUDIANTE", null, "987-555-123", "Ciencias de la Computación", "Activo");
        crearUsuarioSiNoExiste("Sofía", "Quispe", "s.quispe@utp.edu.pe", "alumno123", "ESTUDIANTE", null, "987-444-789", "Ingeniería de Sistemas", "Activo");
        crearUsuarioSiNoExiste("Diego", "Vargas", "d.vargas@utp.edu.pe", "alumno123", "ESTUDIANTE", null, "987-222-456", "Ing. de Software", "Activo");
        crearUsuarioSiNoExiste("Patricia", "Luna", "p.luna@utp.edu.pe", "alumno123", "ESTUDIANTE", null, "987-777-321", "Ciencias de la Computación", "Activo");
        crearUsuarioSiNoExiste("Andrés", "Huanca", "a.huanca@utp.edu.pe", "alumno123", "ESTUDIANTE", null, "987-888-112", "Ing. de Software", "Activo");
        crearUsuarioSiNoExiste("Camila", "Vásquez", "c.vasquez@utp.edu.pe", "alumno123", "ESTUDIANTE", null, "987-121-313", "Ingeniería de Sistemas", "Activo");
        crearUsuarioSiNoExiste("Mateo", "Morales", "m.morales@utp.edu.pe", "alumno123", "ESTUDIANTE", null, "987-333-214", "Ing. de Software", "Activo");
        crearUsuarioSiNoExiste("Valeria", "Rojas", "v.rojas@utp.edu.pe", "alumno123", "ESTUDIANTE", null, "987-441-890", "Ciencias de la Computación", "Activo");
        crearUsuarioSiNoExiste("Rodrigo", "Castillo", "r.castillo@utp.edu.pe", "alumno123", "ESTUDIANTE", null, "987-990-112", "Ingeniería de Sistemas", "Activo");

        // === 7. Equipos de ejemplo ===
        crearEquiposSiVacio();

        // === 8. Incidencias de ejemplo ===
        crearIncidenciasSiVacio();
    }

    // ==================== Helpers ====================

    private Rol obtenerOCrearRol(String nombreRol) {
        return rolRepository.findByNombre(nombreRol).orElseGet(() -> {
            Rol nuevo = new Rol();
            nuevo.setNombre(nombreRol);
            return rolRepository.save(nuevo);
        });
    }

    private void crearEspecialidadSiNoExiste(String nombre, String descripcion) {
        if (especialidadRepository.findByNombre(nombre).isEmpty()) {
            Especialidad e = new Especialidad();
            e.setNombre(nombre);
            e.setDescripcion(descripcion);
            especialidadRepository.save(e);
            System.out.println("✅ Especialidad creada: " + nombre);
        }
    }

    private void crearPrioridadSiNoExiste(String nivel, int tiempoMaximoHoras, String descripcion) {
        if (prioridadRepository.findAll().stream().noneMatch(p -> p.getNivel().equals(nivel))) {
            Prioridad p = new Prioridad();
            p.setNivel(nivel);
            p.setTiempoMaximoHoras(tiempoMaximoHoras);
            p.setDescripcion(descripcion);
            prioridadRepository.save(p);
            System.out.println("✅ Prioridad creada: " + nivel);
        }
    }

    private void crearUbicacionSiNoExiste(String pabellon, String aulaLab, int piso, String tipo) {
        boolean exists = ubicacionRepository.findAll().stream()
                .anyMatch(u -> u.getPabellon().equals(pabellon) && u.getAulaLaboratorio().equals(aulaLab));
        if (!exists) {
            Ubicacion u = new Ubicacion();
            u.setPabellon(pabellon);
            u.setAulaLaboratorio(aulaLab);
            u.setPiso(piso);
            u.setTipo(tipo);
            ubicacionRepository.save(u);
            System.out.println("✅ Ubicación creada: " + pabellon + " - " + aulaLab);
        }
    }

    private void crearCategoriaSiNoExiste(String nombre, String nombreEspecialidad, String nivelPrioridad) {
        if (categoriaRepository.findAll().stream().noneMatch(c -> c.getNombre().equals(nombre))) {
            Especialidad esp = especialidadRepository.findByNombre(nombreEspecialidad)
                    .orElseThrow(() -> new RuntimeException("Especialidad no encontrada: " + nombreEspecialidad));
            Prioridad pri = prioridadRepository.findAll().stream()
                    .filter(p -> p.getNivel().equals(nivelPrioridad))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Prioridad no encontrada: " + nivelPrioridad));

            Categoria c = new Categoria();
            c.setNombre(nombre);
            c.setEspecialidad(esp);
            c.setPrioridadDefecto(pri);
            categoriaRepository.save(c);
            System.out.println("✅ Categoría creada: " + nombre);
        }
    }

    private void crearUsuarioSiNoExiste(String nombre, String apellido, String correo,
                                        String password, String nombreRol, String nombreEspecialidad,
                                        String telefono, String carrera, String estado) {
        var existenteOpt = usuarioRepository.findByCorreo(correo);
        if (existenteOpt.isPresent()) {
            Usuario existente = existenteOpt.get();
            // Actualizar rol si cambió respecto a la inicialización previa
            if (existente.getRol() != null && !nombreRol.equals(existente.getRol().getNombre())) {
                Rol rol = obtenerOCrearRol(nombreRol);
                existente.setRol(rol);
                if (nombreEspecialidad != null) {
                    especialidadRepository.findByNombre(nombreEspecialidad).ifPresent(existente::setEspecialidad);
                }
                usuarioRepository.save(existente);
                System.out.println("🔄 Rol actualizado para: " + correo + " -> " + nombreRol);
            }
            return; // Ya existe
        }

        Rol rol = obtenerOCrearRol(nombreRol);

        Usuario usuario = new Usuario();
        usuario.setNombre(nombre);
        usuario.setApellido(apellido);
        usuario.setCorreo(correo);
        usuario.setPasswordHash(passwordEncoder.encode(password));
        usuario.setRol(rol);
        usuario.setTelefono(telefono);
        usuario.setCarrera(carrera);
        usuario.setEstado(estado != null ? estado : "Activo");

        if (nombreEspecialidad != null) {
            Especialidad especialidad = especialidadRepository.findByNombre(nombreEspecialidad)
                    .orElseThrow(() -> new RuntimeException(
                            "Especialidad '" + nombreEspecialidad + "' no encontrada."));
            usuario.setEspecialidad(especialidad);
        }

        usuarioRepository.save(usuario);
        System.out.println("✅ Usuario creado: " + correo + " / " + password + " [" + nombreRol + "]"
                + (nombreEspecialidad != null ? " - " + nombreEspecialidad : ""));
    }

    private void crearEquiposSiVacio() {
        if (equipoRepository.count() > 0) return;

        var ubicaciones = ubicacionRepository.findAll();
        if (ubicaciones.isEmpty()) return;

        // Helper para buscar ubicación por nombre de aula
        java.util.function.Function<String, Ubicacion> findUbicacion = (aula) ->
                ubicaciones.stream()
                        .filter(u -> u.getAulaLaboratorio().equals(aula))
                        .findFirst()
                        .orElse(null);

        crearEquipo("PC-LAB-A-01", "PC", "HP", "ProDesk 400 G7", findUbicacion.apply("Laboratorio A"), "Operativo");
        crearEquipo("PC-LAB-A-02", "PC", "HP", "ProDesk 400 G7", findUbicacion.apply("Laboratorio A"), "Operativo");
        crearEquipo("PC-LAB-A-03", "PC", "HP", "ProDesk 400 G7", findUbicacion.apply("Laboratorio A"), "Operativo");
        crearEquipo("PC-LAB-A-04", "PC", "HP", "ProDesk 400 G7", findUbicacion.apply("Laboratorio A"), "Operativo");
        crearEquipo("PC-LAB-A-05", "PC", "HP", "ProDesk 400 G7", findUbicacion.apply("Laboratorio A"), "En reparación");
        crearEquipo("PC-LAB-B-01", "PC", "Dell", "OptiPlex 5090", findUbicacion.apply("Laboratorio B"), "Operativo");
        crearEquipo("PC-LAB-B-02", "PC", "Dell", "OptiPlex 5090", findUbicacion.apply("Laboratorio B"), "Operativo");
        crearEquipo("PC-LAB-C-01", "PC", "Lenovo", "ThinkCentre M70q", findUbicacion.apply("Laboratorio C"), "Operativo");
        crearEquipo("PC-LAB-C-02", "PC", "Lenovo", "ThinkCentre M70q", findUbicacion.apply("Laboratorio C"), "Operativo");
        crearEquipo("PC-LAB-D-01", "PC", "HP", "ProDesk 400 G7", findUbicacion.apply("Laboratorio D"), "Operativo");
        crearEquipo("IMP-LAB-A-01", "Impresora", "HP", "LaserJet Pro M404dn", findUbicacion.apply("Laboratorio A"), "Operativo");
        crearEquipo("PROY-LAB-B-01", "Proyector", "Epson", "PowerLite E20", findUbicacion.apply("Laboratorio B"), "Operativo");
        crearEquipo("SW-LAB-A-01", "Switch", "Cisco", "Catalyst 2960", findUbicacion.apply("Laboratorio A"), "Operativo");
        crearEquipo("PC-LAB-E-01", "PC", "HP", "ProDesk 400 G7", findUbicacion.apply("Laboratorio E"), "Operativo");
        crearEquipo("PC-LAB-F-01", "PC", "Dell", "OptiPlex 5090", findUbicacion.apply("Laboratorio F"), "Operativo");
        crearEquipo("MON-LAB-A-05", "Monitor", "Samsung", "S24R350", findUbicacion.apply("Laboratorio A"), "Operativo");
        crearEquipo("TEC-LAB-A-18", "Teclado", "Logitech", "K120", findUbicacion.apply("Laboratorio A"), "Operativo");
        crearEquipo("PC-LAB-C-04", "PC", "Lenovo", "ThinkCentre M70q", findUbicacion.apply("Laboratorio C"), "Operativo");
        crearEquipo("PC-LAB-B-20", "PC", "Dell", "OptiPlex 5090", findUbicacion.apply("Laboratorio B"), "Operativo");
        crearEquipo("PC-LAB-D-15", "PC", "HP", "ProDesk 400 G7", findUbicacion.apply("Laboratorio D"), "Operativo");

        System.out.println("✅ Equipos de ejemplo cargados");
    }

    private void crearEquipo(String codigo, String tipo, String marca, String modelo, Ubicacion ubicacion, String estado) {
        if (equipoRepository.findByCodigo(codigo).isPresent()) return;
        Equipo e = new Equipo();
        e.setCodigo(codigo);
        e.setTipo(tipo);
        e.setMarca(marca);
        e.setModelo(modelo);
        e.setUbicacion(ubicacion);
        e.setEstado(estado);
        equipoRepository.save(e);
    }

    private void crearIncidenciasSiVacio() {
        if (incidenciaRepository.count() > 0) return;

        var categorias = categoriaRepository.findAll();
        var prioridades = prioridadRepository.findAll();
        var ubicaciones = ubicacionRepository.findAll();
        var equipos = equipoRepository.findAll();

        // Helper functions
        java.util.function.Function<String, Categoria> findCat = (nombre) ->
                categorias.stream().filter(c -> c.getNombre().equals(nombre)).findFirst().orElse(null);
        java.util.function.Function<String, Prioridad> findPri = (nivel) ->
                prioridades.stream().filter(p -> p.getNivel().equals(nivel)).findFirst().orElse(null);
        java.util.function.Function<String, Ubicacion> findUbi = (aula) ->
                ubicaciones.stream().filter(u -> u.getAulaLaboratorio().equals(aula)).findFirst().orElse(null);
        java.util.function.Function<String, Equipo> findEq = (codigo) ->
                equipos.stream().filter(e -> e.getCodigo().equals(codigo)).findFirst().orElse(null);

        // Necesitamos usuarios para las incidencias
        Usuario estudiante = usuarioRepository.findByCorreo("m.garcia@utp.edu.pe").orElse(null);
        Usuario tecHardware = usuarioRepository.findByCorreo("c.mendoza@utp.edu.pe").orElse(null);
        Usuario tecSoftware = usuarioRepository.findByCorreo("l.ramos@utp.edu.pe").orElse(null);
        Usuario admin = usuarioRepository.findByCorreo("admin@universidad.edu.pe").orElse(null);

        if (estudiante == null || tecHardware == null) {
            System.out.println("⚠️ No se crearon incidencias de ejemplo (faltan usuarios)");
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        // INC-001: En atención
        crearIncidencia("INC-001", "Computadora no enciende – Puesto #5",
                "La computadora en el puesto #5 no responde al intentar encenderla. Se escucha un pitido corto al presionar el botón de encendido.",
                "En atención", estudiante, tecHardware,
                findCat.apply("Computadora no enciende"), findPri.apply("Alta"),
                findUbi.apply("Laboratorio A"), findEq.apply("PC-LAB-A-05"), null,
                now.minusDays(3), now.minusDays(2), null);

        // INC-002: Pendiente
        crearIncidencia("INC-002", "Proyector sin señal HDMI – Lab B",
                "El proyector del laboratorio B no recibe señal HDMI desde ninguna computadora. Se probó con diferentes cables.",
                "Pendiente", estudiante, null,
                findCat.apply("Proyector sin señal HDMI"), findPri.apply("Media"),
                findUbi.apply("Laboratorio B"), findEq.apply("PROY-LAB-B-01"), null,
                now.minusDays(2), null, null);

        // INC-003: Resuelta
        crearIncidencia("INC-003", "Sin salida a internet local – Puesto #12",
                "El equipo no tiene acceso a Internet desde el laboratorio. Otros equipos funcionan correctamente.",
                "Resuelta", estudiante, tecHardware,
                findCat.apply("Sin conexión a Internet"), findPri.apply("Alta"),
                findUbi.apply("Laboratorio A"), null,
                "Se reconfiguró la dirección IP estática y se reinició el punto de acceso.",
                now.minusDays(5), now.minusDays(4), now.minusDays(3));

        // INC-004: Cerrada
        crearIncidencia("INC-004", "Monitor parpadea al compilar – Puesto #02",
                "El monitor presenta parpadeo intermitente cuando se ejecutan compilaciones pesadas.",
                "Cerrada", estudiante, tecHardware,
                findCat.apply("Problema con monitor"), findPri.apply("Baja"),
                findUbi.apply("Laboratorio D"), findEq.apply("PC-LAB-D-01"),
                "Se reemplazó el cable HDMI defectuoso y se actualizó el firmware del monitor.",
                now.minusDays(10), now.minusDays(9), now.minusDays(7));

        // INC-005: Asignada
        crearIncidencia("INC-005", "Error de licencia en IDE IntelliJ – Lab C",
                "IntelliJ IDEA muestra error de licencia expirada. No se puede activar con la cuenta institucional.",
                "Asignada", estudiante, tecSoftware,
                findCat.apply("Problema con licencia de software"), findPri.apply("Media"),
                findUbi.apply("Laboratorio C"), findEq.apply("PC-LAB-C-01"), null,
                now.minusDays(1), null, null);

        // INC-006: Cerrada
        crearIncidencia("INC-006", "Teclado con teclas bloqueadas – Puesto #18",
                "Las teclas F1-F5 del teclado no responden. Se limpió con aire comprimido pero no mejoró.",
                "Cerrada", estudiante, tecHardware,
                findCat.apply("Teclado con teclas bloqueadas"), findPri.apply("Baja"),
                findUbi.apply("Laboratorio A"), findEq.apply("TEC-LAB-A-18"),
                "Se reemplazó el teclado por uno nuevo del inventario.",
                now.minusDays(8), now.minusDays(7), now.minusDays(6));

        // INC-007: En atención
        crearIncidencia("INC-007", "Kernel de Python no inicia – Puesto #04",
                "Jupyter Notebook no puede iniciar el kernel de Python. Muestra error de conexión.",
                "En atención", estudiante, tecSoftware,
                findCat.apply("Kernel de Python no inicia"), findPri.apply("Media"),
                findUbi.apply("Laboratorio F"), findEq.apply("PC-LAB-F-01"), null,
                now.minusDays(2), now.minusDays(1), null);

        // INC-008: Asignada
        crearIncidencia("INC-008", "Cable de red con conector roto – Puesto #20",
                "El cable de red del puesto #20 tiene el conector RJ-45 roto. No se puede conectar al switch.",
                "Asignada", estudiante, tecHardware,
                findCat.apply("Cable de red con conector roto"), findPri.apply("Media"),
                findUbi.apply("Laboratorio B"), null, null,
                now.minusDays(1), null, null);

        // INC-009: Pendiente
        crearIncidencia("INC-009", "Base de datos local bloqueada – Puesto #15",
                "MySQL Workbench no puede conectarse a la instancia local. Muestra error \"too many connections\".",
                "Pendiente", estudiante, null,
                findCat.apply("Base de datos local bloqueada"), findPri.apply("Alta"),
                findUbi.apply("Laboratorio D"), findEq.apply("PC-LAB-D-01"), null,
                now.minusHours(6), null, null);

        // INC-010: Resuelta
        crearIncidencia("INC-010", "Ruido estático en altavoces – Puesto #11",
                "Los altavoces del aula producen ruido estático constante incluso sin entrada de audio.",
                "Resuelta", estudiante, tecHardware,
                findCat.apply("Ruido estático en altavoces"), findPri.apply("Baja"),
                findUbi.apply("Laboratorio C"), null,
                "Se reemplazó el cable de audio y se actualizó el driver de sonido.",
                now.minusDays(6), now.minusDays(5), now.minusDays(4));

        System.out.println("✅ Incidencias de ejemplo cargadas");
    }

    private void crearIncidencia(String codigoTicket, String titulo, String descripcion,
                                  String estado, Usuario estudiante, Usuario tecnico,
                                  Categoria categoria, Prioridad prioridad,
                                  Ubicacion ubicacion, Equipo equipo, String solucionTecnica,
                                  LocalDateTime fechaCreacion, LocalDateTime fechaInicio, LocalDateTime fechaCierre) {
        if (incidenciaRepository.existsByCodigoTicket(codigoTicket)) return;
        if (categoria == null || prioridad == null || ubicacion == null) return;

        Incidencia inc = new Incidencia();
        inc.setCodigoTicket(codigoTicket);
        inc.setTitulo(titulo);
        inc.setDescripcion(descripcion);
        inc.setEstado(estado);
        inc.setEstudiante(estudiante);
        inc.setTecnico(tecnico);
        inc.setCategoria(categoria);
        inc.setPrioridad(prioridad);
        inc.setUbicacion(ubicacion);
        inc.setEquipo(equipo);
        inc.setSolucionTecnica(solucionTecnica);
        inc.setFechaCreacion(fechaCreacion);
        inc.setFechaInicioAtencion(fechaInicio);
        inc.setFechaCierre(fechaCierre);
        incidenciaRepository.save(inc);
    }
}
