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
        crearUsuarioSiNoExiste("Admin", "Sistema", "admin@universidad.edu.pe", "admin123", "ADMIN", null);

        // Técnicos con especialidades
        crearUsuarioSiNoExiste("Carlos", "Mendoza", "tecnico.hw@universidad.edu.pe", "tecnico123", "TECNICO", "Hardware");
        crearUsuarioSiNoExiste("Laura", "Ríos", "tecnico.redes@universidad.edu.pe", "tecnico123", "TECNICO", "Redes");
        crearUsuarioSiNoExiste("Diego", "Vargas", "tecnico.sw@universidad.edu.pe", "tecnico123", "TECNICO", "Software");

        // Estudiante de prueba
        crearUsuarioSiNoExiste("Alumno", "Prueba", "alumno@universidad.edu.pe", "alumno123", "ESTUDIANTE", null);
    }

    private void crearUsuarioSiNoExiste(String nombre, String apellido, String correo,
                                        String password, String nombreRol, String nombreEspecialidad) {
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
