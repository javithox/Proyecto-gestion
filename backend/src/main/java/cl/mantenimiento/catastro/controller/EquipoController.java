package cl.mantenimiento.catastro.controller;

import cl.mantenimiento.catastro.dto.EquipoRequest;
import cl.mantenimiento.catastro.model.Criticidad;
import cl.mantenimiento.catastro.model.Equipo;
import cl.mantenimiento.catastro.model.EstadoEquipo;
import cl.mantenimiento.catastro.service.EquipoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipos")
public class EquipoController {
    private final EquipoService service;

    public EquipoController(EquipoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Equipo> listar(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) EstadoEquipo estado,
        @RequestParam(required = false) Criticidad criticidad
    ) {
        return service.listar(q, estado, criticidad);
    }

    @GetMapping("/{id}")
    public Equipo obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Equipo crear(@Valid @RequestBody EquipoRequest request) {
        return service.crear(request);
    }

    @PutMapping("/{id}")
    public Equipo actualizar(@PathVariable Long id, @Valid @RequestBody EquipoRequest request) {
        return service.actualizar(id, request);
    }

    @PatchMapping("/{id}/estado")
    public Equipo cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String valor = body.get("estado");
        if (valor == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST, "Falta el campo estado");
        try {
            return service.cambiarEstado(id, EstadoEquipo.valueOf(valor));
        } catch (IllegalArgumentException ex) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado no válido");
        }
    }

    @DeleteMapping("/{id}")
    public Equipo darDeBaja(@PathVariable Long id) {
        return service.darDeBaja(id);
    }
}
