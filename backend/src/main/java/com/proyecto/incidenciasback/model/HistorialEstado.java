package com.proyecto.incidenciasback.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "historial_estados")
@Getter
@Setter
public class HistorialEstado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incidencia_id", nullable = false)
    private Incidencia incidencia;

    @Column(name = "estado_anterior", nullable = false, length = 20)
    private String estadoAnterior;

    @Column(name = "estado_nuevo", nullable = false, length = 20)
    private String estadoNuevo;

    /** Tipo de acción: CREACION, CAMBIO_ESTADO, ASIGNACION, REASIGNACION, SOLICITUD_REASIGNACION */
    @Column(name = "tipo_accion", nullable = false, length = 30)
    private String tipoAccion = "CAMBIO_ESTADO";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(length = 500)
    private String comentario;

    /** Técnico anterior (solo para REASIGNACION) */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tecnico_anterior_id")
    private Usuario tecnicoAnterior;

    /** Técnico nuevo (para ASIGNACION y REASIGNACION) */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tecnico_nuevo_id")
    private Usuario tecnicoNuevo;

    @Column(name = "fecha_cambio")
    private LocalDateTime fechaCambio;

    @PrePersist
    public void prePersist() {
        if (fechaCambio == null) {
            fechaCambio = LocalDateTime.now();
        }
    }
}

