package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.AsignarTecnicoRequest;
import com.proyecto.incidenciasback.dto.CambiarEstadoRequest;
import com.proyecto.incidenciasback.dto.IncidenciaRequest;
import com.proyecto.incidenciasback.dto.IncidenciaResponse;
import com.proyecto.incidenciasback.model.*;
import com.proyecto.incidenciasback.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IncidenciaService {

    private final IncidenciaRepository incidenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final PrioridadRepository prioridadRepository;
    private final UbicacionRepository ubicacionRepository;

    public IncidenciaService(IncidenciaRepository incidenciaRepository,
                             UsuarioRepository usuarioRepository,
                             CategoriaRepository categoriaRepository,
                             PrioridadRepository prioridadRepository,
                             UbicacionRepository ubicacionRepository) {
        this.incidenciaRepository = incidenciaRepository;
        this.usuarioRepository = usuarioRepository;
        this.categoriaRepository = categoriaRepository;
        this.prioridadRepository = prioridadRepository;
        this.ubicacionRepository = ubicacionRepository;
    }

    // ==================== LISTAR ====================

    public List<IncidenciaResponse> listarTodas() {
        return incidenciaRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public IncidenciaResponse obtenerPorId(Integer id) {
        Incidencia incidencia = incidenciaRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Incidencia no encontrada con id: " + id));
        return toResponse(incidencia);
    }

    public List<IncidenciaResponse> listarPorEstudiante(Integer estudianteId) {
        return incidenciaRepository.findByEstudianteId(estudianteId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<IncidenciaResponse> listarPorTecnico(Integer tecnicoId) {
        return incidenciaRepository.findByTecnicoId(tecnicoId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ==================== CREAR ====================

    public IncidenciaResponse crearIncidencia(IncidenciaRequest request) {
        Usuario estudiante = usuarioRepository.findById(request.getEstudianteId())
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado con id: " + request.getEstudianteId()));

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con id: " + request.getCategoriaId()));

        Prioridad prioridad = prioridadRepository.findById(request.getPrioridadId())
                .orElseThrow(() -> new RuntimeException("Prioridad no encontrada con id: " + request.getPrioridadId()));

        Ubicacion ubicacion = ubicacionRepository.findById(request.getUbicacionId())
                .orElseThrow(() -> new RuntimeException("Ubicación no encontrada con id: " + request.getUbicacionId()));

        Incidencia incidencia = new Incidencia();
        incidencia.setCodigoTicket(generarCodigoTicket());
        incidencia.setTitulo(request.getTitulo());
        incidencia.setDescripcion(request.getDescripcion());
        incidencia.setEstado("Pendiente");
        incidencia.setEstudiante(estudiante);
        incidencia.setCategoria(categoria);
        incidencia.setPrioridad(prioridad);
        incidencia.setUbicacion(ubicacion);
        incidencia.setFechaCreacion(LocalDateTime.now());

        incidenciaRepository.save(incidencia);
        return toResponse(incidencia);
    }

    // ==================== ASIGNAR TÉCNICO ====================

    public IncidenciaResponse asignarTecnico(Integer incidenciaId, AsignarTecnicoRequest request) {
        Incidencia incidencia = incidenciaRepository.findById(incidenciaId)
                .orElseThrow(() -> new RuntimeException("Incidencia no encontrada con id: " + incidenciaId));

        Usuario tecnico = usuarioRepository.findById(request.getTecnicoId())
                .orElseThrow(() -> new RuntimeException("Técnico no encontrado con id: " + request.getTecnicoId()));

        // Validar que el usuario es técnico
        if (!"TECNICO".equals(tecnico.getRol().getNombre())) {
            throw new RuntimeException("El usuario seleccionado no tiene rol de TECNICO");
        }

        incidencia.setTecnico(tecnico);
        incidencia.setEstado("En Proceso");
        incidencia.setFechaInicioAtencion(LocalDateTime.now());

        incidenciaRepository.save(incidencia);
        return toResponse(incidencia);
    }

    // ==================== CAMBIAR ESTADO ====================

    public IncidenciaResponse cambiarEstado(Integer incidenciaId, CambiarEstadoRequest request) {
        Incidencia incidencia = incidenciaRepository.findById(incidenciaId)
                .orElseThrow(() -> new RuntimeException("Incidencia no encontrada con id: " + incidenciaId));

        String nuevoEstado = request.getEstado();

        // Validar estados permitidos
        if (!List.of("Pendiente", "En Proceso", "Resuelto", "Cancelado").contains(nuevoEstado)) {
            throw new RuntimeException("Estado no válido: " + nuevoEstado);
        }

        // Si se resuelve, la solución técnica es obligatoria
        if ("Resuelto".equals(nuevoEstado)) {
            if (request.getSolucionTecnica() == null || request.getSolucionTecnica().isBlank()) {
                throw new RuntimeException("La solución técnica es obligatoria al resolver una incidencia");
            }
            incidencia.setSolucionTecnica(request.getSolucionTecnica());
            incidencia.setFechaCierre(LocalDateTime.now());
        }

        incidencia.setEstado(nuevoEstado);
        incidenciaRepository.save(incidencia);
        return toResponse(incidencia);
    }

    // ==================== UTILIDADES ====================

    /**
     * Genera un código de ticket auto-incremental: INC-2026-0001, INC-2026-0002...
     */
    private String generarCodigoTicket() {
        long total = incidenciaRepository.count();
        String anio = String.valueOf(Year.now().getValue());
        return String.format("INC-%s-%04d", anio, total + 1);
    }

    /**
     * Cuenta las incidencias activas (Pendiente o En Proceso) de un técnico.
     */
    public long contarIncidenciasActivas(Integer tecnicoId) {
        return incidenciaRepository.countByTecnicoIdAndEstadoIn(
                tecnicoId, List.of("Pendiente", "En Proceso"));
    }

    /**
     * Convierte una entidad Incidencia a su DTO de respuesta.
     */
    private IncidenciaResponse toResponse(Incidencia inc) {
        return new IncidenciaResponse(
                inc.getId(),
                inc.getCodigoTicket(),
                inc.getTitulo(),
                inc.getDescripcion(),
                inc.getEstado(),
                // Estudiante
                inc.getEstudiante().getId(),
                inc.getEstudiante().getNombre() + " " + inc.getEstudiante().getApellido(),
                // Técnico
                inc.getTecnico() != null ? inc.getTecnico().getId() : null,
                inc.getTecnico() != null
                        ? inc.getTecnico().getNombre() + " " + inc.getTecnico().getApellido()
                        : null,
                // Categoría
                inc.getCategoria().getId(),
                inc.getCategoria().getNombre(),
                inc.getCategoria().getEspecialidad() != null
                        ? inc.getCategoria().getEspecialidad().getNombre()
                        : null,
                // Prioridad
                inc.getPrioridad().getId(),
                inc.getPrioridad().getNivel(),
                // Ubicación
                inc.getUbicacion().getId(),
                inc.getUbicacion().getPabellon() + " - " + inc.getUbicacion().getAulaLaboratorio(),
                // Otros
                inc.getSolucionTecnica(),
                inc.getFechaCreacion(),
                inc.getFechaInicioAtencion(),
                inc.getFechaCierre()
        );
    }
}