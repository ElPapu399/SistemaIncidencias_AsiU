package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.AuditoriaLogResponse;
import com.proyecto.incidenciasback.model.HistorialEquipo;
import com.proyecto.incidenciasback.model.HistorialEstado;
import com.proyecto.incidenciasback.model.SolicitudReasignacion;
import com.proyecto.incidenciasback.repository.HistorialEquipoRepository;
import com.proyecto.incidenciasback.repository.HistorialEstadoRepository;
import com.proyecto.incidenciasback.repository.SolicitudReasignacionRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class AuditoriaService {

    private final HistorialEstadoRepository historialEstadoRepository;
    private final HistorialEquipoRepository historialEquipoRepository;
    private final SolicitudReasignacionRepository solicitudReasignacionRepository;

    public AuditoriaService(
            HistorialEstadoRepository historialEstadoRepository,
            HistorialEquipoRepository historialEquipoRepository,
            SolicitudReasignacionRepository solicitudReasignacionRepository
    ) {
        this.historialEstadoRepository = historialEstadoRepository;
        this.historialEquipoRepository = historialEquipoRepository;
        this.solicitudReasignacionRepository = solicitudReasignacionRepository;
    }

    @Transactional(readOnly = true)
    public List<AuditoriaLogResponse> obtenerLogsAuditoria() {
        List<HistorialEstado> estados = new ArrayList<>();
        try {
            estados = historialEstadoRepository.findAll(
                    Sort.by(Sort.Direction.DESC, "fechaCambio")
            );
        } catch (Exception e) {
            // Manejo defensivo en caso de error de lectura de historial_estados
        }

        List<HistorialEquipo> equipos = new ArrayList<>();
        try {
            equipos = historialEquipoRepository.findAll(
                    Sort.by(Sort.Direction.DESC, "fecha")
            );
        } catch (Exception e) {
            // Manejo defensivo si la tabla historial_equipos aún no contiene datos o no ha sido creada
        }

        List<AuditoriaLogResponse> resultado = new ArrayList<>();

        for (HistorialEstado h : estados) {
            String usuarioNombre = h.getUsuario() != null
                    ? h.getUsuario().getNombre() + " " + h.getUsuario().getApellido()
                    : "Sistema";
            String usuarioRol = h.getUsuario() != null && h.getUsuario().getRol() != null
                    ? h.getUsuario().getRol().getNombre()
                    : "";
            String usuarioEmail = h.getUsuario() != null ? h.getUsuario().getCorreo() : "";

            String tipoAccion = (h.getTipoAccion() != null && !h.getTipoAccion().isBlank())
                    ? h.getTipoAccion()
                    : "CAMBIO_ESTADO";

            String detalle = h.getComentario();
            if ("REASIGNACION".equalsIgnoreCase(tipoAccion)) {
                String tecAnt = h.getTecnicoAnterior() != null
                        ? h.getTecnicoAnterior().getNombre() + " " + h.getTecnicoAnterior().getApellido()
                        : "Técnico previo";
                String tecNue = h.getTecnicoNuevo() != null
                        ? h.getTecnicoNuevo().getNombre() + " " + h.getTecnicoNuevo().getApellido()
                        : "Nuevo técnico";
                detalle = "Reasignación técnica: " + tecAnt + " ➔ " + tecNue
                        + (h.getComentario() != null && !h.getComentario().isBlank() ? " (" + h.getComentario() + ")" : "");
            } else if ("ASIGNACION".equalsIgnoreCase(tipoAccion) && h.getTecnicoNuevo() != null) {
                detalle = "Asignó la incidencia a: " + h.getTecnicoNuevo().getNombre() + " " + h.getTecnicoNuevo().getApellido()
                        + (h.getComentario() != null && !h.getComentario().isBlank() ? " (" + h.getComentario() + ")" : "");
            } else if (detalle == null || detalle.isBlank()) {
                detalle = "Transición de estado a " + h.getEstadoNuevo();
            }

            String entidadCodigo = "";
            String entidadNombre = "";
            try {
                if (h.getIncidencia() != null) {
                    entidadCodigo = h.getIncidencia().getCodigoTicket() != null
                            ? h.getIncidencia().getCodigoTicket()
                            : "#" + h.getIncidencia().getId();
                    entidadNombre = h.getIncidencia().getTitulo() != null
                            ? h.getIncidencia().getTitulo()
                            : "";
                }
            } catch (Exception ignored) {}

            resultado.add(AuditoriaLogResponse.builder()
                    .id("INC-" + h.getId())
                    .fecha(h.getFechaCambio())
                    .tipo("INCIDENCIA")
                    .tipoAccion(tipoAccion)
                    .usuarioId(h.getUsuario() != null ? h.getUsuario().getId() : null)
                    .usuarioNombre(usuarioNombre)
                    .usuarioRol(usuarioRol)
                    .usuarioEmail(usuarioEmail)
                    .entidadCodigo(entidadCodigo)
                    .entidadNombre(entidadNombre)
                    .estadoAnterior(h.getEstadoAnterior())
                    .estadoNuevo(h.getEstadoNuevo())
                    .detalle(detalle)
                    .build());
        }

        for (HistorialEquipo he : equipos) {
            String usuarioNombre = he.getUsuario() != null
                    ? he.getUsuario().getNombre() + " " + he.getUsuario().getApellido()
                    : "Sistema";
            String usuarioRol = he.getUsuario() != null && he.getUsuario().getRol() != null
                    ? he.getUsuario().getRol().getNombre()
                    : "";
            String usuarioEmail = he.getUsuario() != null ? he.getUsuario().getCorreo() : "";

            String entidadNombre = "";
            if (he.getEquipo() != null) {
                if (he.getEquipo().getUbicacion() != null) {
                    entidadNombre = he.getEquipo().getUbicacion().getAulaLaboratorio() + " (" + he.getEquipo().getUbicacion().getPabellon() + ")";
                } else if (he.getEquipo().getTipo() != null) {
                    entidadNombre = he.getEquipo().getTipo();
                }
            }

            resultado.add(AuditoriaLogResponse.builder()
                    .id("EQ-" + he.getId())
                    .fecha(he.getFecha())
                    .tipo("EQUIPO")
                    .tipoAccion("ESTADO_EQUIPO")
                    .usuarioId(he.getUsuario() != null ? he.getUsuario().getId() : null)
                    .usuarioNombre(usuarioNombre)
                    .usuarioRol(usuarioRol)
                    .usuarioEmail(usuarioEmail)
                    .entidadCodigo(he.getEquipo() != null ? he.getEquipo().getCodigo() : "")
                    .entidadNombre(entidadNombre)
                    .estadoAnterior(he.getEstadoAnterior())
                    .estadoNuevo(he.getEstadoNuevo())
                    .detalle(he.getMotivo() != null ? he.getMotivo() : "Actualización de estado en taller")
                    .build());
        }

        List<SolicitudReasignacion> solicitudes = new ArrayList<>();
        try {
            solicitudes = solicitudReasignacionRepository.findAll(
                    Sort.by(Sort.Direction.DESC, "fechaSolicitud")
            );
        } catch (Exception ignored) {}

        for (SolicitudReasignacion s : solicitudes) {
            String solicitanteNombre = s.getTecnicoSolicitante() != null
                    ? s.getTecnicoSolicitante().getNombre() + " " + s.getTecnicoSolicitante().getApellido()
                    : "Técnico";
            String solicitanteRol = s.getTecnicoSolicitante() != null && s.getTecnicoSolicitante().getRol() != null
                    ? s.getTecnicoSolicitante().getRol().getNombre()
                    : "TECNICO";
            String solicitanteEmail = s.getTecnicoSolicitante() != null ? s.getTecnicoSolicitante().getCorreo() : "";

            String ticketCodigo = "";
            String ticketTitulo = "";
            if (s.getIncidencia() != null) {
                ticketCodigo = s.getIncidencia().getCodigoTicket() != null ? s.getIncidencia().getCodigoTicket() : "#" + s.getIncidencia().getId();
                ticketTitulo = s.getIncidencia().getTitulo() != null ? s.getIncidencia().getTitulo() : "";
            }

            String detalleSol = "Solicitud de reasignación [" + s.getEstado() + "]";
            if (s.getTecnicoNuevo() != null) {
                detalleSol += " hacia " + s.getTecnicoNuevo().getNombre() + " " + s.getTecnicoNuevo().getApellido();
            }
            if (s.getMotivo() != null && !s.getMotivo().isBlank()) {
                detalleSol += ". Motivo: " + s.getMotivo();
            }
            if (s.getComentarioRespuesta() != null && !s.getComentarioRespuesta().isBlank()) {
                detalleSol += " (Respuesta: " + s.getComentarioRespuesta() + ")";
            }

            resultado.add(AuditoriaLogResponse.builder()
                    .id("SOL-" + s.getId())
                    .fecha(s.getFechaSolicitud())
                    .tipo("INCIDENCIA")
                    .tipoAccion("SOLICITUD_REASIGNACION")
                    .usuarioId(s.getTecnicoSolicitante() != null ? s.getTecnicoSolicitante().getId() : null)
                    .usuarioNombre(solicitanteNombre)
                    .usuarioRol(solicitanteRol)
                    .usuarioEmail(solicitanteEmail)
                    .entidadCodigo(ticketCodigo)
                    .entidadNombre(ticketTitulo)
                    .estadoAnterior(s.getEstado())
                    .estadoNuevo(s.getEstado())
                    .detalle(detalleSol)
                    .build());
        }

        // Ordenar por fecha descendente
        resultado.sort(Comparator.comparing(AuditoriaLogResponse::getFecha, Comparator.nullsLast(Comparator.reverseOrder())));

        // Limitar a los 200 eventos más recientes
        if (resultado.size() > 200) {
            return resultado.subList(0, 200);
        }
        return resultado;
    }
}
