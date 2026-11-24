package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.CambiarEstadoRequest;
import com.proyecto.incidenciasback.model.Incidencia;
import com.proyecto.incidenciasback.model.Usuario;
import com.proyecto.incidenciasback.repository.*;
import com.proyecto.incidenciasback.security.AuthHelper;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionSynchronizationUtils;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ResolucionCorreoTest {
    @Mock IncidenciaRepository incidenciaRepository;
    @Mock UsuarioRepository usuarioRepository;
    @Mock CategoriaRepository categoriaRepository;
    @Mock PrioridadRepository prioridadRepository;
    @Mock UbicacionRepository ubicacionRepository;
    @Mock EquipoRepository equipoRepository;
    @Mock HistorialEstadoRepository historialEstadoRepository;
    @Mock ArchivoAdjuntoRepository archivoAdjuntoRepository;
    @Mock AuthHelper authHelper;
    @Mock NotificacionService notificacionService;
    @Mock EmailService emailService;
    @InjectMocks IncidenciaService service;
    Incidencia incidencia;
    CambiarEstadoRequest request;

    @BeforeEach void preparar() {
        TransactionSynchronizationManager.initSynchronization();
        incidencia = new Incidencia();
        incidencia.setId(42);
        incidencia.setEstado("En atención");
        Usuario estudiante = new Usuario();
        estudiante.setId(7);
        incidencia.setEstudiante(estudiante);
        when(incidenciaRepository.findById(42)).thenReturn(Optional.of(incidencia));
        when(authHelper.obtenerUsuarioAutenticado()).thenReturn(new Usuario());
        request = new CambiarEstadoRequest();
        request.setEstado("Resuelta");
        request.setSolucionTecnica("Se reemplazó el cable dañado");
    }

    @AfterEach void limpiar() { TransactionSynchronizationManager.clearSynchronization(); }

    @Test void enviaSoloDespuesDeConfirmarLaTransaccion() {
        service.cambiarEstado(42, request);
        verifyNoInteractions(emailService);
        TransactionSynchronizationUtils.triggerAfterCommit();
        verify(emailService).enviarCorreoResolucionIncidencia(incidencia);
    }

    @Test void rollbackNoEnviaCorreo() {
        service.cambiarEstado(42, request);
        TransactionSynchronizationUtils.triggerAfterCompletion(TransactionSynchronization.STATUS_ROLLED_BACK);
        verifyNoInteractions(emailService);
    }

    @Test void noDuplicaCorreoSiYaEstabaResuelta() {
        incidencia.setEstado("Resuelta");
        service.cambiarEstado(42, request);
        TransactionSynchronizationUtils.triggerAfterCommit();
        verifyNoInteractions(emailService);
    }

    @Test void falloDelCorreoNoRevierteLaResolucionConfirmada() {
        doThrow(new RuntimeException("Correo no disponible")).when(emailService).enviarCorreoResolucionIncidencia(incidencia);
        service.cambiarEstado(42, request);
        assertDoesNotThrow(TransactionSynchronizationUtils::triggerAfterCommit);
        assertEquals("Resuelta", incidencia.getEstado());
    }
}
