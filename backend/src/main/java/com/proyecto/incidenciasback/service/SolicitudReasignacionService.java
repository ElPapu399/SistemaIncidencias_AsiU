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
import com.proyecto.incidenciasback.security.AuthHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SolicitudReasignacionService {

    private final SolicitudReasignacionRepository solicitudRepository;
    private final IncidenciaRepository incidenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final IncidenciaService incidenciaService;
    private final AuthHelper authHelper;

    public SolicitudReasignacionService(SolicitudReasignacionRepository solicitudRepository,
                                         IncidenciaRepository incidenciaRepository,
                                         UsuarioRepository usuarioRepository,
                                         IncidenciaService incidenciaService,
                                         AuthHelper authHelper) {
        this.solicitudRepository = solicitudRepository;
        this.incidenciaRepository = incidenciaRepository;
        this.usuarioRepository = usuarioRepository;
        this.incidenciaService = incidenciaService;
        this.authHelper = authHelper;
    }

    @Transactional
    public SolicitudReasignacionResponse crearSolicitud(Integer incidenciaId,
                                                         SolicitudReasignacionRequest request) {
        Incidencia incidencia = incidenciaRepository.findById(incidenciaId)
                .orElseThrow(() -> new RuntimeException("Incidencia no encontrada con id: " + incidenciaId));

        Usuario tecnico = authHelper.obtenerUsuarioAutenticado();

        if (incidencia.getTecnico() == null || !incidencia.getTecnico().getId().equals(tecnico.getId())) {
            throw new RuntimeException("Solo el técnico asignado puede solicitar reasignación");
        }

        // Invariante: máximo una solicitud en cola por técnico y ticket
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

        Usuario revisor = authHelper.obtenerUsuarioAutenticado();

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

            var reasignarRequest = new com.proyecto.incidenciasback.dto.ReasignarTecnicoRequest();
            reasignarRequest.setTecnicoNuevoId(request.getTecnicoNuevoId());
            reasignarRequest.setMotivo("Solicitud de reasignación aprobada. Motivo original: "
                    + solicitud.getMotivo()
                    + (request.getComentario() != null ? ". Comentario del revisor: " + request.getComentario() : ""));

            // Delega en IncidenciaService para registrar trazabilidad completa en historial
            incidenciaService.reasignarTecnico(solicitud.getIncidencia().getId(), reasignarRequest);
        }

        solicitudRepository.save(solicitud);

        return toResponse(solicitud);
    }

    @Transactional(readOnly = true)
    public List<SolicitudReasignacionResponse> listarPendientes() {
        return solicitudRepository.findByEstadoOrderByFechaSolicitudAsc("PENDIENTE")
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SolicitudReasignacionResponse> listarTodas() {
        return solicitudRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SolicitudReasignacionResponse> listarPorIncidencia(Integer incidenciaId) {
        return solicitudRepository.findByIncidenciaIdOrderByFechaSolicitudDesc(incidenciaId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SolicitudReasignacionResponse> listarPorTecnico(Integer tecnicoId) {
        return solicitudRepository.findByTecnicoSolicitanteIdOrderByFechaSolicitudDesc(tecnicoId)
                .stream()
                .map(this::toResponse)
                .toList();
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
