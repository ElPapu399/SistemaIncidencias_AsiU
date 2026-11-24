package com.proyecto.incidenciasback.storage;

import com.google.cloud.storage.*;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import org.mockito.ArgumentCaptor;

class GcsAdjuntoStorageTest {
    private final Storage client = mock(Storage.class);
    private final GcsAdjuntoStorage storage = new GcsAdjuntoStorage("asiu-adjuntos", client);
    private final String name = "incidencias/24/foto.webp";

    @Test void subeAlBucketPrivadoConTipoWebpSinACLPublica() throws Exception {
        storage.guardar(name, new ByteArrayInputStream(new byte[]{1}), "image/webp");
        var info = ArgumentCaptor.forClass(BlobInfo.class);
        verify(client).createFrom(info.capture(), any(InputStream.class), eq(2 * 1024 * 1024), any(Storage.BlobWriteOption.class));
        assertEquals("asiu-adjuntos", info.getValue().getBucket());
        assertEquals(name, info.getValue().getName());
        assertEquals("image/webp", info.getValue().getContentType());
        assertTrue(info.getValue().getAcl() == null || info.getValue().getAcl().isEmpty());
    }

    @Test void recuperaBytesDelBucketSinURLPublica() throws Exception {
        byte[] bytes = {1, 2, 3};
        when(client.readAllBytes(BlobId.of("asiu-adjuntos", name))).thenReturn(bytes);
        assertArrayEquals(bytes, storage.cargar(name).getContentAsByteArray());
    }

    @Test void objetoAusenteEs404() {
        when(client.readAllBytes(BlobId.of("asiu-adjuntos", name))).thenThrow(new StorageException(404, "Not found"));
        assertEquals(404, assertThrows(ResponseStatusException.class, () -> storage.cargar(name)).getStatusCode().value());
    }

    @Test void permisoDenegadoEs503NoArchivoAusente() {
        when(client.readAllBytes(BlobId.of("asiu-adjuntos", name))).thenThrow(new StorageException(403, "Forbidden"));
        assertEquals(503, assertThrows(ResponseStatusException.class, () -> storage.cargar(name)).getStatusCode().value());
    }

    @Test void requiereNombreDeBucket() {
        assertThrows(IllegalArgumentException.class, () -> new GcsAdjuntoStorage("", client));
    }
}
