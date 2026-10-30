package com.proyecto.incidenciasback.repository;

import com.proyecto.incidenciasback.model.Equipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipoRepository extends JpaRepository<Equipo, Integer> {

    Optional<Equipo> findByCodigo(String codigo);

    Optional<Equipo> findByCodigoIgnoreCase(String codigo);

    Optional<Equipo> findByNumeroSerieIgnoreCase(String numeroSerie);

    interface ResumenUbicacion {
        Integer getUbicacionId();

        long getTotal();

        long getComputadoras();
    }

    @org.springframework.data.jpa.repository.Query("select e.ubicacion.id as ubicacionId, count(e) as total, " +
            "sum(case when lower(e.tipo) in ('pc', 'computadora') then 1 else 0 end) as computadoras " +
            "from Equipo e where e.ubicacion is not null group by e.ubicacion.id")
    List<ResumenUbicacion> resumirPorUbicacion();

    List<Equipo> findByUbicacionId(Integer ubicacionId);
}
