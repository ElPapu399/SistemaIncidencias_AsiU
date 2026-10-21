package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.*;
import com.proyecto.incidenciasback.model.*;
import com.proyecto.incidenciasback.repository.*;
import com.proyecto.incidenciasback.security.AuthHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class IncidenciaService {

    private static final List<String> ESTADOS_VALIDOS =
            List.of("Pendiente", "Asignada", "En atención", "Resuelta", "Cerrada");

    public static List<String> obtenerEstadosValidos() {
        return ESTADOS_VALIDOS;
    }

    private final IncidenciaRepository incidenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final PrioridadRepository prioridadRepository;
    private final UbicacionRepository ubicacionRepository;
    private final EquipoRepository equipoRepository;
    private final HistorialEstadoRepository historialEstadoRepository;
    private final ArchivoAdjuntoRepository archivoAdjuntoRepository;
    private final AuthHelper authHelper;

    public IncidenciaService(IncidenciaRepository incidenciaRepository,
                             UsuarioRepository usuarioRepository,
                             CategoriaRepository categoriaRepository,
                             PrioridadRepository prioridadRepository,
                             UbicacionRepository ubicacionRepository,
                             EquipoRepository equipoRepository,
                             HistorialEstadoRepository historialEstadoRepository,
                             ArchivoAdjuntoRepository archivoAdjuntoRepository,
                             AuthHelper authHelper) {
        this.incidenciaRepository = incidenciaRepository;
        this.usuarioRepository = usuarioRepository;
        this.categoriaRepository = categoriaRepository;
        this.prioridadRepository = prioridadRepository;
        this.ubicacionRepository = ubicacionRepository;
        this.equipoRepository = equipoRepository;
        this.historialEstadoRepository = historialEstadoRepository;
        this.archivoAdjuntoRepository = archivoAdjuntoRepository;
        this.authHelper = authHelper;
    }

    @Transactional(readOnly = true)
    public List<IncidenciaResponse> listarTodas() {
        return mapearListaConTrazabilidad(incidenciaRepository.findAll());
    }

    @Transactional(readOnly = true)
    public IncidenciaDetalleResponse obtenerDetallePorId(Integer id) {
        Incidencia inc = incidenciaRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Incidencia no encontrada con id: " + id));

        List<HistorialEstadoResponse> historial = historialEstadoRepository
                .findByIncidenciaIdOrderByFechaCambioAsc(id)
                .stream()
                .map(this::toHistorialResponse)
                .toList();

        List<ArchivoAdjuntoResponse> adjuntos = archivoAdjuntoRepository
                .findByIncidenciaIdOrderByFechaSubidaDesc(id)
                .stream()
                .map(this::toAdjuntoResponse)
                .toList();

        return toDetalleResponse(inc, historial, adjuntos);
    }

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

    @Transactional
    public IncidenciaResponse crearIncidencia(IncidenciaRequest request) {
        Usuario estudiante = usuarioRepository.findById(request.getEstudianteId())
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado con id: " + request.getEstudianteId()));

        // Bloqueo preventivo para cuentas deshabilitadas o egresados
        if ("Inactivo".equalsIgnoreCase(estudiante.getEstado())) {
            throw new RuntimeException("El estudiante se encuentra inactivo y no puede registrar incidencias");
        }

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

        if (request.getEquipoId() != null) {
            Equipo equipo = equipoRepository.findById(request.getEquipoId())
                    .orElseThrow(() -> new RuntimeException("Equipo no encontrado con id: " + request.getEquipoId()));
            incidencia.setEquipo(equipo);
        }

        incidenciaRepository.save(incidencia);

        registrarHistorial(incidencia, null, "Pendiente", "CREACION",
                estudiante, "Ticket registrado", null, null);

        return toResponse(incidencia);
    }

    @Transactional
    public IncidenciaResponse asignarTecnico(Integer incidenciaId, AsignarTecnicoRequest request) {
        Incidencia incidencia = incidenciaRepository.findById(incidenciaId)
                .orElseThrow(() -> new RuntimeException("Incidencia no encontrada con id: " + incidenciaId));

        Usuario tecnico = usuarioRepository.findById(request.getTecnicoId())
                .orElseThrow(() -> new RuntimeException("Técnico no encontrado con id: " + request.getTecnicoId()));

        // Solo personal resolutor de campo puede recibir tickets asignados
        String rolNombre = tecnico.getRol() != null ? tecnico.getRol().getNombre() : "";
        if (!"TECNICO_ESPECIALISTA".equals(rolNombre) && !"TECNICO".equals(rolNombre)) {
            throw new RuntimeException("El usuario seleccionado debe ser un técnico especialista");
        }

        Usuario asignador = authHelper.obtenerUsuarioAutenticado();

        String estadoAnterior = incidencia.getEstado();
        incidencia.setTecnico(tecnico);
        incidencia.setEstado("Asignada");
        incidencia.setFechaInicioAtencion(LocalDateTime.now());

        incidenciaRepository.save(incidencia);

        registrarHistorial(incidencia, estadoAnterior, "Asignada", "ASIGNACION",
                asignador,
                "Técnico asignado: " + tecnico.getNombre() + " " + tecnico.getApellido()
                        + " (asignado por " + asignador.getNombre() + " " + asignador.getApellido() + ")",
                null, tecnico);

        return toResponse(incidencia);
    }

    @Transactional
    public IncidenciaResponse reasignarTecnico(Integer incidenciaId, ReasignarTecnicoRequest request) {
        Incidencia incidencia = incidenciaRepository.findById(incidenciaId)
                .orElseThrow(() -> new RuntimeException("Incidencia no encontrada con id: " + incidenciaId));

        if (incidencia.getTecnico() == null) {
            throw new RuntimeException("La incidencia no tiene un técnico asignado. Use la asignación inicial.");
        }

        Usuario tecnicoNuevo = usuarioRepository.findById(request.getTecnicoNuevoId())
                .orElseThrow(() -> new RuntimeException("Técnico no encontrado con id: " + request.getTecnicoNuevoId()));

        String rolNombre = tecnicoNuevo.getRol() != null ? tecnicoNuevo.getRol().getNombre() : "";
        if (!"TECNICO_ESPECIALISTA".equals(rolNombre) && !"TECNICO".equals(rolNombre)) {
            throw new RuntimeException("El usuario seleccionado debe ser un técnico");
        }

        Usuario reasignador = authHelper.obtenerUsuarioAutenticado();
        Usuario tecnicoAnterior = incidencia.getTecnico();

        if (tecnicoAnterior.getId().equals(tecnicoNuevo.getId())) {
            throw new RuntimeException("El técnico nuevo debe ser diferente al actual");
        }

        String estadoAnterior = incidencia.getEstado();
        incidencia.setTecnico(tecnicoNuevo);
        incidencia.setEstado("Asignada");

        incidenciaRepository.save(incidencia);

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

    @Transactional
    public IncidenciaResponse cambiarEstado(Integer incidenciaId, CambiarEstadoRequest request) {
        Incidencia incidencia = incidenciaRepository.findById(incidenciaId)
                .orElseThrow(() -> new RuntimeException("Incidencia no encontrada con id: " + incidenciaId));

        Usuario usuario;
        if (request.getUsuarioId() != null) {
            usuario = usuarioRepository.findById(request.getUsuarioId())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + request.getUsuarioId()));
        } else {
            usuario = authHelper.obtenerUsuarioAutenticado();
        }

        // Compatibilidad con estados heredados del frontend
        String rawEstado = request.getEstado() != null ? request.getEstado().trim() : "";
        String nuevoEstado = switch (rawEstado) {
            case "En Proceso" -> "En atención";
            case "Resuelto" -> "Resuelta";
            case "Cancelado" -> "Cerrada";
            default -> rawEstado;
        };

        if (!ESTADOS_VALIDOS.contains(nuevoEstado)) {
            throw new RuntimeException("Estado no válido: " + nuevoEstado
                    + ". Estados permitidos: " + String.join(", ", ESTADOS_VALIDOS));
        }

        // Exigir informe de solución técnica antes de dar por resuelta la incidencia
        if ("Resuelta".equals(nuevoEstado)) {
            if (request.getSolucionTecnica() == null || request.getSolucionTecnica().isBlank()) {
                throw new RuntimeException("La solución técnica es obligatoria al resolver una incidencia");
            }
            incidencia.setSolucionTecnica(request.getSolucionTecnica());
            incidencia.setFechaCierre(LocalDateTime.now());
        }

        if ("Cerrada".equals(nuevoEstado) && incidencia.getFechaCierre() == null) {
            incidencia.setFechaCierre(LocalDateTime.now());
        }

        String estadoAnterior = incidencia.getEstado();
        incidencia.setEstado(nuevoEstado);
        incidenciaRepository.save(incidencia);

        registrarHistorial(incidencia, estadoAnterior, nuevoEstado, "CAMBIO_ESTADO",
                usuario, request.getComentario(), null, null);

        return toResponse(incidencia);
    }

    @Transactional
    public IncidenciaResponse calificarIncidencia(Integer incidenciaId, CalificacionRequest request) {
        Incidencia incidencia = incidenciaRepository.findById(incidenciaId)
                .orElseThrow(() -> new RuntimeException("Incidencia no encontrada con id: " + incidenciaId));

        if (!"Resuelta".equals(incidencia.getEstado())) {
            throw new RuntimeException("Solo se pueden calificar incidencias en estado 'Resuelta'. Estado actual: " + incidencia.getEstado());
        }

        Usuario estudiante = authHelper.obtenerUsuarioAutenticado();

        if (!incidencia.getEstudiante().getId().equals(estudiante.getId())) {
            throw new RuntimeException("Solo el estudiante que reportó la incidencia puede calificarla");
        }

        // Calificación final del estudiante cierra el ciclo de vida del ticket
        String estadoAnterior = incidencia.getEstado();
        incidencia.setCalificacion(request.getCalificacion());
        incidencia.setMotivoCalificacion(request.getMotivo());
        incidencia.setComentarioCalificacion(request.getComentario());
        incidencia.setEstado("Cerrada");

        if (incidencia.getFechaCierre() == null) {
            incidencia.setFechaCierre(LocalDateTime.now());
        }

        incidenciaRepository.save(incidencia);

        StringBuilder sb = new StringBuilder(String.format("Calificación: %d/5.", request.getCalificacion()));
        if (request.getMotivo() != null && !request.getMotivo().isBlank()) {
            sb.append(" Motivo: ").append(request.getMotivo()).append(".");
        }
        if (request.getComentario() != null && !request.getComentario().isBlank()) {
            sb.append(" Comentario: ").append(request.getComentario());
        }

        registrarHistorial(incidencia, estadoAnterior, "Cerrada", "CALIFICACION",
                estudiante, sb.toString(), null, null);

        return toResponse(incidencia);
    }

    @Transactional(readOnly = true)
    public List<HistorialEstadoResponse> obtenerHistorial(Integer incidenciaId) {
        if (!incidenciaRepository.existsById(incidenciaId)) {
            throw new RuntimeException("Incidencia no encontrada con id: " + incidenciaId);
        }

        return historialEstadoRepository
                .findByIncidenciaIdOrderByFechaCambioAsc(incidenciaId)
                .stream()
                .map(this::toHistorialResponse)
                .toList();
    }

    private String generarCodigoTicket() {
        long total = incidenciaRepository.count();
        String anio = String.valueOf(Year.now().getValue());
        long correlativo = total + 1;
        String codigo = String.format("INC-%s-%04d", anio, correlativo);

        while (incidenciaRepository.existsByCodigoTicket(codigo)) {
            correlativo++;
            codigo = String.format("INC-%s-%04d", anio, correlativo);
        }

        return codigo;
    }

    @Transactional(readOnly = true)
    public long contarIncidenciasActivas(Integer tecnicoId) {
        return incidenciaRepository.countByTecnicoIdAndEstadoIn(
                tecnicoId, List.of("Pendiente", "Asignada", "En atención"));
    }

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

    private IncidenciaResponse toResponse(Incidencia inc) {
        IncidenciaResponse resp = new IncidenciaResponse(
                inc.getId(),
                inc.getCodigoTicket(),
                inc.getTitulo(),
                inc.getDescripcion(),
                inc.getEstado(),
                inc.getEstudiante().getId(),
                inc.getEstudiante().getNombre() + " " + inc.getEstudiante().getApellido(),
                inc.getTecnico() != null ? inc.getTecnico().getId() : null,
                inc.getTecnico() != null
                        ? inc.getTecnico().getNombre() + " " + inc.getTecnico().getApellido()
                        : null,
                inc.getCategoria().getId(),
                inc.getCategoria().getNombre(),
                inc.getCategoria().getEspecialidad() != null
                        ? inc.getCategoria().getEspecialidad().getNombre()
                        : null,
                inc.getPrioridad().getId(),
                inc.getPrioridad().getNivel(),
                inc.getUbicacion().getId(),
                inc.getUbicacion().getPabellon() + " - " + inc.getUbicacion().getAulaLaboratorio(),
                inc.getEquipo() != null ? inc.getEquipo().getId() : null,
                inc.getEquipo() != null ? inc.getEquipo().getCodigo() : null,
                inc.getSolucionTecnica(),
                inc.getFechaCreacion(),
                inc.getFechaInicioAtencion(),
                inc.getFechaCierre()
        );
        resp.setCalificacion(inc.getCalificacion());
        resp.setMotivoCalificacion(inc.getMotivoCalificacion());
        resp.setComentarioCalificacion(inc.getComentarioCalificacion());
        return resp;
    }

    private List<IncidenciaResponse> mapearListaConTrazabilidad(List<Incidencia> incidencias) {
        if (incidencias.isEmpty()) {
            return Collections.emptyList();
        }

        Map<Integer, HistorialEstado> reasignaciones = historialEstadoRepository
                .findByTipoAccionOrderByFechaCambioDesc("REASIGNACION")
                .stream()
                .filter(h -> h.getIncidencia() != null)
                .collect(Collectors.toMap(
                        h -> h.getIncidencia().getId(),
                        h -> h,
                        (h1, h2) -> h1
                ));

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
                .toList();
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

    private IncidenciaDetalleResponse toDetalleResponse(Incidencia inc,
                                                         List<HistorialEstadoResponse> historial,
                                                         List<ArchivoAdjuntoResponse> adjuntos) {
        return new IncidenciaDetalleResponse(
                inc.getId(),
                inc.getCodigoTicket(),
                inc.getTitulo(),
                inc.getDescripcion(),
                inc.getEstado(),
                inc.getEstudiante().getId(),
                inc.getEstudiante().getNombre() + " " + inc.getEstudiante().getApellido(),
                inc.getTecnico() != null ? inc.getTecnico().getId() : null,
                inc.getTecnico() != null
                        ? inc.getTecnico().getNombre() + " " + inc.getTecnico().getApellido()
                        : null,
                inc.getCategoria().getId(),
                inc.getCategoria().getNombre(),
                inc.getCategoria().getEspecialidad() != null
                        ? inc.getCategoria().getEspecialidad().getNombre()
                        : null,
                inc.getPrioridad().getId(),
                inc.getPrioridad().getNivel(),
                inc.getUbicacion().getId(),
                inc.getUbicacion().getPabellon() + " - " + inc.getUbicacion().getAulaLaboratorio(),
                inc.getEquipo() != null ? inc.getEquipo().getId() : null,
                inc.getEquipo() != null ? inc.getEquipo().getCodigo() : null,
                inc.getEquipo() != null ? inc.getEquipo().getTipo() : null,
                inc.getSolucionTecnica(),
                inc.getFechaCreacion(),
                inc.getFechaInicioAtencion(),
                inc.getFechaCierre(),
                inc.getCalificacion(),
                inc.getMotivoCalificacion(),
                inc.getComentarioCalificacion(),
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

    public List<TecnicoCalificacionResponse> obtenerCalificacionesTecnicos() {
        List<Incidencia> calificadas = incidenciaRepository.findByCalificacionIsNotNullAndTecnicoIsNotNull();

        Map<Integer, List<Incidencia>> porTecnico = calificadas.stream()
                .collect(Collectors.groupingBy(i -> i.getTecnico().getId()));

        return porTecnico.entrySet().stream().map(entry -> {
            List<Incidencia> incidencias = entry.getValue();
            Usuario tecnico = incidencias.get(0).getTecnico();

            double promedio = incidencias.stream()
                    .mapToInt(Incidencia::getCalificacion)
                    .average()
                    .orElse(0.0);

            List<TecnicoCalificacionResponse.ComentarioCalificacion> comentarios = incidencias.stream()
                    .map(i -> new TecnicoCalificacionResponse.ComentarioCalificacion(
                            i.getId(),
                            i.getCodigoTicket(),
                            i.getTitulo(),
                            i.getCalificacion(),
                            i.getMotivoCalificacion(),
                            i.getComentarioCalificacion(),
                            i.getEstudiante().getNombre() + " " + i.getEstudiante().getApellido(),
                            i.getFechaCierre()
                    ))
                    .collect(Collectors.toList());

            return new TecnicoCalificacionResponse(
                    tecnico.getId(),
                    tecnico.getNombre(),
                    tecnico.getApellido(),
                    tecnico.getEspecialidad() != null ? tecnico.getEspecialidad().getNombre() : null,
                    Math.round(promedio * 10.0) / 10.0,
                    incidencias.size(),
                    comentarios
            );
        }).collect(Collectors.toList());
    }
}

