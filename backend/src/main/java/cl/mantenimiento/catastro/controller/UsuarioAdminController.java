package cl.mantenimiento.catastro.controller;

import cl.mantenimiento.catastro.dto.UsuarioAdminRequest;
import cl.mantenimiento.catastro.dto.UsuarioPerfil;
import cl.mantenimiento.catastro.model.Usuario;
import cl.mantenimiento.catastro.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin/usuarios")
public class UsuarioAdminController {
    private final AuthService auth;

    public UsuarioAdminController(AuthService auth) { this.auth = auth; }

    @GetMapping
    public List<UsuarioPerfil> listar(HttpServletRequest request) {
        auth.requireAdmin(request);
        return auth.listarUsuarios();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioPerfil crear(@Valid @RequestBody UsuarioAdminRequest payload, HttpServletRequest request) {
        auth.requireAdmin(request);
        return auth.crearUsuario(payload);
    }

    @PutMapping("/{id}")
    public UsuarioPerfil actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioAdminRequest payload, HttpServletRequest request) {
        auth.requireAdmin(request);
        return auth.actualizarUsuario(id, payload);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id, HttpServletRequest request) {
        Usuario admin = auth.requireAdmin(request);
        if (admin.getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes eliminar tu propia cuenta de administrador.");
        }
        auth.eliminarUsuario(id);
    }
}
