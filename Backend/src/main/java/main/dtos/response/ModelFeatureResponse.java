package main.dtos.response;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ModelFeatureResponse {
    private UUID id;
    private UUID typeId;
    private UUID featureId;
}
