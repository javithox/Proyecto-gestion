package cl.mantenimiento.catastro.repository;

import cl.mantenimiento.catastro.model.Criticidad;
import cl.mantenimiento.catastro.model.Equipo;
import cl.mantenimiento.catastro.model.EstadoEquipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface EquipoRepository extends JpaRepository<Equipo, Long>, JpaSpecificationExecutor<Equipo> {
    boolean existsByCodigoIgnoreCase(String codigo);
    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, Long id);
    long countByEstadoNot(EstadoEquipo estado);
    long countByCriticidad(Criticidad criticidad);
}
