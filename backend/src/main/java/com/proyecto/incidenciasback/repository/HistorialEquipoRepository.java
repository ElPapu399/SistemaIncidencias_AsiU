package com.proyecto.incidenciasback.repository;

import com.proyecto.incidenciasback.model.HistorialEquipo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HistorialEquipoRepository extends JpaRepository<HistorialEquipo, Integer> {
    List<HistorialEquipo> findByEquipoUbicacionIdOrderByFechaDesc(Integer ubicacionId);
    List<HistorialEquipo> findByEquipoIdOrderByFechaDesc(Integer equipoId);
}
