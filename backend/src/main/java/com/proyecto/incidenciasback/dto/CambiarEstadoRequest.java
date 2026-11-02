package com.proyecto.incidenciasback.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CambiarEstadoRequest {

    @NotBlank(message = "El estado es obligatorio")
    private String estado;

    private String solucionTecnica;
    private Integer usuarioId;
    private String comentario;

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getSolucionTecnica() {
        return solucionTecnica;
    }

    public void setSolucionTecnica(String solucionTecnica) {
        this.solucionTecnica = solucionTecnica;
    }

    public Integer getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Integer usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }
}
