package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.dto.*;
import com.proyecto.incidenciasback.service.IncidenciaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<IncidenciaDetalleResponse> obtenerIncidencia(@PathVariable Integer id) {
        return ResponseEntity.ok(incidenciaService.obtenerDetallePorId(id));
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
    public ResponseEntity<IncidenciaResponse> crearIncidencia(@Valid @RequestBody IncidenciaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(incidenciaService.crearIncidencia(request));
    }

    @PutMapping("/{id}/asignar")
    public ResponseEntity<IncidenciaResponse> asignarTecnico(@PathVariable Integer id,
                                                             @Valid @RequestBody AsignarTecnicoRequest request) {
        return ResponseEntity.ok(incidenciaService.asignarTecnico(id, request));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<IncidenciaResponse> cambiarEstado(@PathVariable Integer id,
                                                            @Valid @RequestBody CambiarEstadoRequest request) {
        return ResponseEntity.ok(incidenciaService.cambiarEstado(id, request));
    }

    /**
     * Historial de cambios de estado (timeline) de una incidencia.
     */
    @GetMapping("/{id}/historial")
    public ResponseEntity<List<HistorialEstadoResponse>> obtenerHistorial(@PathVariable Integer id) {
        return ResponseEntity.ok(incidenciaService.obtenerHistorial(id));
    }
}