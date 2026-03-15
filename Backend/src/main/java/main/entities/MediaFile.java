package main.entities;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import main.enums.DamageSource;
import main.enums.MediaCategory;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
@Table(name = "media_files")
public class MediaFile extends AuditableEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileUrl;

    @Column(nullable = false)
    private String fileType; // e.g., "image/jpeg", "image/png", "video/mp4"

    @Column(nullable = false)
    private Long fileSize; // in bytes

    private String description;

    @Column(nullable = false)
    private Integer displayOrder; // for ordering media files

    @Enumerated(EnumType.STRING)
    private MediaCategory mediaCategory;

    @Enumerated(EnumType.STRING)
    private DamageSource damageSource;

    @Column(name = "source_booking_id")
    private UUID sourceBookingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_type_id", nullable = false)
    private CarType carType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id")
    private Car car;
}
