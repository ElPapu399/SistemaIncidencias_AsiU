package com.proyecto.incidenciasback.config;

import com.proyecto.incidenciasback.model.*;
import com.proyecto.incidenciasback.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final EspecialidadRepository especialidadRepository;
    private final PrioridadRepository prioridadRepository;
    private final UbicacionRepository ubicacionRepository;
    private final CategoriaRepository categoriaRepository;
    private final EquipoRepository equipoRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataLoader(UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            EspecialidadRepository especialidadRepository,
            PrioridadRepository prioridadRepository,
            UbicacionRepository ubicacionRepository,
            CategoriaRepository categoriaRepository,
            EquipoRepository equipoRepository,
            BCryptPasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.especialidadRepository = especialidadRepository;
        this.prioridadRepository = prioridadRepository;
        this.ubicacionRepository = ubicacionRepository;
        this.categoriaRepository = categoriaRepository;
        this.equipoRepository = equipoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        obtenerOCrearRol("ADMIN");
        obtenerOCrearRol("ESTUDIANTE");
        obtenerOCrearRol("TECNICO");
        obtenerOCrearRol("TECNICO_GENERAL");
        obtenerOCrearRol("TECNICO_ESPECIALISTA");

        boolean inicializarCatalogos = especialidadRepository.count() == 0 && categoriaRepository.count() == 0;
        if (inicializarCatalogos) {
            crearEspecialidadSiNoExiste("Hardware", "Problemas físicos: equipos, periféricos, impresoras");
            crearEspecialidadSiNoExiste("Redes", "Conectividad, Wi-Fi, switches, puntos de acceso");
            crearEspecialidadSiNoExiste("Software", "Sistemas operativos, aplicaciones, licencias");
            crearEspecialidadSiNoExiste("Audiovisual", "Proyectores, pantallas, audio");
        }

        crearPrioridadSiNoExiste("Alta", 4, "Afecta a múltiples usuarios o servicios críticos");
        crearPrioridadSiNoExiste("Media", 24, "Afecta a un usuario, tiene solución temporal");
        crearPrioridadSiNoExiste("Baja", 72, "Inconveniente menor, no bloquea el trabajo");

        crearUbicacionSiNoExiste("Pabellón A", "Laboratorio A", 1, "Laboratorio");
        crearUbicacionSiNoExiste("Pabellón A", "Laboratorio B", 1, "Laboratorio");
        crearUbicacionSiNoExiste("Pabellón B", "Laboratorio C", 1, "Laboratorio");
        crearUbicacionSiNoExiste("Pabellón B", "Laboratorio D", 2, "Laboratorio");
        crearUbicacionSiNoExiste("Pabellón C", "Laboratorio E", 1, "Laboratorio");
        crearUbicacionSiNoExiste("Pabellón C", "Laboratorio F", 2, "Laboratorio");
        crearUbicacionSiNoExiste("Pabellón D", "Aula 301", 3, "Aula");
        crearUbicacionSiNoExiste("Pabellón D", "Auditorio", 1, "Auditorio");

        if (inicializarCatalogos) {
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
        }

        crearUsuarioSiNoExiste("Ana", "Rodríguez", "admin@utp.edu.pe", "admin123", "ADMIN", null, "987-000-000", null,
                "Activo");

        crearUsuarioSiNoExiste("Rosa", "Flores", "r.flores@utp.edu.pe", "tecnico123", "TECNICO_GENERAL", null,
                "987-666-321", null, "Activo");
        crearUsuarioSiNoExiste("Jorge", "Herrera", "j.herrera@utp.edu.pe", "tecnico123", "TECNICO_GENERAL", null,
                "987-777-888", null, "Activo");

        crearUsuarioSiNoExiste("Carlos", "Mendoza", "c.mendoza@utp.edu.pe", "tecnico123", "TECNICO_ESPECIALISTA",
                "Hardware", "987-111-222", null, "Activo");
        crearUsuarioSiNoExiste("Pedro", "Sánchez", "p.sanchez@utp.edu.pe", "tecnico123", "TECNICO_ESPECIALISTA",
                "Redes", "987-333-789", null, "Activo");
        crearUsuarioSiNoExiste("Lucía", "Ramos", "l.ramos@utp.edu.pe", "tecnico123", "TECNICO_ESPECIALISTA", "Software",
                "987-444-100", null, "Activo");
        crearUsuarioSiNoExiste("Marcos", "Vega", "m.vega@utp.edu.pe", "tecnico123", "TECNICO_ESPECIALISTA",
                "Audiovisual", "987-555-200", null, "Activo");

        crearUsuarioSiNoExiste("María", "García", "m.garcia@utp.edu.pe", "alumno123", "ESTUDIANTE", null, "987-654-321",
                "Ingeniería de Sistemas", "Activo");
        crearUsuarioSiNoExiste("Luis", "Torres", "l.torres@utp.edu.pe", "alumno123", "ESTUDIANTE", null, "987-555-123",
                "Ciencias de la Computación", "Activo");
        crearUsuarioSiNoExiste("Sofía", "Quispe", "s.quispe@utp.edu.pe", "alumno123", "ESTUDIANTE", null, "987-444-789",
                "Ingeniería de Sistemas", "Activo");
        crearUsuarioSiNoExiste("Diego", "Vargas", "d.vargas@utp.edu.pe", "alumno123", "ESTUDIANTE", null, "987-222-456",
                "Ing. de Software", "Activo");
        crearUsuarioSiNoExiste("Patricia", "Luna", "p.luna@utp.edu.pe", "alumno123", "ESTUDIANTE", null, "987-777-321",
                "Ciencias de la Computación", "Activo");
        crearUsuarioSiNoExiste("Andrés", "Huanca", "a.huanca@utp.edu.pe", "alumno123", "ESTUDIANTE", null,
                "987-888-112", "Ing. de Software", "Activo");
        crearUsuarioSiNoExiste("Camila", "Vásquez", "c.vasquez@utp.edu.pe", "alumno123", "ESTUDIANTE", null,
                "987-121-313", "Ingeniería de Sistemas", "Activo");
        crearUsuarioSiNoExiste("Mateo", "Morales", "m.morales@utp.edu.pe", "alumno123", "ESTUDIANTE", null,
                "987-333-214", "Ing. de Software", "Activo");
        crearUsuarioSiNoExiste("Valeria", "Rojas", "v.rojas@utp.edu.pe", "alumno123", "ESTUDIANTE", null, "987-441-890",
                "Ciencias de la Computación", "Activo");
        crearUsuarioSiNoExiste("Rodrigo", "Castillo", "r.castillo@utp.edu.pe", "alumno123", "ESTUDIANTE", null,
                "987-990-112", "Ingeniería de Sistemas", "Activo");

        crearEquiposSiVacio();
    }

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
            if (existente.getRol() != null && !nombreRol.equals(existente.getRol().getNombre())) {
                Rol rol = obtenerOCrearRol(nombreRol);
                existente.setRol(rol);
                if (nombreEspecialidad != null) {
                    especialidadRepository.findByNombre(nombreEspecialidad).ifPresent(existente::setEspecialidad);
                }
                usuarioRepository.save(existente);
                System.out.println("🔄 Rol actualizado para: " + correo + " -> " + nombreRol);
            }
            return;
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
        if (equipoRepository.count() > 0)
            return;

        var ubicaciones = ubicacionRepository.findAll();
        if (ubicaciones.isEmpty())
            return;

        java.util.function.Function<String, Ubicacion> findUbicacion = (aula) -> ubicaciones.stream()
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
        crearEquipo("PC-LAB-C-01", "PC", "Lenovo", "ThinkCentre M70q", findUbicacion.apply("Laboratorio C"),
                "Operativo");
        crearEquipo("PC-LAB-C-02", "PC", "Lenovo", "ThinkCentre M70q", findUbicacion.apply("Laboratorio C"),
                "Operativo");
        crearEquipo("PC-LAB-D-01", "PC", "HP", "ProDesk 400 G7", findUbicacion.apply("Laboratorio D"), "Operativo");
        crearEquipo("IMP-LAB-A-01", "Impresora", "HP", "LaserJet Pro M404dn", findUbicacion.apply("Laboratorio A"),
                "Operativo");
        crearEquipo("PROY-LAB-B-01", "Proyector", "Epson", "PowerLite E20", findUbicacion.apply("Laboratorio B"),
                "Operativo");
        crearEquipo("SW-LAB-A-01", "Switch", "Cisco", "Catalyst 2960", findUbicacion.apply("Laboratorio A"),
                "Operativo");
        crearEquipo("PC-LAB-E-01", "PC", "HP", "ProDesk 400 G7", findUbicacion.apply("Laboratorio E"), "Operativo");
        crearEquipo("PC-LAB-F-01", "PC", "Dell", "OptiPlex 5090", findUbicacion.apply("Laboratorio F"), "Operativo");
        crearEquipo("MON-LAB-A-05", "Monitor", "Samsung", "S24R350", findUbicacion.apply("Laboratorio A"), "Operativo");
        crearEquipo("TEC-LAB-A-18", "Teclado", "Logitech", "K120", findUbicacion.apply("Laboratorio A"), "Operativo");
        crearEquipo("PC-LAB-C-04", "PC", "Lenovo", "ThinkCentre M70q", findUbicacion.apply("Laboratorio C"),
                "Operativo");
        crearEquipo("PC-LAB-B-20", "PC", "Dell", "OptiPlex 5090", findUbicacion.apply("Laboratorio B"), "Operativo");
        crearEquipo("PC-LAB-D-15", "PC", "HP", "ProDesk 400 G7", findUbicacion.apply("Laboratorio D"), "Operativo");

        System.out.println("✅ Equipos de ejemplo cargados");
    }

    private void crearEquipo(String codigo, String tipo, String marca, String modelo, Ubicacion ubicacion,
            String estado) {
        if (equipoRepository.findByCodigo(codigo).isPresent())
            return;
        Equipo e = new Equipo();
        e.setCodigo(codigo);
        e.setTipo(tipo);
        e.setMarca(marca);
        e.setModelo(modelo);
        e.setUbicacion(ubicacion);
        e.setEstado(estado);
        equipoRepository.save(e);
    }
}
