package com.proyecto.incidenciasback.repository;

import com.proyecto.incidenciasback.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByCorreo(String correo);

    List<Usuario> findByRolNombreAndEspecialidadId(String rolNombre, Integer especialidadId);

    List<Usuario> findByRolNombre(String rolNombre);
}
