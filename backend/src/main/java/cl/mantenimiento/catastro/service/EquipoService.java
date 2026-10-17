package cl.mantenimiento.catastro.service;

import cl.mantenimiento.catastro.dto.EquipoRequest;
import cl.mantenimiento.catastro.model.Equipo;
import cl.mantenimiento.catastro.model.EstadoEquipo;
import cl.mantenimiento.catastro.repository.EquipoRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class EquipoService {
    private final EquipoRepository repository;

    public EquipoService(EquipoRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Equipo> listar(String q, EstadoEquipo estado, cl.mantenimiento.catastro.model.Criticidad criticidad) {
        Specification<Equipo> spec = (root, query, cb) -> cb.conjunction();
        if (q != null && !q.isBlank()) {
            String patron = "%" + q.trim().toLowerCase(Locale.ROOT) + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("codigo")), patron),
                cb.like(cb.lower(root.get("nombre")), patron),
                cb.like(cb.lower(root.get("marca")), patron),
                cb.like(cb.lower(root.get("ubicacion")), patron)
            ));
        }
        if (estado != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("estado"), estado));
        if (criticidad != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("criticidad"), criticidad));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "actualizadoEn"));
    }

    @Transactional(readOnly = true)
    public Equipo obtener(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipo no encontrado"));
    }

    public Equipo crear(EquipoRequest request) {
        if (repository.existsByCodigoIgnoreCase(request.codigo().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un equipo con ese código");
        }
        Equipo equipo = new Equipo();
        aplicar(equipo, request);
        return repository.save(equipo);
    }

    public Equipo actualizar(Long id, EquipoRequest request) {
        Equipo equipo = obtener(id);
        if (repository.existsByCodigoIgnoreCaseAndIdNot(request.codigo().trim(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe otro equipo con ese código");
        }
        aplicar(equipo, request);
        return repository.save(equipo);
    }

    public Equipo cambiarEstado(Long id, EstadoEquipo estado) {
        Equipo equipo = obtener(id);
        equipo.setEstado(estado);
        return repository.save(equipo);
    }

    public Equipo darDeBaja(Long id) {
        return cambiarEstado(id, EstadoEquipo.BAJA);
    }

    private void aplicar(Equipo e, EquipoRequest r) {
        e.setCodigo(r.codigo());
        e.setNombre(r.nombre());
        e.setDescripcion(r.descripcion());
        e.setMarca(r.marca());
        e.setModelo(r.modelo());
        e.setNumeroSerie(r.numeroSerie());
        e.setFechaAdquisicion(r.fechaAdquisicion());
        e.setCriticidad(r.criticidad());
        e.setEstado(r.estado());
        e.setUbicacion(r.ubicacion());
        e.setCondicionesOperacion(r.condicionesOperacion());
    }
}
