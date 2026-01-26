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
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id", nullable = false)
    private Type type;
}
