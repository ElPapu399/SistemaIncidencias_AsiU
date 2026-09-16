package com.proyecto.incidenciasback.repository;

import com.proyecto.incidenciasback.model.ArchivoAdjunto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArchivoAdjuntoRepository extends JpaRepository<ArchivoAdjunto, Integer> {

    List<ArchivoAdjunto> findByIncidenciaIdOrderByFechaSubidaDesc(Integer incidenciaId);
}
