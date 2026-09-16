package com.proyecto.incidenciasback.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CambiarEstadoRequest {

    @NotBlank(message = "El estado es obligatorio")
    private String estado;

    // Obligatorio cuando estado = "Resuelto"
    private String solucionTecnica;

    // ID del usuario que realiza el cambio (para el historial)
    @NotNull(message = "El usuario es obligatorio")
    private Integer usuarioId;

    // Comentario opcional para el historial
    private String comentario;
}
