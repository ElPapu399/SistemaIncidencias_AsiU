package com.proyecto.incidenciasback.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudes_reasignacion")
@Getter
@Setter
public class SolicitudReasignacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "incidencia_id", nullable = false)
    private Incidencia incidencia;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tecnico_solicitante_id", nullable = false)
    private Usuario tecnicoSolicitante;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String motivo;

    @Column(nullable = false, length = 20)
    private String estado = "PENDIENTE";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "revisado_por_id")
    private Usuario revisadoPor;

    @Column(name = "comentario_respuesta", length = 500)
    private String comentarioRespuesta;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tecnico_nuevo_id")
    private Usuario tecnicoNuevo;

    @Column(name = "fecha_solicitud")
    private LocalDateTime fechaSolicitud;

    @Column(name = "fecha_respuesta")
    private LocalDateTime fechaRespuesta;

    @PrePersist
    public void prePersist() {
        if (fechaSolicitud == null) {
            fechaSolicitud = LocalDateTime.now();
        }
    }
}
