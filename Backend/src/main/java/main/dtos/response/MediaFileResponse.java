package main.dtos.response;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

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
    private Instant createdAt;
    private Instant modifiedAt;
}
