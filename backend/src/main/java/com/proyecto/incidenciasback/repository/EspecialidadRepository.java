package com.proyecto.incidenciasback.repository;

import com.proyecto.incidenciasback.model.Especialidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EspecialidadRepository extends JpaRepository<Especialidad, Integer> {
    Optional<Especialidad> findByNombre(String nombre);
}
