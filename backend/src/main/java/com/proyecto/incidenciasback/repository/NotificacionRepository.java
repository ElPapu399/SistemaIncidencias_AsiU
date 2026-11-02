package com.proyecto.incidenciasback.repository;

import com.proyecto.incidenciasback.model.Notificacion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Integer> {

    @EntityGraph(attributePaths = {"incidencia"})
    List<Notificacion> findTop30ByUsuarioIdOrderByFechaCreacionDesc(Integer usuarioId);

    @EntityGraph(attributePaths = {"incidencia"})
    Optional<Notificacion> findByIdAndUsuarioId(Integer id, Integer usuarioId);

    long countByUsuarioIdAndLeidaFalse(Integer usuarioId);

    @Modifying
    @Query("UPDATE Notificacion n SET n.leida = true WHERE n.id = :id AND n.usuario.id = :usuarioId")
    int marcarComoLeida(@Param("id") Integer id, @Param("usuarioId") Integer usuarioId);

    @Modifying
    @Query("UPDATE Notificacion n SET n.leida = true WHERE n.usuario.id = :usuarioId AND n.leida = false")
    int marcarTodasComoLeidas(@Param("usuarioId") Integer usuarioId);
}

