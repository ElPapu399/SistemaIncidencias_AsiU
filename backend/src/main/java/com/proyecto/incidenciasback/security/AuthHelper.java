package com.proyecto.incidenciasback.security;

import com.proyecto.incidenciasback.model.Usuario;
import com.proyecto.incidenciasback.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Componente utilitario para obtener el usuario autenticado desde el SecurityContext.
 */
@Component
public class AuthHelper {

    private final UsuarioRepository usuarioRepository;

    public AuthHelper(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Obtiene el usuario autenticado actual desde el SecurityContext.
     */
    public Usuario obtenerUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !auth.getName().equals("anonymousUser")) {
            return usuarioRepository.findByCorreo(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado: " + auth.getName()));
        }
        throw new RuntimeException("No se pudo determinar el usuario autenticado");
    }
}
