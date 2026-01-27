package main.dtos.response;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CarBrandResponse {
    private UUID brandId;
    private String brandName;
}
