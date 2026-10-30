package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.dto.LaboratorioRequest;
import com.proyecto.incidenciasback.dto.LaboratorioResponse;
import com.proyecto.incidenciasback.service.LaboratorioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/laboratorios")
public class LaboratorioController {
    private final LaboratorioService service;

    public LaboratorioController(LaboratorioService service) {
        this.service = service;
    }

    @GetMapping
    public List<LaboratorioResponse> listar() {
        return service.listar();
    }

    @GetMapping("/encargados")
    public List<Map<String, Object>> encargados() {
        return service.encargados();
    }

    @GetMapping("/{id}")
    public LaboratorioResponse obtener(@PathVariable Integer id) {
        return service.obtener(id);
    }

    @PostMapping
    public ResponseEntity<LaboratorioResponse> crear(@Valid @RequestBody LaboratorioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.guardar(null, request));
    }

    @PutMapping("/{id}")
    public LaboratorioResponse editar(@PathVariable Integer id, @Valid @RequestBody LaboratorioRequest request) {
        return service.guardar(id, request);
    }
}
