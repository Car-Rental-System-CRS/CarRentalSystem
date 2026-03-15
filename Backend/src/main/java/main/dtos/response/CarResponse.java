package main.dtos.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CarResponse {
    private UUID id;
    private String licensePlate;
    private LocalDate importDate;
    private UUID typeId;
    
    // Additional fields for booking display
    private String name;           // from CarType.name
    private String brand;          // from CarBrand.name
    private String model;          // from CarType.name (duplicate for consistency)
    private Integer year;          // derived from importDate or CarType
    private BigDecimal pricePerDay; // from CarType.price
    private Integer quantity;      // default to 1 for single car
    private String imageUrl;       // from CarType.mediaFiles (first image)
    private List<MediaFileResponse> damageImages;
}
