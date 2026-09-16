package com.proyecto.incidenciasback.repository;

import com.proyecto.incidenciasback.model.Equipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipoRepository extends JpaRepository<Equipo, Integer> {

    Optional<Equipo> findByCodigo(String codigo);

    List<Equipo> findByUbicacionId(Integer ubicacionId);

    List<Equipo> findByEstado(String estado);
}
