package cl.mantenimiento.catastro.dto;

import java.time.Instant;

public record UsuarioPerfil(
    Long id,
    String nombre,
    String username,
    String correo,
    String codigoEmpleado,
    String rol,
    Instant creadoEn
) {}
