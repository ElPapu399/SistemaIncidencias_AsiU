package com.proyecto.incidenciasback.config;

import com.proyecto.incidenciasback.model.Rol;
import com.proyecto.incidenciasback.model.Usuario;
import com.proyecto.incidenciasback.repository.RolRepository;
import com.proyecto.incidenciasback.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataLoader(UsuarioRepository usuarioRepository,
                      RolRepository rolRepository,
                      BCryptPasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        crearUsuarioSiNoExiste("Admin",   "Sistema", "admin@universidad.edu.pe",   "admin123",   "ADMIN");
        crearUsuarioSiNoExiste("Técnico", "Soporte", "tecnico@universidad.edu.pe", "tecnico123", "TECNICO");
        crearUsuarioSiNoExiste("Alumno",  "Prueba",  "alumno@universidad.edu.pe",  "alumno123",  "ESTUDIANTE");
    }

    private void crearUsuarioSiNoExiste(String nombre, String apellido, String correo,
                                        String password, String nombreRol) {
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

        usuarioRepository.save(usuario);
        System.out.println("✅ Usuario creado: " + correo + " / " + password + " [" + nombreRol + "]");
    }
}
