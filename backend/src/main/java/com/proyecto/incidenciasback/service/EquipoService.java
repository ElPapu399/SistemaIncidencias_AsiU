package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.EquipoResponse;
import com.proyecto.incidenciasback.dto.EquipoRequest;
import com.proyecto.incidenciasback.dto.EquipoEstadoRequest;
import com.proyecto.incidenciasback.model.Equipo;
import com.proyecto.incidenciasback.model.HistorialEquipo;
import com.proyecto.incidenciasback.repository.EquipoRepository;
import com.proyecto.incidenciasback.repository.UbicacionRepository;
import com.proyecto.incidenciasback.repository.HistorialEquipoRepository;
import com.proyecto.incidenciasback.security.AuthHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
@Transactional(readOnly = true)
public class EquipoService {

    private final EquipoRepository equipoRepository;
    private final UbicacionRepository ubicaciones;
    private final HistorialEquipoRepository historial;
    private final AuthHelper auth;

    public EquipoService(EquipoRepository equipoRepository, UbicacionRepository ubicaciones,
                         HistorialEquipoRepository historial, AuthHelper auth) {
        this.equipoRepository = equipoRepository;
        this.ubicaciones = ubicaciones;
        this.historial = historial;
        this.auth = auth;
    }

    public List<EquipoResponse> listarTodos() {
        return equipoRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<EquipoResponse> listarPorUbicacion(Integer ubicacionId) {
        return equipoRepository.findByUbicacionId(ubicacionId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public EquipoResponse obtenerPorId(Integer id) {
        Equipo equipo = equipoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipo no encontrado con id: " + id));
        return toResponse(equipo);
    }

    @Transactional
    public EquipoResponse guardar(Integer id, EquipoRequest request) {
        String codigo = request.codigo().trim();
        String tipo = request.tipo().trim();
        if (codigo.isBlank() || tipo.isBlank()) throw new IllegalArgumentException("El código y el tipo son obligatorios");
        equipoRepository.findByCodigoIgnoreCase(codigo).ifPresent(e -> {
            if (!Objects.equals(e.getId(), id)) throw new IllegalArgumentException("Ya existe un equipo con ese código");
        });
        String serie = opcional(request.numeroSerie());
        if (serie != null) equipoRepository.findByNumeroSerieIgnoreCase(serie).ifPresent(e -> {
            if (!Objects.equals(e.getId(), id)) throw new IllegalArgumentException("Ya existe un equipo con ese número de serie");
        });
        var ubicacion = ubicaciones.findById(request.ubicacionId())
                .orElseThrow(() -> new IllegalArgumentException("Laboratorio no encontrado"));
        if (!"Laboratorio".equalsIgnoreCase(ubicacion.getTipo())) throw new IllegalArgumentException("La ubicación debe ser un laboratorio");
        Equipo equipo = id == null ? new Equipo() : buscar(id);
        if (id != null && !Objects.equals(equipo.getUbicacion() == null ? null : equipo.getUbicacion().getId(), ubicacion.getId())) {
            throw new IllegalArgumentException("No se permite trasladar equipos desde este formulario");
        }
        equipo.setCodigo(codigo);
        equipo.setTipo(tipo);
        equipo.setMarca(opcional(request.marca()));
        equipo.setModelo(opcional(request.modelo()));
        equipo.setNumeroSerie(serie);
        equipo.setFechaAdquisicion(request.fechaAdquisicion());
        equipo.setUbicacion(ubicacion);
        if (id == null) equipo.setEstado("Operativo");
        return toResponse(equipoRepository.save(equipo));
    }

    @Transactional
    public EquipoResponse cambiarEstado(Integer id, EquipoEstadoRequest request) {
        Equipo equipo = buscar(id);
        if (equipo.getEstado().equals(request.estado())) throw new IllegalArgumentException("Selecciona un estado diferente al actual");
        HistorialEquipo cambio = new HistorialEquipo();
        cambio.setEquipo(equipo);
        cambio.setUsuario(auth.obtenerUsuarioAutenticado());
        cambio.setEstadoAnterior(equipo.getEstado());
        cambio.setEstadoNuevo(request.estado());
        cambio.setMotivo(request.motivo().trim());
        cambio.setFecha(LocalDateTime.now(ZoneId.of("America/Lima")));
        equipo.setEstado(request.estado());
        Equipo guardado = equipoRepository.save(equipo);
        historial.save(cambio);
        return toResponse(guardado);
    }

    private Equipo buscar(Integer id) {
        return equipoRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Equipo no encontrado"));
    }

    private String opcional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private EquipoResponse toResponse(Equipo e) {
        return new EquipoResponse(
                e.getId(),
                e.getCodigo(),
                e.getTipo(),
                e.getMarca(),
                e.getModelo(),
                e.getUbicacion() != null ? e.getUbicacion().getId() : null,
                e.getUbicacion() != null
                        ? e.getUbicacion().getPabellon() + " - " + e.getUbicacion().getAulaLaboratorio()
                        : null,
                e.getEstado(), e.getNumeroSerie(), e.getFechaAdquisicion()
        );
    }
}
