package com.proyecto.incidenciasback.storage;

import com.proyecto.incidenciasback.service.ArchivoAdjuntoService;
import com.proyecto.incidenciasback.model.*;
import com.proyecto.incidenciasback.repository.*;
import java.io.InputStream;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import org.mockito.ArgumentCaptor;

class ArchivoAdjuntoStorageTest {
    private final ArchivoAdjuntoRepository repository = mock(ArchivoAdjuntoRepository.class);
    private final IncidenciaRepository incidents = mock(IncidenciaRepository.class);
    private final UsuarioRepository users = mock(UsuarioRepository.class);
    private final AdjuntoStorage storage = mock(AdjuntoStorage.class);
    private final ArchivoAdjuntoService service = new ArchivoAdjuntoService(repository, incidents, users, storage);
    private final MockMultipartFile file = new MockMultipartFile("file", "foto.webp", "image/webp", new byte[]{1, 2});

    private void prepararIncidencia() {
        Incidencia incident = new Incidencia();
        incident.setId(24);
        when(incidents.findById(24)).thenReturn(Optional.of(incident));
    }

    @Test void referenciaYObjetoCoincidenSinCambiarElContratoDelFrontend() throws Exception {
        prepararIncidencia();
        var response = service.subirArchivo(24, null, file);
        var name = ArgumentCaptor.forClass(String.class);
        verify(storage).guardar(name.capture(), any(InputStream.class), eq("image/webp"));
        assertTrue(name.getValue().startsWith("incidencias/24/"));
        assertTrue(name.getValue().endsWith(".webp"));
        assertEquals("/api/adjuntos/24/" + name.getValue().substring(name.getValue().lastIndexOf('/') + 1), response.getUrlArchivo());
        verify(repository).save(any(ArchivoAdjunto.class));
    }

    @Test void limpiaObjetoSiFallaGuardarReferencia() throws Exception {
        prepararIncidencia();
        when(repository.save(any())).thenThrow(new RuntimeException("BD no disponible"));
        assertThrows(RuntimeException.class, () -> service.subirArchivo(24, null, file));
        var name = ArgumentCaptor.forClass(String.class);
        verify(storage).guardar(name.capture(), any(InputStream.class), eq("image/webp"));
        verify(storage).eliminar(name.getValue());
    }

    @Test void unaSubidaFallidaNoCreaReferenciaEnBD() throws Exception {
        prepararIncidencia();
        doThrow(new RuntimeException("Storage no disponible")).when(storage).guardar(anyString(), any(InputStream.class), anyString());
        assertThrows(RuntimeException.class, () -> service.subirArchivo(24, null, file));
        verifyNoInteractions(repository);
    }

    @Test void bloqueaRutasManipuladasAntesDeAccederAlBucket() {
        assertThrows(IllegalArgumentException.class, () -> service.cargarArchivo(24, "../secreto"));
        assertThrows(IllegalArgumentException.class, () -> service.cargarArchivo(24, "..\\secreto"));
        assertThrows(IllegalArgumentException.class, () -> service.cargarArchivo(-1, "foto.webp"));
        verifyNoInteractions(storage);
    }
}
