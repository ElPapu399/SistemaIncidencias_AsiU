package com.proyecto.incidenciasback.repository;

import com.proyecto.incidenciasback.model.Incidencia;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IncidenciaRepository extends JpaRepository<Incidencia, Integer> {

    @EntityGraph(attributePaths = {"estudiante", "tecnico", "categoria", "categoria.especialidad", "prioridad", "ubicacion", "equipo"})
    List<Incidencia> findAll();

    @EntityGraph(attributePaths = {"estudiante", "tecnico", "categoria", "categoria.especialidad", "prioridad", "ubicacion", "equipo"})
    List<Incidencia> findByEstudianteId(Integer estudianteId);

    @EntityGraph(attributePaths = {"estudiante", "tecnico", "categoria", "categoria.especialidad", "prioridad", "ubicacion", "equipo"})
    List<Incidencia> findByTecnicoId(Integer tecnicoId);

    @EntityGraph(attributePaths = {"estudiante", "tecnico", "categoria", "categoria.especialidad", "prioridad", "ubicacion", "equipo"})
    Optional<Incidencia> findById(Integer id);

    boolean existsByCodigoTicket(String codigoTicket);

    long countByTecnicoIdAndEstadoIn(Integer tecnicoId, List<String> estados);
}