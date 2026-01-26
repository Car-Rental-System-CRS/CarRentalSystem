package main.dtos.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CarFeatureResponse {
    private String featureName;
    private String featureDescription;
}
