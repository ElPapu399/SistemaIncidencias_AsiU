package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.ArchivoAdjuntoResponse;
import com.proyecto.incidenciasback.model.ArchivoAdjunto;
import com.proyecto.incidenciasback.model.Incidencia;
import com.proyecto.incidenciasback.model.Usuario;
import com.proyecto.incidenciasback.repository.ArchivoAdjuntoRepository;
import com.proyecto.incidenciasback.repository.IncidenciaRepository;
import com.proyecto.incidenciasback.repository.UsuarioRepository;
import com.proyecto.incidenciasback.storage.AdjuntoStorage;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ArchivoAdjuntoService {

    private final ArchivoAdjuntoRepository archivoAdjuntoRepository;
    private final IncidenciaRepository incidenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AdjuntoStorage storage;

    public ArchivoAdjuntoService(ArchivoAdjuntoRepository archivoAdjuntoRepository,
                                  IncidenciaRepository incidenciaRepository,
                                  UsuarioRepository usuarioRepository,
                                  AdjuntoStorage storage) {
        this.archivoAdjuntoRepository = archivoAdjuntoRepository;
        this.incidenciaRepository = incidenciaRepository;
        this.usuarioRepository = usuarioRepository;
        this.storage = storage;
    }

    public ArchivoAdjuntoResponse subirArchivo(Integer incidenciaId, Integer usuarioId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("El archivo está vacío");
        }

        Incidencia incidencia = incidenciaRepository.findById(incidenciaId)
                .orElseThrow(() -> new RuntimeException("Incidencia no encontrada con id: " + incidenciaId));

        Usuario usuario = null;
        if (usuarioId != null) {
            usuario = usuarioRepository.findById(usuarioId).orElse(null);
        }
        if (usuario == null) {
            usuario = incidencia.getEstudiante();
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + extension;

            String nombre = nombreObjeto(incidenciaId, uniqueFilename);
            try (var contenido = file.getInputStream()) {
                storage.guardar(nombre, contenido, file.getContentType());
            }

            ArchivoAdjunto adjunto = new ArchivoAdjunto();
            adjunto.setIncidencia(incidencia);
            adjunto.setUrlArchivo("/api/adjuntos/" + incidenciaId + "/" + uniqueFilename);
            adjunto.setNombreOriginal(originalFilename != null ? originalFilename : "archivo");
            adjunto.setTipoArchivo(file.getContentType());
            adjunto.setTamanioByte(file.getSize());
            adjunto.setSubidoPor(usuario);
            adjunto.setFechaSubida(LocalDateTime.now());

            try {
                archivoAdjuntoRepository.save(adjunto);
            } catch (RuntimeException e) {
                // No dejar archivos huérfanos si la referencia no pudo guardarse.
                try {
                    storage.eliminar(nombre);
                } catch (RuntimeException cleanupError) {
                    LoggerFactory.getLogger(ArchivoAdjuntoService.class)
                            .warn("No se pudo limpiar un adjunto sin referencia: {}", nombre, cleanupError);
                }
                throw e;
            }

            return toResponse(adjunto);

        } catch (IOException e) {
            throw new RuntimeException("Error al guardar el archivo: " + e.getMessage(), e);
        }
    }

    public List<ArchivoAdjuntoResponse> listarPorIncidencia(Integer incidenciaId) {
        return archivoAdjuntoRepository.findByIncidenciaIdOrderByFechaSubidaDesc(incidenciaId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private String nombreObjeto(Integer incidenciaId, String filename) {
        if (incidenciaId == null || incidenciaId <= 0 || filename == null
                || !filename.matches("[A-Za-z0-9][A-Za-z0-9._-]*") || filename.contains("..")) {
            throw new IllegalArgumentException("Ruta de adjunto no válida");
        }
        return "incidencias/" + incidenciaId + "/" + filename;
    }

    public Resource cargarArchivo(Integer incidenciaId, String filename) {
        return storage.cargar(nombreObjeto(incidenciaId, filename));
    }

    private ArchivoAdjuntoResponse toResponse(ArchivoAdjunto a) {
        return new ArchivoAdjuntoResponse(
                a.getId(),
                a.getIncidencia().getId(),
                a.getUrlArchivo(),
                a.getNombreOriginal(),
                a.getTipoArchivo(),
                a.getTamanioByte(),
                a.getSubidoPor() != null ? a.getSubidoPor().getId() : null,
                a.getSubidoPor() != null
                        ? a.getSubidoPor().getNombre() + " " + a.getSubidoPor().getApellido()
                        : null,
                a.getFechaSubida()
        );
    }
}
