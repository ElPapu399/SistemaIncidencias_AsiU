package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.dto.EquipoResponse;
import com.proyecto.incidenciasback.service.EquipoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipos")
public class EquipoController {

    private final EquipoService equipoService;

    public EquipoController(EquipoService equipoService) {
        this.equipoService = equipoService;
    }

    /**
     * Listar todos los equipos o filtrar por ubicación.
     * GET /api/equipos
     * GET /api/equipos?ubicacionId=4
     */
    @GetMapping
    public ResponseEntity<List<EquipoResponse>> listarEquipos(
            @RequestParam(required = false) Integer ubicacionId) {
        if (ubicacionId != null) {
            return ResponseEntity.ok(equipoService.listarPorUbicacion(ubicacionId));
        }
        return ResponseEntity.ok(equipoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerEquipo(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(equipoService.obtenerPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}
