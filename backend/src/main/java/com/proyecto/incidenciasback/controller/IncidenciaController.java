package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.model.Incidencia;
import com.proyecto.incidenciasback.service.IncidenciaService;
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
    public ResponseEntity<List<Incidencia>> listarIncidencias() {
        return ResponseEntity.ok(incidenciaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incidencia> obtenerIncidencia(@PathVariable Integer id) {
        return ResponseEntity.ok(incidenciaService.obtenerPorId(id));
    }
}