package cl.mantenimiento.catastro.repository;

import cl.mantenimiento.catastro.model.AuthSession;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthSessionRepository extends JpaRepository<AuthSession, Long> {
    Optional<AuthSession> findFirstByTokenHashAndRevocadoEnIsNullAndExpiraEnAfter(String tokenHash, Instant ahora);
    Optional<AuthSession> findFirstByTokenHashAndRevocadoEnIsNull(String tokenHash);
    void deleteAllByUsuario_Id(Long usuarioId);
}
