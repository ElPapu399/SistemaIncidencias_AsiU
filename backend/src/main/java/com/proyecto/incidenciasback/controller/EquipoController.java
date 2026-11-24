package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.dto.EquipoResponse;
import com.proyecto.incidenciasback.dto.EquipoRequest;
import com.proyecto.incidenciasback.dto.EquipoEstadoRequest;
import com.proyecto.incidenciasback.dto.HistorialEquipoResponse;
import jakarta.validation.Valid;
import com.proyecto.incidenciasback.service.EquipoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipos")
public class EquipoController {

    private final EquipoService equipoService;

    public EquipoController(EquipoService equipoService) {
        this.equipoService = equipoService;
    }

    @GetMapping
    public ResponseEntity<List<EquipoResponse>> listarEquipos(
            @RequestParam(required = false) Integer ubicacionId) {
        if (ubicacionId != null) {
            return ResponseEntity.ok(equipoService.listarPorUbicacion(ubicacionId));
        }
        return ResponseEntity.ok(equipoService.listarTodos());
    }

    @GetMapping("/historial")
    public ResponseEntity<List<HistorialEquipoResponse>> obtenerHistorial(
            @RequestParam(required = false) Integer ubicacionId,
            @RequestParam(required = false) Integer equipoId) {
        if (ubicacionId != null) {
            return ResponseEntity.ok(equipoService.obtenerHistorialPorUbicacion(ubicacionId));
        }
        if (equipoId != null) {
            return ResponseEntity.ok(equipoService.obtenerHistorialPorEquipo(equipoId));
        }
        return ResponseEntity.ok(equipoService.obtenerTodoElHistorial());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipoResponse> obtenerEquipo(@PathVariable Integer id) {
        return ResponseEntity.ok(equipoService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<EquipoResponse> crear(@Valid @RequestBody EquipoRequest request) {
        return ResponseEntity.status(201).body(equipoService.guardar(null, request));
    }

    @PutMapping("/{id}")
    public EquipoResponse editar(@PathVariable Integer id, @Valid @RequestBody EquipoRequest request) {
        return equipoService.guardar(id, request);
    }

    @PutMapping("/{id}/estado")
    public EquipoResponse cambiarEstado(@PathVariable Integer id, @Valid @RequestBody EquipoEstadoRequest request) {
        return equipoService.cambiarEstado(id, request);
    }
}
