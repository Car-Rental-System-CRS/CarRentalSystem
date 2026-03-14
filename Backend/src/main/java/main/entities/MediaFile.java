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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_type_id", nullable = true)
    private CarType carType;

    //SQL Codes to modify carTypeFK
//    ALTER TABLE media_files
//    ALTER COLUMN car_type_id UNIQUEIDENTIFIER NULL;

//    ALTER TABLE media_files
//    ALTER COLUMN media_context NVARCHAR(255) NULL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_condition_id")
    private CarCondition carCondition; // nullable — existing car type photos unaffected
}
