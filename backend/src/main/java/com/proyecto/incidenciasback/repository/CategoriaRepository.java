package com.proyecto.incidenciasback.repository;

import com.proyecto.incidenciasback.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
    List<Categoria> findByEspecialidadId(Integer especialidadId);
    Optional<Categoria> findByNombreIgnoreCase(String nombre);
}
