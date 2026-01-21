
package src.Entity.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import src.entity.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
}
