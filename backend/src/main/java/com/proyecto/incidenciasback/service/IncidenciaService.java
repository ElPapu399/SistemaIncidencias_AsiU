package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.*;
import com.proyecto.incidenciasback.model.*;
import com.proyecto.incidenciasback.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IncidenciaService {

    /** Estados válidos según el prototipo */
    private static final List<String> ESTADOS_VALIDOS =
            List.of("Pendiente", "Asignada", "En atención", "Resuelta", "Cerrada");

    private final IncidenciaRepository incidenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final PrioridadRepository prioridadRepository;
    private final UbicacionRepository ubicacionRepository;
    private final EquipoRepository equipoRepository;
    private final HistorialEstadoRepository historialEstadoRepository;
    private final ArchivoAdjuntoRepository archivoAdjuntoRepository;

    public IncidenciaService(IncidenciaRepository incidenciaRepository,
                             UsuarioRepository usuarioRepository,
                             CategoriaRepository categoriaRepository,
                             PrioridadRepository prioridadRepository,
                             UbicacionRepository ubicacionRepository,
                             EquipoRepository equipoRepository,
                             HistorialEstadoRepository historialEstadoRepository,
                             ArchivoAdjuntoRepository archivoAdjuntoRepository) {
        this.incidenciaRepository = incidenciaRepository;
        this.usuarioRepository = usuarioRepository;
        this.categoriaRepository = categoriaRepository;
        this.prioridadRepository = prioridadRepository;
        this.ubicacionRepository = ubicacionRepository;
        this.equipoRepository = equipoRepository;
        this.historialEstadoRepository = historialEstadoRepository;
        this.archivoAdjuntoRepository = archivoAdjuntoRepository;
    }

    // ==================== LISTAR ====================

    @Transactional(readOnly = true)
    public List<IncidenciaResponse> listarTodas() {
        return incidenciaRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Obtener detalle enriquecido de una incidencia (con historial + adjuntos).
     */
    @Transactional(readOnly = true)
    public IncidenciaDetalleResponse obtenerDetallePorId(Integer id) {
        Incidencia inc = incidenciaRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Incidencia no encontrada con id: " + id));

        List<HistorialEstadoResponse> historial = historialEstadoRepository
                .findByIncidenciaIdOrderByFechaCambioAsc(id)
                .stream()
                .map(this::toHistorialResponse)
                .collect(Collectors.toList());

        List<ArchivoAdjuntoResponse> adjuntos = archivoAdjuntoRepository
                .findByIncidenciaIdOrderByFechaSubidaDesc(id)
                .stream()
                .map(this::toAdjuntoResponse)
                .collect(Collectors.toList());

        return toDetalleResponse(inc, historial, adjuntos);
    }

    /**
     * Obtener respuesta simple (para listas).
     */
    @Transactional(readOnly = true)
    public IncidenciaResponse obtenerPorId(Integer id) {
        Incidencia incidencia = incidenciaRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Incidencia no encontrada con id: " + id));
        return toResponse(incidencia);
    }

    @Transactional(readOnly = true)
    public List<IncidenciaResponse> listarPorEstudiante(Integer estudianteId) {
        return incidenciaRepository.findByEstudianteId(estudianteId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<IncidenciaResponse> listarPorTecnico(Integer tecnicoId) {
        return incidenciaRepository.findByTecnicoId(tecnicoId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ==================== CREAR ====================

    @Transactional
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

        // Equipo (opcional)
        if (request.getEquipoId() != null) {
            Equipo equipo = equipoRepository.findById(request.getEquipoId())
                    .orElseThrow(() -> new RuntimeException("Equipo no encontrado con id: " + request.getEquipoId()));
            incidencia.setEquipo(equipo);
        }

        incidenciaRepository.save(incidencia);

        // Registrar en historial: ticket creado
        registrarHistorial(incidencia, null, "Pendiente", estudiante, "Ticket registrado");

        return toResponse(incidencia);
    }

    // ==================== ASIGNAR TÉCNICO ====================

    @Transactional
    public IncidenciaResponse asignarTecnico(Integer incidenciaId, AsignarTecnicoRequest request) {
        Incidencia incidencia = incidenciaRepository.findById(incidenciaId)
                .orElseThrow(() -> new RuntimeException("Incidencia no encontrada con id: " + incidenciaId));

        Usuario tecnico = usuarioRepository.findById(request.getTecnicoId())
                .orElseThrow(() -> new RuntimeException("Técnico no encontrado con id: " + request.getTecnicoId()));

        // Validar que el usuario es técnico especialista
        String rolNombre = tecnico.getRol() != null ? tecnico.getRol().getNombre() : "";
        if (!"TECNICO_ESPECIALISTA".equals(rolNombre) && !"TECNICO".equals(rolNombre)) {
            throw new RuntimeException("El usuario seleccionado debe ser un técnico especialista");
        }

        String estadoAnterior = incidencia.getEstado();
        incidencia.setTecnico(tecnico);
        incidencia.setEstado("Asignada");
        incidencia.setFechaInicioAtencion(LocalDateTime.now());

        incidenciaRepository.save(incidencia);

        // Registrar en historial
        registrarHistorial(incidencia, estadoAnterior, "Asignada", tecnico,
                "Técnico asignado: " + tecnico.getNombre() + " " + tecnico.getApellido());

        return toResponse(incidencia);
    }

    // ==================== CAMBIAR ESTADO ====================

    @Transactional
    public IncidenciaResponse cambiarEstado(Integer incidenciaId, CambiarEstadoRequest request) {
        Incidencia incidencia = incidenciaRepository.findById(incidenciaId)
                .orElseThrow(() -> new RuntimeException("Incidencia no encontrada con id: " + incidenciaId));

        Usuario usuario;
        if (request.getUsuarioId() != null) {
            usuario = usuarioRepository.findById(request.getUsuarioId())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + request.getUsuarioId()));
        } else {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null && !auth.getName().equals("anonymousUser")) {
                usuario = usuarioRepository.findByCorreo(auth.getName())
                        .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado: " + auth.getName()));
            } else {
                throw new RuntimeException("El usuario es obligatorio para registrar el cambio de estado");
            }
        }

        String rawEstado = request.getEstado() != null ? request.getEstado().trim() : "";
        String nuevoEstado = switch (rawEstado) {
            case "En Proceso" -> "En atención";
            case "Resuelto" -> "Resuelta";
            case "Cancelado" -> "Cerrada";
            default -> rawEstado;
        };

        // Validar estados permitidos
        if (!ESTADOS_VALIDOS.contains(nuevoEstado)) {
            throw new RuntimeException("Estado no válido: " + nuevoEstado
                    + ". Estados permitidos: " + String.join(", ", ESTADOS_VALIDOS));
        }

        // Si se resuelve, la solución técnica es obligatoria
        if ("Resuelta".equals(nuevoEstado)) {
            if (request.getSolucionTecnica() == null || request.getSolucionTecnica().isBlank()) {
                throw new RuntimeException("La solución técnica es obligatoria al resolver una incidencia");
            }
            incidencia.setSolucionTecnica(request.getSolucionTecnica());
            incidencia.setFechaCierre(LocalDateTime.now());
        }

        // Si se cierra, también se registra fecha de cierre
        if ("Cerrada".equals(nuevoEstado) && incidencia.getFechaCierre() == null) {
            incidencia.setFechaCierre(LocalDateTime.now());
        }

        String estadoAnterior = incidencia.getEstado();
        incidencia.setEstado(nuevoEstado);
        incidenciaRepository.save(incidencia);

        // Registrar en historial
        registrarHistorial(incidencia, estadoAnterior, nuevoEstado, usuario, request.getComentario());

        return toResponse(incidencia);
    }

    // ==================== HISTORIAL ====================

    /**
     * Obtiene el historial de cambios de estado de una incidencia.
     */
    @Transactional(readOnly = true)
    public List<HistorialEstadoResponse> obtenerHistorial(Integer incidenciaId) {
        // Verificar que la incidencia existe
        if (!incidenciaRepository.existsById(incidenciaId)) {
            throw new RuntimeException("Incidencia no encontrada con id: " + incidenciaId);
        }

        return historialEstadoRepository
                .findByIncidenciaIdOrderByFechaCambioAsc(incidenciaId)
                .stream()
                .map(this::toHistorialResponse)
                .collect(Collectors.toList());
    }

    // ==================== UTILIDADES ====================

    /**
     * Genera un código de ticket auto-incremental único: INC-2026-0001, INC-2026-0002...
     */
    private String generarCodigoTicket() {
        long total = incidenciaRepository.count();
        String anio = String.valueOf(Year.now().getValue());
        long correlativo = total + 1;
        String codigo = String.format("INC-%s-%04d", anio, correlativo);

        // Prevenir colisión si se borraron tickets o en pruebas
        while (incidenciaRepository.existsByCodigoTicket(codigo)) {
            correlativo++;
            codigo = String.format("INC-%s-%04d", anio, correlativo);
        }

        return codigo;
    }

    /**
     * Cuenta las incidencias activas (Pendiente, Asignada o En atención) de un técnico.
     */
    @Transactional(readOnly = true)
    public long contarIncidenciasActivas(Integer tecnicoId) {
        return incidenciaRepository.countByTecnicoIdAndEstadoIn(
                tecnicoId, List.of("Pendiente", "Asignada", "En atención"));
    }

    /**
     * Registra un cambio de estado en el historial.
     */
    private void registrarHistorial(Incidencia incidencia, String estadoAnterior,
                                     String estadoNuevo, Usuario usuario, String comentario) {
        HistorialEstado historial = new HistorialEstado();
        historial.setIncidencia(incidencia);
        historial.setEstadoAnterior(estadoAnterior != null ? estadoAnterior : "Nuevo");
        historial.setEstadoNuevo(estadoNuevo);
        historial.setUsuario(usuario);
        historial.setComentario(comentario);
        historialEstadoRepository.save(historial);
    }

    // ==================== MAPPERS ====================

    /**
     * Convierte una entidad Incidencia a su DTO de respuesta (para listas).
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
                // Equipo
                inc.getEquipo() != null ? inc.getEquipo().getId() : null,
                inc.getEquipo() != null ? inc.getEquipo().getCodigo() : null,
                // Otros
                inc.getSolucionTecnica(),
                inc.getFechaCreacion(),
                inc.getFechaInicioAtencion(),
                inc.getFechaCierre()
        );
    }

    /**
     * Convierte una entidad Incidencia a su DTO de detalle (para vista individual).
     */
    private IncidenciaDetalleResponse toDetalleResponse(Incidencia inc,
                                                         List<HistorialEstadoResponse> historial,
                                                         List<ArchivoAdjuntoResponse> adjuntos) {
        return new IncidenciaDetalleResponse(
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
                // Equipo
                inc.getEquipo() != null ? inc.getEquipo().getId() : null,
                inc.getEquipo() != null ? inc.getEquipo().getCodigo() : null,
                inc.getEquipo() != null ? inc.getEquipo().getTipo() : null,
                // Otros
                inc.getSolucionTecnica(),
                inc.getFechaCreacion(),
                inc.getFechaInicioAtencion(),
                inc.getFechaCierre(),
                // Relaciones
                historial,
                adjuntos
        );
    }

    private HistorialEstadoResponse toHistorialResponse(HistorialEstado h) {
        return new HistorialEstadoResponse(
                h.getId(),
                h.getEstadoAnterior(),
                h.getEstadoNuevo(),
                h.getUsuario().getId(),
                h.getUsuario().getNombre() + " " + h.getUsuario().getApellido(),
                h.getComentario(),
                h.getFechaCambio()
        );
    }

    private ArchivoAdjuntoResponse toAdjuntoResponse(ArchivoAdjunto a) {
        return new ArchivoAdjuntoResponse(
                a.getId(),
                a.getIncidencia().getId(),
                a.getUrlArchivo(),
                a.getNombreOriginal(),
                a.getTipoArchivo(),
                a.getTamanioByte(),
                a.getSubidoPor() != null ? a.getSubidoPor().getId() : null,
                a.getSubidoPor() != null
                        ? a.getSubidoPor().getNombre() + " " + a.getSubidoPor().getApellido()
                        : null,
                a.getFechaSubida()
        );
    }
}