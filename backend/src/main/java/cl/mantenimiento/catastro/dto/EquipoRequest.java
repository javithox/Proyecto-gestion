package cl.mantenimiento.catastro.dto;

import cl.mantenimiento.catastro.model.Criticidad;
import cl.mantenimiento.catastro.model.EstadoEquipo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record EquipoRequest(
    @NotBlank @Size(max = 30) String codigo,
    @NotBlank @Size(max = 120) String nombre,
    @Size(max = 1000) String descripcion,
    @Size(max = 100) String marca,
    @Size(max = 100) String modelo,
    @Size(max = 100) String numeroSerie,
    LocalDate fechaAdquisicion,
    @NotNull Criticidad criticidad,
    @NotNull EstadoEquipo estado,
    @NotBlank @Size(max = 180) String ubicacion,
    @Size(max = 1000) String condicionesOperacion
) {}
