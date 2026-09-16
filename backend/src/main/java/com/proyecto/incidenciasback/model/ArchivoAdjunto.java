package com.proyecto.incidenciasback.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "archivos_adjuntos")
@Getter
@Setter
public class ArchivoAdjunto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incidencia_id", nullable = false)
    private Incidencia incidencia;

    @Column(name = "url_archivo", nullable = false, length = 255)
    private String urlArchivo;

    @Column(name = "nombre_original", nullable = false, length = 150)
    private String nombreOriginal;

    @Column(name = "tipo_archivo", length = 100)
    private String tipoArchivo;

    @Column(name = "tamanio_bytes")
    private Long tamanioByte;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subido_por")
    private Usuario subidoPor;

    @Column(name = "fecha_subida")
    private LocalDateTime fechaSubida;

    @PrePersist
    public void prePersist() {
        if (fechaSubida == null) {
            fechaSubida = LocalDateTime.now();
        }
    }
}
