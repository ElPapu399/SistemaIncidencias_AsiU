package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.dto.AuditoriaLogResponse;
import com.proyecto.incidenciasback.service.AuditoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/auditoria")
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    public AuditoriaController(AuditoriaService auditoriaService) {
        this.auditoriaService = auditoriaService;
    }

    @GetMapping
    public ResponseEntity<List<AuditoriaLogResponse>> listarLogs() {
        return ResponseEntity.ok(auditoriaService.obtenerLogsAuditoria());
    }
}

