package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.ArchivoAdjuntoResponse;
import com.proyecto.incidenciasback.model.ArchivoAdjunto;
import com.proyecto.incidenciasback.model.Incidencia;
import com.proyecto.incidenciasback.model.Usuario;
import com.proyecto.incidenciasback.repository.ArchivoAdjuntoRepository;
import com.proyecto.incidenciasback.repository.IncidenciaRepository;
import com.proyecto.incidenciasback.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ArchivoAdjuntoService {

    private final ArchivoAdjuntoRepository archivoAdjuntoRepository;
    private final IncidenciaRepository incidenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final Path uploadDir;

    public ArchivoAdjuntoService(ArchivoAdjuntoRepository archivoAdjuntoRepository,
                                  IncidenciaRepository incidenciaRepository,
                                  UsuarioRepository usuarioRepository,
                                  @Value("${app.upload-dir:./uploads}") String uploadPath) {
        this.archivoAdjuntoRepository = archivoAdjuntoRepository;
        this.incidenciaRepository = incidenciaRepository;
        this.usuarioRepository = usuarioRepository;
        this.uploadDir = Paths.get(uploadPath).toAbsolutePath().normalize();

        // Crear directorio de uploads si no existe
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("No se pudo crear el directorio de uploads: " + uploadPath, e);
        }
    }

    /**
     * Sube un archivo adjunto a una incidencia.
     */
    public ArchivoAdjuntoResponse subirArchivo(Integer incidenciaId, Integer usuarioId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("El archivo está vacío");
        }

        Incidencia incidencia = incidenciaRepository.findById(incidenciaId)
                .orElseThrow(() -> new RuntimeException("Incidencia no encontrada con id: " + incidenciaId));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + usuarioId));

        try {
            // Crear subdirectorio por incidencia
            Path incidenciaDir = this.uploadDir.resolve("incidencias").resolve(String.valueOf(incidenciaId));
            Files.createDirectories(incidenciaDir);

            // Generar nombre único para evitar colisiones
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + extension;

            // Guardar archivo en disco
            Path targetPath = incidenciaDir.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            // Guardar registro en BD
            ArchivoAdjunto adjunto = new ArchivoAdjunto();
            adjunto.setIncidencia(incidencia);
            adjunto.setUrlArchivo("/api/adjuntos/" + incidenciaId + "/" + uniqueFilename);
            adjunto.setNombreOriginal(originalFilename != null ? originalFilename : "archivo");
            adjunto.setTipoArchivo(file.getContentType());
            adjunto.setTamanioByte(file.getSize());
            adjunto.setSubidoPor(usuario);
            adjunto.setFechaSubida(LocalDateTime.now());

            archivoAdjuntoRepository.save(adjunto);

            return toResponse(adjunto);

        } catch (IOException e) {
            throw new RuntimeException("Error al guardar el archivo: " + e.getMessage(), e);
        }
    }

    /**
     * Lista los archivos adjuntos de una incidencia.
     */
    public List<ArchivoAdjuntoResponse> listarPorIncidencia(Integer incidenciaId) {
        return archivoAdjuntoRepository.findByIncidenciaIdOrderByFechaSubidaDesc(incidenciaId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Carga un archivo desde disco para descarga.
     */
    public Resource cargarArchivo(Integer incidenciaId, String filename) {
        try {
            Path filePath = this.uploadDir
                    .resolve("incidencias")
                    .resolve(String.valueOf(incidenciaId))
                    .resolve(filename)
                    .normalize();

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Archivo no encontrado: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Archivo no encontrado: " + filename, e);
        }
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
