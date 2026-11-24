package com.proyecto.incidenciasback.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "local", matchIfMissing = true)
public class LocalAdjuntoStorage implements AdjuntoStorage {
    private final Path root;

    public LocalAdjuntoStorage(@Value("${app.upload-dir:./uploads}") String directorio) throws IOException {
        root = Path.of(directorio).toAbsolutePath().normalize();
        Files.createDirectories(root);
    }

    private Path resolver(String nombre) {
        Path path = root.resolve(nombre).normalize();
        if (!path.startsWith(root)) throw new IllegalArgumentException("Ruta de adjunto no válida");
        return path;
    }

    @Override
    public void guardar(String nombre, InputStream contenido, String contentType) throws IOException {
        Path path = resolver(nombre);
        Files.createDirectories(path.getParent());
        Files.copy(contenido, path);
    }

    @Override
    public Resource cargar(String nombre) {
        Path path = resolver(nombre);
        if (!Files.isRegularFile(path) || !Files.isReadable(path)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Archivo no encontrado");
        }
        try {
            return new UrlResource(path.toUri());
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo leer el adjunto", e);
        }
    }

    @Override
    public void eliminar(String nombre) {
        try {
            Files.deleteIfExists(resolver(nombre));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo eliminar el adjunto", e);
        }
    }
}
