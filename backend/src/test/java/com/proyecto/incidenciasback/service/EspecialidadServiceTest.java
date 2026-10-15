package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.EspecialidadRequest;
import com.proyecto.incidenciasback.model.Especialidad;
import com.proyecto.incidenciasback.repository.EspecialidadRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EspecialidadServiceTest {
    @Mock EspecialidadRepository especialidades;
    EspecialidadService service;

    @BeforeEach
    void setUp() {
        service = new EspecialidadService(especialidades);
    }

    private Especialidad especialidad(int id, String nombre) {
        Especialidad especialidad = new Especialidad();
        especialidad.setId(id);
        especialidad.setNombre(nombre);
        return especialidad;
    }

    @Test
    void crearRecortaNombreYDescripcion() {
        when(especialidades.save(any(Especialidad.class))).thenAnswer(invocation -> {
            Especialidad creada = invocation.getArgument(0);
            creada.setId(5);
            return creada;
        });

        Especialidad resultado = service.guardar(null, new EspecialidadRequest("  Seguridad  ", "  Seguridad informática  "));

        assertThat(resultado.getId()).isEqualTo(5);
        assertThat(resultado.getNombre()).isEqualTo("Seguridad");
        assertThat(resultado.getDescripcion()).isEqualTo("Seguridad informática");
    }

    @Test
    void editarMantieneIdSinRecrearEspecialidad() {
        Especialidad existente = especialidad(2, "Redes");
        when(especialidades.findByNombreIgnoreCase("Redes")).thenReturn(Optional.of(existente));
        when(especialidades.findById(2)).thenReturn(Optional.of(existente));
        when(especialidades.save(existente)).thenReturn(existente);

        Especialidad resultado = service.guardar(2, new EspecialidadRequest("Redes", "Conectividad del campus"));

        assertThat(resultado).isSameAs(existente);
        assertThat(resultado.getId()).isEqualTo(2);
        assertThat(resultado.getDescripcion()).isEqualTo("Conectividad del campus");
    }

    @Test
    void rechazaDuplicadosTantoAlCrearComoAlEditar() {
        when(especialidades.findByNombreIgnoreCase("redes")).thenReturn(Optional.of(especialidad(2, "Redes")));
        assertThatThrownBy(() -> service.guardar(null, new EspecialidadRequest("redes", null)))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("Ya existe");
        assertThatThrownBy(() -> service.guardar(3, new EspecialidadRequest("redes", null)))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("Ya existe");
        verify(especialidades, never()).save(any());
    }

    @Test
    void rechazaNombreEnBlancoSinGuardar() {
        assertThatThrownBy(() -> service.guardar(null, new EspecialidadRequest("   ", null)))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("obligatorio");
        verifyNoInteractions(especialidades);
    }

    @Test
    void editarIdInexistenteNoCreaOtraEspecialidad() {
        assertThatThrownBy(() -> service.guardar(999, new EspecialidadRequest("Nueva", null)))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("no encontrada");
        verify(especialidades, never()).save(any());
    }
}
