package com.proyecto.incidenciasback.storage;

import java.io.ByteArrayInputStream;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;

class LocalAdjuntoStorageTest {
    @TempDir Path directory;

    @Test void conservaContenidoEntreInstanciasSinGoogleCloud() throws Exception {
        byte[] content = {82, 73, 70, 70, 1, 2, 3};
        String name = "incidencias/24/foto.webp";
        new LocalAdjuntoStorage(directory.toString()).guardar(name, new ByteArrayInputStream(content), "image/webp");
        assertArrayEquals(content, new LocalAdjuntoStorage(directory.toString()).cargar(name).getContentAsByteArray());
    }

    @Test void archivoAusenteEs404() throws Exception {
        var storage = new LocalAdjuntoStorage(directory.toString());
        var error = assertThrows(ResponseStatusException.class, () -> storage.cargar("incidencias/24/ausente.webp"));
        assertEquals(404, error.getStatusCode().value());
    }

    @Test void bloqueaLecturaFueraDelDirectorio() throws Exception {
        var storage = new LocalAdjuntoStorage(directory.toString());
        assertThrows(IllegalArgumentException.class, () -> storage.cargar("../secreto"));
    }

    @Test void eliminaUnAdjuntoSinReferencia() throws Exception {
        var storage = new LocalAdjuntoStorage(directory.toString());
        String name = "incidencias/24/foto.webp";
        storage.guardar(name, new ByteArrayInputStream(new byte[]{1}), "image/webp");
        storage.eliminar(name);
        assertThrows(ResponseStatusException.class, () -> storage.cargar(name));
    }
}
