package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.dto.RespuestaSolicitudRequest;
import com.proyecto.incidenciasback.dto.SolicitudReasignacionRequest;
import com.proyecto.incidenciasback.dto.SolicitudReasignacionResponse;
import com.proyecto.incidenciasback.service.SolicitudReasignacionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador para la gestión de solicitudes de reasignación.
 *
 * Flujo:
 *  1. Técnico solicita reasignación → POST /api/incidencias/{id}/solicitar-reasignacion
 *  2. Admin lista pendientes → GET /api/solicitudes-reasignacion/pendientes
 *  3. Admin aprueba o rechaza → PUT /api/solicitudes-reasignacion/{id}/responder
 */
@RestController
@RequestMapping("/api")
public class SolicitudReasignacionController {

    private final SolicitudReasignacionService solicitudService;

    public SolicitudReasignacionController(SolicitudReasignacionService solicitudService) {
        this.solicitudService = solicitudService;
    }

    // ==================== TÉCNICO: solicitar reasignación ====================

    /**
     * Un técnico solicita ser reasignado de una incidencia, explicando sus motivos.
     */
    @PostMapping("/incidencias/{incidenciaId}/solicitar-reasignacion")
    public ResponseEntity<SolicitudReasignacionResponse> solicitarReasignacion(
            @PathVariable Integer incidenciaId,
            @Valid @RequestBody SolicitudReasignacionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(solicitudService.crearSolicitud(incidenciaId, request));
    }

    // ==================== ADMIN: gestionar solicitudes ====================

    /**
     * Lista solicitudes pendientes de revisión.
     */
    @GetMapping("/solicitudes-reasignacion/pendientes")
    public ResponseEntity<List<SolicitudReasignacionResponse>> listarPendientes() {
        return ResponseEntity.ok(solicitudService.listarPendientes());
    }

    /**
     * Lista todas las solicitudes (historial completo).
     */
    @GetMapping("/solicitudes-reasignacion")
    public ResponseEntity<List<SolicitudReasignacionResponse>> listarTodas() {
        return ResponseEntity.ok(solicitudService.listarTodas());
    }

    /**
     * Lista solicitudes de una incidencia específica.
     */
    @GetMapping("/incidencias/{incidenciaId}/solicitudes-reasignacion")
    public ResponseEntity<List<SolicitudReasignacionResponse>> listarPorIncidencia(
            @PathVariable Integer incidenciaId) {
        return ResponseEntity.ok(solicitudService.listarPorIncidencia(incidenciaId));
    }

    /**
     * Admin aprueba o rechaza una solicitud de reasignación.
     * Si aprueba, debe incluir el ID del nuevo técnico.
     */
    @PutMapping("/solicitudes-reasignacion/{id}/responder")
    public ResponseEntity<SolicitudReasignacionResponse> responderSolicitud(
            @PathVariable Integer id,
            @Valid @RequestBody RespuestaSolicitudRequest request) {
        return ResponseEntity.ok(solicitudService.responderSolicitud(id, request));
    }
}
