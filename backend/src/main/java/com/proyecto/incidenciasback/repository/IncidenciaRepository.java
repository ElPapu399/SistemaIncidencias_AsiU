package com.proyecto.incidenciasback.repository;

import com.proyecto.incidenciasback.model.Incidencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidenciaRepository extends JpaRepository<Incidencia, Integer> {

    List<Incidencia> findByEstudianteId(Integer estudianteId);

    List<Incidencia> findByTecnicoId(Integer tecnicoId);

    long countByTecnicoIdAndEstadoIn(Integer tecnicoId, List<String> estados);
}