package main.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class CarFeature extends AuditableEntity{

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @OneToMany(
            mappedBy = "carFeature",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ModelFeature> modelFeatures = new ArrayList<>();

}
