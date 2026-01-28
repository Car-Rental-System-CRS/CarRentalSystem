package main.entities;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

/**
 * IdClass for ModelFeature. Property names must match ModelFeature's @Id fields (carType, carFeature).
 */
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class ModelFeatureId implements Serializable {

    private UUID carType;
    private UUID carFeature;
}
