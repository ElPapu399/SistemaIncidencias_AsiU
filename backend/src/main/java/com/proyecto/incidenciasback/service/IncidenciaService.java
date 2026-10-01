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
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Servicio principal de incidencias con trazabilidad completa
 * de asignaciones, reasignaciones y cambios de estado.
 */

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
        return mapearListaConTrazabilidad(incidenciaRepository.findAll());
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
        List<IncidenciaResponse> res = mapearListaConTrazabilidad(List.of(incidencia));
        return res.isEmpty() ? toResponse(incidencia) : res.get(0);
    }

    @Transactional(readOnly = true)
    public List<IncidenciaResponse> listarPorEstudiante(Integer estudianteId) {
        return mapearListaConTrazabilidad(incidenciaRepository.findByEstudianteId(estudianteId));
    }

    @Transactional(readOnly = true)
    public List<IncidenciaResponse> listarPorTecnico(Integer tecnicoId) {
        return mapearListaConTrazabilidad(incidenciaRepository.findByTecnicoId(tecnicoId));
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
        registrarHistorial(incidencia, null, "Pendiente", "CREACION",
                estudiante, "Ticket registrado", null, null);

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

        // Obtener el usuario autenticado (quien realiza la asignación)
        Usuario asignador = obtenerUsuarioAutenticado();

        String estadoAnterior = incidencia.getEstado();
        incidencia.setTecnico(tecnico);
        incidencia.setEstado("Asignada");
        incidencia.setFechaInicioAtencion(LocalDateTime.now());

        incidenciaRepository.save(incidencia);

        // Registrar en historial: quién asignó a quién
        registrarHistorial(incidencia, estadoAnterior, "Asignada", "ASIGNACION",
                asignador,
                "Técnico asignado: " + tecnico.getNombre() + " " + tecnico.getApellido()
                        + " (asignado por " + asignador.getNombre() + " " + asignador.getApellido() + ")",
                null, tecnico);

        return toResponse(incidencia);
    }

    // ==================== REASIGNAR TÉCNICO ====================

    /**
     * Reasigna una incidencia de un técnico a otro.
     * Registra en el historial: quién reasignó, de quién a quién, y por qué.
     */
    @Transactional
    public IncidenciaResponse reasignarTecnico(Integer incidenciaId, ReasignarTecnicoRequest request) {
        Incidencia incidencia = incidenciaRepository.findById(incidenciaId)
                .orElseThrow(() -> new RuntimeException("Incidencia no encontrada con id: " + incidenciaId));

        if (incidencia.getTecnico() == null) {
            throw new RuntimeException("La incidencia no tiene un técnico asignado. Use la asignación inicial.");
        }

        Usuario tecnicoNuevo = usuarioRepository.findById(request.getTecnicoNuevoId())
                .orElseThrow(() -> new RuntimeException("Técnico no encontrado con id: " + request.getTecnicoNuevoId()));

        // Validar que el nuevo usuario es técnico
        String rolNombre = tecnicoNuevo.getRol() != null ? tecnicoNuevo.getRol().getNombre() : "";
        if (!"TECNICO_ESPECIALISTA".equals(rolNombre) && !"TECNICO".equals(rolNombre)) {
            throw new RuntimeException("El usuario seleccionado debe ser un técnico");
        }

        // Obtener quién está haciendo la reasignación
        Usuario reasignador = obtenerUsuarioAutenticado();
        Usuario tecnicoAnterior = incidencia.getTecnico();

        // Validar que no se reasigne al mismo técnico
        if (tecnicoAnterior.getId().equals(tecnicoNuevo.getId())) {
            throw new RuntimeException("El técnico nuevo debe ser diferente al actual");
        }

        String estadoAnterior = incidencia.getEstado();
        incidencia.setTecnico(tecnicoNuevo);
        incidencia.setEstado("Asignada");

        incidenciaRepository.save(incidencia);

        // Registrar reasignación en historial con trazabilidad completa
        String comentario = String.format(
                "Reasignado de %s %s a %s %s. Motivo: %s (reasignado por %s %s)",
                tecnicoAnterior.getNombre(), tecnicoAnterior.getApellido(),
                tecnicoNuevo.getNombre(), tecnicoNuevo.getApellido(),
                request.getMotivo(),
                reasignador.getNombre(), reasignador.getApellido());

        registrarHistorial(incidencia, estadoAnterior, "Asignada", "REASIGNACION",
                reasignador, comentario, tecnicoAnterior, tecnicoNuevo);

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
        registrarHistorial(incidencia, estadoAnterior, nuevoEstado, "CAMBIO_ESTADO",
                usuario, request.getComentario(), null, null);

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
     * Obtiene el usuario autenticado actual desde el SecurityContext.
     */
    private Usuario obtenerUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !auth.getName().equals("anonymousUser")) {
            return usuarioRepository.findByCorreo(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado: " + auth.getName()));
        }
        throw new RuntimeException("No se pudo determinar el usuario autenticado");
    }

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
     * Registra una acción en el historial con trazabilidad completa.
     *
     * @param tipoAccion     CREACION, CAMBIO_ESTADO, ASIGNACION, REASIGNACION, SOLICITUD_REASIGNACION
     * @param tecnicoAnterior técnico anterior (solo para REASIGNACION)
     * @param tecnicoNuevo    técnico nuevo (para ASIGNACION y REASIGNACION)
     */
    private void registrarHistorial(Incidencia incidencia, String estadoAnterior,
                                     String estadoNuevo, String tipoAccion,
                                     Usuario usuario, String comentario,
                                     Usuario tecnicoAnterior, Usuario tecnicoNuevo) {
        HistorialEstado historial = new HistorialEstado();
        historial.setIncidencia(incidencia);
        historial.setEstadoAnterior(estadoAnterior != null ? estadoAnterior : "Nuevo");
        historial.setEstadoNuevo(estadoNuevo);
        historial.setTipoAccion(tipoAccion);
        historial.setUsuario(usuario);
        historial.setComentario(comentario);
        historial.setTecnicoAnterior(tecnicoAnterior);
        historial.setTecnicoNuevo(tecnicoNuevo);
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

    private List<IncidenciaResponse> mapearListaConTrazabilidad(List<Incidencia> incidencias) {
        if (incidencias.isEmpty()) {
            return Collections.emptyList();
        }

        // Obtener reasignaciones (la más reciente por incidencia)
        Map<Integer, HistorialEstado> reasignaciones = historialEstadoRepository
                .findByTipoAccionOrderByFechaCambioDesc("REASIGNACION")
                .stream()
                .filter(h -> h.getIncidencia() != null)
                .collect(Collectors.toMap(
                        h -> h.getIncidencia().getId(),
                        h -> h,
                        (h1, h2) -> h1
                ));

        // Obtener asignaciones iniciales (la primera por incidencia)
        Map<Integer, HistorialEstado> asignaciones = historialEstadoRepository
                .findByTipoAccionOrderByFechaCambioAsc("ASIGNACION")
                .stream()
                .filter(h -> h.getIncidencia() != null)
                .collect(Collectors.toMap(
                        h -> h.getIncidencia().getId(),
                        h -> h,
                        (h1, h2) -> h1
                ));

        return incidencias.stream()
                .map(inc -> toResponseConTrazabilidad(inc, reasignaciones.get(inc.getId()), asignaciones.get(inc.getId())))
                .collect(Collectors.toList());
    }

    private IncidenciaResponse toResponseConTrazabilidad(Incidencia inc, HistorialEstado reasig, HistorialEstado asig) {
        IncidenciaResponse resp = toResponse(inc);

        if (reasig != null) {
            resp.setFueReasignada(true);
            if (reasig.getTecnicoAnterior() != null) {
                resp.setTecnicoAnteriorId(reasig.getTecnicoAnterior().getId());
                resp.setTecnicoAnteriorNombre(reasig.getTecnicoAnterior().getNombre() + " " + reasig.getTecnicoAnterior().getApellido());
            }
            if (reasig.getUsuario() != null) {
                resp.setReasignadoPorNombre(reasig.getUsuario().getNombre() + " " + reasig.getUsuario().getApellido());
            }
            resp.setMotivoReasignacion(reasig.getComentario());
            resp.setFechaReasignacion(reasig.getFechaCambio());
        } else {
            resp.setFueReasignada(false);
        }

        if (asig != null && asig.getUsuario() != null) {
            resp.setAsignadoPorNombre(asig.getUsuario().getNombre() + " " + asig.getUsuario().getApellido());
        }

        return resp;
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
                h.getTipoAccion(),
                h.getUsuario().getId(),
                h.getUsuario().getNombre() + " " + h.getUsuario().getApellido(),
                h.getComentario(),
                h.getTecnicoAnterior() != null ? h.getTecnicoAnterior().getId() : null,
                h.getTecnicoAnterior() != null
                        ? h.getTecnicoAnterior().getNombre() + " " + h.getTecnicoAnterior().getApellido()
                        : null,
                h.getTecnicoNuevo() != null ? h.getTecnicoNuevo().getId() : null,
                h.getTecnicoNuevo() != null
                        ? h.getTecnicoNuevo().getNombre() + " " + h.getTecnicoNuevo().getApellido()
                        : null,
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