package com.proyecto.incidenciasback.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO para que un admin/técnico de soporte apruebe o rechace una solicitud de reasignación.
 */
@Getter
@Setter
public class RespuestaSolicitudRequest {

    /** 'APROBADA' o 'RECHAZADA' */
    @NotBlank(message = "La decisión es obligatoria (APROBADA o RECHAZADA)")
    private String decision;

    /** Comentario explicando la decisión */
    private String comentario;

    /** ID del nuevo técnico (obligatorio si la decisión es APROBADA) */
    private Integer tecnicoNuevoId;
}
