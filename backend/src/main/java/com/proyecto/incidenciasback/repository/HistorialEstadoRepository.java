package com.proyecto.incidenciasback.repository;

import com.proyecto.incidenciasback.model.HistorialEstado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialEstadoRepository extends JpaRepository<HistorialEstado, Integer> {

    @Query("SELECT h FROM HistorialEstado h LEFT JOIN FETCH h.incidencia LEFT JOIN FETCH h.usuario LEFT JOIN FETCH h.tecnicoAnterior LEFT JOIN FETCH h.tecnicoNuevo ORDER BY h.fechaCambio DESC")
    List<HistorialEstado> findAllConRelaciones();

    List<HistorialEstado> findByIncidenciaIdOrderByFechaCambioAsc(Integer incidenciaId);

    List<HistorialEstado> findByTipoAccionOrderByFechaCambioDesc(String tipoAccion);

    List<HistorialEstado> findByTipoAccionOrderByFechaCambioAsc(String tipoAccion);
}
