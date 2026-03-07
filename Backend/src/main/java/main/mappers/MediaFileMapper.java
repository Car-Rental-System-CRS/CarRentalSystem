package main.mappers;

import main.dtos.response.MediaFileResponse;
import main.entities.MediaFile;

public class MediaFileMapper {

    public static MediaFileResponse toResponse(MediaFile entity) {
        if (entity == null) {
            return null;
        }

        return MediaFileResponse.builder()
                .id(entity.getId())
                .fileName(entity.getFileName())
                .fileUrl(entity.getFileUrl())
                .fileType(entity.getFileType())
                .fileSize(entity.getFileSize())
                .description(entity.getDescription())
                .displayOrder(entity.getDisplayOrder())
                .createdAt(entity.getCreatedAt())
                .modifiedAt(entity.getModifiedAt())
                .build();
    }
}
