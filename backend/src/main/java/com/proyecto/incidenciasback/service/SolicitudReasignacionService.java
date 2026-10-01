package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.RespuestaSolicitudRequest;
import com.proyecto.incidenciasback.dto.SolicitudReasignacionRequest;
import com.proyecto.incidenciasback.dto.SolicitudReasignacionResponse;
import com.proyecto.incidenciasback.model.Incidencia;
import com.proyecto.incidenciasback.model.SolicitudReasignacion;
import com.proyecto.incidenciasback.model.Usuario;
import com.proyecto.incidenciasback.repository.IncidenciaRepository;
import com.proyecto.incidenciasback.repository.SolicitudReasignacionRepository;
import com.proyecto.incidenciasback.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar las solicitudes de reasignación de técnicos.
 * Flujo: Técnico solicita → Admin revisa → Aprueba (reasigna) o Rechaza.
 */
@Service
public class SolicitudReasignacionService {

    private final SolicitudReasignacionRepository solicitudRepository;
    private final IncidenciaRepository incidenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final IncidenciaService incidenciaService;

    public SolicitudReasignacionService(SolicitudReasignacionRepository solicitudRepository,
                                         IncidenciaRepository incidenciaRepository,
                                         UsuarioRepository usuarioRepository,
                                         IncidenciaService incidenciaService) {
        this.solicitudRepository = solicitudRepository;
        this.incidenciaRepository = incidenciaRepository;
        this.usuarioRepository = usuarioRepository;
        this.incidenciaService = incidenciaService;
    }

    // ==================== CREAR SOLICITUD (Técnico) ====================

    /**
     * Un técnico solicita ser reasignado de una incidencia.
     * Valida que el técnico esté asignado a la incidencia y no tenga una solicitud pendiente.
     */
    @Transactional
    public SolicitudReasignacionResponse crearSolicitud(Integer incidenciaId,
                                                         SolicitudReasignacionRequest request) {
        Incidencia incidencia = incidenciaRepository.findById(incidenciaId)
                .orElseThrow(() -> new RuntimeException("Incidencia no encontrada con id: " + incidenciaId));

        Usuario tecnico = obtenerUsuarioAutenticado();

        // Validar que el técnico está asignado a esta incidencia
        if (incidencia.getTecnico() == null || !incidencia.getTecnico().getId().equals(tecnico.getId())) {
            throw new RuntimeException("Solo el técnico asignado puede solicitar reasignación");
        }

        // Validar que no tenga una solicitud pendiente para esta incidencia
        if (solicitudRepository.existsByIncidenciaIdAndTecnicoSolicitanteIdAndEstado(
                incidenciaId, tecnico.getId(), "PENDIENTE")) {
            throw new RuntimeException("Ya existe una solicitud de reasignación pendiente para esta incidencia");
        }

        SolicitudReasignacion solicitud = new SolicitudReasignacion();
        solicitud.setIncidencia(incidencia);
        solicitud.setTecnicoSolicitante(tecnico);
        solicitud.setMotivo(request.getMotivo());
        solicitud.setEstado("PENDIENTE");

        solicitudRepository.save(solicitud);

        return toResponse(solicitud);
    }

    // ==================== RESPONDER SOLICITUD (Admin) ====================

    /**
     * Un admin o técnico de soporte aprueba o rechaza una solicitud de reasignación.
     * Si se aprueba, se reasigna la incidencia al nuevo técnico con trazabilidad completa.
     */
    @Transactional
    public SolicitudReasignacionResponse responderSolicitud(Integer solicitudId,
                                                             RespuestaSolicitudRequest request) {
        SolicitudReasignacion solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con id: " + solicitudId));

        if (!"PENDIENTE".equals(solicitud.getEstado())) {
            throw new RuntimeException("Esta solicitud ya fue procesada: " + solicitud.getEstado());
        }

        String decision = request.getDecision().toUpperCase();
        if (!"APROBADA".equals(decision) && !"RECHAZADA".equals(decision)) {
            throw new RuntimeException("La decisión debe ser APROBADA o RECHAZADA");
        }

        Usuario revisor = obtenerUsuarioAutenticado();

        solicitud.setEstado(decision);
        solicitud.setRevisadoPor(revisor);
        solicitud.setComentarioRespuesta(request.getComentario());
        solicitud.setFechaRespuesta(LocalDateTime.now());

        if ("APROBADA".equals(decision)) {
            if (request.getTecnicoNuevoId() == null) {
                throw new RuntimeException("Debe seleccionar un nuevo técnico al aprobar la reasignación");
            }

            Usuario tecnicoNuevo = usuarioRepository.findById(request.getTecnicoNuevoId())
                    .orElseThrow(() -> new RuntimeException(
                            "Técnico no encontrado con id: " + request.getTecnicoNuevoId()));

            solicitud.setTecnicoNuevo(tecnicoNuevo);

            // Reasignar la incidencia con trazabilidad completa
            var reasignarRequest = new com.proyecto.incidenciasback.dto.ReasignarTecnicoRequest();
            reasignarRequest.setTecnicoNuevoId(request.getTecnicoNuevoId());
            reasignarRequest.setMotivo("Solicitud de reasignación aprobada. Motivo original: "
                    + solicitud.getMotivo()
                    + (request.getComentario() != null ? ". Comentario del revisor: " + request.getComentario() : ""));

            incidenciaService.reasignarTecnico(solicitud.getIncidencia().getId(), reasignarRequest);
        }

        solicitudRepository.save(solicitud);

        return toResponse(solicitud);
    }

    // ==================== LISTAR ====================

    /** Lista todas las solicitudes pendientes (para el admin) */
    @Transactional(readOnly = true)
    public List<SolicitudReasignacionResponse> listarPendientes() {
        return solicitudRepository.findByEstadoOrderByFechaSolicitudAsc("PENDIENTE")
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Lista todas las solicitudes (para historial) */
    @Transactional(readOnly = true)
    public List<SolicitudReasignacionResponse> listarTodas() {
        return solicitudRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Lista las solicitudes de una incidencia específica */
    @Transactional(readOnly = true)
    public List<SolicitudReasignacionResponse> listarPorIncidencia(Integer incidenciaId) {
        return solicitudRepository.findByIncidenciaIdOrderByFechaSolicitudDesc(incidenciaId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Lista las solicitudes de un técnico específico */
    @Transactional(readOnly = true)
    public List<SolicitudReasignacionResponse> listarPorTecnico(Integer tecnicoId) {
        return solicitudRepository.findByTecnicoSolicitanteIdOrderByFechaSolicitudDesc(tecnicoId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ==================== UTILIDADES ====================

    private Usuario obtenerUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !auth.getName().equals("anonymousUser")) {
            return usuarioRepository.findByCorreo(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado: " + auth.getName()));
        }
        throw new RuntimeException("No se pudo determinar el usuario autenticado");
    }

    private SolicitudReasignacionResponse toResponse(SolicitudReasignacion s) {
        return new SolicitudReasignacionResponse(
                s.getId(),
                s.getIncidencia().getId(),
                s.getIncidencia().getCodigoTicket(),
                s.getIncidencia().getTitulo(),
                s.getTecnicoSolicitante().getId(),
                s.getTecnicoSolicitante().getNombre() + " " + s.getTecnicoSolicitante().getApellido(),
                s.getMotivo(),
                s.getEstado(),
                s.getRevisadoPor() != null ? s.getRevisadoPor().getId() : null,
                s.getRevisadoPor() != null
                        ? s.getRevisadoPor().getNombre() + " " + s.getRevisadoPor().getApellido()
                        : null,
                s.getComentarioRespuesta(),
                s.getTecnicoNuevo() != null ? s.getTecnicoNuevo().getId() : null,
                s.getTecnicoNuevo() != null
                        ? s.getTecnicoNuevo().getNombre() + " " + s.getTecnicoNuevo().getApellido()
                        : null,
                s.getFechaSolicitud(),
                s.getFechaRespuesta()
        );
    }
}
