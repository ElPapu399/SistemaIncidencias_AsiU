package com.proyecto.incidenciasback.controller;

import com.proyecto.incidenciasback.config.SecurityConfig;
import com.proyecto.incidenciasback.model.*;
import com.proyecto.incidenciasback.repository.*;
import com.proyecto.incidenciasback.security.*;
import com.proyecto.incidenciasback.service.EquipoService;
import com.proyecto.incidenciasback.service.LaboratorioService;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({EquipoController.class, LaboratorioController.class})
@Import({SecurityConfig.class, JwtAuthFilter.class, EquipoService.class, LaboratorioService.class})
class InventarioControllerTest {
    @Autowired MockMvc mvc;
    @MockBean EquipoRepository equipos;
    @MockBean UbicacionRepository ubicaciones;
    @MockBean UsuarioRepository usuarios;
    @MockBean HistorialEquipoRepository historial;
    @MockBean AuthHelper auth;
    @MockBean JwtUtil jwt;

    @BeforeEach void setUp() { sesion("ADMIN"); }
    void sesion(String rol) {
        when(jwt.validateAndGetClaims("token")).thenReturn(Jwts.claims().subject("admin@example.com").add("rol", rol).build());
    }
    Ubicacion laboratorio() {
        Ubicacion lab = new Ubicacion(); lab.setId(9); lab.setAulaLaboratorio("Laboratorio A");
        lab.setPabellon("Pabellón A"); lab.setPiso(1); lab.setTipo("Laboratorio"); return lab;
    }
    Equipo equipo(Ubicacion lab) {
        Equipo equipo = new Equipo(); equipo.setId(20); equipo.setCodigo("PC-A-01");
        equipo.setTipo("PC"); equipo.setEstado("En reparación"); equipo.setUbicacion(lab); return equipo;
    }
    String activo(String codigo, String serie) {
        return "{\"codigo\":\"" + codigo + "\",\"tipo\":\"PC\",\"marca\":\"Dell\",\"modelo\":\"OptiPlex\",\"numeroSerie\":\"" + serie + "\",\"ubicacionId\":9}";
    }

    @Test void listaSoloEquiposDelLaboratorioSeleccionado() throws Exception {
        when(equipos.findByUbicacionId(9)).thenReturn(List.of(equipo(laboratorio())));
        mvc.perform(get("/api/equipos?ubicacionId=9").header("Authorization", "Bearer token"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].ubicacionId").value(9));
        verify(equipos, never()).findAll();
    }

    @Test void creaEquipoConLaboratorioRealYEstadoInicialOperativo() throws Exception {
        Ubicacion lab = laboratorio(); when(ubicaciones.findById(9)).thenReturn(Optional.of(lab));
        when(equipos.save(any())).thenAnswer(invocation -> { Equipo e = invocation.getArgument(0); e.setId(21); return e; });
        mvc.perform(post("/api/equipos").header("Authorization", "Bearer token").contentType(MediaType.APPLICATION_JSON).content(activo(" PC-A-02 ", "SERIE-2")))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.codigo").value("PC-A-02"))
                .andExpect(jsonPath("$.estado").value("Operativo")).andExpect(jsonPath("$.ubicacionId").value(9))
                .andExpect(jsonPath("$.numeroSerie").value("SERIE-2"));
    }

    @Test void editarConservaIdEstadoYVinculos() throws Exception {
        Ubicacion lab = laboratorio(); Equipo equipo = equipo(lab);
        when(ubicaciones.findById(9)).thenReturn(Optional.of(lab)); when(equipos.findById(20)).thenReturn(Optional.of(equipo));
        when(equipos.save(equipo)).thenReturn(equipo);
        mvc.perform(put("/api/equipos/20").header("Authorization", "Bearer token").contentType(MediaType.APPLICATION_JSON).content(activo("PC-A-01", "SERIE-1")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(20)).andExpect(jsonPath("$.estado").value("En reparación"));
        assertThat(equipo.getUbicacion()).isSameAs(lab);
        verifyNoInteractions(historial);
    }

    @Test void rechazaCodigoYSerieDuplicadosSinGuardar() throws Exception {
        when(equipos.findByCodigoIgnoreCase("PC-A-01")).thenReturn(Optional.of(equipo(laboratorio())));
        mvc.perform(post("/api/equipos").header("Authorization", "Bearer token").contentType(MediaType.APPLICATION_JSON).content(activo("PC-A-01", "SERIE-1")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value("Ya existe un equipo con ese código"));
        when(equipos.findByNumeroSerieIgnoreCase("SERIE-1")).thenReturn(Optional.of(equipo(laboratorio())));
        mvc.perform(post("/api/equipos").header("Authorization", "Bearer token").contentType(MediaType.APPLICATION_JSON).content(activo("PC-A-02", "SERIE-1")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value("Ya existe un equipo con ese número de serie"));
        verify(equipos, never()).save(any());
    }

    @Test void cambiarEstadoRegistraMotivoUsuarioYFechaSinEliminarEquipo() throws Exception {
        Equipo equipo = equipo(laboratorio()); Usuario actor = new Usuario(); actor.setId(7);
        when(equipos.findById(20)).thenReturn(Optional.of(equipo)); when(equipos.save(equipo)).thenReturn(equipo);
        when(auth.obtenerUsuarioAutenticado()).thenReturn(actor);
        mvc.perform(put("/api/equipos/20/estado").header("Authorization", "Bearer token").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"estado":"Dado de baja","motivo":"  Daño irreparable  "}
                                """))
                .andExpect(status().isOk()).andExpect(jsonPath("$.estado").value("Dado de baja"));
        var captor = org.mockito.ArgumentCaptor.forClass(HistorialEquipo.class);
        verify(historial).save(captor.capture());
        assertThat(captor.getValue().getEstadoAnterior()).isEqualTo("En reparación");
        assertThat(captor.getValue().getUsuario()).isSameAs(actor);
        assertThat(captor.getValue().getMotivo()).isEqualTo("Daño irreparable");
        assertThat(captor.getValue().getFecha()).isNotNull();
        verify(equipos, never()).delete(any());
    }

    @Test void validaEstadoMotivoYFechaDeAdquisicion() throws Exception {
        mvc.perform(put("/api/equipos/20/estado").header("Authorization", "Bearer token").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"estado":"Inventado","motivo":"  "}
                                """))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/equipos").header("Authorization", "Bearer token").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"codigo":"PC-NUEVO","tipo":"PC","ubicacionId":9,"fechaAdquisicion":"2999-01-01"}
                                """))
                .andExpect(status().isBadRequest());
        verify(equipos, never()).save(any()); verifyNoInteractions(historial);
    }

    @Test void resumenLaboratorioCuentaInventarioRealSinInventarCapacidadNiEncargado() throws Exception {
        Ubicacion lab = laboratorio(); Equipo pc = equipo(lab); Equipo proyector = equipo(lab); proyector.setTipo("Proyector");
        when(ubicaciones.findById(9)).thenReturn(Optional.of(lab)); when(equipos.findByUbicacionId(9)).thenReturn(List.of(pc, proyector));
        mvc.perform(get("/api/laboratorios/9").header("Authorization", "Bearer token"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.cantidadEquipos").value(2))
                .andExpect(jsonPath("$.cantidadPCs").value(1)).andExpect(jsonPath("$.capacidad").isEmpty())
                .andExpect(jsonPath("$.encargado").isEmpty());
    }

    @Test void estudianteNoPuedeModificarInventarioPeroConservaConsultaDeEquiposParaIncidencias() throws Exception {
        sesion("ESTUDIANTE");
        mvc.perform(post("/api/equipos").header("Authorization", "Bearer token")).andExpect(status().isForbidden());
        mvc.perform(put("/api/equipos/20").header("Authorization", "Bearer token")).andExpect(status().isForbidden());
        mvc.perform(put("/api/equipos/20/estado").header("Authorization", "Bearer token")).andExpect(status().isForbidden());
        mvc.perform(get("/api/equipos?ubicacionId=9").header("Authorization", "Bearer token")).andExpect(status().isOk());
        verify(equipos, never()).save(any());
    }

    @Test void especialistaPuedeConsultarLaboratorioPeroNoCrearlo() throws Exception {
        sesion("TECNICO_ESPECIALISTA");
        mvc.perform(get("/api/laboratorios").header("Authorization", "Bearer token")).andExpect(status().isOk());
        mvc.perform(post("/api/laboratorios").header("Authorization", "Bearer token")).andExpect(status().isForbidden());
    }

    @Test void equipoNoPuedeSerCreadoEnUnAulaNiMovidoDesdeEdicion() throws Exception {
        Ubicacion aula = laboratorio(); aula.setTipo("Aula"); when(ubicaciones.findById(9)).thenReturn(Optional.of(aula));
        mvc.perform(post("/api/equipos").header("Authorization", "Bearer token").contentType(MediaType.APPLICATION_JSON).content(activo("PC-NUEVO", "")))
                .andExpect(status().isBadRequest());
        Ubicacion destino = laboratorio(); when(ubicaciones.findById(9)).thenReturn(Optional.of(destino));
        Ubicacion origen = laboratorio(); origen.setId(10); when(equipos.findById(20)).thenReturn(Optional.of(equipo(origen)));
        mvc.perform(put("/api/equipos/20").header("Authorization", "Bearer token").contentType(MediaType.APPLICATION_JSON).content(activo("PC-NUEVO", "")))
                .andExpect(status().isBadRequest());
        verify(equipos, never()).save(any());
    }

    @Test void creaLaboratorioSinConteosManualesYConEncargadoReal() throws Exception {
        Usuario encargado = new Usuario(); encargado.setId(7); encargado.setNombre("Carlos"); encargado.setApellido("Mendoza");
        Rol rol = new Rol(); rol.setNombre("TECNICO_ESPECIALISTA"); encargado.setRol(rol); encargado.setEstado("Activo");
        when(usuarios.findById(7)).thenReturn(Optional.of(encargado));
        when(ubicaciones.saveAndFlush(any())).thenAnswer(invocation -> {
            Ubicacion lab = invocation.getArgument(0); lab.setId(30);
            when(ubicaciones.findById(30)).thenReturn(Optional.of(lab)); return lab;
        });
        mvc.perform(post("/api/laboratorios").header("Authorization", "Bearer token").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre":"Laboratorio nuevo","pabellon":"Pabellón C","piso":2,"capacidad":30,"encargadoId":7,"estado":"Operativo","cantidadPCs":999}
                                """))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(30))
                .andExpect(jsonPath("$.cantidadPCs").value(0)).andExpect(jsonPath("$.cantidadEquipos").value(0))
                .andExpect(jsonPath("$.encargado").value("Carlos Mendoza"));
    }

    @Test void editarLaboratorioConservaIdYNoModificaSusEquipos() throws Exception {
        Ubicacion lab = laboratorio(); when(ubicaciones.findById(9)).thenReturn(Optional.of(lab));
        when(ubicaciones.saveAndFlush(lab)).thenReturn(lab);
        when(equipos.findByUbicacionId(9)).thenReturn(List.of(equipo(lab)));
        mvc.perform(put("/api/laboratorios/9").header("Authorization", "Bearer token").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre":"Laboratorio renombrado","pabellon":"Pabellón A","piso":1,"capacidad":25,"estado":"Mantenimiento"}
                                """))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(9))
                .andExpect(jsonPath("$.nombre").value("Laboratorio renombrado"))
                .andExpect(jsonPath("$.cantidadEquipos").value(1));
        verify(equipos, never()).save(any());
    }
}
