package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.entities.CarType;
import main.entities.MediaFile;
import main.repositories.CarTypeRepository;
import main.repositories.MediaFileRepository;
import main.services.MediaFileService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaFileServiceImpl implements MediaFileService {
    
    private final MediaFileRepository mediaFileRepository;
    private final CarTypeRepository carTypeRepository;

    @Override
    @Transactional
    public MediaFile uploadMediaFile(UUID carTypeId, MultipartFile file, String description, Integer displayOrder) {
        CarType carType = carTypeRepository.findById(carTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Car type not found: " + carTypeId));

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        // TODO: Implement actual file upload logic (e.g., to cloud storage like AWS S3, Azure Blob, etc.)
        // For now, we'll just create the entity with placeholder URL
        String fileUrl = "placeholder-url/" + file.getOriginalFilename();

        MediaFile mediaFile = MediaFile.builder()
                .fileName(file.getOriginalFilename())
                .fileUrl(fileUrl)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .description(description)
                .displayOrder(displayOrder != null ? displayOrder : 0)
                .carType(carType)
                .build();

        return mediaFileRepository.save(mediaFile);
    }

    @Override
    public MediaFile getMediaFileById(UUID id) {
        return mediaFileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Media file not found: " + id));
    }

    @Override
    public List<MediaFile> getMediaFilesByCarType(UUID carTypeId) {
        if (!carTypeRepository.existsById(carTypeId)) {
            throw new IllegalArgumentException("Car type not found: " + carTypeId);
        }
        return mediaFileRepository.findByCarTypeIdOrderByDisplayOrderAsc(carTypeId);
    }

    @Override
    @Transactional
    public MediaFile updateMediaFile(UUID id, String description, Integer displayOrder) {
        MediaFile mediaFile = mediaFileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Media file not found: " + id));

        if (description != null) {
            mediaFile.setDescription(description);
        }
        if (displayOrder != null) {
            mediaFile.setDisplayOrder(displayOrder);
        }

        return mediaFileRepository.save(mediaFile);
    }

    @Override
    @Transactional
    public void deleteMediaFile(UUID id) {
        if (!mediaFileRepository.existsById(id)) {
            throw new IllegalArgumentException("Media file not found: " + id);
        }
        // TODO: Implement actual file deletion from storage
        mediaFileRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteMediaFilesByCarType(UUID carTypeId) {
        if (!carTypeRepository.existsById(carTypeId)) {
            throw new IllegalArgumentException("Car type not found: " + carTypeId);
        }
        // TODO: Implement actual file deletion from storage
        mediaFileRepository.deleteByCarTypeId(carTypeId);
    }
}
