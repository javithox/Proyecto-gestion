package cl.mantenimiento.catastro.repository;

import cl.mantenimiento.catastro.model.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsernameIgnoreCaseOrCorreoIgnoreCase(String username, String correo);
    boolean existsByUsernameIgnoreCase(String username);
}
