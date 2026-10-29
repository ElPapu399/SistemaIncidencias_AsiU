package com.proyecto.incidenciasback.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "equipos")
@Getter
@Setter
public class Equipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @Column(nullable = false, length = 50)
    private String tipo;

    @Column(length = 100)
    private String marca;

    @Column(length = 100)
    private String modelo;

    @Column(name = "numero_serie", unique = true, length = 100)
    private String numeroSerie;

    @Column(name = "fecha_adquisicion")
    private LocalDate fechaAdquisicion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ubicacion_id")
    private Ubicacion ubicacion;

    @Column(nullable = false, length = 20)
    private String estado;
}
