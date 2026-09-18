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
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarPorRol(String rolNombre) {
        String upperRol = rolNombre.toUpperCase();
        List<Usuario> usuarios;
        if ("TECNICO".equals(upperRol)) {
            usuarios = usuarioRepository.findByRolNombreIn(List.of("TECNICO", "TECNICO_GENERAL", "TECNICO_ESPECIALISTA"));
        } else {
            usuarios = usuarioRepository.findByRolNombre(upperRol);
        }

        return usuarios.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtenerPorId(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
        return toResponse(usuario);
    }

    @Transactional
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
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword() != null ? request.getPassword() : "123456"));
        usuario.setRol(rol);
        usuario.setTelefono(request.getTelefono());
        usuario.setCarrera(request.getCarrera());
        usuario.setEstado(request.getEstado() != null ? request.getEstado() : "Activo");

        if (request.getEspecialidadId() != null) {
            Especialidad especialidad = especialidadRepository.findById(request.getEspecialidadId())
                    .orElseThrow(() -> new RuntimeException(
                            "Especialidad no encontrada con id: " + request.getEspecialidadId()));
            usuario.setEspecialidad(especialidad);
        }

        usuarioRepository.save(usuario);
        return toResponse(usuario);
    }

    @Transactional
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
        usuario.setTelefono(request.getTelefono());
        usuario.setCarrera(request.getCarrera());
        if (request.getEstado() != null) {
            usuario.setEstado(request.getEstado());
        }

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

    @Transactional
    public void eliminarUsuario(Integer id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuario no encontrado con id: " + id);
        }
        usuarioRepository.deleteById(id);
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCorreo(),
                usuario.getRol() != null ? usuario.getRol().getId() : null,
                usuario.getRol() != null ? usuario.getRol().getNombre() : null,
                usuario.getEspecialidad() != null ? usuario.getEspecialidad().getId() : null,
                usuario.getEspecialidad() != null ? usuario.getEspecialidad().getNombre() : null,
                usuario.getTelefono(),
                usuario.getCarrera(),
                usuario.getEstado() != null ? usuario.getEstado() : "Activo",
                usuario.getFechaCreacion());
    }
}
