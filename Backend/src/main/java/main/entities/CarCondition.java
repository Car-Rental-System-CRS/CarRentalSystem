package main.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
@Table(name = "car_conditions")
public class CarCondition extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @Column(nullable = false)
    private Integer odometer;

    @Column(nullable = false)
    private Integer fuelLevel;

    @OneToMany(
            mappedBy = "carCondition",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<MediaFile> photos;
}