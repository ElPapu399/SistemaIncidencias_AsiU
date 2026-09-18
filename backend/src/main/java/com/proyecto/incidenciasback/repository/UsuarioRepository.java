package com.proyecto.incidenciasback.repository;

import com.proyecto.incidenciasback.model.Usuario;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    @EntityGraph(attributePaths = {"rol", "especialidad"})
    Optional<Usuario> findByCorreo(String correo);

    @EntityGraph(attributePaths = {"rol", "especialidad"})
    List<Usuario> findAll();

    @EntityGraph(attributePaths = {"rol", "especialidad"})
    List<Usuario> findByRolNombreAndEspecialidadId(String rolNombre, Integer especialidadId);

    @EntityGraph(attributePaths = {"rol", "especialidad"})
    List<Usuario> findByRolNombreInAndEspecialidadId(List<String> roles, Integer especialidadId);

    @EntityGraph(attributePaths = {"rol", "especialidad"})
    List<Usuario> findByRolNombre(String rolNombre);

    @EntityGraph(attributePaths = {"rol", "especialidad"})
    List<Usuario> findByRolNombreIn(List<String> roles);
}
