package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.CategoriaRequest;
import com.proyecto.incidenciasback.model.Categoria;
import com.proyecto.incidenciasback.model.Especialidad;
import com.proyecto.incidenciasback.model.Prioridad;
import com.proyecto.incidenciasback.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoriaServiceTest {
    @Mock CategoriaRepository categorias;
    @Mock EspecialidadRepository especialidades;
    @Mock PrioridadRepository prioridades;
    @Mock IncidenciaRepository incidencias;
    CategoriaService service;

    @BeforeEach
    void setUp() {
        service = new CategoriaService(categorias, especialidades, prioridades, incidencias);
    }

    private Categoria categoria(int id, String nombre) {
        Categoria categoria = new Categoria();
        categoria.setId(id);
        categoria.setNombre(nombre);
        return categoria;
    }

    @Test
    void listadoCuentaPorIdEIncluyeCategoriasSinIncidencias() {
        var conteo = mock(IncidenciaRepository.ConteoCategoria.class);
        when(conteo.getCategoriaId()).thenReturn(7);
        when(conteo.getTotal()).thenReturn(12L);
        when(incidencias.contarPorCategoria()).thenReturn(List.of(conteo));
        when(categorias.findAll()).thenReturn(List.of(categoria(7, "Error de aplicación"), categoria(9, "Conexión lenta")));

        var resultado = service.listar();

        assertThat(resultado).extracting("id").containsExactly(7, 9);
        assertThat(resultado).extracting("ticketsVinculados").containsExactly(12L, 0L);
    }

    @Test
    void crearRecortaNombreYAsignaReferenciasReales() {
        var especialidad = new Especialidad();
        var prioridad = new Prioridad();
        when(especialidades.findById(2)).thenReturn(Optional.of(especialidad));
        when(prioridades.findById(3)).thenReturn(Optional.of(prioridad));
        when(categorias.save(any(Categoria.class))).thenAnswer(invocation -> {
            Categoria creada = invocation.getArgument(0);
            creada.setId(15);
            return creada;
        });

        var resultado = service.guardar(null, new CategoriaRequest("  Nueva categoría  ", 2, 3));

        assertThat(resultado.nombre()).isEqualTo("Nueva categoría");
        assertThat(resultado.especialidad()).isSameAs(especialidad);
        assertThat(resultado.prioridadDefecto()).isSameAs(prioridad);
        assertThat(resultado.ticketsVinculados()).isZero();
    }

    @Test
    void editarConservaIdYVinculosDeIncidencias() {
        Categoria existente = categoria(7, "Error de aplicación");
        when(categorias.findByNombreIgnoreCase("Error de aplicación")).thenReturn(Optional.of(existente));
        when(categorias.findById(7)).thenReturn(Optional.of(existente));
        when(especialidades.findById(2)).thenReturn(Optional.of(new Especialidad()));
        when(prioridades.findById(3)).thenReturn(Optional.of(new Prioridad()));
        when(categorias.save(existente)).thenReturn(existente);
        when(incidencias.countByCategoriaId(7)).thenReturn(12L);

        var resultado = service.guardar(7, new CategoriaRequest("Error de aplicación", 2, 3));

        assertThat(resultado.id()).isEqualTo(7);
        assertThat(resultado.ticketsVinculados()).isEqualTo(12L);
        verify(incidencias, never()).save(any());
    }

    @Test
    void rechazaNombreDuplicadoSinGuardar() {
        when(categorias.findByNombreIgnoreCase("Error de aplicación"))
                .thenReturn(Optional.of(categoria(7, "Error de aplicación")));

        assertThatThrownBy(() -> service.guardar(null, new CategoriaRequest("Error de aplicación", 2, 3)))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("Ya existe");
        verify(categorias, never()).save(any());
    }

    @Test
    void rechazaEspecialidadInexistenteSinGuardar() {
        assertThatThrownBy(() -> service.guardar(null, new CategoriaRequest("Nueva", 999, 3)))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("Especialidad no encontrada");
        verify(categorias, never()).save(any());
    }

    @Test
    void rechazaPrioridadInexistenteSinGuardar() {
        when(especialidades.findById(2)).thenReturn(Optional.of(new Especialidad()));
        assertThatThrownBy(() -> service.guardar(null, new CategoriaRequest("Nueva", 2, 999)))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("Prioridad no encontrada");
        verify(categorias, never()).save(any());
    }
}
