package main.specification;

import main.entities.CarType;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class CarTypeSpecification {

    public static Specification<CarType> getTypeNameSpecification(String name) {
        return (root, query, cb) -> {
            if (name == null || name.isBlank()) return null;

            return cb.like(
                    cb.lower(root.get("name")),
                    "%" + name.toLowerCase() + "%"
            );
        };
    }

    public static Specification<CarType> getTypeNumberOfSeatsSpecification(Integer seats) {
        return (root, query, cb) -> {
            if (seats == null) return null;

            return cb.equal(root.get("numberOfSeats"), seats);
        };
    }

    public static Specification<CarType> getConsumptionLessThanOrEqual(Double consumption) {
        return (root, query, cb) -> {
            if (consumption == null) return null;

            return cb.lessThanOrEqualTo(
                    root.get("consumptionKwhPerKm"),
                    consumption
            );
        };
    }

    public static Specification<CarType> getPriceGreaterThanOrEqual(BigDecimal minPrice) {
        return (root, query, cb) -> {
            if (minPrice == null) return null;

            return cb.greaterThanOrEqualTo(
                    root.get("price"),
                    minPrice
            );
        };
    }

    public static Specification<CarType> getPriceLessThanOrEqual(BigDecimal maxPrice) {
        return (root, query, cb) -> {
            if (maxPrice == null) return null;

            return cb.lessThanOrEqualTo(
                    root.get("price"),
                    maxPrice
            );
        };
    }
}
