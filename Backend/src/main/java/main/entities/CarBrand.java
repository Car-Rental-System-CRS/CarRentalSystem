package main.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class CarBrand {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID brandId;

    @Column(nullable = false)
    private String brandName;
}
