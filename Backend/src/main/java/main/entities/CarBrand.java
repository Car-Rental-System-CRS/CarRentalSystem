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
public class CarBrand extends AuditableEntity{

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;
}
