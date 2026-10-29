package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.dto.*;
import com.proyecto.incidenciasback.service.LaboratorioService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/laboratorios")
public class LaboratorioController {
    private final LaboratorioService service;
    public LaboratorioController(LaboratorioService service) { this.service = service; }
    @GetMapping public List<LaboratorioResponse> listar() { return service.listar(); }
    @GetMapping("/encargados") public List<Map<String, Object>> encargados() { return service.encargados(); }
    @GetMapping("/{id}") public LaboratorioResponse obtener(@PathVariable Integer id) { return service.obtener(id); }
    @PostMapping public ResponseEntity<LaboratorioResponse> crear(@Valid @RequestBody LaboratorioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.guardar(null, request));
    }
    @PutMapping("/{id}") public LaboratorioResponse editar(@PathVariable Integer id, @Valid @RequestBody LaboratorioRequest request) {
        return service.guardar(id, request);
    }
}
