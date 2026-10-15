package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.PerfilRequest;
import com.proyecto.incidenciasback.dto.PerfilResponse;
import com.proyecto.incidenciasback.model.Usuario;
import com.proyecto.incidenciasback.repository.UsuarioRepository;
import com.proyecto.incidenciasback.security.AuthHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PerfilService {
    private final AuthHelper authHelper;
    private final UsuarioRepository usuarios;

    public PerfilService(AuthHelper authHelper, UsuarioRepository usuarios) {
        this.authHelper = authHelper;
        this.usuarios = usuarios;
    }

    @Transactional(readOnly = true)
    public PerfilResponse obtener() {
        return respuesta(authHelper.obtenerUsuarioAutenticado());
    }

    @Transactional
    public PerfilResponse actualizar(PerfilRequest request) {
        // La identidad viene del JWT, nunca de un ID enviado por el navegador.
        Usuario usuario = authHelper.obtenerUsuarioAutenticado();
        String nombre = request.nombre().trim();
        String apellido = request.apellido().trim();
        if (nombre.isBlank() || apellido.isBlank()) {
            throw new IllegalArgumentException("El nombre y el apellido son obligatorios");
        }
        usuario.setNombre(nombre);
        usuario.setApellido(apellido);
        usuario.setTelefono(textoOpcional(request.telefono()));
        if (usuario.getRol() != null && "ESTUDIANTE".equals(usuario.getRol().getNombre())) {
            usuario.setCarrera(textoOpcional(request.carrera()));
        }
        // Correo, rol, estado, especialidad y contraseña conservan sus valores.
        return respuesta(usuarios.save(usuario));
    }

    private String textoOpcional(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }

    private PerfilResponse respuesta(Usuario usuario) {
        return new PerfilResponse(usuario.getId(), usuario.getNombre(), usuario.getApellido(), usuario.getCorreo(),
                usuario.getRol() != null ? usuario.getRol().getNombre() : null,
                usuario.getTelefono(), usuario.getCarrera(),
                usuario.getEspecialidad() != null ? usuario.getEspecialidad().getNombre() : null);
    }
}
