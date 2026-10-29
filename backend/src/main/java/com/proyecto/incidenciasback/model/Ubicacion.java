package com.proyecto.incidenciasback.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "ubicaciones")
@Getter
@Setter
public class Ubicacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 50)
    private String pabellon;

    @Column(name = "aula_laboratorio", nullable = false, length = 50)
    private String aulaLaboratorio;

    @Column(nullable = false)
    private Integer piso;

    @Column(nullable = false, length = 30)
    private String tipo;

    private Integer capacidad;

    @Column(length = 20)
    private String estado;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "encargado_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Usuario encargado;
}
