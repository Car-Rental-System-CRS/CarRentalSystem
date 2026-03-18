package main.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import main.entities.Account;
import main.enums.Role;

public interface AccountRepository extends JpaRepository<Account, UUID> {
    Optional<Account> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email, UUID id);
    List<Account> findByRole(Role role);

    @Query("SELECT a FROM Account a WHERE " +
           "(:search IS NULL OR LOWER(a.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:baseRole IS NULL OR a.role = :baseRole)")
    Page<Account> findAllWithFilters(@Param("search") String search, @Param("baseRole") Role baseRole, Pageable pageable);

    // Dashboard: user registrations by date within date range
    @Query(value = "SELECT CONVERT(varchar(10), CAST(a.created_at AS date), 23) AS bucket_date, COUNT(*) AS cnt " +
           "FROM accounts a " +
           "WHERE a.role = 'USER' " +
           "AND a.created_at >= :start AND a.created_at <= :end " +
           "GROUP BY CONVERT(varchar(10), CAST(a.created_at AS date), 23) " +
           "ORDER BY bucket_date", nativeQuery = true)
    List<Object[]> countRegistrationsByDateBetween(
            @Param("start") java.time.Instant start,
            @Param("end") java.time.Instant end
    );
}
