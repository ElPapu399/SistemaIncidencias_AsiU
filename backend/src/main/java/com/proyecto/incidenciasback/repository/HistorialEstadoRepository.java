package com.proyecto.incidenciasback.repository;

import com.proyecto.incidenciasback.model.HistorialEstado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialEstadoRepository extends JpaRepository<HistorialEstado, Integer> {

    List<HistorialEstado> findByIncidenciaIdOrderByFechaCambioAsc(Integer incidenciaId);
}
