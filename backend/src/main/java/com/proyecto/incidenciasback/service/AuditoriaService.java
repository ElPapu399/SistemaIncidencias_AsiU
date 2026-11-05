package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.AuditoriaLogResponse;
import com.proyecto.incidenciasback.model.HistorialEquipo;
import com.proyecto.incidenciasback.model.HistorialEstado;
import com.proyecto.incidenciasback.model.SolicitudReasignacion;
import com.proyecto.incidenciasback.repository.HistorialEquipoRepository;
import com.proyecto.incidenciasback.repository.HistorialEstadoRepository;
import com.proyecto.incidenciasback.repository.SolicitudReasignacionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class AuditoriaService {

    private static final Logger log = LoggerFactory.getLogger(AuditoriaService.class);

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

    public List<AuditoriaLogResponse> obtenerLogsAuditoria() {
        List<AuditoriaLogResponse> resultado = new ArrayList<>();

        // 1. Historial de Estados de Incidencias
        try {
            List<HistorialEstado> estados = null;
            try {
                estados = historialEstadoRepository.findAllConRelaciones();
            } catch (Exception e) {
                estados = historialEstadoRepository.findAll(Sort.by(Sort.Direction.DESC, "fechaCambio"));
            }

            if (estados != null) {
                for (HistorialEstado h : estados) {
                    try {
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
                        if (h.getIncidencia() != null) {
                            entidadCodigo = h.getIncidencia().getCodigoTicket() != null
                                    ? h.getIncidencia().getCodigoTicket()
                                    : "#" + h.getIncidencia().getId();
                            entidadNombre = h.getIncidencia().getTitulo() != null
                                    ? h.getIncidencia().getTitulo()
                                    : "";
                        }

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
                    } catch (Exception exItem) {
                        log.debug("Error procesando item historial_estados: {}", exItem.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("No se pudo consultar historial_estados: {}", e.getMessage());
        }

        // 2. Historial de Equipos de Taller
        try {
            List<HistorialEquipo> equipos = historialEquipoRepository.findAll(Sort.by(Sort.Direction.DESC, "fecha"));
            if (equipos != null) {
                for (HistorialEquipo he : equipos) {
                    try {
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
                    } catch (Exception exItem) {
                        log.debug("Error procesando item historial_equipos: {}", exItem.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("No se pudo consultar historial_equipos: {}", e.getMessage());
        }

        // 3. Solicitudes de Reasignación
        try {
            List<SolicitudReasignacion> solicitudes = solicitudReasignacionRepository.findAll(Sort.by(Sort.Direction.DESC, "fechaSolicitud"));
            if (solicitudes != null) {
                for (SolicitudReasignacion s : solicitudes) {
                    try {
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
                    } catch (Exception exItem) {
                        log.debug("Error procesando item solicitudes_reasignacion: {}", exItem.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("No se pudo consultar solicitudes_reasignacion: {}", e.getMessage());
        }

        // 4. Ordenar por fecha descendente
        resultado.sort(Comparator.comparing(AuditoriaLogResponse::getFecha, Comparator.nullsLast(Comparator.reverseOrder())));

        if (resultado.size() > 200) {
            return resultado.subList(0, 200);
        }
        return resultado;
    }
}
