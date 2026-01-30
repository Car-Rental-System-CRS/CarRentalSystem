package main.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
        name = "model_features",
        uniqueConstraints = {
        @UniqueConstraint(columnNames = {"type_id", "feature_id"})
        },
        indexes = {
                @Index(name = "idx_model_feature_type", columnList = "type_id"),
                @Index(name = "idx_model_feature_feature", columnList = "feature_id")
        }
)
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class ModelFeature extends AuditableEntity{

    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id", nullable = false)
    @JsonIgnore
    private CarType carType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feature_id", nullable = false)
    @JsonIgnore
    private CarFeature carFeature;
}
