package main.dtos.request;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class CreateCarBrandRequest {
    private String brandName;
}
