package main.dtos.request;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class CreateCarFeatureRequest {
    private String name;
    private String description;
}
