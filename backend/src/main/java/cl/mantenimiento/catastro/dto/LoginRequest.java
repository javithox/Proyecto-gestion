package cl.mantenimiento.catastro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
    @NotBlank(message = "Ingresa tu usuario o correo.")
    @Size(max = 320, message = "El usuario o correo es demasiado largo.")
    String identificador,
    @NotBlank(message = "Ingresa tu contraseña.")
    @Size(max = 72, message = "La contraseña no puede superar 72 caracteres.")
    String password
) {}
