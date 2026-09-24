package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.dto.ArchivoAdjuntoResponse;
import com.proyecto.incidenciasback.service.ArchivoAdjuntoService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ArchivoAdjuntoController {

    private final ArchivoAdjuntoService archivoAdjuntoService;

    public ArchivoAdjuntoController(ArchivoAdjuntoService archivoAdjuntoService) {
        this.archivoAdjuntoService = archivoAdjuntoService;
    }

    /**
     * Subir un archivo adjunto a una incidencia.
     * POST /api/incidencias/{incidenciaId}/adjuntos
     * Form-data: file (MultipartFile), usuarioId (Integer)
     */
    @PostMapping("/incidencias/{incidenciaId}/adjuntos")
    public ResponseEntity<ArchivoAdjuntoResponse> subirArchivo(
            @PathVariable Integer incidenciaId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "usuarioId", required = false) Integer usuarioId) {
        ArchivoAdjuntoResponse response = archivoAdjuntoService.subirArchivo(incidenciaId, usuarioId, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Listar archivos adjuntos de una incidencia.
     * GET /api/incidencias/{incidenciaId}/adjuntos
     */
    @GetMapping("/incidencias/{incidenciaId}/adjuntos")
    public ResponseEntity<List<ArchivoAdjuntoResponse>> listarAdjuntos(@PathVariable Integer incidenciaId) {
        return ResponseEntity.ok(archivoAdjuntoService.listarPorIncidencia(incidenciaId));
    }

    /**
     * Descargar/servir un archivo adjunto.
     * GET /api/adjuntos/{incidenciaId}/{filename}
     */
    @GetMapping("/adjuntos/{incidenciaId}/{filename}")
    public ResponseEntity<Resource> descargarArchivo(
            @PathVariable Integer incidenciaId,
            @PathVariable String filename) {
        try {
            Resource resource = archivoAdjuntoService.cargarArchivo(incidenciaId, filename);
            String lowerName = filename.toLowerCase();
            String contentType = "application/octet-stream";

            if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
                contentType = "image/jpeg";
            } else if (lowerName.endsWith(".png")) {
                contentType = "image/png";
            } else if (lowerName.endsWith(".gif")) {
                contentType = "image/gif";
            } else if (lowerName.endsWith(".webp")) {
                contentType = "image/webp";
            } else if (lowerName.endsWith(".svg")) {
                contentType = "image/svg+xml";
            } else if (lowerName.endsWith(".pdf")) {
                contentType = "application/pdf";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
