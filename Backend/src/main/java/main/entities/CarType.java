package main.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class CarType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID typeId;

    @Column(nullable = false)
    private int numberOfSeats;

    @Column(nullable = false)
    private String carName;

    // kWh per km
    @Column(nullable = false)
    private double consumptionKwhPerKm;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private CarBrand carBrand;
}
