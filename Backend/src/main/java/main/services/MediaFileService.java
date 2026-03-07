package main.services;

import main.entities.MediaFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface MediaFileService {
    
    MediaFile uploadMediaFile(UUID carTypeId, MultipartFile file, String description, Integer displayOrder);

    MediaFile getMediaFileById(UUID id);

    List<MediaFile> getMediaFilesByCarType(UUID carTypeId);

    MediaFile updateMediaFile(UUID id, String description, Integer displayOrder);

    void deleteMediaFile(UUID id);

    void deleteMediaFilesByCarType(UUID carTypeId);
}
