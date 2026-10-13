package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.dto.EquipoResponse;
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

    @GetMapping("/{id}")
    public ResponseEntity<EquipoResponse> obtenerEquipo(@PathVariable Integer id) {
        return ResponseEntity.ok(equipoService.obtenerPorId(id));
    }
}
