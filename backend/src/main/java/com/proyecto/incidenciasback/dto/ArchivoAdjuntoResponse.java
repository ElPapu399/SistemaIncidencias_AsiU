package com.proyecto.incidenciasback.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ArchivoAdjuntoResponse {
    private Integer id;
    private Integer incidenciaId;
    private String urlArchivo;
    private String nombreOriginal;
    private String tipoArchivo;
    private Long tamanioByte;
    private Integer subidoPorId;
    private String subidoPorNombre;
    private LocalDateTime fechaSubida;
}
