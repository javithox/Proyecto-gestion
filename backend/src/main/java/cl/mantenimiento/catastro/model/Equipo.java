package cl.mantenimiento.catastro.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "equipos", uniqueConstraints = @UniqueConstraint(name = "uk_equipos_codigo", columnNames = "codigo"))
public class Equipo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String codigo;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(length = 1000)
    private String descripcion;

    @Column(length = 100)
    private String marca;

    @Column(length = 100)
    private String modelo;

    @Column(name = "numero_serie", length = 100)
    private String numeroSerie;

    private LocalDate fechaAdquisicion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Criticidad criticidad = Criticidad.MEDIA;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoEquipo estado = EstadoEquipo.OPERATIVO;

    @Column(nullable = false, length = 180)
    private String ubicacion;

    @Column(length = 1000)
    private String condicionesOperacion;

    @Column(nullable = false, updatable = false)
    private OffsetDateTime creadoEn;

    @Column(nullable = false)
    private OffsetDateTime actualizadoEn;

    @PrePersist
    void alCrear() {
        OffsetDateTime ahora = OffsetDateTime.now();
        creadoEn = ahora;
        actualizadoEn = ahora;
    }

    @PreUpdate
    void alActualizar() {
        actualizadoEn = OffsetDateTime.now();
    }

    public Long getId() { return id; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = limpiar(codigo); }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = limpiar(nombre); }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = limpiarOpcional(descripcion); }
    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = limpiarOpcional(marca); }
    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = limpiarOpcional(modelo); }
    public String getNumeroSerie() { return numeroSerie; }
    public void setNumeroSerie(String numeroSerie) { this.numeroSerie = limpiarOpcional(numeroSerie); }
    public LocalDate getFechaAdquisicion() { return fechaAdquisicion; }
    public void setFechaAdquisicion(LocalDate fechaAdquisicion) { this.fechaAdquisicion = fechaAdquisicion; }
    public Criticidad getCriticidad() { return criticidad; }
    public void setCriticidad(Criticidad criticidad) { this.criticidad = criticidad; }
    public EstadoEquipo getEstado() { return estado; }
    public void setEstado(EstadoEquipo estado) { this.estado = estado; }
    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = limpiar(ubicacion); }
    public String getCondicionesOperacion() { return condicionesOperacion; }
    public void setCondicionesOperacion(String condicionesOperacion) { this.condicionesOperacion = limpiarOpcional(condicionesOperacion); }
    public OffsetDateTime getCreadoEn() { return creadoEn; }
    public OffsetDateTime getActualizadoEn() { return actualizadoEn; }

    private static String limpiar(String s) { return s == null ? null : s.trim(); }
    private static String limpiarOpcional(String s) { return s == null || s.isBlank() ? null : s.trim(); }
}
