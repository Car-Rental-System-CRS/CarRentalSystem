package main.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
@IdClass(ModelFeatureId.class)
public class ModelFeature {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id", nullable = false)
    private Type type;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feature_id", nullable = false)
    private Feature feature;
}
