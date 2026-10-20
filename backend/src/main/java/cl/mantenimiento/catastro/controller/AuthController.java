package cl.mantenimiento.catastro.controller;

import cl.mantenimiento.catastro.dto.LoginRequest;
import cl.mantenimiento.catastro.dto.SetupRequest;
import cl.mantenimiento.catastro.dto.UsuarioPerfil;
import cl.mantenimiento.catastro.model.Usuario;
import cl.mantenimiento.catastro.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.time.Duration;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;

    @Value("${app.auth.cookie-secure:true}") private boolean secureCookie;
    @Value("${app.auth.session-hours:12}") private long sessionHours;

    public AuthController(AuthService auth) { this.auth = auth; }

    @GetMapping("/setup-status")
    public Map<String, Boolean> setupStatus() { return Map.of("setupRequired", auth.setupRequired()); }

    @PostMapping("/setup")
    public ResponseEntity<UsuarioPerfil> setup(@Valid @RequestBody SetupRequest payload, HttpServletResponse response) {
        AuthService.LoginResult result = auth.setupInitialAdmin(payload);
        response.addHeader(HttpHeaders.SET_COOKIE, sessionCookie(result.token(), Duration.ofHours(Math.max(1, sessionHours))).toString());
        return ResponseEntity.status(HttpStatus.CREATED).body(result.perfil());
    }

    @PostMapping("/login")
    public ResponseEntity<UsuarioPerfil> login(@Valid @RequestBody LoginRequest payload, HttpServletResponse response) {
        AuthService.LoginResult result = auth.login(payload.identificador(), payload.password());
        response.addHeader(HttpHeaders.SET_COOKIE, sessionCookie(result.token(), Duration.ofHours(Math.max(1, sessionHours))).toString());
        return ResponseEntity.ok(result.perfil());
    }

    @GetMapping("/me")
    public UsuarioPerfil me(HttpServletRequest request) {
        Usuario user = auth.authenticatedUser(request);
        if (user == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "La sesión no está activa");
        return auth.toProfile(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        auth.logout(request);
        return ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, sessionCookie("", Duration.ZERO).toString())
            .build();
    }

    private ResponseCookie sessionCookie(String value, Duration maxAge) {
        return ResponseCookie.from(AuthService.SESSION_COOKIE, value)
            .httpOnly(true)
            .secure(secureCookie)
            .sameSite(secureCookie ? "None" : "Lax")
            .path("/")
            .maxAge(maxAge)
            .build();
    }
}
