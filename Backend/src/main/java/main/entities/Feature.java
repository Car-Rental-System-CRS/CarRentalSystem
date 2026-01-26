package main.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class Feature {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;
}
