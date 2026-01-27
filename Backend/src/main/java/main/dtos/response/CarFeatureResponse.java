package main.dtos.response;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CarFeatureResponse {
    private UUID featureId;
    private String featureName;
    private String featureDescription;
}
