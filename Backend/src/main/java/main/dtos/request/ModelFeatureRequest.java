package main.dtos.request;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModelFeatureRequest {
    private UUID typeId;
    private List<UUID> featureIds;
}
