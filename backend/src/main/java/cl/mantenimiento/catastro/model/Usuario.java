package cl.mantenimiento.catastro.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(name = "app_users", uniqueConstraints = {
    @UniqueConstraint(name = "uk_app_users_username", columnNames = "username"),
    @UniqueConstraint(name = "uk_app_users_email", columnNames = "correo"),
    @UniqueConstraint(name = "uk_app_users_employee_code", columnNames = "codigo_empleado"),
    @UniqueConstraint(name = "uk_app_users_initial_admin", columnNames = "initial_admin")
})
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(length = 320)
    private String correo;

    @Column(nullable = false, length = 160)
    private String nombre;

    @Column(name = "codigo_empleado", length = 60)
    private String codigoEmpleado;

    @Column(nullable = false, length = 40)
    private String rol = "USUARIO";

    @Column(name = "initial_admin")
    private Boolean initialAdmin;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private Instant creadoEn;

    @Column(name = "actualizado_en", nullable = false)
    private Instant actualizadoEn;

    @PrePersist
    void alCrear() {
        Instant ahora = Instant.now();
        creadoEn = ahora;
        actualizadoEn = ahora;
        if (rol == null || rol.isBlank()) rol = "USUARIO";
    }

    @PreUpdate
    void alActualizar() { actualizadoEn = Instant.now(); }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getCodigoEmpleado() { return codigoEmpleado; }
    public void setCodigoEmpleado(String codigoEmpleado) { this.codigoEmpleado = codigoEmpleado; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    public Boolean getInitialAdmin() { return initialAdmin; }
    public void setInitialAdmin(Boolean initialAdmin) { this.initialAdmin = initialAdmin; }
    public Instant getCreadoEn() { return creadoEn; }
}
