package main.specification;

import main.entities.CarFeature;
import org.springframework.data.jpa.domain.Specification;

public class CarFeatureSpecification {

    public static Specification<CarFeature> getFeatureNameSpecification(String name) {
        return (root, query, cb) -> {
            if (name == null || name.isBlank()) return null;

            return cb.like(
                    cb.lower(root.get("name")),
                    "%" + name.toLowerCase() + "%"
            );
        };
    }

    public static Specification<CarFeature> getFeatureDescriptionSpecification(String description) {
        return (root, query, cb) -> {
            if (description == null || description.isBlank()) return null;

            return cb.like(
                    cb.lower(root.get("description")),
                    "%" + description.toLowerCase() + "%"
            );
        };
    }
}
