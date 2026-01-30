package main.specification;

import main.entities.CarBrand;
import org.springframework.data.jpa.domain.Specification;

public class CarBrandSpecification {

    public static Specification<CarBrand> hasName(String name) {
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
