package main.specification;

import main.entities.CarFeature;
import org.springframework.data.jpa.domain.Specification;

public class CarFeatureSpecification {
    public static Specification<CarFeature> hasName(String name) {
        return (root, query, criteriaBuilder) -> {
            if (name == null || name.isBlank()) {
                return null;
            }
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")),
                    "%" + name.toLowerCase() + "%"
            );
        };
    }
}
