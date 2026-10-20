package cl.mantenimiento.catastro.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SetupRequest(
    @NotBlank(message = "Ingresa tu nombre de usuario.")
    @Size(min = 3, max = 80, message = "El usuario debe tener entre 3 y 80 caracteres.")
    String username,
    @NotBlank(message = "Ingresa tu nombre.")
    @Size(max = 160, message = "El nombre es demasiado largo.")
    String nombre,
    @Email(message = "Ingresa un correo válido.")
    @Size(max = 320, message = "El correo es demasiado largo.")
    String correo,
    @Size(max = 60, message = "El código de empleado es demasiado largo.")
    String codigoEmpleado,
    @NotBlank(message = "Crea una contraseña.")
    @Size(min = 12, max = 72, message = "La contraseña inicial debe tener entre 12 y 72 caracteres.")
    String password
) {}
