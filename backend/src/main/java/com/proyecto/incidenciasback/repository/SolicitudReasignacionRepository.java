package com.proyecto.incidenciasback.repository;

import com.proyecto.incidenciasback.model.SolicitudReasignacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudReasignacionRepository extends JpaRepository<SolicitudReasignacion, Integer> {

    /** Solicitudes de una incidencia específica, ordenadas por fecha */
    List<SolicitudReasignacion> findByIncidenciaIdOrderByFechaSolicitudDesc(Integer incidenciaId);

    /** Solicitudes pendientes (para que el admin las revise) */
    List<SolicitudReasignacion> findByEstadoOrderByFechaSolicitudAsc(String estado);

    /** Solicitudes hechas por un técnico específico */
    List<SolicitudReasignacion> findByTecnicoSolicitanteIdOrderByFechaSolicitudDesc(Integer tecnicoId);

    /** Verificar si ya existe una solicitud pendiente para esa incidencia y técnico */
    boolean existsByIncidenciaIdAndTecnicoSolicitanteIdAndEstado(Integer incidenciaId, Integer tecnicoId, String estado);
}
