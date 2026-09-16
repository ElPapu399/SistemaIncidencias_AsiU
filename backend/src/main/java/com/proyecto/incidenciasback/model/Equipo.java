package com.proyecto.incidenciasback.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "equipos")
@Getter
@Setter
public class Equipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String codigo; // Ej: PC-LAB-A-05

    @Column(nullable = false, length = 50)
    private String tipo; // 'PC', 'Impresora', 'Proyector', 'Switch', etc.

    @Column(length = 100)
    private String marca;

    @Column(length = 100)
    private String modelo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ubicacion_id")
    private Ubicacion ubicacion;

    @Column(nullable = false, length = 20)
    private String estado; // 'Operativo', 'En reparación', 'Dado de baja'
}
