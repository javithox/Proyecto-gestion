package cl.mantenimiento.catastro.service;

import cl.mantenimiento.catastro.model.Usuario;
import cl.mantenimiento.catastro.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);
    private final UsuarioRepository users;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.username:admin}") private String username;
    @Value("${app.bootstrap.password:}") private String password;
    @Value("${app.bootstrap.name:Administrador}") private String name;
    @Value("${app.bootstrap.email:}") private String email;
    @Value("${app.bootstrap.employee-code:}") private String employeeCode;

    public AdminBootstrap(UsuarioRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            log.warn("No se creó la cuenta inicial: define APP_ADMIN_USERNAME y APP_ADMIN_PASSWORD antes del primer acceso.");
            return;
        }
        if (password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length < 12 || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            log.warn("No se creó la cuenta inicial: APP_ADMIN_PASSWORD debe tener entre 12 y 72 bytes UTF-8.");
            return;
        }
        if (users.count() > 0 || users.existsByUsernameIgnoreCase(username.trim())) return;

        Usuario admin = new Usuario();
        admin.setUsername(username.trim().toLowerCase(java.util.Locale.ROOT));
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setNombre(name == null || name.isBlank() ? username.trim() : name.trim());
        admin.setCorreo(blankToNull(email));
        admin.setCodigoEmpleado(blankToNull(employeeCode));
        admin.setRol("ADMIN");
        admin.setInitialAdmin(true);
        try {
            users.saveAndFlush(admin);
            log.info("Cuenta administradora inicial creada con ID {}.", admin.getId());
        } catch (DataIntegrityViolationException ex) {
            log.info("La cuenta inicial ya fue creada por otra instancia.");
        }
    }

    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
