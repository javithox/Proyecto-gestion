package cl.mantenimiento.catastro.service;

import cl.mantenimiento.catastro.dto.SetupRequest;
import cl.mantenimiento.catastro.dto.UsuarioAdminRequest;
import cl.mantenimiento.catastro.dto.UsuarioPerfil;
import cl.mantenimiento.catastro.model.AuthSession;
import cl.mantenimiento.catastro.model.Usuario;
import cl.mantenimiento.catastro.repository.AuthSessionRepository;
import cl.mantenimiento.catastro.repository.UsuarioRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    public static final String SESSION_COOKIE = "catastro_session";
    private static final SecureRandom RANDOM = new SecureRandom();
    private final AuthSessionRepository sessions;
    private final UsuarioRepository users;
    private final PasswordEncoder passwordEncoder;
    private final String dummyHash;

    @Value("${app.auth.session-hours:12}") private long sessionHours;

    public AuthService(AuthSessionRepository sessions, UsuarioRepository users, PasswordEncoder passwordEncoder) {
        this.sessions = sessions;
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.dummyHash = passwordEncoder.encode(UUID.randomUUID().toString());
    }

    @Transactional(readOnly = true)
    public Usuario requireAdmin(HttpServletRequest request) {
        Usuario current = authenticatedUser(request);
        if (current == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Inicia sesión para continuar.");
        if (!"ADMIN".equalsIgnoreCase(current.getRol())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Esta función está reservada al administrador.");
        return current;
    }

    @Transactional(readOnly = true)
    public List<UsuarioPerfil> listarUsuarios() {
        return users.findAll().stream().sorted((a, b) -> a.getUsername().compareToIgnoreCase(b.getUsername())).map(this::toProfile).toList();
    }

    @Transactional
    public UsuarioPerfil crearUsuario(UsuarioAdminRequest request) {
        String username = request.username().trim().toLowerCase(Locale.ROOT);
        validarPasswordNueva(request.password());
        if (users.existsByUsernameIgnoreCase(username)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Ese nombre de usuario ya está registrado.");
        String email = blankToNull(request.correo());
        if (email != null && users.findByUsernameIgnoreCaseOrCorreoIgnoreCase(email, email).isPresent()) throw new ResponseStatusException(HttpStatus.CONFLICT, "Ese correo ya está registrado.");
        Usuario user = new Usuario();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setNombre(request.nombre().trim());
        user.setCorreo(email == null ? null : email.toLowerCase(Locale.ROOT));
        user.setCodigoEmpleado(blankToNull(request.codigoEmpleado()));
        user.setRol("USUARIO");
        // null permite múltiples usuarios bajo la restricción única de initial_admin.
        user.setInitialAdmin(null);
        try { return toProfile(users.saveAndFlush(user)); }
        catch (DataIntegrityViolationException ex) { throw new ResponseStatusException(HttpStatus.CONFLICT, "El usuario, correo o código de empleado ya existe."); }
    }

    @Transactional
    public UsuarioPerfil actualizarUsuario(Long id, UsuarioAdminRequest request) {
        Usuario user = users.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró el usuario."));
        if (Boolean.TRUE.equals(user.getInitialAdmin()) || "ADMIN".equalsIgnoreCase(user.getRol())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "La cuenta administradora protegida no se puede modificar desde esta pantalla.");
        String username = request.username().trim().toLowerCase(Locale.ROOT);
        users.findByUsernameIgnoreCaseOrCorreoIgnoreCase(username, username).filter(existing -> !existing.getId().equals(id)).ifPresent(existing -> { throw new ResponseStatusException(HttpStatus.CONFLICT, "Ese nombre de usuario ya está registrado."); });
        String email = blankToNull(request.correo());
        if (email != null) users.findByUsernameIgnoreCaseOrCorreoIgnoreCase(email, email).filter(existing -> !existing.getId().equals(id)).ifPresent(existing -> { throw new ResponseStatusException(HttpStatus.CONFLICT, "Ese correo ya está registrado."); });
        user.setUsername(username);
        user.setNombre(request.nombre().trim());
        user.setCorreo(email == null ? null : email.toLowerCase(Locale.ROOT));
        user.setCodigoEmpleado(blankToNull(request.codigoEmpleado()));
        if (request.password() != null && !request.password().isBlank()) {
            validarPasswordNueva(request.password());
            user.setPasswordHash(passwordEncoder.encode(request.password()));
            sessions.deleteAllByUsuario_Id(id);
        }
        try { return toProfile(users.saveAndFlush(user)); }
        catch (DataIntegrityViolationException ex) { throw new ResponseStatusException(HttpStatus.CONFLICT, "El usuario, correo o código de empleado ya existe."); }
    }

    @Transactional
    public void eliminarUsuario(Long id) {
        Usuario user = users.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró el usuario."));
        if (Boolean.TRUE.equals(user.getInitialAdmin()) || "ADMIN".equalsIgnoreCase(user.getRol())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "La cuenta administradora protegida no se puede eliminar.");
        sessions.deleteAllByUsuario_Id(id);
        users.delete(user);
    }

    private void validarPasswordNueva(String password) {
        if (password == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debes indicar una contraseña para el nuevo usuario.");
        int bytes = password.getBytes(StandardCharsets.UTF_8).length;
        if (bytes < 12 || bytes > 72) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña debe tener entre 12 y 72 bytes UTF-8.");
    }

    @Transactional(readOnly = true)
    public boolean setupRequired() { return users.count() == 0; }

    @Transactional
    public LoginResult setupInitialAdmin(SetupRequest request) {
        if (users.count() != 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La configuración inicial ya fue completada. Inicia sesión.");
        }
        String password = request.password();
        int passwordBytes = password.getBytes(StandardCharsets.UTF_8).length;
        if (passwordBytes < 12 || passwordBytes > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña debe tener entre 12 y 72 bytes UTF-8.");
        }

        Usuario admin = new Usuario();
        admin.setUsername(request.username().trim().toLowerCase(Locale.ROOT));
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setNombre(request.nombre().trim());
        admin.setCorreo(blankToNull(request.correo()) == null ? null : request.correo().trim().toLowerCase(Locale.ROOT));
        admin.setCodigoEmpleado(blankToNull(request.codigoEmpleado()));
        admin.setRol("ADMIN");
        admin.setInitialAdmin(true);
        try {
            users.saveAndFlush(admin);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La cuenta inicial ya fue creada o uno de sus datos ya existe.");
        }
        return createSession(admin);
    }

    @Transactional
    public LoginResult login(String identifier, String password) {
        String normalized = identifier == null ? "" : identifier.trim();
        if (password == null || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario o contraseña incorrectos.");
        }
        Usuario user = users.findByUsernameIgnoreCaseOrCorreoIgnoreCase(normalized, normalized).orElse(null);
        String hashToCheck = user == null ? dummyHash : user.getPasswordHash();
        if (!passwordEncoder.matches(password, hashToCheck) || user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario o contraseña incorrectos.");
        }
        return createSession(user);
    }

    private LoginResult createSession(Usuario user) {
        byte[] tokenBytes = new byte[32];
        RANDOM.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
        AuthSession session = new AuthSession();
        session.setTokenHash(hash(token));
        session.setUsuario(user);
        session.setExpiraEn(Instant.now().plus(Math.max(1, sessionHours), ChronoUnit.HOURS));
        sessions.save(session);
        return new LoginResult(token, toProfile(user));
    }

    @Transactional(readOnly = true)
    public Usuario authenticatedUser(HttpServletRequest request) {
        String token = cookieValue(request, SESSION_COOKIE);
        if (token == null || token.length() > 256) return null;
        return sessions.findFirstByTokenHashAndRevocadoEnIsNullAndExpiraEnAfter(hash(token), Instant.now())
            .map(AuthSession::getUsuario).orElse(null);
    }

    @Transactional
    public void logout(HttpServletRequest request) {
        String token = cookieValue(request, SESSION_COOKIE);
        if (token == null || token.length() > 256) return;
        sessions.findFirstByTokenHashAndRevocadoEnIsNull(hash(token)).ifPresent(session -> {
            session.setRevocadoEn(Instant.now());
            sessions.save(session);
        });
    }

    public UsuarioPerfil toProfile(Usuario user) {
        return new UsuarioPerfil(user.getId(), user.getNombre(), user.getUsername(), user.getCorreo(), user.getCodigoEmpleado(), user.getRol(), user.getCreadoEn());
    }

    private String cookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie cookie : cookies) if (name.equals(cookie.getName())) return cookie.getValue();
        return null;
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception ex) {
            throw new IllegalStateException("SHA-256 no disponible", ex);
        }
    }

    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    public record LoginResult(String token, UsuarioPerfil perfil) {}
}
