package com.proyecto.incidenciasback.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "historial_equipos")
@Getter
@Setter
public class HistorialEquipo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(optional = false) @JoinColumn(name = "equipo_id")
    private Equipo equipo;
    @ManyToOne(optional = false) @JoinColumn(name = "usuario_id")
    private Usuario usuario;
    @Column(nullable = false, length = 20)
    private String estadoAnterior;
    @Column(nullable = false, length = 20)
    private String estadoNuevo;
    @Column(nullable = false, length = 500)
    private String motivo;
    @Column(nullable = false)
    private LocalDateTime fecha;
}
