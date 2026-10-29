package com.proyecto.incidenciasback.service;

import com.proyecto.incidenciasback.dto.LaboratorioRequest;
import com.proyecto.incidenciasback.dto.LaboratorioResponse;
import com.proyecto.incidenciasback.model.Ubicacion;
import com.proyecto.incidenciasback.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class LaboratorioService {
    private final UbicacionRepository ubicaciones;
    private final EquipoRepository equipos;
    private final UsuarioRepository usuarios;

    public LaboratorioService(UbicacionRepository ubicaciones, EquipoRepository equipos, UsuarioRepository usuarios) {
        this.ubicaciones = ubicaciones;
        this.equipos = equipos;
        this.usuarios = usuarios;
    }

    public List<LaboratorioResponse> listar() {
        var resumenes = equipos.resumirPorUbicacion().stream().collect(Collectors.toMap(EquipoRepository.ResumenUbicacion::getUbicacionId, r -> r));
        return ubicaciones.findByTipoIgnoreCaseOrderByIdAsc("Laboratorio").stream()
                .map(u -> respuesta(u, resumenes.get(u.getId()))).toList();
    }

    public LaboratorioResponse obtener(Integer id) {
        Ubicacion ubicacion = buscar(id);
        var lista = equipos.findByUbicacionId(id);
        long pcs = lista.stream().filter(e -> "PC".equalsIgnoreCase(e.getTipo()) || "Computadora".equalsIgnoreCase(e.getTipo())).count();
        return new LaboratorioResponse(id, ubicacion.getAulaLaboratorio(), ubicacion.getPabellon(), ubicacion.getPiso(),
                ubicacion.getEstado(), ubicacion.getCapacidad(), ubicacion.getEncargado() == null ? null : ubicacion.getEncargado().getId(),
                nombreEncargado(ubicacion), pcs, lista.size());
    }

    public List<Map<String, Object>> encargados() {
        return usuarios.findByRolNombreIn(UsuarioService.ROLES_TECNICOS).stream()
                .filter(u -> !"Inactivo".equalsIgnoreCase(u.getEstado()))
                .map(u -> Map.<String, Object>of("id", u.getId(), "nombre", u.getNombre() + " " + u.getApellido())).toList();
    }

    @Transactional
    public LaboratorioResponse guardar(Integer id, LaboratorioRequest request) {
        String nombre = request.nombre().trim();
        String pabellon = request.pabellon().trim();
        if (nombre.isBlank() || pabellon.isBlank()) throw new IllegalArgumentException("Completa nombre y pabellón");
        if (ubicaciones.existsByPabellonIgnoreCaseAndAulaLaboratorioIgnoreCaseAndPisoAndIdNot(pabellon, nombre, request.piso(), id == null ? -1 : id)) {
            throw new IllegalArgumentException("Ya existe una ubicación con ese nombre, pabellón y piso");
        }
        var encargado = request.encargadoId() == null ? null : usuarios.findById(request.encargadoId())
                .orElseThrow(() -> new IllegalArgumentException("Encargado no encontrado"));
        if (encargado != null && (encargado.getRol() == null || !UsuarioService.ROLES_TECNICOS.contains(encargado.getRol().getNombre()) || "Inactivo".equalsIgnoreCase(encargado.getEstado()))) {
            throw new IllegalArgumentException("Selecciona un técnico activo como encargado");
        }
        Ubicacion laboratorio = id == null ? new Ubicacion() : buscar(id);
        laboratorio.setAulaLaboratorio(nombre);
        laboratorio.setPabellon(pabellon);
        laboratorio.setPiso(request.piso());
        laboratorio.setCapacidad(request.capacidad());
        laboratorio.setEncargado(encargado);
        laboratorio.setEstado(request.estado());
        laboratorio.setTipo("Laboratorio");
        return obtener(ubicaciones.saveAndFlush(laboratorio).getId());
    }

    private Ubicacion buscar(Integer id) {
        Ubicacion u = ubicaciones.findById(id).orElseThrow(() -> new IllegalArgumentException("Laboratorio no encontrado"));
        if (!"Laboratorio".equalsIgnoreCase(u.getTipo())) throw new IllegalArgumentException("La ubicación no es un laboratorio");
        return u;
    }

    private String nombreEncargado(Ubicacion u) {
        return u.getEncargado() == null ? null : u.getEncargado().getNombre() + " " + u.getEncargado().getApellido();
    }

    private LaboratorioResponse respuesta(Ubicacion u, EquipoRepository.ResumenUbicacion resumen) {
        return new LaboratorioResponse(u.getId(), u.getAulaLaboratorio(), u.getPabellon(), u.getPiso(), u.getEstado(),
                u.getCapacidad(), u.getEncargado() == null ? null : u.getEncargado().getId(), nombreEncargado(u),
                resumen == null ? 0 : resumen.getComputadoras(), resumen == null ? 0 : resumen.getTotal());
    }
}
