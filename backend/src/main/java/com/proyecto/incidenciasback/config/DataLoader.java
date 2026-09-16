package com.proyecto.incidenciasback.config;

import com.proyecto.incidenciasback.model.Especialidad;
import com.proyecto.incidenciasback.model.Rol;
import com.proyecto.incidenciasback.model.Usuario;
import com.proyecto.incidenciasback.repository.EspecialidadRepository;
import com.proyecto.incidenciasback.repository.RolRepository;
import com.proyecto.incidenciasback.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final EspecialidadRepository especialidadRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataLoader(UsuarioRepository usuarioRepository,
                      RolRepository rolRepository,
                      EspecialidadRepository especialidadRepository,
                      BCryptPasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.especialidadRepository = especialidadRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Admin
        crearUsuarioSiNoExiste("Ana", "Rodríguez", "admin@universidad.edu.pe", "admin123", "ADMIN", null, "987-000-000", null, "Activo");

        // Técnicos con especialidades (coincidentes con prototipo)
        crearUsuarioSiNoExiste("Carlos", "Mendoza", "c.mendoza@utp.edu.pe", "tecnico123", "TECNICO", "Hardware", "987-111-222", null, "Activo");
        crearUsuarioSiNoExiste("Pedro", "Sánchez", "p.sanchez@utp.edu.pe", "tecnico123", "TECNICO", "Redes", "987-333-789", null, "Activo");
        crearUsuarioSiNoExiste("Lucía", "Ramos", "l.ramos@utp.edu.pe", "tecnico123", "TECNICO", "Software", "987-444-100", null, "Activo");
        crearUsuarioSiNoExiste("Marcos", "Vega", "m.vega@utp.edu.pe", "tecnico123", "TECNICO", "Audiovisual", "987-555-200", null, "Activo");
        crearUsuarioSiNoExiste("Rosa", "Flores", "r.flores@utp.edu.pe", "tecnico123", "TECNICO", null, "987-666-321", null, "Activo");

        // Estudiantes (coincidentes con prototipo)
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
    }

    private void crearUsuarioSiNoExiste(String nombre, String apellido, String correo,
                                        String password, String nombreRol, String nombreEspecialidad,
                                        String telefono, String carrera, String estado) {
        if (usuarioRepository.findByCorreo(correo).isPresent()) {
            return; // Ya existe, no hacer nada
        }

        Rol rol = rolRepository.findByNombre(nombreRol)
                .orElseThrow(() -> new RuntimeException(
                        "Rol '" + nombreRol + "' no encontrado. Verifica que init.sql fue ejecutado."));

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
}
