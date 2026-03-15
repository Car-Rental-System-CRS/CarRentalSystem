package main.dtos.response;

import java.time.Instant;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import main.enums.DamageSource;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MediaFileResponse {
    private UUID id;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private String description;
    private Integer displayOrder;
    private DamageSource damageSource;
    private UUID sourceBookingId;
    private Instant createdAt;
    private Instant modifiedAt;
}
