package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.UsuarioRequest;
import com.proyecto.incidenciasback.dto.UsuarioResponse;
import com.proyecto.incidenciasback.dto.UsuarioUpdateRequest;
import com.proyecto.incidenciasback.model.Especialidad;
import com.proyecto.incidenciasback.model.Rol;
import com.proyecto.incidenciasback.model.Usuario;
import com.proyecto.incidenciasback.repository.EspecialidadRepository;
import com.proyecto.incidenciasback.repository.RolRepository;
import com.proyecto.incidenciasback.repository.UsuarioRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final EspecialidadRepository especialidadRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            EspecialidadRepository especialidadRepository,
            BCryptPasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.especialidadRepository = especialidadRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public UsuarioResponse obtenerPorId(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
        return toResponse(usuario);
    }

    public UsuarioResponse crearUsuario(UsuarioRequest request) {
        // Validar que el correo no exista
        if (usuarioRepository.findByCorreo(request.getCorreo()).isPresent()) {
            throw new RuntimeException("Ya existe un usuario con el correo: " + request.getCorreo());
        }

        Rol rol = rolRepository.findById(request.getRolId())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con id: " + request.getRolId()));

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());
        usuario.setCorreo(request.getCorreo());
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        usuario.setRol(rol);

        if (request.getEspecialidadId() != null) {
            Especialidad especialidad = especialidadRepository.findById(request.getEspecialidadId())
                    .orElseThrow(() -> new RuntimeException(
                            "Especialidad no encontrada con id: " + request.getEspecialidadId()));
            usuario.setEspecialidad(especialidad);
        }

        usuarioRepository.save(usuario);
        return toResponse(usuario);
    }

    public UsuarioResponse actualizarUsuario(Integer id, UsuarioUpdateRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));

        // Validar que el correo no esté usado por otro usuario
        usuarioRepository.findByCorreo(request.getCorreo()).ifPresent(existente -> {
            if (!existente.getId().equals(id)) {
                throw new RuntimeException("Ya existe otro usuario con el correo: " + request.getCorreo());
            }
        });

        Rol rol = rolRepository.findById(request.getRolId())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con id: " + request.getRolId()));

        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());
        usuario.setCorreo(request.getCorreo());
        usuario.setRol(rol);

        if (request.getEspecialidadId() != null) {
            Especialidad especialidad = especialidadRepository.findById(request.getEspecialidadId())
                    .orElseThrow(() -> new RuntimeException(
                            "Especialidad no encontrada con id: " + request.getEspecialidadId()));
            usuario.setEspecialidad(especialidad);
        } else {
            usuario.setEspecialidad(null);
        }

        usuarioRepository.save(usuario);
        return toResponse(usuario);
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCorreo(),
                usuario.getRol().getNombre(),
                usuario.getEspecialidad() != null ? usuario.getEspecialidad().getNombre() : null,
                usuario.getFechaCreacion());
    }
}
