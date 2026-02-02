package main.specification;

import main.entities.Car;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class CarSpecification {

    public static Specification<Car> getLicensePlateLike(String licensePlate) {
        return (root, query, cb) -> {
            if (licensePlate == null || licensePlate.isBlank()) return null;

            return cb.like(
                    cb.lower(root.get("licensePlate")),
                    "%" + licensePlate.toLowerCase() + "%"
            );
        };
    }

    public static Specification<Car> getImportDateFrom(LocalDate from) {
        return (root, query, cb) -> {
            if (from == null) return null;

            return cb.greaterThanOrEqualTo(
                    root.get("importDate"),
                    from
            );
        };
    }

    public static Specification<Car> getImportDateTo(LocalDate to) {
        return (root, query, cb) -> {
            if (to == null) return null;

            return cb.lessThanOrEqualTo(
                    root.get("importDate"),
                    to
            );
        };
    }
}
