package com.proyecto.incidenciasback.repository;

import com.proyecto.incidenciasback.model.SolicitudReasignacion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudReasignacionRepository extends JpaRepository<SolicitudReasignacion, Integer> {

    @EntityGraph(attributePaths = {"incidencia", "tecnicoSolicitante", "revisadoPor", "tecnicoNuevo"})
    List<SolicitudReasignacion> findByIncidenciaIdOrderByFechaSolicitudDesc(Integer incidenciaId);

    @EntityGraph(attributePaths = {"incidencia", "tecnicoSolicitante", "revisadoPor", "tecnicoNuevo"})
    List<SolicitudReasignacion> findByEstadoOrderByFechaSolicitudAsc(String estado);

    @EntityGraph(attributePaths = {"incidencia", "tecnicoSolicitante", "revisadoPor", "tecnicoNuevo"})
    List<SolicitudReasignacion> findByTecnicoSolicitanteIdOrderByFechaSolicitudDesc(Integer tecnicoId);

    boolean existsByIncidenciaIdAndTecnicoSolicitanteIdAndEstado(Integer incidenciaId, Integer tecnicoId, String estado);
}
