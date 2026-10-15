package com.proyecto.incidenciasback.config;

import com.proyecto.incidenciasback.model.Rol;
import com.proyecto.incidenciasback.model.Usuario;
import com.proyecto.incidenciasback.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataLoaderTest {
    @Mock UsuarioRepository usuarios;
    @Mock RolRepository roles;
    @Mock EspecialidadRepository especialidades;
    @Mock PrioridadRepository prioridades;
    @Mock UbicacionRepository ubicaciones;
    @Mock CategoriaRepository categorias;
    @Mock EquipoRepository equipos;
    @Mock IncidenciaRepository incidencias;
    @Mock HistorialEstadoRepository historial;
    @Mock ArchivoAdjuntoRepository adjuntos;
    @Mock BCryptPasswordEncoder passwordEncoder;
    @InjectMocks DataLoader loader;

    @Test
    void reiniciarNoRecreaEspecialidadesNiCategoriasRenombradas() {
        // Simula una base ya inicializada, con usuarios y catálogos administrados.
        when(especialidades.count()).thenReturn(4L);
        when(roles.findByNombre(anyString())).thenReturn(Optional.of(new Rol()));
        when(usuarios.findByCorreo(anyString())).thenReturn(Optional.of(new Usuario()));
        when(equipos.count()).thenReturn(1L);
        when(incidencias.count()).thenReturn(1L);

        loader.run();

        verify(especialidades, never()).findByNombre(anyString());
        verify(especialidades, never()).save(any());
        verify(categorias, never()).save(any());
    }
}
