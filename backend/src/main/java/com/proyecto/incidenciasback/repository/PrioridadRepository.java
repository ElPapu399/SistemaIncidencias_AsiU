package com.proyecto.incidenciasback.repository;

import com.proyecto.incidenciasback.model.Prioridad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrioridadRepository extends JpaRepository<Prioridad, Integer> {
}
