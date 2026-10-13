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

@RestController
@RequestMapping("/api")
public class SolicitudReasignacionController {

    private final SolicitudReasignacionService solicitudService;

    public SolicitudReasignacionController(SolicitudReasignacionService solicitudService) {
        this.solicitudService = solicitudService;
    }

    @PostMapping("/incidencias/{incidenciaId}/solicitar-reasignacion")
    public ResponseEntity<SolicitudReasignacionResponse> solicitarReasignacion(
            @PathVariable Integer incidenciaId,
            @Valid @RequestBody SolicitudReasignacionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(solicitudService.crearSolicitud(incidenciaId, request));
    }

    @GetMapping("/solicitudes-reasignacion/pendientes")
    public ResponseEntity<List<SolicitudReasignacionResponse>> listarPendientes() {
        return ResponseEntity.ok(solicitudService.listarPendientes());
    }

    @GetMapping("/solicitudes-reasignacion")
    public ResponseEntity<List<SolicitudReasignacionResponse>> listarTodas() {
        return ResponseEntity.ok(solicitudService.listarTodas());
    }

    @GetMapping("/incidencias/{incidenciaId}/solicitudes-reasignacion")
    public ResponseEntity<List<SolicitudReasignacionResponse>> listarPorIncidencia(
            @PathVariable Integer incidenciaId) {
        return ResponseEntity.ok(solicitudService.listarPorIncidencia(incidenciaId));
    }

    @PutMapping("/solicitudes-reasignacion/{id}/responder")
    public ResponseEntity<SolicitudReasignacionResponse> responderSolicitud(
            @PathVariable Integer id,
            @Valid @RequestBody RespuestaSolicitudRequest request) {
        return ResponseEntity.ok(solicitudService.responderSolicitud(id, request));
    }
}
