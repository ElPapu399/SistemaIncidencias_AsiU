package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.dto.*;
import com.proyecto.incidenciasback.service.IncidenciaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidencias")
public class IncidenciaController {

    private final IncidenciaService incidenciaService;

    public IncidenciaController(IncidenciaService incidenciaService) {
        this.incidenciaService = incidenciaService;
    }

    @GetMapping
    public ResponseEntity<List<IncidenciaResponse>> listarIncidencias() {
        return ResponseEntity.ok(incidenciaService.listarTodas());
    }

    /**
     * Detalle enriquecido de una incidencia (con historial + adjuntos + equipo).
     * Usar este endpoint para el modal de detalle.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerIncidencia(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(incidenciaService.obtenerDetallePorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/estudiante/{estudianteId}")
    public ResponseEntity<List<IncidenciaResponse>> listarPorEstudiante(@PathVariable Integer estudianteId) {
        return ResponseEntity.ok(incidenciaService.listarPorEstudiante(estudianteId));
    }

    @GetMapping("/tecnico/{tecnicoId}")
    public ResponseEntity<List<IncidenciaResponse>> listarPorTecnico(@PathVariable Integer tecnicoId) {
        return ResponseEntity.ok(incidenciaService.listarPorTecnico(tecnicoId));
    }

    @PostMapping
    public ResponseEntity<?> crearIncidencia(@Valid @RequestBody IncidenciaRequest request) {
        try {
            IncidenciaResponse response = incidenciaService.crearIncidencia(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/asignar")
    public ResponseEntity<?> asignarTecnico(@PathVariable Integer id,
                                            @Valid @RequestBody AsignarTecnicoRequest request) {
        try {
            IncidenciaResponse response = incidenciaService.asignarTecnico(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Integer id,
                                           @Valid @RequestBody CambiarEstadoRequest request) {
        try {
            IncidenciaResponse response = incidenciaService.cambiarEstado(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Historial de cambios de estado (timeline) de una incidencia.
     */
    @GetMapping("/{id}/historial")
    public ResponseEntity<?> obtenerHistorial(@PathVariable Integer id) {
        try {
            List<HistorialEstadoResponse> historial = incidenciaService.obtenerHistorial(id);
            return ResponseEntity.ok(historial);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}