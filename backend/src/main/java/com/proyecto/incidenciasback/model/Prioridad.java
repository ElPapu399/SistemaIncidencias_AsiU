package com.proyecto.incidenciasback.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "prioridades")
@Getter
@Setter
public class Prioridad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 20)
    private String nivel;

    @Column(name = "tiempo_maximo_horas", nullable = false)
    private Integer tiempoMaximoHoras;

    @Column(length = 150)
    private String descripcion;
}