package com.proyecto.incidenciasback.repository;

import com.proyecto.incidenciasback.model.Ubicacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UbicacionRepository extends JpaRepository<Ubicacion, Integer> {
    java.util.List<Ubicacion> findByTipoIgnoreCaseOrderByIdAsc(String tipo);
    boolean existsByPabellonIgnoreCaseAndAulaLaboratorioIgnoreCaseAndPisoAndIdNot(
            String pabellon, String aulaLaboratorio, Integer piso, Integer id);
}
